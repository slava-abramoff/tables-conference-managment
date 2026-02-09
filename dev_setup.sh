#!/usr/bin/env bash

COMPOSE_FILE="docker-compose.dev.yml"
ROOT_ENV_FILE=".env"
BACKEND_ENV_FILE="backend/.env"
FRONTEND_ENV_FILE="frontend/.env"
LOG_FILE="dev_setup.log"

# ---------- utils ----------

log() {
  local message="$1"
  local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
  echo "$message"
  # Пытаемся записать в лог, но не прерываем выполнение при ошибке
  echo "[$timestamp] $message" >> "$LOG_FILE" 2>/dev/null || true
}

log_error() {
  local message="$1"
  log "❌ ОШИБКА: $message"
}

log_success() {
  local message="$1"
  log "✅ $message"
}

read_choice() {
  local prompt="$1"
  local default="${2:-1}"
  local choice

  read -rp "$prompt" choice
  choice="${choice:-$default}"
  echo "$choice"
}

set_env_var() {
  local file="$1"
  local key="$2"
  local value="$3"

  if [ -z "$file" ] || [ -z "$key" ] || [ -z "$value" ]; then
    log_error "set_env_var: один из параметров пустой (file=$file, key=$key)"
    return 1
  fi

  # Создаем директорию если нужно
  local dir=$(dirname "$file")
  if [ ! -d "$dir" ] && [ "$dir" != "." ]; then
    mkdir -p "$dir" 2>/dev/null || {
      log_error "Не удалось создать директорию $dir"
      return 1
    }
  fi

  # Создаем файл если его нет
  if [ ! -f "$file" ]; then
    touch "$file" 2>/dev/null || {
      log_error "Не удалось создать файл $file"
      return 1
    }
  fi

  if grep -q "^${key}=" "$file" 2>/dev/null; then
    if sed -i "s|^${key}=.*|${key}=${value}|" "$file" 2>/dev/null; then
      log "Обновлена переменная $key в $file"
    else
      log_error "Не удалось обновить переменную $key в $file"
      return 1
    fi
  else
    if echo "${key}=${value}" >> "$file" 2>/dev/null; then
      log "Добавлена переменная $key в $file"
    else
      log_error "Не удалось добавить переменную $key в $file"
      return 1
    fi
  fi
  return 0
}

# ---------- AUTO FILL ENV ----------

auto_fill_env() {
  log "Начато автоматическое заполнение .env файлов"

  # Корневой .env
  log "Заполнение корневого .env"
  set_env_var "$ROOT_ENV_FILE" "POSTGRES_HOST" "localhost"
  set_env_var "$ROOT_ENV_FILE" "POSTGRES_PORT" "5432"
  set_env_var "$ROOT_ENV_FILE" "POSTGRES_USER" "admin"
  set_env_var "$ROOT_ENV_FILE" "POSTGRES_PASSWORD" "changeme"
  set_env_var "$ROOT_ENV_FILE" "POSTGRES_DB" "managerdb"
  set_env_var "$ROOT_ENV_FILE" "AUTO_MIGRATE" "true"

  # backend/.env
  log "Заполнение backend/.env"
  set_env_var "$BACKEND_ENV_FILE" "POSTGRES_HOST" "localhost"
  set_env_var "$BACKEND_ENV_FILE" "POSTGRES_PORT" "5432"
  set_env_var "$BACKEND_ENV_FILE" "POSTGRES_USER" "admin"
  set_env_var "$BACKEND_ENV_FILE" "POSTGRES_PASSWORD" "changeme"
  set_env_var "$BACKEND_ENV_FILE" "POSTGRES_DB" "managerdb"
  set_env_var "$BACKEND_ENV_FILE" "AUTO_MIGRATE" "true"
  set_env_var "$BACKEND_ENV_FILE" "SECRET_KEY" "watafasheinepepe"
  set_env_var "$BACKEND_ENV_FILE" "SMTP_PORT" "465"
  set_env_var "$BACKEND_ENV_FILE" "SMTP_HOST" "smtp.mail.ru"
  set_env_var "$BACKEND_ENV_FILE" "SMTP_USER" "johndoe@mail.ru"
  set_env_var "$BACKEND_ENV_FILE" "SMTP_PASSWORD" "institut"
  set_env_var "$BACKEND_ENV_FILE" "SMTP_FROM" "\"Любим вас <johndoe@mail.ru>\""
  set_env_var "$BACKEND_ENV_FILE" "SERVER_DOMAIN" "\"http://localhost:8080\""
  set_env_var "$BACKEND_ENV_FILE" "SERVER_LOGGER_CONSOLE" "true"
  set_env_var "$BACKEND_ENV_FILE" "SERVER_PORT" ":8080"
  set_env_var "$BACKEND_ENV_FILE" "SERVER_ADMIN_LOGIN" "johndoe"
  set_env_var "$BACKEND_ENV_FILE" "SERVER_ADMIN_PASSWORD" "changeme"
  set_env_var "$BACKEND_ENV_FILE" "FRONTEND_DOMAIN" "http://localhost:5173"

  # frontend/.env
  log "Заполнение frontend/.env"
  set_env_var "$FRONTEND_ENV_FILE" "VITE_API_URL" "\"http://localhost:8080/api\""

  log_success "Автоматическое заполнение .env файлов завершено"
}

