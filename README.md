# De-ID Studio — frontend

Веб-интерфейс для де-идентификации медицинских текстов и генерации синтетических клинических данных.

- **Лендинг** с формой обратной связи.
- **Вход** по magic link на почту.
- **Мастер де-идентификации**: фреймворк → текст или файл → настройки → проверка найденных сущностей и экспорт.
- **Синтетические данные**: настройки генерации, просмотр записей, отчёт о соответствии, скачивание.
- **Дашборд** со статистикой и **история анализов** с фильтрами и экспортом в CSV.

API — отдельный репозиторий [medical-app-be](https://github.com/cebanoleksandr/medical-app-be). Там же описаны сервис детекции Presidio и правила работы с персональными данными.

Продакшен: https://cebanoleksandr.github.io/medical-app-fe/

## Стек

| Что | Чем |
|---|---|
| Сборка | Vite, TypeScript (strict) |
| UI | React 19, MUI (`styled` + токены из [src/theme.ts](src/theme.ts)), framer-motion на лендинге |
| Данные с сервера | TanStack Query поверх axios |
| Роутинг | React Router, **hash-роутер** (`/#/app/...`) — см. [Деплой](#деплой) |
| Формы | react-hook-form + yup |
| Тексты | i18next + react-i18next, типизированные ключи |

## Локальный запуск

Нужен Node 22.

```bash
npm install
cp .env.example .env
npm run dev
```

Приложение откроется на http://localhost:5173/medical-app-fe/. Путь `/medical-app-fe/` задан в `base` в [vite.config.ts](vite.config.ts), он совпадает с адресом на GitHub Pages.

По умолчанию dev-сервер проксирует `/api` на задеплоенный API на Render. Чтобы работать с локальным бекендом, укажите в `.env`:

```bash
VITE_API_PROXY_TARGET=http://localhost:3000
```

### Вход при локальной разработке

Ссылку из письма бекенд собирает из своих `APP_URL` и `APP_LINK_BASE`.

- **С локальным бекендом.** Задайте в `.env` бекенда `APP_LINK_BASE=http://localhost:5173/medical-app-fe/#`. При `MAIL_PROVIDER=console` ссылка для входа печатается в лог бекенда.
- **С задеплоенным бекендом.** Ссылка в письме ведёт на продакшен. Чтобы войти локально, скопируйте из неё токен и откройте `http://localhost:5173/medical-app-fe/#/auth/verify?token=<токен>`.

Токен одноразовый и живёт 15 минут.

## Скрипты

| Команда | Что делает |
|---|---|
| `npm run dev` | dev-сервер с HMR и прокси `/api` |
| `npm run build` | проверка типов (`tsc -b`) и сборка в `dist/` |
| `npm run lint` | ESLint |
| `npm run preview` | раздаёт собранный `dist/` |
| `npm run deploy` | сборка и публикация `dist/` в ветку `gh-pages` |

Тестов на фронтенде пока нет. Перед коммитом запускайте `npx tsc -b` и `npm run lint`.

## Переменные окружения

Vite подставляет их при сборке. В код попадают только переменные с префиксом `VITE_`, поэтому секретов здесь быть не должно.

| Переменная | Назначение |
|---|---|
| `VITE_API_PROXY_TARGET` | куда dev-сервер проксирует `/api`. Только для `npm run dev` |
| `VITE_API_URL` | адрес API. Пусто — запросы идут на `/api` того же origin (через прокси). Полный URL — запросы идут напрямую на бекенд |
| `VITE_PRESIDIO_WAKE_URL` | `/health` сервиса детекции. Приложение пингует его, чтобы разбудить бесплатный инстанс Render, пока пользователь ещё на первых шагах мастера ([wakeDetection.ts](src/api/wakeDetection.ts)). Пусто — без пинга |

- **`.env`** — локальные настройки, в git не попадает. Шаблон — [.env.example](.env.example).
- **[.env.production](.env.production)** — для `npm run build` и `npm run deploy`, лежит в репозитории. GitHub Pages не умеет проксировать `/api`, поэтому там задан полный адрес API.

## Структура

```
src/
├── api/            axios-клиент, refresh токена, типы ответов API, ключи запросов
├── services/       по функции на эндпоинт: analyses, synthetic, sources, auth, activity…
├── hooks/          React Query хуки поверх services: useDashboard, useCreateAnalysis, useDataset…
├── routes/         дерево маршрутов, проверка сессии в loader'ах
├── pages/          страницы: landing/, auth/, шаги мастера, Dashboard, Analyses, Synthetic…
├── components/
│   ├── layouts/    AppLayout (sidebar + header), AuthLayout, лендинг, мастер де-идентификации
│   ├── ui/         общие компоненты: Button, Dropdown, Stepper, DateRangePicker…
│   └── <раздел>/   компоненты страниц: dashboard/, de-identify/, review/, synthetic/, generated/…
├── i18n/           настройка i18next, словари в locales/en/, форматирование чисел и дат
├── assets/         иконки и картинки из Figma, разложены по разделам
└── theme.ts        цвета, типографика, тени, брейкпоинты
```

### Маршруты

| Путь | Страница |
|---|---|
| `/`, `/contact-us` | лендинг |
| `/auth/login`, `/auth/verify` | вход по magic link |
| `/app` | дашборд |
| `/app/analyses` | все анализы |
| `/app/de-identify/{compliance,input,configuration,review}` | мастер де-идентификации |
| `/app/synthetic/settings`, `/app/synthetic/result?dataset=<id>` | генерация и результат |

Всё под `/app` доступно только после входа. Неизвестные пути показывают страницу 404.

## Как устроено

### Запросы к API

Компоненты не вызывают axios напрямую. Цепочка такая:

1. **`services/`** — функция на каждый эндпоинт.
2. **`hooks/`** — хук на React Query с ключом из [queryKeys.ts](src/api/queryKeys.ts).
3. **Компонент** — использует хук.

Ошибки приводятся к `ApiError` ([errors.ts](src/api/errors.ts)): статус, понятное сообщение, флаги вроде `isGone` для истёкших датасетов.

### Авторизация

- **Access-токен** хранится только в памяти, не в `localStorage`.
- **Refresh-токен** лежит в `httpOnly` cookie, которую ставит бекенд.
- **Перезагрузка страницы.** Сессия восстанавливается запросом `POST /auth/refresh`.
- **Ответ 401.** [client.ts](src/api/client.ts) один раз обновляет токен и повторяет запрос. Параллельные запросы ждут одного общего refresh: бекенд ротирует refresh-токен при каждом использовании, а повтор старого токена сбрасывает все сессии.
- **Refresh не удался.** Пользователь попадает на страницу входа.

### Персональные данные

Текст документа и черновик мастера живут только в памяти вкладки (React context в `AppLayout`). Они не пишутся в `localStorage`, URL или логи. Если закрыть вкладку, черновик пропадает. Это сделано намеренно.

### Стили и адаптивность

- **Стили** — MUI `styled` и токены из `theme.ts` (`colors`, `typography`, `shadows`, `radius`). Tailwind подключён, но компоненты на нём не пишутся.
- **Брейкпоинты** — `media.nav` (1024px) и `media.mobile` (720px) из `theme.ts`:
  - ниже 1024px боковое меню становится выдвижной панелью с кнопкой ☰ в шапке;
  - ниже 720px страницы перестраиваются в одну колонку;
  - таблицы на узких экранах прокручиваются по горизонтали.

### Тексты и языки

Все тексты интерфейса лежат в [src/i18n/locales/en/](src/i18n/locales/en/). Каждому разделу соответствует свой файл: `common`, `app`, `auth`, `landing`, `dashboard`, `analyses`, `deIdentify`, `synthetic`. Сейчас язык один — английский.

- **Текст в коде** пишется не строкой, а через ключ: `const { t } = useTranslation('dashboard')`, затем `t('stats.documents')`. Вне компонентов используется `i18n.t('dashboard:stats.documents')`.
- **Ключи типизированы.** Опечатка в ключе или несуществующий ключ ломает `tsc`.
- **Числа и даты** форматируются через [src/i18n/format.ts](src/i18n/format.ts), а не через `toLocaleString('en-US')`.
- **Справочники бекенда** (фреймворки, методы, идентификаторы) переводятся по id через `useCatalog()`. Если перевода нет, показывается текст сервера.

Как добавить язык:

1. Скопировать `locales/en` в `locales/<код>` и перевести.
2. Добавить код в `LANGUAGES` в [resources.ts](src/i18n/resources.ts).
3. Указать локаль для дат и чисел в [format.ts](src/i18n/format.ts).

Выбор языка запоминается в `localStorage` (`deid.language`). Если выбора нет, берётся язык браузера. Переключателя в интерфейсе пока нет.

## Деплой

Фронтенд публикуется на GitHub Pages:

```bash
npm run deploy
```

Команда собирает проект с [.env.production](.env.production) и пушит `dist/` в ветку `gh-pages`.

GitHub Pages раздаёт только статические файлы, отсюда три следствия:

- **Hash-роутер.** Pages не умеет отдавать `index.html` на любой путь, поэтому маршруты живут после `#`: `/medical-app-fe/#/app/analyses`. Обычный роутер давал бы 404 при обновлении страницы.
- **Прямые запросы к API.** Проксировать `/api` нельзя, поэтому приложение ходит на `https://deid-api.onrender.com/api` с другого домена.
- **Настройки бекенда на Render:**

  | Переменная | Значение |
  |---|---|
  | `APP_URL` | `https://cebanoleksandr.github.io` — origin для CORS, без пути |
  | `APP_LINK_BASE` | `https://cebanoleksandr.github.io/medical-app-fe/#` — база для ссылки в письме |
  | `COOKIE_SECURE` | `true` |
  | `COOKIE_SAMESITE` | `none` — иначе браузер не отправит refresh-cookie на другой домен |

**Ограничение:** Safari и браузеры, которые блокируют сторонние cookie, могут не сохранять refresh-cookie. Тогда сессия теряется при перезагрузке страницы. Полностью это решается только размещением фронтенда и API на одном домене: Vercel или Netlify с прокси `/api`, как описано в DEPLOY.md бекенда.

**Бесплатный тариф Render.** API и Presidio засыпают после 15 минут простоя, и первый запрос может идти до минуты. Поэтому таймаут запросов в клиенте — 90 секунд.
