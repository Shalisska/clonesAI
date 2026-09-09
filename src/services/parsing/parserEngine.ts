import type { ParseConfig, ParsedItem } from './parseConfig';

/**
 * Движок парсинга HTML.
 * Строит DOM через DOMParser и извлекает позиции по конфигу селекторов.
 */
export function parseHtml(html: string, config: ParseConfig): ParsedItem[] {
    if (!html.trim()) return [];

    const doc = new DOMParser().parseFromString(html, 'text/html');
    const rows = Array.from(doc.querySelectorAll(config.itemRowSelector));
    const results: ParsedItem[] = [];

    for (const row of rows) {
        const nameEl = row.querySelector(config.itemNameSelector);
        const name = nameEl ? cleanText(nameEl.textContent) : '';
        if (!name) continue;

        const price = extractPrice(row, config);
        if (price === null) continue;

        results.push({
            itemId: slugify(name),
            itemName: name,
            price,
            unit: config.unit,
        });
    }

    return results;
}

function extractPrice(row: Element, config: ParseConfig): number | null {
    const el = row.querySelector(config.itemPriceSelector);
    if (!el) return null;

    let raw: string;
    if (config.priceAttribute) {
        raw = el.getAttribute(config.priceAttribute) ?? '';
    } else {
        raw = el.textContent ?? '';
    }
    raw = raw.trim();
    if (!raw) return null;

    if (config.priceRegex) {
        const match = raw.match(new RegExp(config.priceRegex));
        if (!match) return null;
        raw = match[1] ?? match[0];
    }

    const normalized = raw.replace(/\s+/g, '').replace(',', '.').replace(/[^\d.-]/g, '');
    const num = Number.parseFloat(normalized);
    return Number.isFinite(num) ? num : null;
}

function cleanText(value: string | null): string {
    return (value ?? '').replace(/\s+/g, ' ').trim();
}

/** Slug из названия товара — стабильный itemId. */
export function slugify(value: string): string {
    const latin = value
        .toLowerCase()
        .replace(/[а-яё]/g, (ch) => transliterate(ch));
    return latin
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        || `item-${value.length}`;
}

/** Простой хэш строки (djb2) для дедупликации разметки. */
export function hashHtml(html: string): string {
    let hash = 5381;
    for (let i = 0; i < html.length; i += 1) {
        hash = ((hash << 5) + hash + html.charCodeAt(i)) | 0;
    }
    return `h${(hash >>> 0).toString(16)}`;
}

const RU_MAP: Record<string, string> = {
    а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'e', ж: 'zh', з: 'z',
    и: 'i', й: 'y', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r',
    с: 's', т: 't', у: 'u', ф: 'f', х: 'kh', ц: 'ts', ч: 'ch', ш: 'sh',
    щ: 'shch', ъ: '', ы: 'y', ь: '', э: 'e', ю: 'yu', я: 'ya',
};

function transliterate(ch: string): string {
    return RU_MAP[ch] ?? '';
}