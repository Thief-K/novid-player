use serde_json::Value;
use std::sync::atomic::{AtomicU64, Ordering};
use std::time::Duration;
use tauri::{AppHandle, Emitter};
use tokio::io::{AsyncBufReadExt, AsyncWriteExt, BufReader};
use tokio::net::windows::named_pipe::ClientOptions;
use tokio::sync::mpsc;

static REQUEST_COUNTER: AtomicU64 = AtomicU64::new(1);

#[derive(Clone)]
pub struct MpvIpcClient {
    tx: mpsc::Sender<String>,
}

impl MpvIpcClient {
    pub fn build_command_message(command_args: Vec<Value>, req_id: u64) -> Result<String, serde_json::Error> {
        let msg = serde_json::json!({
            "command": command_args,
            "request_id": req_id
        });
        serde_json::to_string(&msg)
    }

    pub fn get_observed_properties() -> Vec<&'static str> {
        vec![
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
        ]
    }

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

        let _ = app_handle.emit(
            "mpv-event",
            serde_json::json!({
                "event": "mpv-ready"
            }),
        );

        Ok(client_instance)
    }

    pub async fn send_command(
        &self,
        command_args: Vec<Value>,
    ) -> Result<u64, Box<dyn std::error::Error + Send + Sync>> {
        let req_id = REQUEST_COUNTER.fetch_add(1, Ordering::SeqCst);
        let raw = Self::build_command_message(command_args, req_id)?;
        self.tx
            .send(raw)
            .await
            .map_err(|e| format!("IPC Send error: {}", e))?;
        Ok(req_id)
    }

    async fn setup_observers(&self) -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
        let properties = Self::get_observed_properties();

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

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_build_command_message() {
        let cmd = vec![
            Value::String("set_property".to_string()),
            Value::String("volume".to_string()),
            Value::Number(85.into()),
        ];
        let json_str = MpvIpcClient::build_command_message(cmd, 42).expect("serialization failed");
        let parsed: Value = serde_json::from_str(&json_str).expect("deserialization failed");

        assert_eq!(parsed["request_id"], 42);
        assert_eq!(parsed["command"][0], "set_property");
        assert_eq!(parsed["command"][1], "volume");
        assert_eq!(parsed["command"][2], 85);
    }

    #[test]
    fn test_observed_properties_coverage() {
        let props = MpvIpcClient::get_observed_properties();
        assert!(props.contains(&"time-pos"));
        assert!(props.contains(&"duration"));
        assert!(props.contains(&"pause"));
        assert!(props.contains(&"volume"));
        assert!(props.contains(&"mute"));
        assert!(props.contains(&"speed"));
        assert!(props.contains(&"hwdec-current"));
        assert!(props.contains(&"eof-reached"));
        assert!(props.contains(&"video-params"));
        assert_eq!(props.len(), 24);
    }

    #[test]
    fn test_request_counter_increment() {
        let val1 = REQUEST_COUNTER.fetch_add(1, Ordering::SeqCst);
        let val2 = REQUEST_COUNTER.fetch_add(1, Ordering::SeqCst);
        assert_eq!(val2, val1 + 1);
    }
}
