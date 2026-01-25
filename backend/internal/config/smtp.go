package config

import (
	"errors"
	"os"
	"strconv"
	"strings"
)

type Smtp struct {
	Port     int
	Host     string
	User     string
	Password string
	From     string
}

// # SMTP
// SMTP_HOST=your_host
// SMTP_PORT=your_port
// SMTP_USER=your_name
// SMTP_PASSWORD=your_password
// SMTP_FROM=your_from

func getSmtpConfig() (*Smtp, error) {
	portStr := os.Getenv("SMTP_PORT")

	port, err := strconv.Atoi(portStr)
	if err != nil {
		return nil, err
	}

	host := os.Getenv("SMTP_HOST")
	user := os.Getenv("SMTP_USER")
	if !strings.Contains("@", user) {
		return nil, errors.New("invalid smtp username")
	}

	password := os.Getenv("SMTP_PASSWORD")
	from := os.Getenv("SMTP_FROM")

	return &Smtp{
		Port:     port,
		Host:     host,
		User:     user,
		Password: password,
		From:     from,
	}, nil
}
