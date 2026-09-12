import React from 'react';
import { categoryLabel } from '../../core/engine/calculator';
import { StatCard } from '../components/StatCard';
import { useApp } from '../state/appStore';
import { useBlocks, useLatestQuotes, useTransactions } from '../hooks/useData';
import { formatDate, formatMoney, formatPercent } from '../shared/utils/format';

export const DashboardPage: React.FC = () => {
    const { dashboard, activeAccountId } = useApp();
    const blocks = useBlocks();
    const transactions = useTransactions();
    const quotes = useLatestQuotes();

    const snapshot = dashboard.snapshot();
    const recent = dashboard.recentTransactions(8);
    const blockName = new Map(blocks.map((b) => [b.id, b.name]));

    return (
        <div className="grid" style={{ gap: 16 }}>
            {!activeAccountId && (
                <p className="card muted" style={{ margin: 0 }}>
                    Аккаунт не выбран. Создайте и выберите аккаунт во вкладке «Аккаунты»,
                    чтобы вести учёт для конкретного пользователя и сервера.
                </p>
            )}
            <section className="grid grid-3">
                <StatCard label="Доход" value={formatMoney(snapshot.totalIncome)} tone="positive" />
                <StatCard label="Расход" value={formatMoney(snapshot.totalExpense)} tone="negative" />
                <StatCard
                    label="Баланс"
                    value={formatMoney(snapshot.balance)}
                    tone={snapshot.balance >= 0 ? 'positive' : 'negative'}
                />
            </section>

            <section className="card">
                <h2>Итоги по категориям</h2>
                {snapshot.byCategory.length === 0 ? (
                    <p className="empty-state">Пока нет данных. Добавьте транзакции в разделе «Учёт».</p>
                ) : (
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Категория</th>
                                <th className="num">Доход</th>
                                <th className="num">Расход</th>
                                <th className="num">Баланс</th>
                            </tr>
                        </thead>
                        <tbody>
                            {snapshot.byCategory.map((c) => (
                                <tr key={c.category}>
                                    <td>{categoryLabel(c.category)}</td>
                                    <td className="num income">{formatMoney(c.income)}</td>
                                    <td className="num expense">{formatMoney(c.expense)}</td>
                                    <td className="num">{formatMoney(c.balance)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </section>

            <section className="grid grid-2">
                <div className="card">
                    <h2>Последние операции</h2>
                    {recent.length === 0 ? (
                        <p className="empty-state">Операций пока нет.</p>
                    ) : (
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Дата</th>
                                    <th>Блок</th>
                                    <th className="num">Сумма</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recent.map((tx) => (
                                    <tr key={tx.id}>
                                        <td>{formatDate(tx.date)}</td>
                                        <td>{blockName.get(tx.blockId) ?? tx.blockId}</td>
                                        <td className={`num ${tx.type === 'income' ? 'income' : 'expense'}`}>
                                            {tx.type === 'income' ? '+' : '−'}{formatMoney(tx.amount)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                <div className="card">
                    <h2>Последние цены (биржа)</h2>
                    {quotes.length === 0 ? (
                        <p className="empty-state">Котировок нет. Импортируйте HTML биржи в разделе «Импорт данных».</p>
                    ) : (
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Товар</th>
                                    <th className="num">Цена</th>
                                    <th>Обновлено</th>
                                </tr>
                            </thead>
                            <tbody>
                                {quotes.slice(0, 10).map((q) => (
                                    <tr key={q.itemId}>
                                        <td>{q.itemName}</td>
                                        <td className="num">{formatMoney(q.price)} {q.unit}</td>
                                        <td>{formatDate(q.timestamp)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                    {transactions.length > 0 && (
                        <p className="muted" style={{ marginBottom: 0 }}>
                            Маржа аккаунта: {formatPercent(snapshot.totalIncome > 0 ? snapshot.balance / snapshot.totalIncome : 0)}
                        </p>
                    )}
                </div>
            </section>
        </div>
    );
};