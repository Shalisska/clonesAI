import type { PriceQuote } from '../../core/domain/types';
import type { Repository } from '../../data/repositories/repository.interface';

/** Сервис управления котировками цен (распарсенными данными). */
export class QuoteService {
    private readonly repo: Repository<PriceQuote>;

    constructor(repo: Repository<PriceQuote>) {
        this.repo = repo;
    }

    getAll(): PriceQuote[] {
        return this.repo
            .getAll()
            .sort((a, b) => a.itemName.localeCompare(b.itemName));
    }

    /**
     * Сохраняет партию котировок с дедупликацией:
     * повторная вставка той же позиции с тем же htmlHash игнорируется.
     */
    saveMany(quotes: PriceQuote[]): { saved: number; skipped: number } {
        let saved = 0;
        let skipped = 0;
        const seenByItem = new Map<string, Set<string>>();
        for (const q of this.repo.getAll()) {
            const set = seenByItem.get(q.itemId) ?? new Set<string>();
            set.add(q.htmlHash);
            seenByItem.set(q.itemId, set);
        }
        const toAdd: PriceQuote[] = [];
        for (const quote of quotes) {
            const set = seenByItem.get(quote.itemId) ?? new Set<string>();
            if (set.has(quote.htmlHash)) {
                skipped += 1;
                continue;
            }
            set.add(quote.htmlHash);
            seenByItem.set(quote.itemId, set);
            toAdd.push(quote);
            saved += 1;
        }
        if (toAdd.length > 0) this.repo.addMany(toAdd);
        return { saved, skipped };
    }

    /** Последняя котировка по конкретному товару. */
    getLatestPrice(itemId: string): PriceQuote | undefined {
        return this.repo
            .getAll()
            .filter((q) => q.itemId === itemId)
            .sort((a, b) => b.timestamp.localeCompare(a.timestamp))[0];
    }

    /** Последняя котировка по каждому товару (актуальные цены). */
    latestByItem(): PriceQuote[] {
        const latest = new Map<string, PriceQuote>();
        for (const quote of this.repo.getAll()) {
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