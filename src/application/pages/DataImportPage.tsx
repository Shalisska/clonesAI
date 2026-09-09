import React, { useState } from 'react';
import { EXCHANGE_PARSE_CONFIG, toPriceQuotes } from '../../services/parsing/exchangeParser';
import { parseHtml } from '../../services/parsing/parserEngine';
import type { ParsedItem } from '../../services/parsing/parseConfig';
import { useApp } from '../state/appStore';
import { formatMoney } from '../shared/utils/format';

export const DataImportPage: React.FC = () => {
    const { quotes, refresh } = useApp();
    const [html, setHtml] = useState('');
    const [parsed, setParsed] = useState<ParsedItem[] | null>(null);
    const [message, setMessage] = useState('');

    const handleParse = () => {
        setMessage('');
        if (!html.trim()) {
            setMessage('Вставьте HTML-разметку.');
            return;
        }
        const items = parseHtml(html, EXCHANGE_PARSE_CONFIG);
        setParsed(items);
        setMessage(
            items.length === 0
                ? 'Ничего не извлечено. Проверьте, что разметка соответствует пресету биржи.'
                : `Извлечено позиций: ${items.length}`,
        );
    };

    const handleSave = () => {
        if (!parsed || parsed.length === 0) return;
        const result = quotes.saveMany(toPriceQuotes(parsed, html));
        setMessage(`Сохранено: ${result.saved}, пропущено дублей: ${result.skipped}.`);
        setParsed(null);
        refresh();
    };

    return (
        <div className="grid">
            <section className="card">
                <h2>Импорт данных с биржи</h2>
                <p className="muted">
                    Вставьте HTML-разметку страницы биржи (скопированную после входа в игру).
                    Используется фиксированный пресет правил:
                </p>
                <ul className="muted">
                    <li>Строка товара: <code>{EXCHANGE_PARSE_CONFIG.itemRowSelector}</code></li>
                    <li>Название: <code>{EXCHANGE_PARSE_CONFIG.itemNameSelector}</code></li>
                    <li>Цена: <code>{EXCHANGE_PARSE_CONFIG.itemPriceSelector}</code></li>
                </ul>
                <p className="muted">
                    Примечание: селекторы пока являются заглушкой — уточняются после получения
                    реального образца разметки биржи.
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
                        onClick={handleSave}
                        disabled={!parsed || parsed.length === 0}
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
                                <th>Товар</th>
                                <th className="num">Цена</th>
                                <th>Ед.</th>
                            </tr>
                        </thead>
                        <tbody>
                            {parsed.map((p) => (
                                <tr key={p.itemId}>
                                    <td>{p.itemName}</td>
                                    <td className="num">{formatMoney(p.price)}</td>
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