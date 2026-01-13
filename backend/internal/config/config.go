package config

import "os"

var JwtSecret string = os.Getenv("SECRET_KEY")
