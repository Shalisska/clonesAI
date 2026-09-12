import { calculateSnapshot } from '../../core/engine/calculator';
import type { Block, Snapshot, Transaction } from '../../core/domain/types';
import type { Repository } from '../../data/repositories/repository.interface';
import type { ActiveAccountScope } from '../accountScope';

/** Сервис сводок текущего состояния аккаунта. */
export class DashboardService {
    private readonly blocksRepo: Repository<Block>;
    private readonly transactionsRepo: Repository<Transaction>;
    private readonly scope: ActiveAccountScope;

    constructor(
        blocksRepo: Repository<Block>,
        transactionsRepo: Repository<Transaction>,
        scope: ActiveAccountScope,
    ) {
        this.blocksRepo = blocksRepo;
        this.transactionsRepo = transactionsRepo;
        this.scope = scope;
    }

    private accountTransactions(): Transaction[] {
        const accountId = this.scope.get();
        return this.transactionsRepo
            .getAll()
            .filter((tx) => !accountId || tx.accountId === accountId);
    }

    snapshot(): Snapshot {
        return calculateSnapshot(this.blocksRepo.getAll(), this.accountTransactions());
    }

    recentTransactions(limit = 10): Transaction[] {
        return [...this.accountTransactions()]
            .sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt))
            .slice(0, limit);
    }
}