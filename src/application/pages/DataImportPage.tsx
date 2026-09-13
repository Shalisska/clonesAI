import React, { useState } from 'react';
import { EXCHANGE_PARSE_CONFIG, parseExchangeRows, toPriceQuotes } from '../../services/parsing/exchangeParser';
import type { ParsedItem } from '../../services/parsing/parseConfig';
import { SERVER_LABELS } from '../../core/domain/enums';
import { useApp } from '../state/appStore';
import { formatMoney } from '../shared/utils/format';

export const DataImportPage: React.FC = () => {
    const { quotes, refresh, accounts, activeAccountId } = useApp();
    const [html, setHtml] = useState('');
    const [parsed, setParsed] = useState<ParsedItem[] | null>(null);
    const [message, setMessage] = useState('');

    const handleParse = () => {
        setMessage('');
        if (!html.trim()) {
            setMessage('Вставьте HTML-разметку.');
            return;
        }
        const items = parseExchangeRows(html);
        setParsed(items);
        setMessage(
            items.length === 0
                ? 'Ничего не извлечено. Проверьте, что разметка соответствует пресету биржи.'
                : `Извлечено позиций: ${items.length}`,
        );
    };

    const handleSave = () => {
        if (!parsed || parsed.length === 0) return;
        if (!activeAccountId) {
            setMessage('Сначала выберите аккаунт — котировки сохраняются для конкретного аккаунта.');
            return;
        }
        const result = quotes.saveMany(toPriceQuotes(parsed, html));
        setMessage(`Сохранено: ${result.saved}, пропущено дублей: ${result.skipped}.`);
        setParsed(null);
        refresh();
    };

    const handleExportJson = () => {
        if (!parsed || parsed.length === 0) return;
        const account = activeAccountId ? accounts.getById(activeAccountId) : undefined;
        const payload = {
            exportedAt: new Date().toISOString(),
            source: EXCHANGE_PARSE_CONFIG.source,
            accountId: activeAccountId ?? null,
            server: account ? SERVER_LABELS[account.server] : null,
            items: parsed,
        };
        const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `exchange-${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
        setMessage(`Выгружено позиций в JSON: ${parsed.length}.`);
    };

    return (
        <div className="grid">
            <section className="card">
                <h2>Импорт данных с биржи</h2>
                <p className="muted">
                    Вставьте HTML-разметку страницы биржи (скопированную после входа в игру).
                    Парсер использует стабильные идентификаторы из разметки
                    (<code>{EXCHANGE_PARSE_CONFIG.rowSelector}</code>, атрибут{' '}
                    <code>{EXCHANGE_PARSE_CONFIG.priceAttribute}</code>), поэтому корректно работает
                    на обоих серверах, включая уникальные товары каждого сервера.
                </p>

                <textarea
                    rows={10}
                    value={html}
                    onChange={(e) => setHtml(e.target.value)}
                    placeholder="<html>… вставьте разметку биржи …</html>"
                />
                <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
                    <button className="btn btn-primary" onClick={handleParse}>Распарсить</button>
                    <button
                        className="btn"
                        onClick={handleExportJson}
                        disabled={!parsed || parsed.length === 0}
                    >
                        Скачать JSON
                    </button>
                    <button
                        className="btn"
                        onClick={handleSave}
                        disabled={!parsed || parsed.length === 0 || !activeAccountId}
                    >
                        Сохранить котировки ({parsed?.length ?? 0})
                    </button>
                </div>
                {message && <p className="muted">{message}</p>}
            </section>

            <section className="card">
                <h2>Предпросмотр распарсенных позиций</h2>
                {!parsed || parsed.length === 0 ? (
                    <p className="empty-state">Пока пусто. Вставьте HTML и нажмите «Распарсить».</p>
                ) : (
                    <table className="table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Товар</th>
                                <th className="num">Номинал</th>
                                <th className="num">Лавка</th>
                                <th className="num">Мин. цена</th>
                                <th className="num">Доступно</th>
                                <th>Ед.</th>
                            </tr>
                        </thead>
                        <tbody>
                            {parsed.map((p) => (
                                <tr key={p.itemId}>
                                    <td className="muted">{p.exchangeId ?? '—'}</td>
                                    <td>{p.itemName}</td>
                                    <td className="num">{p.basePrice != null ? formatMoney(p.basePrice) : '—'}</td>
                                    <td className="num">{p.swapPrice != null ? formatMoney(p.swapPrice) : '—'}</td>
                                    <td className="num">{formatMoney(p.price)}</td>
                                    <td className="num">{p.available ?? '—'}</td>
                                    <td>{p.unit}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </section>
        </div>
    );
};