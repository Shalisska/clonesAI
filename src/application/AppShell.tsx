import React, { useEffect, useState } from 'react';
import { useTheme } from './shared/context/ThemeContext';
import { useRouter } from './routing/router';
import { AccountSelector } from './components/AccountSelector';
import { DashboardPage } from './pages/DashboardPage';
import { AccountingPage } from './pages/AccountingPage';
import { SandboxPage } from './pages/SandboxPage';
import { DataImportPage } from './pages/DataImportPage';
import { BackupPage } from './pages/BackupPage';
import { AccountsPage } from './pages/AccountsPage';

type Tab = 'dashboard' | 'accounting' | 'sandbox' | 'import' | 'accounts' | 'backup';

const TABS: Array<{ id: Tab; label: string }> = [
    { id: 'dashboard', label: 'Дашборд' },
    { id: 'accounting', label: 'Учёт' },
    { id: 'sandbox', label: 'Песочница' },
    { id: 'import', label: 'Импорт данных' },
    { id: 'accounts', label: 'Аккаунты' },
    { id: 'backup', label: 'Резервная копия' },
];

/**
 * Пути вкладок. Вкладка без пути остаётся чисто внутренней (URL не меняется).
 * Позже, при меню-дереве, сюда можно добавлять многосегментные маршруты
 * (например '/reports/:year/:month') — роутер это уже поддерживает.
 */
const TAB_ROUTES: Partial<Record<Tab, string>> = {
    dashboard: '/',
    import: '/import-html',
};

/** Определяет активную вкладку по текущему пути (для восстановления при перезагрузке). */
function tabFromPath(pathname: string): Tab {
    if (pathname === '/import-html') return 'import';
    return 'dashboard';
}

export const AppShell: React.FC = () => {
    const { pathname, navigate } = useRouter();
    const [tab, setTab] = useState<Tab>(() => tabFromPath(window.location.pathname));
    const { theme, toggleTheme } = useTheme();

    // Синхронизируем вкладку с адресной строкой (перезагрузка, кнопки назад/вперёд).
    useEffect(() => {
        setTab(tabFromPath(pathname));
    }, [pathname]);

    const handleTab = (id: Tab) => {
        setTab(id);
        const route = TAB_ROUTES[id];
        if (route) navigate(route);
    };

    return (
        <div className="app-shell">
            <header className="app-header">
                <h1>Golden Clone · Assistant</h1>
                <nav className="app-nav">
                    {TABS.map((t) => (
                        <button
                            key={t.id}
                            className={`btn ${tab === t.id ? 'btn-primary' : ''}`}
                            onClick={() => handleTab(t.id)}
                        >
                            {t.label}
                        </button>
                    ))}
                    <AccountSelector />
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
                {tab === 'accounts' && <AccountsPage />}
                {tab === 'backup' && <BackupPage />}
            </main>
        </div>
    );
};