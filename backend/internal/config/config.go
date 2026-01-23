package config

import (
	"os"
)

var JwtSecret string = os.Getenv("SECRET_KEY")

type Config struct {
	server server
	smtp   smtp
	jwt    jwt
	db     database
}

func LoadConfig() (*Config, error) {
	return nil, nil
}
