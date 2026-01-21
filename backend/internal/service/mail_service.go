package service

import (
	"log"
	"os"
	"strconv"

	"gopkg.in/gomail.v2"
)

type MailService struct {
	dialer *gomail.Dialer
	from   string
}

func NewMailService() *MailService {
	host := os.Getenv("SMTP_HOST")
	portStr := os.Getenv("SMTP_PORT")
	user := os.Getenv("SMTP_USER")
	pass := os.Getenv("SMTP_PASSWORD")
	from := os.Getenv("SMTP_FROM")

	port, err := strconv.Atoi(portStr)
	if err != nil {
		log.Fatal("Invalid SMTP port")
		return nil
	}

	d := gomail.NewDialer(
		host,
		port,
		user,
		pass,
	)

	return &MailService{
		dialer: d,
		from:   from,
	}
}

func (s *MailService) Send(
	to string,
	subject string,
	body string,
) {
	m := gomail.NewMessage()
	m.SetHeader("From", s.from)
	m.SetHeader("To", to)
	m.SetHeader("Subject", subject)
	m.SetBody("text/plain", body)

	s.dialer.DialAndSend(m)
}
