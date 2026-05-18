#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::sync::{Mutex, Once};
use tauri::Manager;
use tauri_plugin_shell::ShellExt;

static START_BACKEND: Once = Once::new();
static BACKEND_CHILD: Mutex<Option<tauri_plugin_shell::process::CommandChild>> = Mutex::new(None);

#[tauri::command]
async fn save_file(path: String, contents: Vec<u8>) -> Result<(), String> {
    std::fs::write(&path, &contents).map_err(|e| e.to_string())
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![save_file])
        .setup(|app| {
            let app_handle = app.handle().clone();

            START_BACKEND.call_once(|| {
                if cfg!(not(debug_assertions)) {
                    std::thread::spawn(move || {
                        let sidecar = app_handle
                            .shell()
                            .sidecar("math-tools-backend")
                            .expect("Sidecar не найден");
                        let (mut rx, child) =
                            sidecar.spawn().expect("Не удалось запустить sidecar");

                        *BACKEND_CHILD.lock().unwrap() = Some(child);

                        // Готовность бэкенда проверяет фронтенд (см. BackendGate)
                        tauri::async_runtime::block_on(async move {
                            while let Some(event) = rx.recv().await {
                                match event {
                                    tauri_plugin_shell::process::CommandEvent::Stderr(line) => {
                                        eprintln!(
                                            "Backend stderr: {}",
                                            String::from_utf8_lossy(&line)
                                        );
                                    }
                                    tauri_plugin_shell::process::CommandEvent::Stdout(line) => {
                                        eprintln!(
                                            "Backend stdout: {}",
                                            String::from_utf8_lossy(&line)
                                        );
                                    }
                                    _ => {}
                                }
                            }
                        });
                    });
                } else {
                    eprintln!(
                        "Режим разработки: бэкенд запускайте вручную (python backend/main.py)"
                    );
                }
            });

            Ok(())
        })
        .on_window_event(|window, event| {
            if let tauri::WindowEvent::CloseRequested { .. } = event {
                // Убиваем весь дерево процессов через taskkill
                #[cfg(target_os = "windows")]
                {
                    if let Ok(mut child_lock) = BACKEND_CHILD.lock() {
                        if let Some(child) = child_lock.take() {
                            let pid = child.pid();
                            let _ = std::process::Command::new("taskkill")
                                .args(["/F", "/T", "/PID", &pid.to_string()])
                                .spawn();
                        }
                    }
                }
                window.app_handle().exit(0);
            }
        })
        .run(tauri::generate_context!())
        .expect("Ошибка при запуске приложения");
}
