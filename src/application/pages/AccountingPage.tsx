import React, { useState } from 'react';
import { categoryLabel } from '../../core/engine/calculator';
import { TransactionType } from '../../core/domain/enums';
import { useApp } from '../state/appStore';
import { useBlocks, useTransactions } from '../hooks/useData';
import { formatDate, formatMoney } from '../shared/utils/format';

export const AccountingPage: React.FC = () => {
    const { accounting, dashboard, refresh, activeAccountId } = useApp();
    const blocks = useBlocks();
    const transactions = useTransactions();

    const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
    const [blockId, setBlockId] = useState('');
    const [type, setType] = useState<TransactionType>(TransactionType.Income);
    const [amount, setAmount] = useState('0');
    const [quantity, setQuantity] = useState('');
    const [description, setDescription] = useState('');

    const blockName = new Map(blocks.map((b) => [b.id, b.name]));
    const report = dashboard.snapshot().byBlock;

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        if (!blockId) return;
        accounting.add({
            date,
            blockId,
            type,
            amount: Number(amount) || 0,
            quantity: quantity ? Number(quantity) : undefined,
            description: description.trim() || undefined,
        });
        setAmount('0');
        setQuantity('');
        setDescription('');
        refresh();
    };

    return (
        <div className="grid grid-2">
            <section className="card">
                <h2>Новая операция</h2>
                {!activeAccountId && (
                    <p className="muted" style={{ marginTop: 0 }}>
                        Сначала выберите аккаунт в шапке (или создайте его во вкладке «Аккаунты»).
                    </p>
                )}
                <form onSubmit={handleAdd} className="grid" style={{ gap: 12 }}>
                    <div className="field">
                        <label>Блок</label>
                        <select value={blockId} onChange={(e) => setBlockId(e.target.value)} required>
                            <option value="">— выберите блок —</option>
                            {blocks.map((b) => (
                                <option key={b.id} value={b.id}>
                                    {categoryLabel(b.category)} · {b.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="field">
                        <label>Тип</label>
                        <select value={type} onChange={(e) => setType(e.target.value as TransactionType)}>
                            <option value={TransactionType.Income}>Приход</option>
                            <option value={TransactionType.Expense}>Расход</option>
                        </select>
                    </div>
                    <div className="field">
                        <label>Дата</label>
                        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
                    </div>
                    <div className="field">
                        <label>Сумма</label>
                        <input type="number" min="0" step="any" value={amount} onChange={(e) => setAmount(e.target.value)} required />
                    </div>
                    <div className="field">
                        <label>Количество (опц.)</label>
                        <input type="number" min="0" step="any" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
                    </div>
                    <div className="field">
                        <label>Описание (опц.)</label>
                        <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} />
                    </div>
                    <button className="btn btn-primary" type="submit" disabled={!activeAccountId}>
                        Добавить
                    </button>
                </form>
            </section>

            <section className="card">
                <h2>Отчёт по блокам</h2>
                {report.length === 0 ? (
                    <p className="empty-state">Транзакций пока нет.</p>
                ) : (
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Блок</th>
                                <th className="num">Доход</th>
                                <th className="num">Расход</th>
                                <th className="num">Баланс</th>
                            </tr>
                        </thead>
                        <tbody>
                            {report.map((s) => (
                                <tr key={s.blockId}>
                                    <td>{s.blockName}</td>
                                    <td className="num income">{formatMoney(s.income)}</td>
                                    <td className="num expense">{formatMoney(s.expense)}</td>
                                    <td className="num">{formatMoney(s.balance)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </section>

            <section className="card" style={{ gridColumn: '1 / -1' }}>
                <h2>Все операции</h2>
                {transactions.length === 0 ? (
                    <p className="empty-state">Операций пока нет.</p>
                ) : (
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Дата</th>
                                <th>Блок</th>
                                <th>Тип</th>
                                <th className="num">Кол-во</th>
                                <th className="num">Сумма</th>
                                <th>Описание</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {transactions.map((tx) => (
                                <tr key={tx.id}>
                                    <td>{formatDate(tx.date)}</td>
                                    <td>{blockName.get(tx.blockId) ?? tx.blockId}</td>
                                    <td>{tx.type === 'income' ? 'Приход' : 'Расход'}</td>
                                    <td className="num">{tx.quantity ?? '—'}</td>
                                    <td className={`num ${tx.type === 'income' ? 'income' : 'expense'}`}>
                                        {tx.type === 'income' ? '+' : '−'}{formatMoney(tx.amount)}
                                    </td>
                                    <td className="muted">{tx.description ?? '—'}</td>
                                    <td>
                                        <button
                                            className="btn btn-danger"
                                            onClick={() => {
                                                accounting.remove(tx.id);
                                                refresh();
                                            }}
                                        >
                                            Удалить
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </section>
        </div>
    );
};