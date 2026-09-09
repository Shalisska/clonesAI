import React, { useState } from 'react';
import { useTheme } from './shared/context/ThemeContext';
import { DashboardPage } from './pages/DashboardPage';
import { AccountingPage } from './pages/AccountingPage';
import { SandboxPage } from './pages/SandboxPage';
import { DataImportPage } from './pages/DataImportPage';
import { BackupPage } from './pages/BackupPage';

type Tab = 'dashboard' | 'accounting' | 'sandbox' | 'import' | 'backup';

const TABS: Array<{ id: Tab; label: string }> = [
    { id: 'dashboard', label: 'Дашборд' },
    { id: 'accounting', label: 'Учёт' },
    { id: 'sandbox', label: 'Песочница' },
    { id: 'import', label: 'Импорт данных' },
    { id: 'backup', label: 'Резервная копия' },
];

export const AppShell: React.FC = () => {
    const [tab, setTab] = useState<Tab>('dashboard');
    const { theme, toggleTheme } = useTheme();

    return (
        <div className="app-shell">
            <header className="app-header">
                <h1>Golden Clone · Assistant</h1>
                <nav className="app-nav">
                    {TABS.map((t) => (
                        <button
                            key={t.id}
                            className={`btn ${tab === t.id ? 'btn-primary' : ''}`}
                            onClick={() => setTab(t.id)}
                        >
                            {t.label}
                        </button>
                    ))}
                    <button className="theme-btn" onClick={toggleTheme} title="Переключить тему">
                        {theme === 'dark' ? '☀️' : '🌙'}
                    </button>
                </nav>
            </header>
            <main className="app-main">
                {tab === 'dashboard' && <DashboardPage />}
                {tab === 'accounting' && <AccountingPage />}
                {tab === 'sandbox' && <SandboxPage />}
                {tab === 'import' && <DataImportPage />}
                {tab === 'backup' && <BackupPage />}
            </main>
        </div>
    );
};