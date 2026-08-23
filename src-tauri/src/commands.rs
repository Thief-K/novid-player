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

    let screenshots_dir = if let Ok(user_profile) = std::env::var("USERPROFILE") {
        format!("{}\\Pictures\\Screenshots", user_profile)
    } else if let Ok(home) = std::env::var("HOME") {
        format!("{}/Pictures/Screenshots", home)
    } else {
        "Screenshots".to_string()
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

    manager
        .send_command(vec![
            Value::String("screenshot".to_string()),
            Value::String(mode.to_string()),
        ])
        .await
        .map(|_| screenshots_dir)
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
