package config

import (
	"errors"
	"os"
	"strconv"
	"strings"
	"unicode/utf8"
)

type Server struct {
	Port          int
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

	port, err := strconv.Atoi(serverPort)
	if err != nil {
		return nil, err
	}

	isValidDomain := strings.Contains(serverDomain, "http://") || strings.Contains(serverDomain, "https://")

	if !isValidDomain {
		return nil, errors.New("is not valid domain")
	}

	if serverLogger == "true" {
		logger = true
	} else {
		logger = false
	}

	if !(utf8.RuneCountInString(adminLogin) > 5) {
		return nil, errors.New("is not valid admin login")
	}

	if !(utf8.RuneCountInString(adminPassword) > 6) {
		return nil, errors.New("is not valid admin password")
	}

	return &Server{Port: port, Domain: serverDomain, LoggerConsole: logger, Admin: adminLogin, Password: adminPassword}, nil
}
