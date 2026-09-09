import type { Transaction } from '../../core/domain/types';
import { TransactionType } from '../../core/domain/enums';
import type { Repository } from '../../data/repositories/repository.interface';
import { generateId } from '../../data/repositories/repository.interface';

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

    constructor(repo: Repository<Transaction>) {
        this.repo = repo;
    }

    getAll(): Transaction[] {
        return this.repo
            .getAll()
            .sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt));
    }

    add(input: TransactionInput): Transaction {
        const tx: Transaction = {
            id: generateId('tx'),
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