import { DEFAULT_BLOCKS } from '../../core/domain/blockCatalog';
import type { Account, Block, PriceQuote, Transaction, User } from '../../core/domain/types';
import { LocalStorageRepository } from '../repositories/localStorageRepository';
import type { Repository } from '../repositories/repository.interface';
import { STORAGE_KEYS } from './schema';

/** Совокупность репозиториев приложения. */
export interface DataStore {
    users: Repository<User>;
    accounts: Repository<Account>;
    blocks: Repository<Block>;
    transactions: Repository<Transaction>;
    quotes: Repository<PriceQuote>;
}

/** Создаёт хранилище на localStorage с предзаполнением каталога блоков. */
export function createLocalStore(): DataStore {
    return {
        users: new LocalStorageRepository<User>(STORAGE_KEYS.users),
        accounts: new LocalStorageRepository<Account>(STORAGE_KEYS.accounts),
        blocks: new LocalStorageRepository<Block>(STORAGE_KEYS.blocks, DEFAULT_BLOCKS),
        transactions: new LocalStorageRepository<Transaction>(STORAGE_KEYS.transactions),
        quotes: new LocalStorageRepository<PriceQuote>(STORAGE_KEYS.quotes),
    };
}

/** Структура данных для полного замещения хранилища (импорт резервной копии). */
export interface StoreOverwriteData {
    users?: User[];
    accounts?: Account[];
    blocks: Block[];
    transactions: Transaction[];
    quotes: PriceQuote[];
}

/**
 * Полное замещение содержимого всех репозиториев.
 * Используется при импорте резервной копии.
 */
export function overwriteStore(store: DataStore, data: StoreOverwriteData): void {
    store.users.clear();
    store.accounts.clear();
    store.blocks.clear();
    store.transactions.clear();
    store.quotes.clear();
    if (data.users) store.users.addMany(data.users);
    if (data.accounts) store.accounts.addMany(data.accounts);
    store.blocks.addMany(data.blocks);
    store.transactions.addMany(data.transactions);
    store.quotes.addMany(data.quotes);
}