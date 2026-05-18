#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::sync::{Mutex, Once};
use tauri::Manager;
use tauri_plugin_shell::ShellExt;

static START_BACKEND: Once = Once::new();
static BACKEND_CHILD: Mutex<Option<tauri_plugin_shell::process::CommandChild>> = Mutex::new(None);

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
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

                        // Ждём пока бэкенд поднимется
                        loop {
                            match reqwest::blocking::get("http://127.0.0.1:8000/") {
                                Ok(_) => break,
                                Err(_) => std::thread::sleep(std::time::Duration::from_millis(300)),
                            }
                        }

                        // Небольшая задержка чтобы фронтенд успел загрузиться
                        std::thread::sleep(std::time::Duration::from_millis(500));

                        // Показываем окно только когда бэкенд готов
                        if let Some(window) = app_handle.get_webview_window("main") {
                            let _ = window.show();
                        }

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
