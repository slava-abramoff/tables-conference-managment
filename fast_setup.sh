#!/bin/bash

ENV_FILE=".env"

# Функция для ввода переменной с подсказкой
prompt_var() {
    local var_name=$1
    local default_value=$2
    local description=$3
    local input

    if [ -n "$default_value" ]; then
        read -p "$description [$default_value]: " input
        input=${input:-$default_value}
    else
        read -p "$description: " input
    fi

    echo "$var_name=$input"
}

# Проверяем, существует ли .env
if [ -f "$ENV_FILE" ]; then
    echo ".env file already exists."
    read -p "Do you want to overwrite it? (y/N) " choice
    case "$choice" in
        y|Y )
            echo "Overwriting .env..."
            ;;
        * )
            echo "Launching docker compose..."
            docker compose -f docker-compose.prod.yml up -d --build
            exit 0
            ;;
    esac
fi

echo "Creating .env file..."

{
echo "# PostgreSQL"
prompt_var "POSTGRES_HOST" "postgres" "PostgreSQL host"
prompt_var "POSTGRES_PORT" "5432" "PostgreSQL port"
prompt_var "POSTGRES_USER" "postgres" "PostgreSQL user"
prompt_var "POSTGRES_PASSWORD" "" "PostgreSQL password"
prompt_var "POSTGRES_DB" "testdb" "PostgreSQL database name"

echo ""
echo "# Auto Migration"
prompt_var "AUTO_MIGRATE" "true" "Auto migrate? (true/false)"

echo ""
echo "# JWT Authorization"
prompt_var "SECRET_KEY" "" "JWT secret key"

echo ""
echo "# SMTP Configuration"
prompt_var "SMTP_HOST" "smtp.mail.ru" "SMTP host"
prompt_var "SMTP_PORT" "465" "SMTP port"
prompt_var "SMTP_USER" "" "SMTP user"
prompt_var "SMTP_PASSWORD" "" "SMTP password"
prompt_var "SMTP_FROM" "\"Your Name <your_email@example.com>\"" "SMTP from address"

echo ""
echo "# Server Configuration"
prompt_var "SERVER_DOMAIN" "http://localhost:8080" "Server domain (with http:// or https://)"
prompt_var "SERVER_LOGGER_CONSOLE" "true" "Log to console? (true/false)"
prompt_var "SERVER_PORT" "8080" "Server port"
prompt_var "SERVER_ADMIN_LOGIN" "admin" "Admin login"
prompt_var "SERVER_ADMIN_PASSWORD" "changeme" "Admin password"

echo ""
echo "# Frontend Configuration"
prompt_var "VITE_API_URL" "http://localhost:8080/api" "Frontend API URL"
prompt_var "FRONTEND_PORT" "5173" "Frontend port"
prompt_var "FRONTEND_DOMAIN" "http://localhost:5173" "Frontend domain"
} > "$ENV_FILE"

echo ".env file created successfully."

# Запускаем docker compose
echo "Starting docker compose..."
docker compose -f docker-compose.prod.yml up -d --build
