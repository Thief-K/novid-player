pub mod commands;
pub mod mpv_ipc;
pub mod mpv_manager;
pub mod thumbnail;

use mpv_manager::MpvManager;
use tauri::{Emitter, Manager, WindowEvent};
use thumbnail::ThumbnailManager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    env_logger::Builder::from_env(env_logger::Env::default().default_filter_or("info")).init();

    let mpv_manager = MpvManager::new();
    let mpv_clone = mpv_manager.clone();
    let thumbnail_manager = ThumbnailManager::new();
    let thumbnail_clone = thumbnail_manager.clone();

    tauri::Builder::default()
        .plugin(tauri_plugin_single_instance::init(|app, args, cwd| {
            log::info!("Single instance launch detected. Args: {:?}, Cwd: {:?}", args, cwd);
            let files = commands::parse_cli_files(&args, Some(&cwd));
            if !files.is_empty() {
                let _ = app.emit("open-files", files);
            }
            if let Some(window) = app.get_webview_window("main") {
                let _ = window.show();
                let _ = window.unminimize();
                let _ = window.set_focus();
            }
        }))
        .plugin(tauri_plugin_dialog::init())
        .manage(mpv_manager)
        .manage(thumbnail_manager)
        .invoke_handler(tauri::generate_handler![
            commands::mpv_command,
            commands::mpv_set_property,
            commands::load_file,
            commands::take_screenshot,
            commands::check_mpv_status,
            commands::get_video_thumbnail,
            commands::cleanup_thumbnails,
            commands::toggle_window_maximize,
            commands::auto_fit_window,
            commands::get_startup_paths,
            commands::open_external_url,
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
                thumbnail_clone.cleanup();
            }
        })
        .run(tauri::generate_context!())
        .expect("error while running NovidPlayer application");
}
