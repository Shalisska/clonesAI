import type {
    Block,
    BlockSummary,
    CategorySummary,
    Snapshot,
    Transaction,
} from '../domain/types';
import { CATEGORY_LABELS, Category, TransactionType } from '../domain/enums';

const round2 = (v: number): number => Math.round(v * 100) / 100;

/**
 * Строит текущее состояние аккаунта на основе блоков и транзакций:
 * итоги, сводки по категориям и по блокам.
 */
export function calculateSnapshot(
    blocks: Block[],
    transactions: Transaction[],
): Snapshot {
    const blockMap = new Map<string, BlockSummary>();
    for (const block of blocks) {
        blockMap.set(block.id, {
            blockId: block.id,
            blockName: block.name,
            category: block.category,
            income: 0,
            expense: 0,
            balance: 0,
            transactionsCount: 0,
        });
    }

    let totalIncome = 0;
    let totalExpense = 0;

    for (const tx of transactions) {
        const isIncome = tx.type === TransactionType.Income;
        const amount = Math.max(0, tx.amount);
        if (isIncome) totalIncome += amount;
        else totalExpense += amount;

        const summary = blockMap.get(tx.blockId);
        if (summary) {
            summary.transactionsCount += 1;
            if (isIncome) summary.income += amount;
            else summary.expense += amount;
        }
    }

    const byBlock: BlockSummary[] = Array.from(blockMap.values())
        .map((s) => ({
            ...s,
            income: round2(s.income),
            expense: round2(s.expense),
            balance: round2(s.income - s.expense),
        }))
        .filter((s) => s.transactionsCount > 0 || s.income > 0 || s.expense > 0)
        .sort((a, b) => b.balance - a.balance);

    const categoryMap = new Map<Category, CategorySummary>();
    for (const block of blocks) {
        const key = block.category;
        if (!categoryMap.has(key)) {
            categoryMap.set(key, {
                category: key,
                income: 0,
                expense: 0,
                balance: 0,
                blocksCount: 0,
            });
        }
        categoryMap.get(key)!.blocksCount += 1;
    }

    for (const s of byBlock) {
        const cat = categoryMap.get(s.category);
        if (cat) {
            cat.income += s.income;
            cat.expense += s.expense;
        }
    }

    const byCategory: CategorySummary[] = Array.from(categoryMap.values())
        .map((c) => ({
            ...c,
            income: round2(c.income),
            expense: round2(c.expense),
            balance: round2(c.income - c.expense),
        }))
        .filter((c) => c.blocksCount > 0)
        .sort((a, b) => b.balance - a.balance);

    return {
        generatedAt: new Date().toISOString(),
        totalIncome: round2(totalIncome),
        totalExpense: round2(totalExpense),
        balance: round2(totalIncome - totalExpense),
        byCategory,
        byBlock,
    };
}

/** Подпись категории для UI */
export function categoryLabel(category: Category): string {
    return CATEGORY_LABELS[category] ?? category;
}

/** Фильтр транзакций за период [from, to] включительно (ISO-строки). */
export function filterByPeriod(
    transactions: Transaction[],
    from?: string,
    to?: string,
): Transaction[] {
    return transactions.filter((tx) => {
        if (from && tx.date < from) return false;
        if (to && tx.date > to) return false;
        return true;
    });
}