# ---------- DOCKER ----------

start_db_container() {
  if [ ! -f "$COMPOSE_FILE" ]; then
    log_error "Файл $COMPOSE_FILE не найден"
    echo "⚠️  Файл $COMPOSE_FILE не найден в текущей директории"
    return 1
  fi

  if [ ! -f "$ROOT_ENV_FILE" ]; then
    log_error "Файл $ROOT_ENV_FILE не найден. Сначала заполните .env файлы"
    echo "⚠️  Файл $ROOT_ENV_FILE не найден. Выберите опцию 1 для автоматического заполнения"
    return 1
  fi

  log "Запуск контейнера с БД"
  if docker compose -f "$COMPOSE_FILE" up -d; then
    log_success "Контейнер с БД запущен"
    echo "✅ Контейнер с БД успешно запущен"
  else
    log_error "Ошибка при запуске контейнера с БД"
    echo "❌ Ошибка при запуске контейнера с БД"
    return 1
  fi
}

stop_db_container() {
  if [ ! -f "$COMPOSE_FILE" ]; then
    log_error "Файл $COMPOSE_FILE не найден"
    echo "⚠️  Файл $COMPOSE_FILE не найден в текущей директории"
    return 1
  fi

  log "Остановка контейнера с БД"
  if docker compose -f "$COMPOSE_FILE" stop; then
    log_success "Контейнер с БД остановлен"
    echo "✅ Контейнер с БД успешно остановлен"
  else
    log_error "Ошибка при остановке контейнера с БД"
    echo "❌ Ошибка при остановке контейнера с БД"
    return 1
  fi
}

# ---------- MAIN ----------

# Инициализация логирования
log "=== Запуск скрипта dev_setup.sh ==="

# Проверка наличия docker
if ! command -v docker >/dev/null 2>&1; then
  log_error "Docker не найден. Убедитесь, что Docker установлен и доступен в PATH"
fi

# Проверка наличия docker compose
if ! docker compose version >/dev/null 2>&1; then
  log_error "Docker Compose не найден или недоступен"
fi

while true; do
  echo "
=== Dev Setup ===
1) Автоматически заполнить .env
2) Запустить контейнер с БД
3) Остановить контейнер с БД
0) Выход
"
  c=$(read_choice "> " 0)
  case $c in
    1)
      auto_fill_env
      echo ""
      read -rp "Нажмите Enter для продолжения..."
      ;;
    2)
      start_db_container
      echo ""
      read -rp "Нажмите Enter для продолжения..."
      ;;
    3)
      stop_db_container
      echo ""
      read -rp "Нажмите Enter для продолжения..."
      ;;
    0)
      log "Завершение работы скрипта"
      exit 0
      ;;
    *)
      echo "⚠️  Неверный выбор. Попробуйте снова."
      ;;
  esac
done
