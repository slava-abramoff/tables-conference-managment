package config

import (
	"errors"
	"os"
	"strings"
)

type Server struct {
	Port          string
	Domain        string
	Frontend      string
	LoggerConsole bool
	Admin         string
	Password      string
}

func isValidDomain(domain string) bool {
	return strings.Contains(domain, "http://") || strings.Contains(domain, "https://")
}

func getServerConfig() (*Server, error) {
	var logger bool

	serverPort := os.Getenv("SERVER_PORT")
	serverDomain := os.Getenv("SERVER_DOMAIN")
	frontendDomain := os.Getenv("FRONTEND_DOMAIN")
	serverLogger := os.Getenv("SERVER_LOGGER_CONSOLE")
	adminLogin := os.Getenv("SERVER_ADMIN_LOGIN")
	adminPassword := os.Getenv("SERVER_ADMIN_PASSWORD")

	if !isValidDomain(serverDomain) {
		return nil, errors.New("is not valid server domain")
	}

	if !isValidDomain(frontendDomain) {
		return nil, errors.New("is not valid frontend domain")
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

	return &Server{
		Port:          serverPort,
		Domain:        serverDomain,
		Frontend:      frontendDomain,
		LoggerConsole: logger,
		Admin:         adminLogin,
		Password:      adminPassword,
	}, nil
}
