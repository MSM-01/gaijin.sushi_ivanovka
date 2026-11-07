# GAIJIN SUSHI — электронное меню

React + TypeScript + Vite + Tailwind CSS + Zustand + React Router + Lucide.

## Запуск сайта

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production-сборка в папку dist
npm run preview    # просмотр production-сборки
```

Нужен Node.js 18+.

## Админ-панель и база данных

Изменения меню сохраняются в PostgreSQL и доступны всем посетителям. Для локального запуска нужны Node.js 18+, PostgreSQL и Docker Compose (или установленный PostgreSQL).

1. Создайте `server/.env` из `server/.env.example` и проверьте `DATABASE_URL`.
2. Запустите PostgreSQL. Если установлен Docker Compose:

   ```bash
   cd server
   docker compose up -d postgres
   ```

3. В `server/.env` задайте `ADMIN_USERNAME` и `ADMIN_PASSWORD` (не менее 12 символов). Не публикуйте этот файл.
4. Установите зависимости, создайте таблицы, загрузите исходный каталог и создайте администратора:

   ```bash
   cd server
   npm install
   npm run db:migrate
   npm run db:seed
   npm run admin:create
   ```

   `db:seed` добавляет начальные блюда только один раз и не перезаписывает изменения в базе.
5. В одном терминале запустите API, в другом — сайт:

   ```bash
   cd server && npm run dev
   ```

   ```bash
   npm run dev
   ```

Откройте [http://localhost:5173/admin](http://localhost:5173/admin) и войдите с заданными логином и паролем. В админке можно добавлять, редактировать, скрывать и удалять блюда и категории, менять цены и изображения, а также отмечать блюдо как временно недоступное. В меню посетителю покажется статус; нажатие на такую позицию покажет уведомление, что блюда пока нет.

Без запущенного API сайт временно показывает исходное меню и предупреждение, что данные не удалось обновить. Для публикации настройте проксирование `/api` на сервер и укажите адрес сайта в `FRONTEND_ORIGIN`.

## Как это работает

1. Гость открывает сайт (можно по QR-коду) и листает меню по категориям.
2. Кнопка «+» на фото добавляет блюдо, потом появляется счётчик «− 1 +». Нажатие на фото — карточка блюда с описанием.
3. Корзина (кнопка в шапке или красная панель внизу): количество, удаление, очистка, итог.
4. «Показать заказ кассиру» → чек с номером, датой, составом и суммой. Кнопка «Показать кассиру» открывает крупный экран, есть увеличение текста и печать/PDF.

Онлайн-оплаты нет, заказ автоматически никуда не отправляется — чек показывают на кассе.
Тема (светлая/тёмная), язык (RU/EN), корзина и чек сохраняются в localStorage.

## Начальные данные меню

Начальный каталог хранится в `src/data/menu.ts` и загружается в PostgreSQL командой `npm run db:seed`:

- **Категории** — массив `CATEGORIES` (id + названия RU/EN).
- **Блюда** — массив `PRODUCTS`: название, описание (RU/EN), цена в сомах, категория и фото.
- **Фото** кладите в `public/menu/` и указывайте имя файла в `img('имя-без-.jpg')`.

Контакты (телефон, адрес, часы работы) — в `src/data/info.ts`. Пустые поля на сайте не показываются.
Переводы интерфейса — `src/i18n/translations.ts`.

Текущие блюда и категории после загрузки редактируются через `/admin`, а не через файл исходных данных.

## Структура

```
src/
  components/   Header, Drawer, Footer, CategoryTabs, ProductCard, ProductDetails,
                CartItem, CartBar, QtyStepper, ThemeSwitcher, LanguageSwitcher, Toast, ...
  pages/        MenuPage, CartPage, ReceiptPage, AdminPage, NotFoundPage
  store/        cart.ts (корзина + чек), settings.ts (тема, язык), toast.ts
  data/         menu.ts, info.ts
  i18n/         translations.ts, useI18n.ts
public/         logo.jpg (логотип), menu/ (фото блюд)
```

## Публикация

`npm run build`, затем содержимое `dist/` можно выложить на Netlify, Vercel, Cloudflare Pages
или любой хостинг. Для SPA включите переадресацию всех путей на `index.html`
(на Netlify — файл `public/_redirects` со строкой `/* /index.html 200`).
