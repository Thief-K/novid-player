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

    pub fn hash_path(path: &str) -> u64 {
        let mut hasher = DefaultHasher::new();
        path.hash(&mut hasher);
        hasher.finish()
    }

    pub fn quantize_time(time_sec: f64) -> f64 {
        // Quantize time to 0.5s intervals for high cache reuse
        (time_sec.max(0.0) * 2.0).round() / 2.0
    }

    pub fn build_thumbnail_args(video_path: &str, time_quantized: f64, out_dir: &str) -> Vec<String> {
        vec![
            video_path.to_string(),
            format!("--start={:.2}", time_quantized),
            "--frames=1".to_string(),
            "--no-audio".to_string(),
            "--no-config".to_string(),
            "--no-osc".to_string(),
            "--no-osd-bar".to_string(),
            "--no-input-default-bindings".to_string(),
            "--terminal=no".to_string(),
            "--hr-seek=no".to_string(), // Fast keyframe seek for instant preview
            "--vf=scale=320:-1".to_string(),
            "--vo=image".to_string(),
            "--vo-image-format=jpeg".to_string(),
            "--vo-image-jpeg-quality=80".to_string(),
            format!("--vo-image-outdir={}", out_dir),
        ]
    }

    pub async fn get_thumbnail(
        &self,
        mpv_path: &Path,
        video_path: &str,
        time_sec: f64,
    ) -> Result<String, String> {
        let time_quantized = Self::quantize_time(time_sec);
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
        let args = Self::build_thumbnail_args(video_path, time_quantized, &out_dir.to_string_lossy());
        cmd.args(args);

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

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_quantize_time() {
        assert_eq!(ThumbnailManager::quantize_time(0.0), 0.0);
        assert_eq!(ThumbnailManager::quantize_time(-5.0), 0.0);
        assert_eq!(ThumbnailManager::quantize_time(1.2), 1.0);
        assert_eq!(ThumbnailManager::quantize_time(1.3), 1.5);
        assert_eq!(ThumbnailManager::quantize_time(1.74), 1.5);
        assert_eq!(ThumbnailManager::quantize_time(1.76), 2.0);
    }

    #[test]
    fn test_build_thumbnail_args_invariants() {
        let video_path = "C:\\Videos\\sample.mp4";
        let out_dir = "C:\\Temp\\out_thumb";
        let args = ThumbnailManager::build_thumbnail_args(video_path, 12.5, out_dir);

        // AGENTS.md Section 5.E Invariants
        assert!(args.contains(&video_path.to_string()));
        assert!(args.contains(&"--start=12.50".to_string()));
        assert!(args.contains(&"--frames=1".to_string()));
        assert!(args.contains(&"--no-audio".to_string()));
        assert!(args.contains(&"--vf=scale=320:-1".to_string()));
        assert!(args.contains(&"--vo=image".to_string()));
        assert!(args.contains(&"--hr-seek=no".to_string()));
        assert!(args.contains(&format!("--vo-image-outdir={}", out_dir)));
    }

    #[test]
    fn test_hash_path_consistency() {
        let hash1 = ThumbnailManager::hash_path("C:\\Video\\test.mp4");
        let hash2 = ThumbnailManager::hash_path("C:\\Video\\test.mp4");
        let hash3 = ThumbnailManager::hash_path("C:\\Video\\other.mp4");
        assert_eq!(hash1, hash2);
        assert_ne!(hash1, hash3);
    }
}
