#!/usr/bin/env bash

COMPOSE_FILE="docker-compose.prod.yml"
ENV_FILE=".env"
ENV_EXAMPLE=".env.example"
LOG_FILE="setup.log"

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

pause() {
  read -rp "Нажмите Enter для продолжения..."
}

read_choice() {
  local prompt="$1"
  local default="${2:-1}"
  local choice
  
  read -rp "$prompt" choice
  choice="${choice:-$default}"
  echo "$choice"
}

read_value() {
  local prompt="$1"
  local default_value="$2"
  local value
  
  while true; do
    read -rp "$prompt" value
    if [ -n "$value" ]; then
      echo "$value"
      return 0
    elif [ -n "$default_value" ]; then
      echo "$default_value"
      return 0
    else
      echo "⚠️  Значение не может быть пустым. Попробуйте снова."
    fi
  done
}

set_env_var() {
  local key="$1"
  local value="$2"

  if [ -z "$key" ] || [ -z "$value" ]; then
    log_error "set_env_var: ключ или значение пустое (key=$key)"
    return 1
  fi

  if [ ! -f "$ENV_FILE" ]; then
    log_error "set_env_var: файл $ENV_FILE не существует"
    return 1
  fi

  if grep -q "^${key}=" "$ENV_FILE" 2>/dev/null; then
    if sed -i "s|^${key}=.*|${key}=${value}|" "$ENV_FILE" 2>/dev/null; then
      log "Обновлена переменная $key"
    else
      log_error "Не удалось обновить переменную $key"
      return 1
    fi
  else
    if echo "${key}=${value}" >> "$ENV_FILE" 2>/dev/null; then
      log "Добавлена переменная $key"
    else
      log_error "Не удалось добавить переменную $key"
      return 1
    fi
  fi
  return 0
}

ensure_env() {
  if [ ! -f "$ENV_FILE" ]; then
    if [ ! -f "$ENV_EXAMPLE" ]; then
      log_error "Файл $ENV_EXAMPLE не найден. Невозможно создать $ENV_FILE"
      return 1
    fi
    
    if cp "$ENV_EXAMPLE" "$ENV_FILE" 2>/dev/null; then
      log_success ".env создан из .env.example"
    else
      log_error "Не удалось создать $ENV_FILE из $ENV_EXAMPLE"
      return 1
    fi
  fi
  return 0
}

is_email() {
  [[ "$1" =~ ^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$ ]]
}

# ---------- ENV MODES ----------

manual_env() {
  log "Начато ручное редактирование .env"
  
  if ! ensure_env; then
    log_error "Не удалось создать/проверить .env файл"
    return 1
  fi
  
  if command -v nano >/dev/null 2>&1; then
    nano "$ENV_FILE"
    log_success "Ручное редактирование .env завершено"
  else
    log_error "Редактор nano не найден. Используйте другой редактор для редактирования $ENV_FILE"
    return 1
  fi
}

