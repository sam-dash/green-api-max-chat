# MAX Chat — тестовое задание

ПРЕВЬЮ - "https://sam-dash.github.io/green-api-max-chat/"

Веб-интерфейс для отправки и получения текстовых сообщений в мессенджере MAX

## Стек

React 18 + TypeScript + Vite, без сторонних UI-библиотек.

## Архитектура

```
src/
  api/            — greenApiClient.ts: HTTP-слой, запросы к GREEN-API
  hooks/          — useAuth, useChats, useIncomingMessages: бизнес-логика
  components/     — ui компоненты
  utils/          — форматирование данных
  types.ts        — доменные типы (Chat, ChatMessage, ответы GREEN API)
  App.tsx         — композиция хуков и компонентов
```

## Как это соответствует ТЗ

1. **Вход** — форма с idInstance/apiTokenInstance, проверяется через getStateInstance.
2. **Новый чат** — номер телефона - checkAccount - chatId.
3. **Отправка** — sendMessage.
4. **Получение** — receiveNotification + deleteNotification после обработки.
5. Только текстовые сообщения, интерфейс — по мотивам web.max.ru.

На экране входа есть кнопка «Посмотреть демо без регистрации» — подставляет мок
вместо реальных запросов к GREEN API, чтобы проверить весь флоу без аккаунта.

## Запуск

```bash
npm install
npm run dev
```
