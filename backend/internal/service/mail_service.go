package service

import (
	"log"
	"net/mail"
	"table-api/internal/config"

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

func NewMailService(cfg *config.Smtp, logger logger) *MailService {
	host := cfg.Host
	port := cfg.Port
	user := cfg.User
	pass := cfg.Password
	fromRaw := cfg.From

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
