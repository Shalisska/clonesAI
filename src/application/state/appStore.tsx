import React, { createContext, useContext, useMemo, useState } from 'react';
import { createLocalStore, type DataStore } from '../../data/storage/storageManager';
import { AccountingService } from '../../services/accounting/accountingService';
import { DashboardService } from '../../services/analytics/dashboardService';
import { QuoteService } from '../../services/quotes/quoteService';
import { SandboxService } from '../../services/sandbox/sandboxService';

export interface AppServices {
    store: DataStore;
    accounting: AccountingService;
    quotes: QuoteService;
    sandbox: SandboxService;
    dashboard: DashboardService;
    /** счётчик изменений для принудительного перерендера при мутациях */
    revision: number;
    refresh: () => void;
}

const AppContext = createContext<AppServices | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [revision, setRevision] = useState(0);

    const services = useMemo<Omit<AppServices, 'revision'>>(() => {
        const store = createLocalStore();
        const quotes = new QuoteService(store.quotes);
        return {
            store,
            quotes,
            accounting: new AccountingService(store.transactions),
            sandbox: new SandboxService((itemId) => quotes.getLatestPrice(itemId)),
            dashboard: new DashboardService(store.blocks, store.transactions),
            refresh: () => setRevision((r) => r + 1),
        };
    }, []);

    const value = useMemo<AppServices>(
        () => ({ ...services, revision }),
        [services, revision],
    );

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useApp = (): AppServices => {
    const context = useContext(AppContext);
    if (!context) throw new Error('useApp must be used within AppProvider');
    return context;
};