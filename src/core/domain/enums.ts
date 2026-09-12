// Типы операций учёта
export const TransactionType = {
    Income: 'income',
    Expense: 'expense',
} as const;
export type TransactionType = (typeof TransactionType)[keyof typeof TransactionType];

// Группировки игровых экономических блоков «Золотого клона»
export const Category = {
    Animals: 'animals',
    Factories: 'factories',
    StateEnterprises: 'state-enterprises',
    RealEstate: 'real-estate',
    Rentier: 'rentier',
    Trade: 'trade',
    Other: 'other',
} as const;
export type Category = (typeof Category)[keyof typeof Category];

export const CATEGORY_LABELS: Record<Category, string> = {
    [Category.Animals]: 'Животноводство',
    [Category.Factories]: 'Заводы и фабрики',
    [Category.StateEnterprises]: 'Государственные предприятия',
    [Category.RealEstate]: 'Недвижимость',
    [Category.Rentier]: 'Рентные активы',
    [Category.Trade]: 'Торговля и биржа',
    [Category.Other]: 'Прочее',
};

// Серверы игры «Золотой клон»
export const Server = {
    Metropolis: 'metropolis',
    Enclave: 'enclave',
} as const;
export type Server = (typeof Server)[keyof typeof Server];

/** Список серверов в фиксированном порядке отображения. */
export const SERVERS: readonly Server[] = [Server.Metropolis, Server.Enclave];

export const SERVER_LABELS: Record<Server, string> = {
    [Server.Metropolis]: 'Метрополия',
    [Server.Enclave]: 'Анклав',
};