import type { Identifiable } from '../../core/domain/types';

/**
 * Асинхронный репозиторий поверх IndexedDB.
 * Подходит для больших объёмов истории котировок, где localStorage тесен.
 * Сервисы по умолчанию используют синхронный LocalStorageRepository;
 * этот адаптер подключается при необходимости масштабирования.
 */
export class IndexedDbRepository<T extends Identifiable> {
    private readonly dbPromise: Promise<IDBDatabase>;
    private readonly storeName: string;

    constructor(dbName: string, storeName: string) {
        this.storeName = storeName;
        this.dbPromise = openDb(dbName, storeName);
    }

    async getAll(): Promise<T[]> {
        const db = await this.dbPromise;
        return new Promise((resolve, reject) => {
            const req = db.transaction(this.storeName, 'readonly').objectStore(this.storeName).getAll();
            req.onsuccess = () => resolve((req.result as T[]) ?? []);
            req.onerror = () => reject(req.error);
        });
    }

    async add(item: T): Promise<T> {
        const db = await this.dbPromise;
        await new Promise<void>((resolve, reject) => {
            const tx = db.transaction(this.storeName, 'readwrite');
            tx.objectStore(this.storeName).put(item);
            tx.oncomplete = () => resolve();
            tx.onerror = () => reject(tx.error);
        });
        return item;
    }

    async addMany(items: T[]): Promise<T[]> {
        for (const item of items) await this.add(item);
        return items;
    }

    async remove(id: string): Promise<boolean> {
        const db = await this.dbPromise;
        return new Promise((resolve, reject) => {
            const tx = db.transaction(this.storeName, 'readwrite');
            tx.objectStore(this.storeName).delete(id);
            tx.oncomplete = () => resolve(true);
            tx.onerror = () => reject(tx.error);
        });
    }

    async clear(): Promise<void> {
        const db = await this.dbPromise;
        await new Promise<void>((resolve, reject) => {
            const tx = db.transaction(this.storeName, 'readwrite');
            tx.objectStore(this.storeName).clear();
            tx.oncomplete = () => resolve();
            tx.onerror = () => reject(tx.error);
        });
    }
}

function openDb(dbName: string, storeName: string): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(dbName, 1);
        request.onupgradeneeded = () => {
            const db = request.result;
            if (!db.objectStoreNames.contains(storeName)) {
                db.createObjectStore(storeName, { keyPath: 'id' });
            }
        };
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}