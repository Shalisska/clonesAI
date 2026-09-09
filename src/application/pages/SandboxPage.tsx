import React, { useState } from 'react';
import { categoryLabel } from '../../core/engine/calculator';
import { useApp } from '../state/appStore';
import { useBlocks, useLatestQuotes } from '../hooks/useData';
import { formatMoney, formatPercent } from '../shared/utils/format';

export const SandboxPage: React.FC = () => {
    const { sandbox } = useApp();
    const blocks = useBlocks();
    const quotes = useLatestQuotes();

    const [blockId, setBlockId] = useState('');
    const [quantity, setQuantity] = useState('100');
    const [unitPrice, setUnitPrice] = useState('10');
    const [unitCosts, setUnitCosts] = useState('4');
    const [fixedCosts, setFixedCosts] = useState('0');
    const [periodDays, setPeriodDays] = useState('30');
    const [useQuote, setUseQuote] = useState(false);
    const [quoteItemId, setQuoteItemId] = useState('');

    const result = sandbox.simulate({
        blockId,
        quantity: Number(quantity) || 0,
        unitPrice: Number(unitPrice) || 0,
        unitCosts: Number(unitCosts) || 0,
        fixedCosts: Number(fixedCosts) || 0,
        periodDays: Number(periodDays) || 1,
        useQuoteForPrice: useQuote,
        quoteItemId: useQuote ? quoteItemId : undefined,
    });

    const selectedQuote = quotes.find((q) => q.itemId === quoteItemId);

    return (
        <div className="grid grid-2">
            <section className="card">
                <h2>Параметры моделирования</h2>
                <div className="grid" style={{ gap: 12 }}>
                    <div className="field">
                        <label>Блок</label>
                        <select value={blockId} onChange={(e) => setBlockId(e.target.value)}>
                            <option value="">— выберите блок —</option>
                            {blocks.map((b) => (
                                <option key={b.id} value={b.id}>
                                    {categoryLabel(b.category)} · {b.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="field">
                        <label>Количество</label>
                        <input type="number" min="0" step="any" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
                    </div>

                    <div className="field">
                        <label>
                            <input
                                type="checkbox"
                                checked={useQuote}
                                onChange={(e) => setUseQuote(e.target.checked)}
                                style={{ marginRight: 6 }}
                            />
                            Использовать цену из биржи
                        </label>
                    </div>

                    {useQuote ? (
                        <div className="field">
                            <label>Товар (биржа)</label>
                            <select value={quoteItemId} onChange={(e) => setQuoteItemId(e.target.value)}>
                                <option value="">— выберите товар —</option>
                                {quotes.map((q) => (
                                    <option key={q.itemId} value={q.itemId}>
                                        {q.itemName} · {formatMoney(q.price)}
                                    </option>
                                ))}
                            </select>
                            {selectedQuote && (
                                <span className="muted">
                                    Текущая цена: {formatMoney(selectedQuote.price)} {selectedQuote.unit}
                                </span>
                            )}
                        </div>
                    ) : (
                        <div className="field">
                            <label>Цена за единицу</label>
                            <input type="number" min="0" step="any" value={unitPrice} onChange={(e) => setUnitPrice(e.target.value)} />
                        </div>
                    )}

                    <div className="field">
                        <label>Переменные затраты на единицу</label>
                        <input type="number" min="0" step="any" value={unitCosts} onChange={(e) => setUnitCosts(e.target.value)} />
                    </div>

                    <div className="field">
                        <label>Постоянные затраты за период</label>
                        <input type="number" min="0" step="any" value={fixedCosts} onChange={(e) => setFixedCosts(e.target.value)} />
                    </div>

                    <div className="field">
                        <label>Горизонт, дней</label>
                        <input type="number" min="1" step="1" value={periodDays} onChange={(e) => setPeriodDays(e.target.value)} />
                    </div>
                </div>
            </section>

            <section className="card">
                <h2>Прогноз прибыльности</h2>
                <table className="table">
                    <tbody>
                        <tr>
                            <td>Выручка за период</td>
                            <td className="num income">{formatMoney(result.revenue)}</td>
                        </tr>
                        <tr>
                            <td>Затраты за период</td>
                            <td className="num expense">{formatMoney(result.costs)}</td>
                        </tr>
                        <tr>
                            <td><strong>Прибыль</strong></td>
                            <td className={`num ${result.profit >= 0 ? 'income' : 'expense'}`}>
                                <strong>{formatMoney(result.profit)}</strong>
                            </td>
                        </tr>
                        <tr>
                            <td>Маржа</td>
                            <td className="num">{formatPercent(result.margin)}</td>
                        </tr>
                        <tr>
                            <td>Доход в день</td>
                            <td className="num">{formatMoney(result.dailyIncome)}</td>
                        </tr>
                        <tr>
                            <td>Окупаемость постоянных затрат</td>
                            <td className="num">
                                {result.paybackDays === null ? 'не окупается' : `${result.paybackDays.toFixed(1)} дн.`}
                            </td>
                        </tr>
                    </tbody>
                </table>

                {result.profit > 0 && (
                    <p className="muted" style={{ marginBottom: 0 }}>
                        За {result.periodDays} дн. прибыль ≈ {formatMoney(result.profit)}.
                    </p>
                )}
                {result.profit <= 0 && (
                    <p className="empty-state" style={{ marginBottom: 0 }}>
                        Блок убыточен при текущих параметрах.
                    </p>
                )}
            </section>
        </div>
    );
};