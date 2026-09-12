import type { Transaction } from '../../core/domain/types';
import { TransactionType } from '../../core/domain/enums';
import type { Repository } from '../../data/repositories/repository.interface';
import { generateId } from '../../data/repositories/repository.interface';
import type { ActiveAccountScope } from '../accountScope';

/** Входные данные для новой транзакции. */
export interface TransactionInput {
    date: string;
    blockId: string;
    type: TransactionType;
    amount: number;
    quantity?: number;
    description?: string;
    quoteItemId?: string;
}

/** Сервис учёта приходов/расходов по блокам. */
export class AccountingService {
    private readonly repo: Repository<Transaction>;
    private readonly scope: ActiveAccountScope;

    constructor(repo: Repository<Transaction>, scope: ActiveAccountScope) {
        this.repo = repo;
        this.scope = scope;
    }

    /** Возвращает транзакции, ограниченные текущим аккаунтом (если он выбран). */
    getAll(): Transaction[] {
        const accountId = this.scope.get();
        return this.repo
            .getAll()
            .filter((tx) => !accountId || tx.accountId === accountId)
            .sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt));
    }

    add(input: TransactionInput): Transaction {
        const tx: Transaction = {
            id: generateId('tx'),
            accountId: this.scope.get() ?? '',
            date: input.date,
            blockId: input.blockId,
            type: input.type,
            amount: Math.max(0, input.amount),
            quantity: input.quantity,
            description: input.description,
            quoteItemId: input.quoteItemId,
            createdAt: new Date().toISOString(),
        };
        this.repo.add(tx);
        return tx;
    }

    update(tx: Transaction): void {
        this.repo.update(tx);
    }

    remove(id: string): void {
        this.repo.remove(id);
    }
}