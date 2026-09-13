import type { PriceQuote } from '../../core/domain/types';
import { generateId } from '../../data/repositories/repository.interface';
import { hashHtml } from './parserEngine';
import type { ParsedItem } from './parseConfig';

/**
 * Пресет правил для страницы биржи «Золотого клона».
 *
 * Реальная разметка (образец с сервера Анклав): таблица `#exchange_lots`,
 * каждая строка товара — `tr[id^="r_type_"]`, значения цен в атрибутах
 * `data-price`, количество — в `#item_ammount_N`, единица измерения — в
 * `data-confirm-message` (кг / шт / л / ед). Идентификация ресурса — по
 * числовому ID из `r_type_N` (стабилен между серверами и при переименовании).
 */
export const EXCHANGE_PARSE_CONFIG = {
    pageType: 'exchange',
    source: 'exchange',
    tableSelector: '#exchange_lots',
    rowSelector: 'tr[id^="r_type_"]',
    resourceIdPattern: /r_type_(\d+)/,
    priceAttribute: 'data-price',
    availableIdPrefix: 'item_ammount_',
    unit: 'шт',
} as const;

/** Имена колонок строки-товара (0-based порядок td). */
const NAME_TD = 1;
const NOMINAL_TD = 2;
const SWAP_TD = 3;
const MIN_PRICE_TD = 5;
const AVAILABLE_TD = 7;

/**
 * Разбирает HTML страницы биржи в позиции с полным набором цен.
 * Извлекает: id ресурса, название, номинал, цену лавки, мин. цену, количество.
 */
export function parseExchangeRows(html: string): ParsedItem[] {
    if (!html.trim()) return [];
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const rows = Array.from(
        doc.querySelectorAll<HTMLTableRowElement>(EXCHANGE_PARSE_CONFIG.rowSelector),
    );
    const results: ParsedItem[] = [];

    for (const row of rows) {
        const exchangeId = extractResourceId(row);
        if (!exchangeId) continue;

        const tds = Array.from(row.children) as HTMLElement[];
        const name = cleanText(tds[NAME_TD]?.textContent ?? '');
        if (!name) continue;

        const basePrice = priceFromTd(tds[NOMINAL_TD]);
        const swapPrice = priceFromTd(tds[SWAP_TD]);
        const minPrice = priceFromTd(tds[MIN_PRICE_TD]);
        const available = quantityFromTd(tds[AVAILABLE_TD]);
        const unit = extractUnit(row) ?? EXCHANGE_PARSE_CONFIG.unit;

        results.push({
            itemId: `res-${exchangeId}`,
            itemName: name,
            price: minPrice ?? basePrice ?? 0,
            unit,
            exchangeId,
            basePrice,
            swapPrice,
            available,
        });
    }

    return results;
}

/** Числовой id ресурса из `id="r_type_N"` (запасной путь — имя ресурса). */
function extractResourceId(row: HTMLTableRowElement): string | null {
    const id = row.getAttribute('id') ?? '';
    const match = EXCHANGE_PARSE_CONFIG.resourceIdPattern.exec(id);
    return match ? match[1] : null;
}

/** Единица измерения из `data-confirm-message` ("купить %n кг"). */
function extractUnit(row: HTMLTableRowElement): string | null {
    const msg = row.getAttribute('data-confirm-message') ?? '';
    const match = /%n\s+([а-яА-ЯёЁ]+)/.exec(msg);
    return match ? match[1] : null;
}

/** Цена из ячейки: приоритет у атрибута data-price, иначе текст. */
function priceFromTd(td: HTMLElement | undefined): number | undefined {
    if (!td) return undefined;
    const el = td.querySelector<HTMLElement>(`[${EXCHANGE_PARSE_CONFIG.priceAttribute}]`)
        ?? td;
    const raw = el.getAttribute(EXCHANGE_PARSE_CONFIG.priceAttribute)
        ?? el.textContent;
    const value = toNumber(raw);
    // Ноль означает «цены нет» (товар не торгуется), а не реальную нулевую цену.
    return value !== undefined && value > 0 ? value : undefined;
}

/** Количество ресурса (с учётом неразрывных пробелов), 0 допускается. */
function quantityFromTd(td: HTMLElement | undefined): number | undefined {
    if (!td) return undefined;
    const raw = td.textContent ?? '';
    const cleaned = raw.replace(/\u00a0/g, '').replace(/\s+/g, '').replace(/[^\d]/g, '');
    if (!cleaned) return undefined;
    const n = Number.parseInt(cleaned, 10);
    return Number.isFinite(n) ? n : undefined;
}

function toNumber(raw: string | null | undefined): number | undefined {
    if (raw == null) return undefined;
    const cleaned = raw
        .replace(/\u00a0/g, '')
        .replace(/\s+/g, '')
        .replace(',', '.')
        .replace(/[^\d.-]/g, '');
    if (!cleaned) return undefined;
    const n = Number.parseFloat(cleaned);
    return Number.isFinite(n) ? n : undefined;
}

function cleanText(value: string | null): string {
    return (value ?? '').replace(/\s+/g, ' ').trim();
}

/** Преобразует распарсенные позиции в котировки с общим htmlHash. */
export function toPriceQuotes(items: ParsedItem[], html: string): PriceQuote[] {
    const htmlHash = hashHtml(html);
    const now = new Date().toISOString();
    return items.map((item) => ({
        id: generateId('quote'),
        itemId: item.itemId,
        exchangeId: item.exchangeId,
        itemName: item.itemName,
        price: item.price,
        basePrice: item.basePrice,
        swapPrice: item.swapPrice,
        available: item.available,
        unit: item.unit,
        source: EXCHANGE_PARSE_CONFIG.source,
        timestamp: now,
        htmlHash,
    }));
}