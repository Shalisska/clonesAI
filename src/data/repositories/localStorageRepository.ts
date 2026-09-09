import type { Identifiable } from '../../core/domain/types';
import { MemoryRepository } from './memoryRepository';

/**
 * Репозиторий поверх localStorage.
 * При каждом изменении персистит всю коллекцию под заданным ключом.
 */
export class LocalStorageRepository<T extends Identifiable>
    extends MemoryRepository<T> {
    private readonly storageKey: string;
    private readonly storage: Storage;

    constructor(storageKey: string, initial: T[] = [], storage: Storage = localStorage) {
        super(readStored<T>(storage, storageKey) ?? initial);
        this.storageKey = storageKey;
        this.storage = storage;
    }

    private persist(): void {
        this.storage.setItem(this.storageKey, JSON.stringify(this.items));
    }

    override add(item: T): T {
        const result = super.add(item);
        this.persist();
        return result;
    }

    override addMany(items: T[]): T[] {
        const result = super.addMany(items);
        this.persist();
        return result;
    }

    override update(item: T): T | undefined {
        const result = super.update(item);
        this.persist();
        return result;
    }

    override remove(id: string): boolean {
        const result = super.remove(id);
        this.persist();
        return result;
    }

    override clear(): void {
        super.clear();
        this.persist();
    }
}

function readStored<T>(storage: Storage, key: string): T[] | undefined {
    try {
        const raw = storage.getItem(key);
        if (!raw) return undefined;
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? (parsed as T[]) : undefined;
    } catch {
        return undefined;
    }
}