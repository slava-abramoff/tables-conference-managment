package validator

import (
	"regexp"
	"strings"
)

func IsValidUrl(s string) bool {
	var urlRegex = regexp.MustCompile(`^https?:\/\/([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(:[0-9]+)?(\/.*)?$`)
	if s == "" {
		return true
	}

	if strings.Count(s, " ") > 1 {
		return false
	}

	if s == " " {
		return true
	}

	return urlRegex.MatchString(s)
}
