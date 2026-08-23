use base64::prelude::*;
use std::collections::hash_map::DefaultHasher;
use std::hash::{Hash, Hasher};
use std::path::{Path, PathBuf};
use std::sync::Arc;

#[derive(Clone)]
pub struct ThumbnailManager {
    temp_dir: PathBuf,
    semaphore: Arc<tokio::sync::Semaphore>,
}

impl Default for ThumbnailManager {
    fn default() -> Self {
        Self::new()
    }
}

impl ThumbnailManager {
    pub fn new() -> Self {
        let temp_base = std::env::temp_dir().join("novidplayer_thumbs");
        let session_id = format!("session_{}", std::process::id());
        let session_dir = temp_base.join(session_id);
        let _ = std::fs::create_dir_all(&session_dir);

        Self {
            temp_dir: session_dir,
            semaphore: Arc::new(tokio::sync::Semaphore::new(2)),
        }
    }

    fn hash_path(path: &str) -> u64 {
        let mut hasher = DefaultHasher::new();
        path.hash(&mut hasher);
        hasher.finish()
    }

    pub async fn get_thumbnail(
        &self,
        mpv_path: &Path,
        video_path: &str,
        time_sec: f64,
    ) -> Result<String, String> {
        let clamped_time = if time_sec < 0.0 { 0.0 } else { time_sec };
        // Quantize time to 0.5s intervals for high cache reuse
        let time_quantized = (clamped_time * 2.0).round() / 2.0;
        let path_hash = Self::hash_path(video_path);
        let cache_key = format!("{:x}_{:.1}", path_hash, time_quantized);

        // 1. Check disk cache
        let target_file = self.temp_dir.join(format!("{}.jpg", cache_key));
        if target_file.exists() && target_file.metadata().map(|m| m.len() > 0).unwrap_or(false) {
            if let Ok(bytes) = std::fs::read(&target_file) {
                return Ok(format!("data:image/jpeg;base64,{}", BASE64_STANDARD.encode(&bytes)));
            }
        }

        // 2. Extract frame using MPV with concurrency limiting
        if !Path::new(video_path).exists() {
            return Err("Video file not found".to_string());
        }

        let _permit = self
            .semaphore
            .acquire()
            .await
            .map_err(|e| e.to_string())?;

        let out_dir = self.temp_dir.join(format!("out_{}", cache_key));
        let _ = std::fs::create_dir_all(&out_dir);

        let mut cmd = tokio::process::Command::new(mpv_path);
        cmd.arg(video_path)
            .arg(format!("--start={:.2}", time_quantized))
            .arg("--frames=1")
            .arg("--no-audio")
            .arg("--no-config")
            .arg("--no-osc")
            .arg("--no-osd-bar")
            .arg("--no-input-default-bindings")
            .arg("--terminal=no")
            .arg("--hr-seek=no") // Fast keyframe seek for instant preview
            .arg("--vf=scale=320:-1")
            .arg("--vo=image")
            .arg("--vo-image-format=jpeg")
            .arg("--vo-image-jpeg-quality=80")
            .arg(format!("--vo-image-outdir={}", out_dir.to_string_lossy()));

        #[cfg(windows)]
        {
            const CREATE_NO_WINDOW: u32 = 0x08000000;
            cmd.creation_flags(CREATE_NO_WINDOW);
        }

        let _ = cmd.output().await;

        let extracted_frame = out_dir.join("00000001.jpg");
        if extracted_frame.exists() {
            if let Ok(bytes) = std::fs::read(&extracted_frame) {
                let _ = std::fs::rename(&extracted_frame, &target_file);
                let _ = std::fs::remove_dir_all(&out_dir);
                return Ok(format!("data:image/jpeg;base64,{}", BASE64_STANDARD.encode(&bytes)));
            }
        }
        let _ = std::fs::remove_dir_all(&out_dir);

        Err("Failed to extract thumbnail frame".to_string())
    }

    pub fn cleanup(&self) {
        let _ = std::fs::remove_dir_all(&self.temp_dir);
    }
}
