# Discord-бот — Остров Судьбы

Система тикетов для Discord-сервера **Остров Судьбы**. Бот рассчитан на запуск на вашем ПК и умеет сам перезапускаться после сбоев.

## Что умеет

- Панель «Создать тикет» в указанном канале
- Личный канал тикета только для автора и поддержки
- Кнопка закрытия с подтверждением
- Один открытый тикет на игрока
- Логи в `logs/bot.log`
- Состояние тикетов в `data/tickets.json`
- Watchdog (`npm run start:safe`) — автоперезапуск при падении

## Быстрый старт (Windows)

1. Установите [Node.js LTS](https://nodejs.org/) (18+)
2. Скопируйте папку `discord-bot` на рабочий стол (или используйте уже готовый архив)
3. Дважды кликните `install.bat`
4. Откройте `.env` и проверьте:
   - `DISCORD_TOKEN` — токен бота
   - `TICKET_CHANNEL_ID=1514901109322547240`
5. В [Discord Developer Portal](https://discord.com/developers/applications):
   - Bot → включите бота
   - OAuth2 → URL Generator → scopes: `bot`, `applications.commands`
   - Permissions: `Manage Channels`, `Send Messages`, `Embed Links`, `Read Message History`, `Attach Files`, `View Channels`
   - Пригласите бота на сервер
6. Запустите `start.bat` и **не закрывайте** окно консоли

## Настройка `.env`

| Переменная | Описание |
|---|---|
| `DISCORD_TOKEN` | Токен бота |
| `TICKET_CHANNEL_ID` | Канал с панелью тикетов |
| `TICKET_CATEGORY_ID` | (опционально) категория для каналов тикетов |
| `SUPPORT_ROLE_IDS` | (опционально) ID ролей поддержки через запятую |
| `TICKET_PREFIX` | Префикс имени канала (`ticket` → `ticket-0001`) |

## Запуск из терминала

```bash
cd discord-bot
npm install
npm run start:safe
```

Обычный запуск без watchdog: `npm start`

## Безопасность токена

- Токен храните **только** в `.env`
- Файл `.env` не коммитьте в git
- Если токен светился в чате — **сбросьте его** в Developer Portal → Bot → Reset Token и обновите `.env`

## Права бота на сервере

Роль бота должна быть выше ролей, которым он выдаёт доступ, и иметь:

- Управление каналами
- Просмотр каналов
- Отправка сообщений
- Встраивание ссылок
- История сообщений
- Прикрепление файлов