quick_env() {
  log "Начато быстрое заполнение .env"
  
  if ! ensure_env; then
    log_error "Не удалось создать/проверить .env файл"
    return 1
  fi

  echo "=== Быстрое заполнение .env ==="

  # PostgreSQL host
  echo "Хост PostgreSQL:"
  echo "1) localhost (по умолчанию)"
  echo "2) postgres"
  echo "3) свой"
  c=$(read_choice "> " 1)
  case $c in
    1) set_env_var POSTGRES_HOST localhost ;;
    2) set_env_var POSTGRES_HOST postgres ;;
    3) 
      v=$(read_value "Введите хост: " "localhost")
      set_env_var POSTGRES_HOST "$v"
      ;;
  esac

  # Port
  echo "Порт PostgreSQL:"
  echo "1) 5432 (по умолчанию)"
  echo "2) свой"
  c=$(read_choice "> " 1)
  if [ "$c" = "1" ]; then
    set_env_var POSTGRES_PORT 5432
  else
    v=$(read_value "Порт: " "5432")
    set_env_var POSTGRES_PORT "$v"
  fi

  # User
  echo "Пользователь PostgreSQL:"
  echo "1) admin (по умолчанию)"
  echo "2) свой"
  c=$(read_choice "> " 1)
  if [ "$c" = "1" ]; then
    set_env_var POSTGRES_USER admin
  else
    v=$(read_value "Пользователь: " "admin")
    set_env_var POSTGRES_USER "$v"
  fi

  # Password
  while true; do
    read -rsp "Пароль PostgreSQL: " v
    echo
    if [ -n "$v" ]; then
      set_env_var POSTGRES_PASSWORD "$v"
      break
    else
      echo "⚠️  Пароль не может быть пустым"
    fi
  done

  # DB
  echo "Название БД:"
  echo "1) managerdb (по умолчанию)"
  echo "2) своё"
  c=$(read_choice "> " 1)
  if [ "$c" = "1" ]; then
    set_env_var POSTGRES_DB managerdb
  else
    v=$(read_value "Имя БД: " "managerdb")
    set_env_var POSTGRES_DB "$v"
  fi

  set_env_var AUTO_MIGRATE true
  set_env_var SERVER_LOGGER_CONSOLE true

  # JWT
  v=$(read_value "SECRET_KEY (JWT): " "")
  set_env_var SECRET_KEY "$v"

  # SMTP
  echo "SMTP хост:"
  echo "1) smtp.mail.ru (по умолчанию)"
  echo "2) свой"
  c=$(read_choice "> " 1)
  if [ "$c" = "1" ]; then
    set_env_var SMTP_HOST smtp.mail.ru
  else
    v=$(read_value "SMTP_HOST: " "smtp.mail.ru")
    set_env_var SMTP_HOST "$v"
  fi

  echo "SMTP порт:"
  echo "1) 465 (по умолчанию)"
  echo "2) 587"
  echo "3) свой"
  c=$(read_choice "> " 1)
  case $c in
    1) set_env_var SMTP_PORT 465 ;;
    2) set_env_var SMTP_PORT 587 ;;
    3) 
      v=$(read_value "SMTP_PORT: " "465")
      set_env_var SMTP_PORT "$v"
      ;;
  esac

  while true; do
    read -rp "SMTP_USER (email): " v
    if [ -z "$v" ]; then
      echo "⚠️  Email не может быть пустым"
      continue
    fi
    if is_email "$v"; then
      set_env_var SMTP_USER "$v"
      break
    else
      echo "❌ Некорректный email"
    fi
  done

  while true; do
    read -rsp "SMTP_PASSWORD: " v
    echo
    if [ -n "$v" ]; then
      set_env_var SMTP_PASSWORD "$v"
      break
    else
      echo "⚠️  Пароль не может быть пустым"
    fi
  done

  v=$(read_value "SMTP_FROM: " "")
  set_env_var SMTP_FROM "\"$v\""

  # Server
  echo "Порт сервера:"
  echo "1) 8080 (по умолчанию)"
  echo "2) свой"
  c=$(read_choice "> " 1)
  if [ "$c" = "1" ]; then
    SERVER_PORT=8080
  else
    SERVER_PORT=$(read_value "Порт: " "8080")
  fi
  set_env_var SERVER_PORT "$SERVER_PORT"

  echo "SERVER_DOMAIN:"
  echo "1) http://localhost:$SERVER_PORT (по умолчанию)"
  echo "2) свой"
  c=$(read_choice "> " 1)
  if [ "$c" = "1" ]; then
    set_env_var SERVER_DOMAIN "http://localhost:$SERVER_PORT"
  else
    v=$(read_value "Домен: " "http://localhost:$SERVER_PORT")
    set_env_var SERVER_DOMAIN "$v"
  fi

  echo "Логин администратора:"
  echo "1) admin (по умолчанию)"
  echo "2) свой"
  c=$(read_choice "> " 1)
  if [ "$c" = "1" ]; then
    set_env_var SERVER_ADMIN_LOGIN admin
  else
    v=$(read_value "Логин: " "admin")
    set_env_var SERVER_ADMIN_LOGIN "$v"
  fi

  echo "Пароль администратора:"
  echo "1) changeme (по умолчанию)"
  echo "2) свой"
  c=$(read_choice "> " 1)
  if [ "$c" = "1" ]; then
    set_env_var SERVER_ADMIN_PASSWORD changeme
  else
    while true; do
      read -rsp "Пароль: " v
      echo
      if [ -n "$v" ]; then
        set_env_var SERVER_ADMIN_PASSWORD "$v"
        break
      else
        echo "⚠️  Пароль не может быть пустым"
      fi
    done
  fi

  DOMAIN=$(grep "^SERVER_DOMAIN=" "$ENV_FILE" 2>/dev/null | cut -d= -f2- | tr -d '"' || echo "http://localhost:$SERVER_PORT")
  set_env_var VITE_API_URL "${DOMAIN}/api"

  echo "Порт frontend:"
  echo "1) 5173 (по умолчанию)"
  echo "2) свой"
  c=$(read_choice "> " 1)
  if [ "$c" = "1" ]; then
    FRONTEND_PORT=5173
  else
    FRONTEND_PORT=$(read_value "Порт: " "5173")
  fi
  set_env_var FRONTEND_PORT "$FRONTEND_PORT"

  echo "FRONTEND_DOMAIN:"
  echo "1) http://localhost:$FRONTEND_PORT (по умолчанию)"
  echo "2) $DOMAIN (НЕ РЕКОМЕНДУЕТСЯ)"
  echo "3) свой"
  c=$(read_choice "> " 1)
  case $c in
    1) set_env_var FRONTEND_DOMAIN "http://localhost:$FRONTEND_PORT" ;;
    2) set_env_var FRONTEND_DOMAIN "$DOMAIN" ;;
    3) 
      v=$(read_value "Домен: " "http://localhost:$FRONTEND_PORT")
      set_env_var FRONTEND_DOMAIN "$v"
      ;;
  esac

  log_success "Быстрое заполнение .env завершено"
}

# ---------- DOCKER ----------

