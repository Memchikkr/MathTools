import { saveAs } from 'file-saver';
import { save } from '@tauri-apps/plugin-dialog';
import { invoke } from '@tauri-apps/api/core';

function isTauri(): boolean {
    return typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
}

/**
 * Сохраняет blob на диск. В Tauri открывает нативный диалог «Сохранить как»
 * и пишет файл через Rust-команду. В браузере (dev) использует file-saver.
 */
export async function saveBlob(blob: Blob, filename: string): Promise<void> {
    if (!isTauri()) {
        saveAs(blob, filename);
        return;
    }

    const path = await save({ defaultPath: filename });
    if (!path) {
        return; // пользователь отменил диалог
    }

    // Передаём байты напрямую: Tauri v2 шлёт Uint8Array сырыми байтами
    // (Array.from раздувал бы файл в JSON-массив из миллионов чисел)
    const contents = new Uint8Array(await blob.arrayBuffer());
    await invoke('save_file', { path, contents });
}
