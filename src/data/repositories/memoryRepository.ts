import type { Identifiable } from '../../core/domain/types';
import type { Repository } from './repository.interface';

/** Репозиторий в памяти. Полезен для предпросмотра экспорта и тестов. */
export class MemoryRepository<T extends Identifiable> implements Repository<T> {
    protected items: T[] = [];

    constructor(initial: T[] = []) {
        this.items = [...initial];
    }

    getAll(): T[] {
        return [...this.items];
    }

    getById(id: string): T | undefined {
        return this.items.find((it) => it.id === id);
    }

    add(item: T): T {
        this.items.push(item);
        return item;
    }

    addMany(items: T[]): T[] {
        this.items.push(...items);
        return items;
    }

    update(item: T): T | undefined {
        const idx = this.items.findIndex((it) => it.id === item.id);
        if (idx === -1) return undefined;
        this.items[idx] = item;
        return item;
    }

    remove(id: string): boolean {
        const idx = this.items.findIndex((it) => it.id === id);
        if (idx === -1) return false;
        this.items.splice(idx, 1);
        return true;
    }

    clear(): void {
        this.items = [];
    }
}