package config

import (
	"os"
	"strconv"
)

type Database struct {
	Port     int
	Host     string
	User     string
	Password string
	DB       string
	Migrate  bool
}

func getDatabaseConfig() (*Database, error) {
	portStr := os.Getenv("POSTGRES_PORT")
	port, err := strconv.Atoi(portStr)
	if err != nil {
		return nil, err
	}

	host := os.Getenv("POSTGRES_HOST")
	user := os.Getenv("POSTGRES_USER")
	password := os.Getenv("POSTGRES_PASSWORD")
	db := os.Getenv("POSTGRES_DB")
	migrateStr := os.Getenv("AUTO_MIGRATE")

	var migrate bool
	if migrateStr == "true" {
		migrate = true
	} else {
		migrate = false
	}

	return &Database{
		Port:     port,
		Host:     host,
		User:     user,
		Password: password,
		DB:       db,
		Migrate:  migrate,
	}, nil
}
