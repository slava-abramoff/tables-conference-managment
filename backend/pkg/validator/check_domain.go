package validator

import (
	"net"
	"net/url"
	"strings"
)

func IsValidDomain(s string) bool {
	u, err := url.ParseRequestURI(s)
	if err == nil && u.Host != "" {
		s = u.Host
	}

	// убираем порт
	host := strings.Split(s, ":")[0]

	// запрещаем пустые и слишком длинные
	if len(host) == 0 || len(host) > 253 {
		return false
	}

	// localhost — по желанию
	if host == "localhost" {
		return true
	}

	// IP?
	if net.ParseIP(host) != nil {
		return true
	}

	labels := strings.Split(host, ".")
	if len(labels) < 2 {
		return false
	}

	for _, label := range labels {
		if len(label) < 1 || len(label) > 63 {
			return false
		}

		for i, r := range label {
			if !(r >= 'a' && r <= 'z' ||
				r >= 'A' && r <= 'Z' ||
				r >= '0' && r <= '9' ||
				r == '-') {
				return false
			}

			if (i == 0 || i == len(label)-1) && r == '-' {
				return false
			}
		}
	}

	return true
}
