use crate::mpv_manager::MpvManager;
use crate::thumbnail::ThumbnailManager;
use serde_json::Value;
use tauri::{AppHandle, Manager, State};

#[tauri::command]
pub async fn mpv_command(
    manager: State<'_, MpvManager>,
    command: Vec<Value>,
) -> Result<u64, String> {
    manager
        .send_command(command)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn mpv_set_property(
    manager: State<'_, MpvManager>,
    property: String,
    value: Value,
) -> Result<(), String> {
    manager
        .send_command(vec![
            Value::String("set_property".to_string()),
            Value::String(property),
            value,
        ])
        .await
        .map(|_| ())
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn load_file(
    manager: State<'_, MpvManager>,
    path: String,
    mode: Option<String>,
) -> Result<(), String> {
    let mode_str = mode.unwrap_or_else(|| "replace".to_string());
    manager
        .send_command(vec![
            Value::String("loadfile".to_string()),
            Value::String(path),
            Value::String(mode_str),
        ])
        .await
        .map(|_| ())
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn take_screenshot(
    manager: State<'_, MpvManager>,
    app: AppHandle,
    include_subtitles: bool,
) -> Result<String, String> {
    let mode = if include_subtitles {
        "subtitles"
    } else {
        "video"
    };

    let base_dir = app
        .path()
        .picture_dir()
        .unwrap_or_else(|_| std::path::PathBuf::from("."));
    let screenshots_dir = base_dir.join("Screenshots");
    let screenshots_str = screenshots_dir.to_string_lossy().to_string();

    let _ = std::fs::create_dir_all(&screenshots_dir);

    let _ = manager
        .send_command(vec![
            Value::String("set_property".to_string()),
            Value::String("screenshot-directory".to_string()),
            Value::String(screenshots_str.clone()),
        ])
        .await;

    manager
        .send_command(vec![
            Value::String("screenshot".to_string()),
            Value::String(mode.to_string()),
        ])
        .await
        .map(|_| screenshots_str)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn check_mpv_status(
    manager: State<'_, MpvManager>,
    app: AppHandle,
) -> Result<bool, String> {
    Ok(manager.find_mpv_binary(&app).is_some())
}

#[tauri::command]
pub async fn get_video_thumbnail(
    manager: State<'_, MpvManager>,
    thumb_mgr: State<'_, ThumbnailManager>,
    app: AppHandle,
    file_path: String,
    time_sec: f64,
) -> Result<String, String> {
    let mpv_path = manager
        .find_mpv_binary(&app)
        .ok_or_else(|| "MPV binary not found".to_string())?;

    thumb_mgr
        .get_thumbnail(&mpv_path, &file_path, time_sec)
        .await
}

#[tauri::command]
pub async fn cleanup_thumbnails(
    thumb_mgr: State<'_, ThumbnailManager>,
) -> Result<(), String> {
    thumb_mgr.cleanup();
    Ok(())
}

#[tauri::command]
pub async fn toggle_window_maximize(window: tauri::Window) -> Result<bool, String> {
    if window.is_fullscreen().unwrap_or(false) {
        let _ = window.set_fullscreen(false);
    }

    let is_max = window.is_maximized().map_err(|e| e.to_string())?;
    let next = if is_max {
        window.unmaximize().map_err(|e| e.to_string())?;
        false
    } else {
        window.maximize().map_err(|e| e.to_string())?;
        true
    };

    Ok(next)
}

#[tauri::command]
pub async fn auto_fit_window(
    window: tauri::Window,
    video_width: f64,
    video_height: f64,
) -> Result<(), String> {
    if video_width <= 0.0 || video_height <= 0.0 {
        return Ok(());
    }

    // Do not resize if currently fullscreen or maximized
    if window.is_fullscreen().unwrap_or(false) || window.is_maximized().unwrap_or(false) {
        return Ok(());
    }

    let monitor = window
        .current_monitor()
        .map_err(|e| e.to_string())?
        .or_else(|| window.primary_monitor().ok().flatten());

    let (max_w, max_h) = if let Some(m) = monitor {
        let scale = m.scale_factor();
        let size = m.size();
        let logical_w = size.width as f64 / scale;
        let logical_h = size.height as f64 / scale;
        (logical_w * 0.85, logical_h * 0.85)
    } else {
        (1920.0 * 0.85, 1080.0 * 0.85)
    };

    let min_w = 640.0;
    let min_h = 400.0;
    let aspect = video_width / video_height;

    let mut target_w = video_width;
    let mut target_h = video_height;

    // 1. Proportional downscale if exceeding max safe screen bounds
    if target_w > max_w || target_h > max_h {
        let scale_w = max_w / target_w;
        let scale_h = max_h / target_h;
        let scale = scale_w.min(scale_h);
        target_w *= scale;
        target_h *= scale;
    }

    // 2. Scale up if below minimum bounds while preserving aspect ratio
    if target_w < min_w {
        target_w = min_w;
        target_h = min_w / aspect;
    }
    if target_h < min_h {
        target_h = min_h;
        target_w = min_h * aspect;
    }

    // 3. Final safety clamp against max bounds
    if target_w > max_w {
        target_w = max_w;
        target_h = max_w / aspect;
    }
    if target_h > max_h {
        target_h = max_h;
        target_w = max_h * aspect;
    }

    let final_w = target_w.round() as u32;
    let final_h = target_h.round() as u32;

    window
        .set_size(tauri::LogicalSize::new(final_w, final_h))
        .map_err(|e| e.to_string())?;
    window.center().map_err(|e| e.to_string())?;

    Ok(())
}

pub fn parse_cli_files(args: &[String], cwd: Option<&str>) -> Vec<String> {
    let mut files = Vec::new();
    for arg in args.iter().skip(1) {
        if arg.starts_with('-') || arg.starts_with("--") {
            continue;
        }
        let clean_arg = arg.trim_matches('"').trim_matches('\'');
        if clean_arg.is_empty() {
            continue;
        }
        let path = std::path::Path::new(clean_arg);
        let resolved = if path.is_absolute() {
            path.to_path_buf()
        } else if let Some(cwd_str) = cwd {
            std::path::Path::new(cwd_str).join(path)
        } else if let Ok(current_dir) = std::env::current_dir() {
            current_dir.join(path)
        } else {
            path.to_path_buf()
        };

        if resolved.exists() {
            files.push(resolved.to_string_lossy().to_string());
        } else {
            let ext = resolved
                .extension()
                .and_then(|e| e.to_str())
                .unwrap_or("")
                .to_lowercase();
            let media_exts = [
                "mp4", "mkv", "avi", "mov", "wmv", "flv", "webm", "m4v", "ts", "m2ts", "rmvb",
                "3gp", "vob", "ogv", "mpg", "mpeg", "mp3", "flac", "wav", "aac", "ogg", "m4a",
                "wma", "opus", "srt", "ass", "ssa", "vtt", "sub",
            ];
            if media_exts.contains(&ext.as_str()) {
                files.push(resolved.to_string_lossy().to_string());
            }
        }
    }
    files
}

static STARTUP_PATHS_CONSUMED: std::sync::atomic::AtomicBool =
    std::sync::atomic::AtomicBool::new(false);

#[tauri::command]
pub fn get_startup_paths() -> Vec<String> {
    if STARTUP_PATHS_CONSUMED.swap(true, std::sync::atomic::Ordering::SeqCst) {
        return Vec::new();
    }
    let args: Vec<String> = std::env::args().collect();
    parse_cli_files(&args, None)
}

#[tauri::command]
pub fn open_external_url(url: String) -> Result<(), String> {
    #[cfg(windows)]
    {
        use std::os::windows::process::CommandExt;
        const CREATE_NO_WINDOW: u32 = 0x08000000;
        std::process::Command::new("cmd")
            .args(["/c", "start", "", &url])
            .creation_flags(CREATE_NO_WINDOW)
            .spawn()
            .map_err(|e| e.to_string())?;
        Ok(())
    }
    #[cfg(not(windows))]
    {
        let _ = url;
        Ok(())
    }
}

