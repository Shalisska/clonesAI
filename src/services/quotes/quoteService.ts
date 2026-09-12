import type { PriceQuote } from '../../core/domain/types';
import type { Repository } from '../../data/repositories/repository.interface';
import type { ActiveAccountScope } from '../accountScope';

/** Сервис управления котировками цен (распарсенными данными). */
export class QuoteService {
    private readonly repo: Repository<PriceQuote>;
    private readonly scope: ActiveAccountScope;

    constructor(repo: Repository<PriceQuote>, scope: ActiveAccountScope) {
        this.repo = repo;
        this.scope = scope;
    }

    /** Котировки, ограниченные текущим аккаунтом (если он выбран). */
    getAll(): PriceQuote[] {
        const accountId = this.scope.get();
        return this.repo
            .getAll()
            .filter((q) => !accountId || q.accountId === accountId)
            .sort((a, b) => a.itemName.localeCompare(b.itemName));
    }

    /**
     * Сохраняет партию котировок с дедупликацией:
     * повторная вставка той же позиции с тем же htmlHash игнорируется.
     */
    saveMany(quotes: PriceQuote[]): { saved: number; skipped: number } {
        const accountId = this.scope.get() ?? '';
        let saved = 0;
        let skipped = 0;
        const seenByItem = new Map<string, Set<string>>();
        for (const q of this.repo.getAll()) {
            const key = `${q.accountId}|${q.itemId}`;
            const set = seenByItem.get(key) ?? new Set<string>();
            set.add(q.htmlHash);
            seenByItem.set(key, set);
        }
        const toAdd: PriceQuote[] = [];
        for (const quote of quotes) {
            const key = `${accountId}|${quote.itemId}`;
            const set = seenByItem.get(key) ?? new Set<string>();
            if (set.has(quote.htmlHash)) {
                skipped += 1;
                continue;
            }
            set.add(quote.htmlHash);
            seenByItem.set(key, set);
            toAdd.push({ ...quote, accountId });
            saved += 1;
        }
        if (toAdd.length > 0) this.repo.addMany(toAdd);
        return { saved, skipped };
    }

    /** Последняя котировка по конкретному товару. */
    getLatestPrice(itemId: string): PriceQuote | undefined {
        const accountId = this.scope.get();
        return this.repo
            .getAll()
            .filter((q) => (!accountId || q.accountId === accountId) && q.itemId === itemId)
            .sort((a, b) => b.timestamp.localeCompare(a.timestamp))[0];
    }

    /** Последняя котировка по каждому товару (актуальные цены). */
    latestByItem(): PriceQuote[] {
        const accountId = this.scope.get();
        const latest = new Map<string, PriceQuote>();
        for (const quote of this.repo.getAll()) {
            if (accountId && quote.accountId !== accountId) continue;
            const current = latest.get(quote.itemId);
            if (!current || quote.timestamp > current.timestamp) {
                latest.set(quote.itemId, quote);
            }
        }
        return Array.from(latest.values()).sort((a, b) =>
            a.itemName.localeCompare(b.itemName),
        );
    }

    remove(id: string): void {
        this.repo.remove(id);
    }
}