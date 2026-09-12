import React, { createContext, useContext, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createLocalStore, type DataStore } from '../../data/storage/storageManager';
import { ACTIVE_ACCOUNT_KEY } from '../../data/storage/schema';
import { AccountingService } from '../../services/accounting/accountingService';
import { AccountService } from '../../services/accounting/accountService';
import { DashboardService } from '../../services/analytics/dashboardService';
import { QuoteService } from '../../services/quotes/quoteService';
import { SandboxService } from '../../services/sandbox/sandboxService';
import { ActiveAccountScope } from '../../services/accountScope';

export interface AppServices {
    store: DataStore;
    accounting: AccountingService;
    quotes: QuoteService;
    sandbox: SandboxService;
    dashboard: DashboardService;
    accounts: AccountService;
    /** id выбранного в данный момент аккаунта (null — аккаунт не выбран) */
    activeAccountId: string | null;
    setActiveAccount: (id: string | null) => void;
    /** счётчик изменений для принудительного перерендера при мутациях */
    revision: number;
    refresh: () => void;
}

function readActiveAccount(): string | null {
    try {
        return localStorage.getItem(ACTIVE_ACCOUNT_KEY);
    } catch {
        return null;
    }
}

const AppContext = createContext<AppServices | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [revision, setRevision] = useState(0);
    const [activeAccountId, setActiveAccountIdState] = useState<string | null>(readActiveAccount);
    const scopeRef = useRef<ActiveAccountScope | null>(null);
    if (!scopeRef.current) {
        scopeRef.current = new ActiveAccountScope();
    }
    const scope = scopeRef.current;

    // синхронизируем scope с сохранённым выбором при первой загрузке
    useEffect(() => {
        scope.set(readActiveAccount());
    }, [scope]);

    const setActiveAccount = useCallback((id: string | null) => {
        setActiveAccountIdState(id);
        scope.set(id);
        try {
            if (id) localStorage.setItem(ACTIVE_ACCOUNT_KEY, id);
            else localStorage.removeItem(ACTIVE_ACCOUNT_KEY);
        } catch {
            // ignore storage errors
        }
        setRevision((r) => r + 1);
    }, [scope]);

    const services = useMemo<Omit<AppServices, 'revision' | 'activeAccountId' | 'setActiveAccount'>>(() => {
        const store = createLocalStore();
        const quotes = new QuoteService(store.quotes, scope);
        return {
            store,
            quotes,
            accounts: new AccountService(store.users, store.accounts),
            accounting: new AccountingService(store.transactions, scope),
            sandbox: new SandboxService((itemId) => quotes.getLatestPrice(itemId)),
            dashboard: new DashboardService(store.blocks, store.transactions, scope),
            refresh: () => setRevision((r) => r + 1),
        };
    }, [scope]);

    const value = useMemo<AppServices>(
        () => ({
            ...services,
            accounts: services.accounts,
            activeAccountId,
            setActiveAccount,
            revision,
        }),
        [services, activeAccountId, setActiveAccount, revision],
    );

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useApp = (): AppServices => {
    const context = useContext(AppContext);
    if (!context) throw new Error('useApp must be used within AppProvider');
    return context;
};