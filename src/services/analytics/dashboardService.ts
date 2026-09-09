import { calculateSnapshot } from '../../core/engine/calculator';
import type { Block, Snapshot, Transaction } from '../../core/domain/types';
import type { Repository } from '../../data/repositories/repository.interface';

/** Сервис сводок текущего состояния аккаунта. */
export class DashboardService {
    private readonly blocksRepo: Repository<Block>;
    private readonly transactionsRepo: Repository<Transaction>;

    constructor(blocksRepo: Repository<Block>, transactionsRepo: Repository<Transaction>) {
        this.blocksRepo = blocksRepo;
        this.transactionsRepo = transactionsRepo;
    }

    snapshot(): Snapshot {
        return calculateSnapshot(this.blocksRepo.getAll(), this.transactionsRepo.getAll());
    }

    recentTransactions(limit = 10): Transaction[] {
        return [...this.transactionsRepo.getAll()]
            .sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt))
            .slice(0, limit);
    }
}