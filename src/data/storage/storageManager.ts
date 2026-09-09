import { DEFAULT_BLOCKS } from '../../core/domain/blockCatalog';
import type { Block, PriceQuote, Transaction } from '../../core/domain/types';
import { LocalStorageRepository } from '../repositories/localStorageRepository';
import type { Repository } from '../repositories/repository.interface';
import { STORAGE_KEYS } from './schema';

/** Совокупность репозиториев приложения. */
export interface DataStore {
    blocks: Repository<Block>;
    transactions: Repository<Transaction>;
    quotes: Repository<PriceQuote>;
}

/** Создаёт хранилище на localStorage с предзаполнением каталога блоков. */
export function createLocalStore(): DataStore {
    return {
        blocks: new LocalStorageRepository<Block>(STORAGE_KEYS.blocks, DEFAULT_BLOCKS),
        transactions: new LocalStorageRepository<Transaction>(STORAGE_KEYS.transactions),
        quotes: new LocalStorageRepository<PriceQuote>(STORAGE_KEYS.quotes),
    };
}

/**
 * Полное замещение содержимого всех репозиториев.
 * Используется при импорте резервной копии.
 */
export function overwriteStore(store: DataStore, data: {
    blocks: Block[];
    transactions: Transaction[];
    quotes: PriceQuote[];
}): void {
    store.blocks.clear();
    store.transactions.clear();
    store.quotes.clear();
    store.blocks.addMany(data.blocks);
    store.transactions.addMany(data.transactions);
    store.quotes.addMany(data.quotes);
}