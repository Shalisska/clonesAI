import type { AppData, Block, PriceQuote, Transaction } from '../../core/domain/types';
import { CURRENT_SCHEMA_VERSION } from './schema';

/** Формирует объект резервной копии из текущих коллекций. */
export function createBackup(
    blocks: Block[],
    transactions: Transaction[],
    quotes: PriceQuote[],
): AppData {
    return {
        version: CURRENT_SCHEMA_VERSION,
        exportedAt: new Date().toISOString(),
        blocks,
        transactions,
        quotes,
    };
}

/** Сериализация резервной копии в JSON (с отступами для читаемости). */
export function serializeBackup(data: AppData): string {
    return JSON.stringify(data, null, 2);
}

/** Разбор JSON резервной копии с базовой валидацией структуры. */
export function parseBackup(raw: string): AppData | null {
    try {
        const data = JSON.parse(raw) as Partial<AppData>;
        if (!data || typeof data !== 'object') return null;
        if (!Array.isArray(data.blocks)) return null;
        if (!Array.isArray(data.transactions)) return null;
        if (!Array.isArray(data.quotes)) return null;
        return data as AppData;
    } catch {
        return null;
    }
}

/** Скачивание резервной копии как файла .json. */
export function downloadBackup(data: AppData, filename = `golden-clone-backup-${Date.now()}.json`): void {
    const blob = new Blob([serializeBackup(data)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}