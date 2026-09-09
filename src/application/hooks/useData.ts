import type { Block, PriceQuote, Transaction } from '../../core/domain/types';
import { useApp } from '../state/appStore';

/** Возвращает актуальные блоки (перечитывает из хранилища при каждом изменении). */
export function useBlocks(): Block[] {
    const { store, revision } = useApp();
    void revision; // перечитываем данные при каждом изменении
    return store.blocks.getAll();
}

/** Возвращает актуальные транзакции. */
export function useTransactions(): Transaction[] {
    const { accounting, revision } = useApp();
    void revision;
    return accounting.getAll();
}

/** Возвращает актуальные котировки. */
export function useQuotes(): PriceQuote[] {
    const { quotes, revision } = useApp();
    void revision;
    return quotes.getAll();
}

/** Возвращает последние цены по каждому товару. */
export function useLatestQuotes(): PriceQuote[] {
    const { quotes, revision } = useApp();
    void revision;
    return quotes.latestByItem();
}