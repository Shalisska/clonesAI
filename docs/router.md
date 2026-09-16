# Роутер приложения

Лёгкий клиентский роутер на `history API`. Отвечает за то, чтобы текущий экран
приложения соответствовал URL и сохранялся при перезагрузке страницы, а также
даёт возможность добавлять маршруты произвольным страницам — включая
многосегментные пути с параметрами (задел под будущее меню-дерево).

## Зачем нужен

- Сохранение вкладки при перезагрузке (например `/import-html`).
- Чистые URL вместо внутреннего состояния.
- Кнопки «назад/вперёд» браузера работают между экранами.
- Единая точка для добавления новых путей к страницам.

## Файлы

| Файл | Назначение |
|------|------------|
| [`src/application/routing/router.tsx`](../src/application/routing/router.tsx) | Реализация роутера (контекст, провайдер, сопоставление путей) |
| [`src/main.tsx`](../src/main.tsx) | Подключение `RouterProvider` вокруг приложения |
| [`src/application/AppShell.tsx`](../src/application/AppShell.tsx) | Привязка вкладок к маршрутам (`TAB_ROUTES`, `tabFromPath`) |

## Как это работает

`RouterProvider` хранит текущий путь в состоянии и синхронизирует его с
`window.location.pathname`:

- при загрузке страницы читает адрес из `window.history`;
- переходы выполняются через `history.pushState` (без перезагрузки);
- `popstate` обновляет состояние при нажатии «назад/вперёд».

Провайдер оборачивается в `main.tsx` вокруг всего приложения:

```tsx
<ThemeProvider>
  <RouterProvider>
    <App />
  </RouterProvider>
</ThemeProvider>
```

## API

### `RouterProvider`

Контекстный провайдер. Оборачивает дерево компонентов, предоставляя доступ к
роутеру через `useRouter()`.

### `useRouter(): Router`

Хук доступа к роутеру (только внутри `RouterProvider`). Возвращает:

- `pathname: string` — текущий путь без query;
- `navigate(to: string): void` — перейти по пути через `history.pushState`;
- `match(patterns: readonly string[]): RouteMatch | null` — сопоставить текущий
  путь с одним из шаблонов (вернёт первый подошедший).

`RouteMatch`:

```ts
interface RouteMatch {
    path: string;                      // фактический путь
    params: Record<string, string>;    // захваченные параметры (:name)
}
```

### `matchPattern(pattern, pathname): RouteMatch | null`

Чистая функция сопоставления одного шаблона с путём:

- статические сегменты сравниваются точно;
- сегменты вида `:name` захватывают значение в `params` (с декодированием);
- количество сегментов должно совпадать (хвостовые слэши не учитываются).

Примеры:

```
pattern "/reports/:year/:month"
path    "/reports/2026/09"      → { params: { year: "2026", month: "09" } }
path    "/reports/2026"         → null (разное число сегментов)

pattern "/analytics/:category"
path    "/analytics/trade"      → { params: { category: "trade" } }
```

## Текущие маршруты

В [`AppShell.tsx`](../src/application/AppShell.tsx) вкладки сопоставляются с
путями через таблицу `TAB_ROUTES`:

```ts
const TAB_ROUTES: Partial<Record<Tab, string>> = {
    dashboard: '/',
    import: '/import-html',
};
```

- Вкладка без пути остаётся **внутренней** — URL не меняется (Учёт, Песочница,
  Аккаунты, Резервная копия).
- `tabFromPath(pathname)` определяет активную вкладку по адресу при загрузке.
- `useEffect` на `pathname` синхронизирует вкладку при перезагрузке и навигации
  назад/вперёд.

При клике на вкладку `handleTab(id)` переключает состояние и, если для вкладки
есть маршрут, вызывает `navigate(route)`.

## Как добавить маршрут новой странице

**Простая вкладка:** достаточно добавить путь в `TAB_ROUTES`:

```ts
const TAB_ROUTES: Partial<Record<Tab, string>> = {
    dashboard: '/',
    accounting: '/accounting',
    import: '/import-html',
};
```

**Многоступенчатый маршрут (например для будущего меню-дерева):**
используйте `router.match` прямо в компоненте страницы:

```tsx
import { useRouter } from '../routing/router';

const { match } = useRouter();
const route = match(['/reports/:year/:month']);
// route?.params.year, route?.params.month
```

Это позволяет строить вложенные разделы без изменения ядра роутера.

## Рекомендации

- `navigate` меняет только путь (без query/hash). При необходимости расширять —
  аккуратно дополнить `normalize`.
- Имена параметров в `:name` должны быть уникальны внутри одного шаблона.
- URL-кодирование значений в пути обрабатывается через `decodeURIComponent`.

## Деплой (SPA-фолбэк)

Vite в dev-режиме и `vite preview` по умолчанию настроены на SPA-режим
(`appType: 'spa'`), поэтому прямой переход по `/import-html` обрабатывается
корректно. Для реального статического хостинга нужно настроить фолбэк всех путей
на `index.html` (например `try_files $uri /index.html` в nginx или аналог для
другого сервера), иначе прямой заход по глубокой ссылке вернёт 404.