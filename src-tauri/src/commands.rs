use crate::mpv_manager::MpvManager;
use serde_json::Value;
use tauri::{AppHandle, State};

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
pub async fn play_pause(manager: State<'_, MpvManager>) -> Result<(), String> {
    manager
        .send_command(vec![
            Value::String("cycle".to_string()),
            Value::String("pause".to_string()),
        ])
        .await
        .map(|_| ())
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn set_pause(manager: State<'_, MpvManager>, pause: bool) -> Result<(), String> {
    manager
        .send_command(vec![
            Value::String("set_property".to_string()),
            Value::String("pause".to_string()),
            Value::Bool(pause),
        ])
        .await
        .map(|_| ())
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn seek(
    manager: State<'_, MpvManager>,
    seconds: f64,
    relative: Option<bool>,
) -> Result<(), String> {
    let mode = if relative.unwrap_or(false) {
        "relative"
    } else {
        "absolute"
    };
    manager
        .send_command(vec![
            Value::String("seek".to_string()),
            serde_json::json!(seconds),
            Value::String(mode.to_string()),
        ])
        .await
        .map(|_| ())
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn set_volume(manager: State<'_, MpvManager>, volume: f64) -> Result<(), String> {
    manager
        .send_command(vec![
            Value::String("set_property".to_string()),
            Value::String("volume".to_string()),
            serde_json::json!(volume),
        ])
        .await
        .map(|_| ())
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn set_mute(manager: State<'_, MpvManager>, mute: bool) -> Result<(), String> {
    manager
        .send_command(vec![
            Value::String("set_property".to_string()),
            Value::String("mute".to_string()),
            Value::Bool(mute),
        ])
        .await
        .map(|_| ())
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn set_speed(manager: State<'_, MpvManager>, speed: f64) -> Result<(), String> {
    manager
        .send_command(vec![
            Value::String("set_property".to_string()),
            Value::String("speed".to_string()),
            serde_json::json!(speed),
        ])
        .await
        .map(|_| ())
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn set_track(
    manager: State<'_, MpvManager>,
    track_type: String,
    id: Value,
) -> Result<(), String> {
    // track_type: "sid" (subtitle), "aid" (audio), "vid" (video)
    manager
        .send_command(vec![
            Value::String("set_property".to_string()),
            Value::String(track_type),
            id,
        ])
        .await
        .map(|_| ())
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn load_sub(manager: State<'_, MpvManager>, path: String) -> Result<(), String> {
    manager
        .send_command(vec![
            Value::String("sub-add".to_string()),
            Value::String(path),
            Value::String("select".to_string()),
        ])
        .await
        .map(|_| ())
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn load_audio(manager: State<'_, MpvManager>, path: String) -> Result<(), String> {
    manager
        .send_command(vec![
            Value::String("audio-add".to_string()),
            Value::String(path),
            Value::String("select".to_string()),
        ])
        .await
        .map(|_| ())
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn set_sub_delay(manager: State<'_, MpvManager>, delay_sec: f64) -> Result<(), String> {
    manager
        .send_command(vec![
            Value::String("set_property".to_string()),
            Value::String("sub-delay".to_string()),
            serde_json::json!(delay_sec),
        ])
        .await
        .map(|_| ())
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn set_audio_delay(
    manager: State<'_, MpvManager>,
    delay_sec: f64,
) -> Result<(), String> {
    manager
        .send_command(vec![
            Value::String("set_property".to_string()),
            Value::String("audio-delay".to_string()),
            serde_json::json!(delay_sec),
        ])
        .await
        .map(|_| ())
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn set_video_aspect(
    manager: State<'_, MpvManager>,
    ratio: String,
) -> Result<(), String> {
    let aspect_val = match ratio.as_str() {
        "16:9" => "1.777778",
        "4:3" => "1.333333",
        "21:9" => "2.333333",
        "1:1" => "1.0",
        "custom" => "-1",
        _ => "-1", // default original
    };
    manager
        .send_command(vec![
            Value::String("set_property".to_string()),
            Value::String("video-aspect-override".to_string()),
            Value::String(aspect_val.to_string()),
        ])
        .await
        .map(|_| ())
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn set_video_adjust(
    manager: State<'_, MpvManager>,
    prop: String,
    val: f64,
) -> Result<(), String> {
    // prop: "brightness", "contrast", "saturation", "gamma", "hue"
    manager
        .send_command(vec![
            Value::String("set_property".to_string()),
            Value::String(prop),
            serde_json::json!(val),
        ])
        .await
        .map(|_| ())
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn frame_step(manager: State<'_, MpvManager>, forward: bool) -> Result<(), String> {
    let cmd = if forward {
        "frame-step"
    } else {
        "frame-back-step"
    };
    manager
        .send_command(vec![Value::String(cmd.to_string())])
        .await
        .map(|_| ())
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn take_screenshot(
    manager: State<'_, MpvManager>,
    include_subtitles: bool,
) -> Result<String, String> {
    let mode = if include_subtitles {
        "subtitles"
    } else {
        "video"
    };

    let screenshots_dir = match std::env::var("USERPROFILE") {
        Ok(user_profile) => format!("{}\\Pictures\\Screenshots", user_profile),
        Err(_) => match std::env::var("HOME") {
            Ok(home) => format!("{}/Pictures/Screenshots", home),
            Err(_) => "Screenshots".to_string(),
        },
    };
    let _ = std::fs::create_dir_all(&screenshots_dir);

    // Ensure MPV has the screenshot directory configured
    let _ = manager
        .send_command(vec![
            Value::String("set_property".to_string()),
            Value::String("screenshot-directory".to_string()),
            Value::String(screenshots_dir.clone()),
        ])
        .await;

    match manager
        .send_command(vec![
            Value::String("screenshot".to_string()),
            Value::String(mode.to_string()),
        ])
        .await
    {
        Ok(_) => Ok(screenshots_dir),
        Err(e) => Err(e.to_string()),
    }
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
    thumb_mgr: State<'_, crate::thumbnail::ThumbnailManager>,
    app: AppHandle,
    file_path: String,
    time_sec: f64,
) -> Result<String, String> {
    let mpv_path = manager
        .find_mpv_binary(&app)
        .ok_or_else(|| "MPV binary not found".to_string())?;

    thumb_mgr
        .get_thumbnail(&app, &mpv_path, &file_path, time_sec)
        .await
}

#[tauri::command]
pub async fn cleanup_thumbnails(
    thumb_mgr: State<'_, crate::thumbnail::ThumbnailManager>,
) -> Result<(), String> {
    thumb_mgr.cleanup();
    Ok(())
}

#[tauri::command]
pub async fn start_window_dragging(window: tauri::Window) -> Result<(), String> {
    window.start_dragging().map_err(|e| e.to_string())
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
pub async fn toggle_window_fullscreen(window: tauri::Window) -> Result<bool, String> {
    let is_fullscreen = window.is_fullscreen().map_err(|e| e.to_string())?;
    let next = !is_fullscreen;
    window.set_fullscreen(next).map_err(|e| e.to_string())?;
    Ok(next)
}

#[tauri::command]
pub async fn is_window_fullscreen(window: tauri::Window) -> Result<bool, String> {
    window.is_fullscreen().map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn minimize_window(window: tauri::Window) -> Result<(), String> {
    window.minimize().map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn close_window(window: tauri::Window) -> Result<(), String> {
    window.close().map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn set_window_always_on_top(
    window: tauri::Window,
    always_on_top: bool,
) -> Result<(), String> {
    window
        .set_always_on_top(always_on_top)
        .map_err(|e| e.to_string())
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
