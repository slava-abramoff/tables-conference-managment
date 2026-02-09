package config

import "os"

type Jwt struct {
	SecretKey string
}

func getJwtConfig() *Jwt {
	secretKey := os.Getenv("SECRET_KEY")
	return &Jwt{
		SecretKey: secretKey,
	}
}
