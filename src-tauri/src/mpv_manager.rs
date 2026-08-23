use crate::mpv_ipc::MpvIpcClient;
use parking_lot::RwLock;
use serde_json::Value;
use std::path::PathBuf;
use std::sync::Arc;
use tauri::{AppHandle, Manager};
use tokio::process::{Child, Command};
use tokio::sync::Mutex;

#[derive(Clone)]
pub struct MpvManager {
    ipc: Arc<RwLock<Option<MpvIpcClient>>>,
    child: Arc<Mutex<Option<Child>>>,
    pipe_name: String,
}

impl Default for MpvManager {
    fn default() -> Self {
        Self::new()
    }
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

    pub fn build_mpv_args(hwnd: usize, pipe_name: &str) -> Vec<String> {
        vec![
            format!("--wid={}", hwnd),
            format!("--input-ipc-server={}", pipe_name),
            "--idle=yes".to_string(),
            "--force-window=yes".to_string(),
            "--keep-open=yes".to_string(),
            "--hr-seek=yes".to_string(),
            "--hwdec=auto-safe".to_string(),
            "--vo=gpu-next".to_string(),
            "--gpu-api=d3d11".to_string(),
            "--gpu-context=d3d11".to_string(),
            "--d3d11-exclusive-fs=no".to_string(),
            "--border=no".to_string(),
            "--title=".to_string(),
            "--window-dragging=no".to_string(),
            "--snap-window=no".to_string(),
            "--cursor-autohide=no".to_string(),
            "--input-default-bindings=no".to_string(),
            "--input-vo-keyboard=no".to_string(),
            "--osc=no".to_string(),
            "--osd-level=0".to_string(),
        ]
    }

    pub fn find_mpv_binary(&self, app_handle: &AppHandle) -> Option<PathBuf> {
        let mut candidates = Vec::new();

        // 1. Tauri bundled resources directory
        if let Ok(resource_dir) = app_handle.path().resource_dir() {
            candidates.push(resource_dir.join("binaries").join("mpv.exe"));
            candidates.push(resource_dir.join("mpv.exe"));
        }

        // 2. Current executable adjacent directory
        if let Ok(exe_path) = std::env::current_exe() {
            if let Some(exe_dir) = exe_path.parent() {
                candidates.push(exe_dir.join("binaries").join("mpv.exe"));
                candidates.push(exe_dir.join("mpv.exe"));
            }
        }

        // 3. Current working directory / dev workspace
        if let Ok(cwd) = std::env::current_dir() {
            candidates.push(cwd.join("binaries").join("mpv.exe"));
            candidates.push(cwd.join("src-tauri").join("binaries").join("mpv.exe"));
        }

        // 4. Check candidates exist
        if let Some(found) = candidates.into_iter().find(|p| p.exists()) {
            log::info!("Found MPV binary at: {:?}", found);
            return Some(found);
        }

        // 5. System PATH lookup
        if let Ok(path_var) = std::env::var("PATH") {
            if let Some(found) = std::env::split_paths(&path_var)
                .map(|d| d.join("mpv.exe"))
                .find(|p| p.exists())
            {
                log::info!("Found MPV in system PATH: {:?}", found);
                return Some(found);
            }
        }

        log::warn!("MPV binary not found in standard paths");
        None
    }

    pub async fn start(
        &self,
        app_handle: AppHandle,
        hwnd: usize,
    ) -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
        let mpv_path = self
            .find_mpv_binary(&app_handle)
            .ok_or("MPV engine (mpv.exe) not found. Please place mpv.exe in src-tauri/binaries/ or install MPV.")?;

        log::info!("Spawning MPV engine using binary: {:?}", mpv_path);

        let mut cmd = Command::new(&mpv_path);
        let args = Self::build_mpv_args(hwnd, &self.pipe_name);
        cmd.args(args);

        #[cfg(windows)]
        {
            const CREATE_NO_WINDOW: u32 = 0x08000000;
            cmd.creation_flags(CREATE_NO_WINDOW);
        }

        let child = cmd.spawn()?;
        {
            let mut guard = self.child.lock().await;
            *guard = Some(child);
        }

        // Connect IPC client
        let ipc_client = MpvIpcClient::connect(self.pipe_name.clone(), app_handle).await?;
        {
            let mut guard = self.ipc.write();
            *guard = Some(ipc_client);
        }

        log::info!("MPV engine initialized and IPC connected successfully.");
        Ok(())
    }

    pub async fn send_command(
        &self,
        args: Vec<Value>,
    ) -> Result<u64, Box<dyn std::error::Error + Send + Sync>> {
        let start_time = std::time::Instant::now();
        loop {
            let client_opt = self.ipc.read().clone();
            if let Some(client) = client_opt {
                return client.send_command(args).await;
            }
            if start_time.elapsed() > std::time::Duration::from_secs(3) {
                return Err("MPV IPC client is not connected".into());
            }
            tokio::time::sleep(std::time::Duration::from_millis(50)).await;
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_build_mpv_args_direct3d_invariants() {
        let hwnd = 12345678;
        let pipe = r"\\.\pipe\mpvsocket_test";
        let args = MpvManager::build_mpv_args(hwnd, pipe);

        // AGENTS.md Section 5.C Invariants
        assert!(args.contains(&"--wid=12345678".to_string()));
        assert!(args.contains(&format!("--input-ipc-server={}", pipe)));
        assert!(args.contains(&"--gpu-api=d3d11".to_string()));
        assert!(args.contains(&"--gpu-context=d3d11".to_string()));
        assert!(args.contains(&"--d3d11-exclusive-fs=no".to_string()));
        assert!(args.contains(&"--force-window=yes".to_string()));
        assert!(args.contains(&"--border=no".to_string()));
        assert!(args.contains(&"--cursor-autohide=no".to_string()));
        assert!(args.contains(&"--window-dragging=no".to_string()));
        assert!(args.contains(&"--idle=yes".to_string()));
    }

    #[test]
    fn test_mpv_manager_default_pipe_name() {
        let mgr = MpvManager::new();
        assert!(mgr.pipe_name.starts_with(r"\\.\pipe\mpvsocket_novidplayer_"));
    }
}
