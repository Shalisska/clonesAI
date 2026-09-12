/** Текущая версия схемы данных приложения (для миграций). */
export const CURRENT_SCHEMA_VERSION = 2;

export const APP_STORAGE_PREFIX = 'golden-clone-assistant';

export const STORAGE_KEYS = {
    users: `${APP_STORAGE_PREFIX}:users`,
    accounts: `${APP_STORAGE_PREFIX}:accounts`,
    blocks: `${APP_STORAGE_PREFIX}:blocks`,
    transactions: `${APP_STORAGE_PREFIX}:transactions`,
    quotes: `${APP_STORAGE_PREFIX}:quotes`,
} as const;

/** Ключ выбранного в данный момент аккаунта (переживает перезагрузку). */
export const ACTIVE_ACCOUNT_KEY = `${APP_STORAGE_PREFIX}:active-account`;

export const DB_NAME = 'golden-clone-assistant-db';
export const QUOTES_STORE = 'quotes';