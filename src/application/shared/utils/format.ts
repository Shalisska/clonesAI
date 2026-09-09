/** Форматирование числа с разделителями разрядов (ru). */
export function formatMoney(value: number): string {
    return new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 2 }).format(value);
}

/** Форматирование доли (0..1) как процента. */
export function formatPercent(ratio: number): string {
    return `${(ratio * 100).toFixed(1)}%`;
}

/** Форматирование даты в короткий вид. */
export function formatDate(iso: string): string {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return iso;
    return date.toLocaleDateString('ru-RU');
}