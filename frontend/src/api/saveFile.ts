import { saveAs } from 'file-saver';
import { save } from '@tauri-apps/plugin-dialog';
import { invoke } from '@tauri-apps/api/core';

function isTauri(): boolean {
    return typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
}

/**
 * Сохранение через нативный диалог «Сохранить как».
 * В Tauri возвращает абсолютный путь к сохранённому файлу или null
 * (если пользователь отменил диалог). В браузере (dev) использует
 * file-saver и возвращает null.
 */
export async function saveBlob(blob: Blob, filename: string): Promise<string | null> {
    if (!isTauri()) {
        saveAs(blob, filename);
        return null;
    }

    const path = await save({ defaultPath: filename });
    if (!path) {
        return null;
    }

    // Tauri v2 передаёт Uint8Array сырыми байтами по быстрому пути
    const contents = new Uint8Array(await blob.arrayBuffer());
    await invoke('save_file', { path, contents });
    return path;
}

/**
 * Быстрое сохранение в системную папку «Загрузки» без диалога.
 * Полезно когда нативный диалог недоступен или неудобен
 * (например, под WSLg) — место сохранения предсказуемо.
 */
export async function saveBlobToDownloads(
    blob: Blob,
    filename: string,
): Promise<string | null> {
    if (!isTauri()) {
        // Браузер: ничего другого предложить не можем
        saveAs(blob, filename);
        return null;
    }

    const dir = await invoke<string>('get_default_save_dir');
    const separator = dir.includes('\\') ? '\\' : '/';
    const path = `${dir}${separator}${filename}`;

    const contents = new Uint8Array(await blob.arrayBuffer());
    await invoke('save_file', { path, contents });
    return path;
}

/** Открывает папку с файлом в системном файловом менеджере. */
export async function revealInFolder(path: string): Promise<void> {
    if (!isTauri()) return;
    await invoke('reveal_in_folder', { path });
}
