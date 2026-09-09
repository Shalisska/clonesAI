/** Текущая версия схемы данных приложения (для миграций). */
export const CURRENT_SCHEMA_VERSION = 1;

export const APP_STORAGE_PREFIX = 'golden-clone-assistant';

export const STORAGE_KEYS = {
    blocks: `${APP_STORAGE_PREFIX}:blocks`,
    transactions: `${APP_STORAGE_PREFIX}:transactions`,
    quotes: `${APP_STORAGE_PREFIX}:quotes`,
} as const;

export const DB_NAME = 'golden-clone-assistant-db';
export const QUOTES_STORE = 'quotes';