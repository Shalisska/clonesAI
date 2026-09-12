import React, { useState } from 'react';
import { SERVERS, SERVER_LABELS, type Server } from '../../core/domain/enums';
import { useApp } from '../state/appStore';
import { useAccounts, useUsers } from '../hooks/useData';

export const AccountsPage: React.FC = () => {
    const { accounts, activeAccountId, setActiveAccount, refresh } = useApp();
    const users = useUsers();
    const accountList = useAccounts();

    const [newUserName, setNewUserName] = useState('');
    const [selectedUserId, setSelectedUserId] = useState<string>('');
    const [accountServer, setAccountServer] = useState<Server>(SERVERS[0]);
    const [accountName, setAccountName] = useState('');
    const [accountNotes, setAccountNotes] = useState('');

    const handleAddUser = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newUserName.trim()) return;
        const user = accounts.addUser(newUserName);
        setNewUserName('');
        setSelectedUserId(user.id);
        refresh();
    };

    const handleAddAccount = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedUserId || !accountName.trim()) return;
        const acc = accounts.addAccount({
            userId: selectedUserId,
            server: accountServer,
            name: accountName,
            notes: accountNotes || undefined,
        });
        setAccountName('');
        setAccountNotes('');
        setActiveAccount(acc.id);
        refresh();
    };

    const handleRemoveUser = (id: string) => {
        accounts.removeUser(id);
        if (accountList.some((a) => a.userId === id && a.id === activeAccountId)) {
            setActiveAccount(null);
        }
        if (selectedUserId === id) setSelectedUserId('');
        refresh();
    };

    const handleRemoveAccount = (id: string) => {
        accounts.removeAccount(id);
        if (activeAccountId === id) setActiveAccount(null);
        refresh();
    };

    return (
        <div className="grid grid-2">
            <section className="card">
                <h2>Новый пользователь</h2>
                <form onSubmit={handleAddUser} className="grid" style={{ gap: 12 }}>
                    <div className="field">
                        <label>Имя пользователя</label>
                        <input
                            type="text"
                            value={newUserName}
                            onChange={(e) => setNewUserName(e.target.value)}
                            placeholder="Например, Алексей"
                        />
                    </div>
                    <button className="btn btn-primary" type="submit">Добавить пользователя</button>
                </form>
            </section>

            <section className="card">
                <h2>Новый аккаунт</h2>
                <form onSubmit={handleAddAccount} className="grid" style={{ gap: 12 }}>
                    <div className="field">
                        <label>Пользователь</label>
                        <select
                            value={selectedUserId}
                            onChange={(e) => setSelectedUserId(e.target.value)}
                        >
                            <option value="">— выберите пользователя —</option>
                            {users.map((u) => (
                                <option key={u.id} value={u.id}>{u.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="field">
                        <label>Сервер</label>
                        <select
                            value={accountServer}
                            onChange={(e) => setAccountServer(e.target.value as Server)}
                        >
                            {SERVERS.map((s) => (
                                <option key={s} value={s}>{SERVER_LABELS[s]}</option>
                            ))}
                        </select>
                    </div>
                    <div className="field">
                        <label>Имя аккаунта / персонажа</label>
                        <input
                            type="text"
                            value={accountName}
                            onChange={(e) => setAccountName(e.target.value)}
                            placeholder="Например, ЗлатоБарон"
                        />
                    </div>
                    <div className="field">
                        <label>Заметки (опц.)</label>
                        <input
                            type="text"
                            value={accountNotes}
                            onChange={(e) => setAccountNotes(e.target.value)}
                        />
                    </div>
                    <button
                        className="btn btn-primary"
                        type="submit"
                        disabled={!selectedUserId || !accountName.trim()}
                    >
                        Добавить аккаунт
                    </button>
                </form>
            </section>

            <section className="card" style={{ gridColumn: '1 / -1' }}>
                <h2>Аккаунты</h2>
                {users.length === 0 ? (
                    <p className="empty-state">
                        Пользователей пока нет. Добавьте пользователя, затем создайте аккаунты на серверах
                        «{SERVER_LABELS[SERVERS[0]]}» и «{SERVER_LABELS[SERVERS[1]]}».
                    </p>
                ) : (
                    <div className="grid" style={{ gap: 16 }}>
                        {users.map((user) => (
                            <div key={user.id} className="card" style={{ margin: 0 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <h3 style={{ margin: 0 }}>{user.name}</h3>
                                    <button className="btn btn-danger" onClick={() => handleRemoveUser(user.id)}>
                                        Удалить пользователя
                                    </button>
                                </div>
                                {selectedUserId !== user.id && (
                                    <button
                                        className="btn"
                                        style={{ marginTop: 10 }}
                                        onClick={() => setSelectedUserId(user.id)}
                                    >
                                        Использовать для нового аккаунта
                                    </button>
                                )}
                                {accounts.getAccountsByUser(user.id).length === 0 ? (
                                    <p className="muted" style={{ marginBottom: 0 }}>Аккаунтов на серверах нет.</p>
                                ) : (
                                    <table className="table" style={{ marginTop: 12 }}>
                                        <thead>
                                            <tr>
                                                <th>Сервер</th>
                                                <th>Аккаунт</th>
                                                <th>Заметки</th>
                                                <th></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {accounts.getAccountsByUser(user.id).map((acc) => {
                                                const isActive = acc.id === activeAccountId;
                                                return (
                                                    <tr key={acc.id}>
                                                        <td>{SERVER_LABELS[acc.server]}</td>
                                                        <td>
                                                            {acc.name}
                                                            {isActive && <span className="badge">активен</span>}
                                                        </td>
                                                        <td className="muted">{acc.notes ?? '—'}</td>
                                                        <td style={{ whiteSpace: 'nowrap' }}>
                                                            {!isActive ? (
                                                                <button
                                                                    className="btn"
                                                                    onClick={() => setActiveAccount(acc.id)}
                                                                >
                                                                    Выбрать
                                                                </button>
                                                            ) : (
                                                                <button className="btn" onClick={() => setActiveAccount(null)}>
                                                                    Сбросить
                                                                </button>
                                                            )}
                                                            <button
                                                                className="btn btn-danger"
                                                                style={{ marginLeft: 8 }}
                                                                onClick={() => handleRemoveAccount(acc.id)}
                                                            >
                                                                Удалить
                                                            </button>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
};