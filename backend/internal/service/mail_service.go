package service

import (
	"log"
	"net/mail"
	"os"
	"strconv"

	"gopkg.in/gomail.v2"
)

type MailService struct {
	dialer *gomail.Dialer
	from   *mail.Address
	log    logger
}

type logger interface {
	Info(msg string, args ...any)
	Warn(msg string, args ...any)
	Error(msg string, args ...any)
}

func NewMailService(logger logger) *MailService {
	host := os.Getenv("SMTP_HOST")
	portStr := os.Getenv("SMTP_PORT")
	user := os.Getenv("SMTP_USER")
	pass := os.Getenv("SMTP_PASSWORD")
	fromRaw := os.Getenv("SMTP_FROM")

	port, err := strconv.Atoi(portStr)
	if err != nil {
		log.Fatal("Invalid SMTP port")
	}

	d := gomail.NewDialer(host, port, user, pass)

	addr, err := mail.ParseAddress(fromRaw)
	if err != nil {
		log.Fatalf("Invalid SMTP_FROM: %v", err)
	}

	return &MailService{
		dialer: d,
		from:   addr,
		log:    logger,
	}
}

func (s *MailService) Send(
	to string,
	subject string,
	body string,
) {
	m := gomail.NewMessage()

	m.SetAddressHeader(
		"From",
		s.from.Address,
		s.from.Name,
	)

	m.SetHeader("To", to)
	m.SetHeader("Subject", subject)
	m.SetBody("text/plain", body)

	if err := s.dialer.DialAndSend(m); err != nil {
		s.log.Warn("failed send: ", err.Error())
	}
}
