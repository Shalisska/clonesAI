import type { Category, TransactionType } from './enums';

export interface Identifiable {
    id: string;
}

/** Игровой экономический блок (напр. «Свиноводство», «Квасная фабрика») */
export interface Block extends Identifiable {
    name: string;
    category: Category;
    description?: string;
    /** Единица измерения по умолчанию (голова, штука, за смену…) */
    defaultUnit: string;
    isActive: boolean;
}

/** Запись прихода/расхода по блоку */
export interface Transaction extends Identifiable {
    /** Дата операции, ISO-строка */
    date: string;
    blockId: string;
    type: TransactionType;
    /** Сумма в игровой валюте (положительное число) */
    amount: number;
    quantity?: number;
    description?: string;
    /** Привязка к котировке, если операция опирается на распарсенную цену */
    quoteItemId?: string;
    createdAt: string;
}

/** Распарсенная цена товара (из HTML биржи) */
export interface PriceQuote extends Identifiable {
    itemId: string;
    itemName: string;
    price: number;
    unit: string;
    /** Источник разметки, напр. 'exchange' */
    source: string;
    timestamp: string;
    /** Хэш исходной разметки для дедупликации повторных вставок */
    htmlHash: string;
}

/** Входные параметры песочницы (прогноз прибыльности) */
export interface SandboxParams {
    blockId: string;
    /** Кол-во единиц (голов, штук, циклов) */
    quantity: number;
    /** Цена за единицу продукции */
    unitPrice: number;
    /** Переменные затраты на единицу */
    unitCosts: number;
    /** Постоянные затраты за период */
    fixedCosts?: number;
    /** Горизонт прогноза в днях */
    periodDays?: number;
    /** Использовать последнюю котировку как цену */
    useQuoteForPrice?: boolean;
    quoteItemId?: string;
}

/** Результат моделирования песочницы */
export interface SandboxResult {
    periodDays: number;
    quantity: number;
    unitPrice: number;
    unitCosts: number;
    fixedCosts: number;
    revenue: number;
    costs: number;
    profit: number;
    /** Доля прибыли от выручки, 0..1 */
    margin: number;
    dailyIncome: number;
    /** Дней до окупаемости постоянных затрат; null если нет прибыли */
    paybackDays: number | null;
}

/** Сводка по категории */
export interface CategorySummary {
    category: Category;
    income: number;
    expense: number;
    balance: number;
    blocksCount: number;
}

/** Сводка по блоку */
export interface BlockSummary {
    blockId: string;
    blockName: string;
    category: Category;
    income: number;
    expense: number;
    balance: number;
    transactionsCount: number;
}

/** Текущее состояние аккаунта (реальные данные) */
export interface Snapshot {
    generatedAt: string;
    totalIncome: number;
    totalExpense: number;
    balance: number;
    byCategory: CategorySummary[];
    byBlock: BlockSummary[];
}

/** Полный экспортируемый стейт приложения */
export interface AppData {
    version: number;
    exportedAt: string;
    blocks: Block[];
    transactions: Transaction[];
    quotes: PriceQuote[];
}