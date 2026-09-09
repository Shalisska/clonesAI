import type { PriceQuote } from '../../core/domain/types';
import { generateId } from '../../data/repositories/repository.interface';
import { hashHtml } from './parserEngine';
import type { ParseConfig, ParsedItem } from './parseConfig';

/**
 * Пресет правил для страницы биржи «Золотого клона».
 *
 * ВАЖНО: это заглушка. Точные CSS-селекторы неизвестны без реального
 * образца HTML страницы биржи (она доступна только после входа в игру).
 * Когда образец будет предоставлен, необходимо уточнить селекторы ниже.
 */
export const EXCHANGE_PARSE_CONFIG: ParseConfig = {
    pageType: 'exchange',
    source: 'exchange',
    itemRowSelector: 'tr', // TODO: уточнить по реальной разметке биржи
    itemNameSelector: '.item-name', // TODO: уточнить по реальной разметке биржи
    itemPriceSelector: '.item-price', // TODO: уточнить по реальной разметке биржи
    priceRegex: '[\\d.,]+',
    unit: 'шт',
};

/** Преобразует распарсенные позиции в котировки с общим htmlHash. */
export function toPriceQuotes(items: ParsedItem[], html: string): PriceQuote[] {
    const htmlHash = hashHtml(html);
    const now = new Date().toISOString();
    return items.map((item) => ({
        id: generateId('quote'),
        itemId: item.itemId,
        itemName: item.itemName,
        price: item.price,
        unit: item.unit,
        source: EXCHANGE_PARSE_CONFIG.source,
        timestamp: now,
        htmlHash,
    }));
}