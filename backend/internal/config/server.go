package config

import (
	"errors"
	"os"
	"strings"
)

type Server struct {
	Port          string
	Domain        string
	LoggerConsole bool
	Admin         string
	Password      string
}

func getServerConfig() (*Server, error) {
	var logger bool

	serverPort := os.Getenv("SERVER_PORT")
	serverDomain := os.Getenv("SERVER_DOMAIN")
	serverLogger := os.Getenv("SERVER_LOGGER_CONSOLE")
	adminLogin := os.Getenv("SERVER_ADMIN_LOGIN")
	adminPassword := os.Getenv("SERVER_ADMIN_PASSWORD")

	isValidDomain := strings.Contains(serverDomain, "http://") || strings.Contains(serverDomain, "https://")

	if !isValidDomain {
		return nil, errors.New("is not valid domain")
	}

	if serverLogger == "true" {
		logger = true
	} else {
		logger = false
	}

	if !(len(adminLogin) >= 5) {
		return nil, errors.New("is not valid admin login")
	}

	if !(len(adminPassword) >= 6) {
		return nil, errors.New("is not valid admin password")
	}

	return &Server{Port: serverPort, Domain: serverDomain, LoggerConsole: logger, Admin: adminLogin, Password: adminPassword}, nil
}
