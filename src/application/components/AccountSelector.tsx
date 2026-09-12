import React from 'react';
import { SERVER_LABELS } from '../../core/domain/enums';
import { useApp } from '../state/appStore';
import { useAccounts, useUsers } from '../hooks/useData';

/**
 * Компактный селектор текущего аккаунта в шапке.
 * Показывает «Пользователь · Сервер · Аккаунт» и позволяет переключаться.
 */
export const AccountSelector: React.FC = () => {
    const { activeAccountId, setActiveAccount, refresh } = useApp();
    const users = useUsers();
    const accounts = useAccounts();

    const userNameById = new Map(users.map((u) => [u.id, u.name]));

    const handleChange = (value: string) => {
        if (value === '') setActiveAccount(null);
        else setActiveAccount(value);
        refresh();
    };

    return (
        <label className="field account-selector" style={{ margin: 0 }}>
            <select value={activeAccountId ?? ''} onChange={(e) => handleChange(e.target.value)} title="Текущий аккаунт">
                <option value="">— нет аккаунта —</option>
                {accounts.map((a) => (
                    <option key={a.id} value={a.id}>
                        {userNameById.get(a.userId) ?? '?'} · {SERVER_LABELS[a.server]} · {a.name}
                    </option>
                ))}
            </select>
        </label>
    );
};