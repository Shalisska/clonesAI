import type { Identifiable } from '../../core/domain/types';

/** Синхронный репозиторий для работы с коллекцией сущностей в браузере. */
export interface Repository<T extends Identifiable> {
    getAll(): T[];
    getById(id: string): T | undefined;
    add(item: T): T;
    addMany(items: T[]): T[];
    update(item: T): T | undefined;
    remove(id: string): boolean;
    clear(): void;
}

/** Простой генератор уникальных id. */
export function generateId(prefix = 'id'): string {
    const rand = Math.random().toString(36).slice(2, 10);
    const time = Date.now().toString(36);
    return `${prefix}_${time}_${rand}`;
}