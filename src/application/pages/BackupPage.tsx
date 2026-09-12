import React, { useRef, useState } from 'react';
import { createBackup, downloadBackup, parseBackup } from '../../data/storage/backup';
import { overwriteStore } from '../../data/storage/storageManager';
import { useApp } from '../state/appStore';
import { useAccounts, useBlocks, useQuotes, useTransactions, useUsers } from '../hooks/useData';

export const BackupPage: React.FC = () => {
    const { store, refresh, accounts, setActiveAccount, activeAccountId } = useApp();
    const users = useUsers();
    const accountList = useAccounts();
    const blocks = useBlocks();
    const transactions = useTransactions();
    const quotes = useQuotes();
    const fileRef = useRef<HTMLInputElement>(null);
    const [message, setMessage] = useState('');

    const handleExport = () => {
        const backup = createBackup(users, accountList, blocks, transactions, quotes);
        downloadBackup(backup);
        setMessage('Резервная копия выгружена.');
    };

    const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
            const data = parseBackup(String(reader.result ?? ''));
            if (!data) {
                setMessage('Не удалось распознать файл резервной копии.');
                return;
            }
            overwriteStore(store, data);
            refresh();
            // если выбранный аккаунт исчез после импорта — сбрасываем выбор
            if (activeAccountId && !accounts.getById(activeAccountId)) {
                setActiveAccount(null);
            }
            setMessage(
                `Импортировано: пользователей ${data.users.length}, аккаунтов ${data.accounts.length}, блоков ${data.blocks.length}, операций ${data.transactions.length}, котировок ${data.quotes.length}.`,
            );
        };
        reader.readAsText(file);
    };

    return (
        <div className="grid grid-2">
            <section className="card">
                <h2>Экспорт</h2>
                <p className="muted">Выгрузить все данные (блоки, операции, котировки) в файл JSON.</p>
                <button className="btn btn-primary" onClick={handleExport}>
                    Скачать резервную копию (.json)
                </button>
            </section>

            <section className="card">
                <h2>Импорт</h2>
                <p className="muted">Загрузить ранее сохранённую копию. Данные будут заменены.</p>
                <input
                    ref={fileRef}
                    type="file"
                    accept="application/json,.json"
                    style={{ display: 'none' }}
                    onChange={handleImportFile}
                />
                <button className="btn" onClick={() => fileRef.current?.click()}>
                    Выбрать файл .json
                </button>
                {message && <p className="muted" style={{ marginTop: 10 }}>{message}</p>}
            </section>
        </div>
    );
};