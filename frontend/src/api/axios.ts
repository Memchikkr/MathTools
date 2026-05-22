import axios from 'axios';

// В dev-режиме (npm start / cargo tauri dev) бэкенд поднимается вручную
// на фиксированном порту 8000 — это и есть дефолт. В production Tauri-сборке
// sidecar получает порт от ОС, печатает его в stdout, Rust-обёртка сохраняет
// и отдаёт фронту через invoke('get_backend_port'). Здесь мы пытаемся его
// получить с ретраями; пока порт неизвестен — работает дефолт.
const DEFAULT_BASE_URL = 'http://127.0.0.1:8000';

const instance = axios.create({ baseURL: DEFAULT_BASE_URL });

function isTauri(): boolean {
    return typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
}

async function discoverBackendPort(): Promise<void> {
    if (!isTauri()) return;
    try {
        const { invoke } = await import('@tauri-apps/api/core');
        // Поллинг: sidecar мог ещё не успеть напечатать порт к моменту запуска фронта.
        for (let i = 0; i < 120; i++) {
            const port = await invoke<number | null>('get_backend_port').catch(() => null);
            if (port) {
                instance.defaults.baseURL = `http://127.0.0.1:${port}`;
                return;
            }
            await new Promise((resolve) => setTimeout(resolve, 500));
        }
    } catch {
        // В dev tauri-команда может быть недоступна — остаёмся на дефолте.
    }
}

discoverBackendPort();

export default instance;
