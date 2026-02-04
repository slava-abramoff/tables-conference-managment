# ---------- build ----------
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# ---------- serve ----------
FROM nginx:1.25-alpine

# чистим дефолт
RUN rm /etc/nginx/conf.d/default.conf

# свой конфиг
COPY nginx.conf /etc/nginx/conf.d/default.conf

# статика
COPY --from=builder /app/dist /usr/share/nginx/html

# nginx внутри контейнера слушает 80
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
