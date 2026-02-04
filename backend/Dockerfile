# ---------- build stage ----------
FROM golang:1.22-alpine AS builder

WORKDIR /app

RUN apk add --no-cache git

COPY go.mod go.sum ./
RUN go mod download

COPY . .

RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -o app

# ---------- runtime stage ----------
FROM alpine:3.19

WORKDIR /app

RUN apk add --no-cache ca-certificates

# бинарник
COPY --from=builder /app/app .

# если есть конфиги
COPY --from=builder /app/config ./config

# логи
COPY . .

# гарантируем, что папка есть
RUN mkdir -p logs

EXPOSE 8080

CMD ["./app"]
