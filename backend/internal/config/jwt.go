package config

import "os"

type Jwt struct {
	SectetKey string
}

func getJwtConfig() *Jwt {
	secretKey := os.Getenv("SECRET_KEY")
	return &Jwt{
		SectetKey: secretKey,
	}
}
