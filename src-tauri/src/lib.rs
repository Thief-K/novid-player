pub mod commands;
pub mod mpv_ipc;
pub mod mpv_manager;

use mpv_manager::MpvManager;
use tauri::{Manager, WindowEvent};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    env_logger::Builder::from_env(env_logger::Env::default().default_filter_or("info")).init();

    let mpv_manager = MpvManager::new();
    let mpv_clone = mpv_manager.clone();

    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_opener::init())
        .manage(mpv_manager)
        .invoke_handler(tauri::generate_handler![
            commands::mpv_command,
            commands::mpv_set_property,
            commands::load_file,
            commands::play_pause,
            commands::seek,
            commands::set_volume,
            commands::set_mute,
            commands::set_speed,
            commands::set_track,
            commands::load_sub,
            commands::load_audio,
            commands::set_sub_delay,
            commands::set_audio_delay,
            commands::set_video_aspect,
            commands::set_video_adjust,
            commands::frame_step,
            commands::take_screenshot,
            commands::check_mpv_status,
            commands::start_window_dragging,
            commands::toggle_window_maximize,
            commands::toggle_window_fullscreen,
            commands::is_window_fullscreen,
            commands::minimize_window,
            commands::close_window,
            commands::set_window_always_on_top,
        ])
        .setup(move |app| {
            let window = app.get_webview_window("main").expect("Failed to get main window");
            let _ = window.set_icon(tauri::include_image!("../icons/128x128.png"));

            #[cfg(windows)]
            {
                if let Ok(hwnd) = window.hwnd() {
                    let hwnd_raw = hwnd.0 as usize;
                    let mpv = mpv_clone.clone();
                    let handle = app.handle().clone();

                    tauri::async_runtime::spawn(async move {
                        // Give window a brief moment to stabilize
                        tokio::time::sleep(std::time::Duration::from_millis(200)).await;
                        if let Err(e) = mpv.start(handle, hwnd_raw).await {
                            log::warn!("MPV startup notification: {}", e);
                        }
                    });
                }
            }

            Ok(())
        })
        .on_window_event(move |_window, event| {
            if let WindowEvent::Destroyed = event {
                // Window destroyed cleanup
            }
        })
        .run(tauri::generate_context!())
        .expect("error while running NovidPlayer application");
}