docker_menu() {
  if [ ! -f "$COMPOSE_FILE" ]; then
    log_error "Файл $COMPOSE_FILE не найден"
    echo "⚠️  Файл $COMPOSE_FILE не найден в текущей директории"
    pause
    return 1
  fi
  
  while true; do
    echo "
=== Docker ===
1) Сборка и запуск
2) Запуск
3) Остановка
0) Назад
"
    c=$(read_choice "> " 0)
    case $c in
      1) docker_build_menu ;;
      2) docker_up_menu ;;
      3) docker_stop_menu ;;
      0) return ;;
      *) echo "⚠️  Неверный выбор. Попробуйте снова." ;;
    esac
  done
}

docker_build_menu() {
  echo "
1) Все контейнеры
2) Server
3) Frontend
4) PostgreSQL
0) Назад
"
  c=$(read_choice "> " 0)
  case $c in
    1) 
      log "Сборка и запуск всех контейнеров"
      if docker compose -f $COMPOSE_FILE up -d --build; then
        log_success "Все контейнеры собраны и запущены"
      else
        log_error "Ошибка при сборке и запуске контейнеров"
      fi
      ;;
    2) 
      log "Сборка и запуск контейнера api"
      if docker compose -f $COMPOSE_FILE up -d --build api; then
        log_success "Контейнер api собран и запущен"
      else
        log_error "Ошибка при сборке и запуске контейнера api"
      fi
      ;;
    3) 
      log "Сборка и запуск контейнера frontend"
      if docker compose -f $COMPOSE_FILE up -d --build frontend; then
        log_success "Контейнер frontend собран и запущен"
      else
        log_error "Ошибка при сборке и запуске контейнера frontend"
      fi
      ;;
    4) 
      log "Сборка и запуск контейнера postgres"
      if docker compose -f $COMPOSE_FILE up -d --build postgres; then
        log_success "Контейнер postgres собран и запущен"
      else
        log_error "Ошибка при сборке и запуске контейнера postgres"
      fi
      ;;
  esac
}

docker_up_menu() {
  echo "
1) Все контейнеры
2) Server
3) Frontend
4) PostgreSQL
0) Назад
"
  c=$(read_choice "> " 0)
  case $c in
    1) 
      log "Запуск всех контейнеров"
      if docker compose -f $COMPOSE_FILE up -d; then
        log_success "Все контейнеры запущены"
      else
        log_error "Ошибка при запуске контейнеров"
      fi
      ;;
    2) 
      log "Запуск контейнера api"
      if docker compose -f $COMPOSE_FILE up -d api; then
        log_success "Контейнер api запущен"
      else
        log_error "Ошибка при запуске контейнера api"
      fi
      ;;
    3) 
      log "Запуск контейнера frontend"
      if docker compose -f $COMPOSE_FILE up -d frontend; then
        log_success "Контейнер frontend запущен"
      else
        log_error "Ошибка при запуске контейнера frontend"
      fi
      ;;
    4) 
      log "Запуск контейнера postgres"
      if docker compose -f $COMPOSE_FILE up -d postgres; then
        log_success "Контейнер postgres запущен"
      else
        log_error "Ошибка при запуске контейнера postgres"
      fi
      ;;
  esac
}

docker_stop_menu() {
  read -rp "⚠️  Вы уверены? (yes/no): " confirm
  if [ "$confirm" != "yes" ]; then
    log "Остановка контейнеров отменена"
    return
  fi

  echo "
1) Все контейнеры
2) Server
3) Frontend
4) PostgreSQL
0) Назад
"
  c=$(read_choice "> " 0)
  case $c in
    1) 
      log "Остановка всех контейнеров"
      if docker compose -f $COMPOSE_FILE stop; then
        log_success "Все контейнеры остановлены"
      else
        log_error "Ошибка при остановке контейнеров"
      fi
      ;;
    2) 
      log "Остановка контейнера api"
      if docker stop api; then
        log_success "Контейнер api остановлен"
      else
        log_error "Ошибка при остановке контейнера api"
      fi
      ;;
    3) 
      log "Остановка контейнера frontend"
      if docker stop frontend; then
        log_success "Контейнер frontend остановлен"
      else
        log_error "Ошибка при остановке контейнера frontend"
      fi
      ;;
    4) 
      log "Остановка контейнера postgres"
      if docker stop postgres; then
        log_success "Контейнер postgres остановлен"
      else
        log_error "Ошибка при остановке контейнера postgres"
      fi
      ;;
  esac
}

# ---------- MAIN ----------

# Инициализация логирования
log "=== Запуск скрипта fast_setup.sh ==="

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
=== Главное меню ===
1) Ручное заполнение .env
2) Быстрое заполнение .env
3) Управление контейнерами
0) Выход
"
  c=$(read_choice "> " 0)
  case $c in
    1) manual_env ;;
    2) quick_env ;;
    3) docker_menu ;;
    0) 
      log "Завершение работы скрипта"
      exit 0 
      ;;
    *) 
      echo "⚠️  Неверный выбор. Попробуйте снова."
      ;;
  esac
done
