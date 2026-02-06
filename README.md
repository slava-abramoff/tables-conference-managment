# Tables Conference Managment
Небольшая open-source система для учета проходящих мероприятий и лекций, адаптированная под внутренние процессы конкретной организации.
Проект реализован на следующем стеке:
- **Backend**: Go
- **Frontend**: React + Typescript
- **Database**: PostgreSQL
- **Infrastructure**: Docker + Docker Compose

---
## Требования
Для запуска проекта обязательно требуется:
- Docker >= 24.x
- Docker Compose >= 2.x

Для локальной разработки требуется:
- Go 1.24 или новее
- Node.js 24.12.0

## Быстрый старт

1. Клонирование репозитория
```bash
$ git clone https://github.com/slava-abramoff/tables-conference-managment.git
$ cd tables-conference-managment
```
2. Настройка переменных окружения

  Запустите скрипт `fast_setup.sh` (рекомендуется):
  ```bash
  $ ./fast_setup.sh
  ```

  Или заполните вручную:

  Скопируйте пример файла окружения:
  ```bash
  $ cp .env.example .env
  ```
  Заполните переменные окружения:
  ```bash
  $ nano .env
  ```
  Соберите и запустите контейнеры:
  ```bash
  $ docker compose -f docker-compose.prod.yml up -d --build
  ```

## Переменные окружения
**СУБД**
```bash
# Хост PostgreSQL (localhost или имя контейнера, например: postgres)
POSTGRES_HOST=your_postgres_host

# Порт PostgreSQL (рекомендуется оставить 5432)
POSTGRES_PORT=5432

# Пользователь для подключения к БД
POSTGRES_USER=your_postgres_user

# Пароль пользователя БД
POSTGRES_PASSWORD=your_postgres_password

# Имя базы данных
POSTGRES_DB=your_database_name
```
**Секретный ключ для JWT**
```bash
# Секретный ключ для подписи JWT-токенов
# Используйте длинную случайную строку
SECRET_KEY=your_jwt_secret_key
```
**Подключение SMTP**
```bash
# SMTP хост (например: smtp.mail.ru)
SMTP_HOST=your_smtp_host

# SMTP порт (зависит от провайдера, часто 465 или 587)
SMTP_PORT=465

# Email-адрес, с которого отправляются письма
SMTP_USER=your_smtp_user

# Пароль приложения / SMTP-пароль
SMTP_PASSWORD=your_smtp_password

# Значение поля "From" в письмах
SMTP_FROM="Your Name <your_email@example.com>"
```
**Backend**
```bash
# Публичный домен backend-сервера (используется в ссылках и CORS)
SERVER_DOMAIN=http://localhost:8080

# Включить вывод логов в консоль
SERVER_LOGGER_CONSOLE=false

# Порт backend-приложения
# Имейте ввиду — это порт контейнера
SERVER_PORT=8080

# Данные администратора, создаваемого при первом запуске
SERVER_ADMIN_LOGIN=admin
SERVER_ADMIN_PASSWORD=admin
```
**Frontend**
```bash
# URL backend API
VITE_API_URL=http://localhost:8080/api

# Порт frontend-приложения
# Имейте ввиду — это порт контейнера
FRONTEND_PORT=4444

# Публичный домен frontend-приложения
# Используется для настройки CORS
FRONTEND_DOMAIN=http://localhost:4444
```
## Отладка и логи
Если вы на этапе заполнения переменных окружения для `SERVER_LOGGER_CONSOLE` указали значение `true`, вы можете просмотреть логи контейнера с сервером:
```bash
$ docker logs api
```
В противном случае, все логи сервера складываются в папку `logs`.

**Информирующие**:
```bash
$ sudo cat backend/logs/info.log
```
**Предупреждения**:
```bash
$ sudo cat backend/logs/warn.log
```
**Критические ошибки**:
```bash
$ sudo cat backend/logs/error.log
```
