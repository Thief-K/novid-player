use serde::{Deserialize, Serialize};
use serde_json::Value;
use std::sync::atomic::{AtomicU64, Ordering};
use std::time::Duration;
use tauri::{AppHandle, Emitter};
use tokio::io::{AsyncBufReadExt, AsyncWriteExt, BufReader};
use tokio::net::windows::named_pipe::ClientOptions;
use tokio::sync::mpsc;

static REQUEST_COUNTER: AtomicU64 = AtomicU64::new(1);

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct IpcMessage {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub command: Option<Vec<Value>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub request_id: Option<u64>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub event: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub name: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub data: Option<Value>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub error: Option<String>,
}

#[derive(Clone)]
pub struct MpvIpcClient {
    tx: mpsc::Sender<String>,
}

impl MpvIpcClient {
    pub async fn connect(
        pipe_name: String,
        app_handle: AppHandle,
    ) -> Result<Self, Box<dyn std::error::Error + Send + Sync>> {
        let (tx, mut rx) = mpsc::channel::<String>(128);

        // Attempt connecting with retry
        let mut connected_client = None;
        for attempt in 1..=20 {
            match ClientOptions::new().open(&pipe_name) {
                Ok(client) => {
                    log::info!("Connected to MPV Named Pipe: {}", pipe_name);
                    connected_client = Some(client);
                    break;
                }
                Err(e) => {
                    if attempt % 5 == 0 {
                        log::warn!(
                            "Waiting for MPV named pipe (attempt {}/20): {}",
                            attempt,
                            e
                        );
                    }
                    tokio::time::sleep(Duration::from_millis(150)).await;
                }
            }
        }

        let client = connected_client.ok_or("Failed to connect to MPV Named Pipe after retries")?;
        let (reader, mut writer) = tokio::io::split(client);

        // Spawn write worker
        tokio::spawn(async move {
            while let Some(msg) = rx.recv().await {
                let mut data = msg.into_bytes();
                data.push(b'\n');
                if let Err(e) = writer.write_all(&data).await {
                    log::error!("Failed to write command to MPV pipe: {}", e);
                    break;
                }
                let _ = writer.flush().await;
            }
        });

        // Spawn read worker & event dispatcher
        let handle = app_handle.clone();
        tokio::spawn(async move {
            let mut lines = BufReader::new(reader).lines();
            while let Ok(Some(line)) = lines.next_line().await {
                if line.trim().is_empty() {
                    continue;
                }
                match serde_json::from_str::<Value>(&line) {
                    Ok(val) => {
                        // Forward raw and structured events to Tauri frontend
                        let _ = handle.emit("mpv-event", val);
                    }
                    Err(err) => {
                        log::debug!("Malformed MPV IPC JSON: {} - Raw: {}", err, line);
                    }
                }
            }
            log::warn!("MPV IPC reader loop exited");
            let _ = handle.emit(
                "mpv-event",
                serde_json::json!({
                    "event": "mpv-disconnected"
                }),
            );
        });

        let client_instance = Self { tx };
        client_instance.setup_observers().await?;

        Ok(client_instance)
    }

    pub async fn send_command(
        &self,
        command_args: Vec<Value>,
    ) -> Result<u64, Box<dyn std::error::Error + Send + Sync>> {
        let req_id = REQUEST_COUNTER.fetch_add(1, Ordering::SeqCst);
        let msg = serde_json::json!({
            "command": command_args,
            "request_id": req_id
        });
        let raw = serde_json::to_string(&msg)?;
        self.tx
            .send(raw)
            .await
            .map_err(|e| format!("IPC Send error: {}", e))?;
        Ok(req_id)
    }

    async fn setup_observers(&self) -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
        let properties = vec![
            "time-pos",
            "duration",
            "percent-pos",
            "pause",
            "volume",
            "mute",
            "speed",
            "track-list",
            "demuxer-cache-state",
            "demuxer-cache-duration",
            "hwdec-current",
            "sub-delay",
            "audio-delay",
            "brightness",
            "contrast",
            "saturation",
            "gamma",
            "video-params",
            "eof-reached",
            "chapter-list",
            "chapter",
            "path",
            "media-title",
            "core-idle",
        ];

        for (idx, prop) in properties.iter().enumerate() {
            self.send_command(vec![
                Value::String("observe_property".to_string()),
                Value::Number((idx + 1).into()),
                Value::String(prop.to_string()),
            ])
            .await?;
        }

        Ok(())
    }
}
