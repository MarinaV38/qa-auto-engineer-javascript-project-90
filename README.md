### Hexlet tests and linter status:
[![Actions Status](https://github.com/MarinaV38/qa-auto-engineer-javascript-project-90/actions/workflows/hexlet-check.yml/badge.svg)](https://github.com/MarinaV38/qa-auto-engineer-javascript-project-90/actions)

# Task Manager E2E (Playwright)

Учебный проект с тестируемым приложением «Task Manager» (React + Vite) и набором E2E-тестов на Playwright. Покрыты сценарии аутентификации, CRUD пользователей/статусов/меток и базовые проверки канбан-доски.

## Используемые технологии

- React 18, Vite
- Playwright 1.56 (тесты, Page Object'ы)
- React Admin (в составе `@hexlet/testing-task-manager`)

## Установка и запуск

```bash
# установка зависимостей
npm install

# запуск dev-сервера
npm run dev

# сборка
npm run build

# прогон всех e2e-тестов
npx playwright test
```

## Структура тестов

- `tests/pages/*.js` — Page Object'ы для основных разделов
- `tests/*.spec.js` — тестовые сценарии (auth, users, statuses, labels, tasks, smoke)
