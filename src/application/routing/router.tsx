import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from 'react';

/** Результат сопоставления пути с шаблоном маршрута. */
export interface RouteMatch {
    path: string;
    params: Record<string, string>;
}

export interface Router {
    /** Текущий путь из адресной строки (без query). */
    pathname: string;
    /** Перейти по пути (history.pushState). */
    navigate: (to: string) => void;
    /** Сопоставить текущий путь с одним из шаблонов; null — совпадений нет. */
    match: (patterns: readonly string[]) => RouteMatch | null;
}

const RouterContext = createContext<Router | undefined>(undefined);

/**
 * Лёгкий роутер на history API.
 * Поддерживает многосегментные пути и параметры (`/analytics/:category`,
 * `/reports/:year/:month`), что в дальнейшем позволит строить меню-дерево.
 * Хранилище путей — в `window.history`, поэтому перезагрузка страницы сохраняет вкладку.
 */
export const RouterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [pathname, setPathname] = useState<string>(() => window.location.pathname);

    const navigate = useCallback((to: string) => {
        window.history.pushState({}, '', to);
        setPathname(window.location.pathname);
    }, []);

    useEffect(() => {
        const onPopState = () => setPathname(window.location.pathname);
        window.addEventListener('popstate', onPopState);
        return () => window.removeEventListener('popstate', onPopState);
    }, []);

    const value = useMemo<Router>(
        () => ({
            pathname,
            navigate,
            match: (patterns) => matchAny(patterns, pathname),
        }),
        [pathname, navigate],
    );

    return <RouterContext.Provider value={value}>{children}</RouterContext.Provider>;
};

/** Доступ к роутеру внутри RouterProvider. */
// eslint-disable-next-line react-refresh/only-export-components
export function useRouter(): Router {
    const ctx = useContext(RouterContext);
    if (!ctx) throw new Error('useRouter must be used within RouterProvider');
    return ctx;
}

/** Первый подошедший шаблон из списка. */
function matchAny(patterns: readonly string[], pathname: string): RouteMatch | null {
    for (const pattern of patterns) {
        const m = matchPattern(pattern, pathname);
        if (m) return m;
    }
    return null;
}

/**
 * Сопоставляет одиночный шаблон с путём.
 * Сегменты вида `:name` захватывают параметр; статические сегменты — точное равенство.
 * Количество сегментов должно совпадать (без учёта хвостовых слэшей).
 */
export function matchPattern(pattern: string, pathname: string): RouteMatch | null {
    const cleanPath = normalize(pathname);
    const cleanPattern = normalize(pattern);
    const parts = cleanPath.split('/').filter(Boolean);
    const segments = cleanPattern.split('/').filter(Boolean);
    if (segments.length !== parts.length) return null;

    const params: Record<string, string> = {};
    for (let i = 0; i < segments.length; i += 1) {
        const seg = segments[i];
        if (seg.startsWith(':')) {
            params[seg.slice(1)] = decodeURIComponent(parts[i]);
        } else if (seg !== parts[i]) {
            return null;
        }
    }
    return { path: cleanPath, params };
}

function normalize(path: string): string {
    const trimmed = path.split('?')[0];
    return trimmed.length > 1 ? trimmed.replace(/\/+$/, '') : trimmed;
}