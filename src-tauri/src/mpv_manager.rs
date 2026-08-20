use crate::mpv_ipc::MpvIpcClient;
use parking_lot::RwLock;
use serde_json::Value;
use std::path::PathBuf;
use std::sync::Arc;
use tauri::{AppHandle, Manager};
use tokio::process::Child;
use tokio::sync::Mutex;

#[derive(Clone)]
pub struct MpvManager {
    ipc: Arc<RwLock<Option<MpvIpcClient>>>,
    child: Arc<Mutex<Option<Child>>>,
    pipe_name: String,
}

impl MpvManager {
    pub fn new() -> Self {
        let pid = std::process::id();
        let pipe_name = format!(r"\\.\pipe\mpvsocket_novidplayer_{}", pid);
        Self {
            ipc: Arc::new(RwLock::new(None)),
            child: Arc::new(Mutex::new(None)),
            pipe_name,
        }
    }

    pub fn find_mpv_binary(&self, app_handle: &AppHandle) -> Option<PathBuf> {
        let mut candidates = Vec::new();

        // 1. Tauri bundled resource directory (for packaged installer/portable releases)
        if let Ok(res_dir) = app_handle.path().resource_dir() {
            candidates.push(res_dir.join("binaries").join("mpv.exe"));
            candidates.push(res_dir.join("mpv.exe"));
        }

        // 2. Relative to current executable (portable builds or target/debug)
        if let Ok(current_exe) = std::env::current_exe() {
            if let Some(parent) = current_exe.parent() {
                candidates.push(parent.join("binaries").join("mpv.exe"));
                candidates.push(parent.join("mpv.exe"));
                // In local dev mode: target/debug/../../src-tauri/binaries/mpv.exe
                if let Some(target_dir) = parent.parent() {
                    if let Some(tauri_dir) = target_dir.parent() {
                        candidates.push(tauri_dir.join("binaries").join("mpv.exe"));
                    }
                }
            }
        }

        // 3. Project root relative paths during local development
        candidates.push(PathBuf::from("src-tauri/binaries/mpv.exe"));
        candidates.push(PathBuf::from("binaries/mpv.exe"));

        for path in &candidates {
            if path.exists() {
                log::info!("Found MPV binary at: {:?}", path);
                return Some(path.clone());
            }
        }

        // 4. System PATH fallback
        if let Some(paths) = std::env::var_os("PATH") {
            for dir in std::env::split_paths(&paths) {
                let p = dir.join("mpv.exe");
                if p.is_file() {
                    log::info!("Found MPV binary in system PATH: {:?}", p);
                    return Some(p);
                }
            }
        }

        log::warn!("MPV binary not found in standard locations: {:?}", candidates);
        None
    }

    pub async fn start(
        &self,
        app_handle: AppHandle,
        hwnd: usize,
    ) -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
        let mpv_path = self
            .find_mpv_binary(&app_handle)
            .ok_or_else(|| {
                "MPV engine (mpv.exe) not found. Please place mpv.exe in src-tauri/binaries/ or install MPV."
            })?;

        log::info!(
            "Launching MPV engine: {:?} with HWND: 0x{:X}, Pipe: {}",
            mpv_path,
            hwnd,
            self.pipe_name
        );

        let mut cmd = tokio::process::Command::new(mpv_path);
        cmd.arg(format!("--input-ipc-server={}", self.pipe_name))
            .arg(format!("--wid={}", hwnd))
            .arg("--idle=yes")
            .arg("--keep-open=yes")
            .arg("--no-config")
            .arg("--no-osc")
            .arg("--no-osd-bar")
            .arg("--no-input-default-bindings")
            .arg("--hwdec=auto-safe")
            .arg("--vo=gpu")
            .arg("--gpu-api=d3d11")
            .arg("--d3d11-exclusive-fs=no")
            .arg("--force-window=yes")
            .arg("--border=no")
            .arg("--title=")
            .arg("--window-dragging=no")
            .arg("--snap-window=no")
            .arg("--cursor-autohide=no")
            .arg("--terminal=no")
            .arg("--msg-level=all=warn");

        // Default screenshot directory: %USERPROFILE%\Pictures\Screenshots
        let screenshots_dir = if let Ok(user_profile) = std::env::var("USERPROFILE") {
            format!("{}\\Pictures\\Screenshots", user_profile)
        } else if let Ok(home) = std::env::var("HOME") {
            format!("{}/Pictures/Screenshots", home)
        } else {
            "Screenshots".to_string()
        };
        let _ = std::fs::create_dir_all(&screenshots_dir);

        cmd.arg(format!("--screenshot-directory={}", screenshots_dir))
            .arg("--screenshot-template=NovidPlayer_%F_%p")
            .arg("--screenshot-format=png")
            .arg("--screenshot-png-compression=7");

        #[cfg(windows)]
        {
            // CREATE_NO_WINDOW (0x08000000) prevents console window flashing
            const CREATE_NO_WINDOW: u32 = 0x08000000;
            cmd.creation_flags(CREATE_NO_WINDOW);
        }

        let child_proc = cmd.spawn()?;
        {
            let mut lock = self.child.lock().await;
            *lock = Some(child_proc);
        }

        // Establish IPC Connection
        let client = MpvIpcClient::connect(self.pipe_name.clone(), app_handle).await?;
        {
            let mut ipc_lock = self.ipc.write();
            *ipc_lock = Some(client);
        }

        log::info!("MPV engine initialized and ready");
        Ok(())
    }

    pub async fn send_command(
        &self,
        args: Vec<Value>,
    ) -> Result<u64, Box<dyn std::error::Error + Send + Sync>> {
        let client_opt = self.ipc.read().clone();
        if let Some(client) = client_opt {
            client.send_command(args).await
        } else {
            Err("MPV IPC client is not connected".into())
        }
    }

    pub async fn stop(&self) {
        log::info!("Stopping MPV engine...");
        if let Some(client) = self.ipc.read().clone() {
            let _ = client
                .send_command(vec![Value::String("quit".to_string())])
                .await;
        }

        let mut child_guard = self.child.lock().await;
        if let Some(mut child) = child_guard.take() {
            let _ = child.kill().await;
        }

        let mut ipc_guard = self.ipc.write();
        *ipc_guard = None;
    }
}
