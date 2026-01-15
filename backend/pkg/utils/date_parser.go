package utils

import (
	"errors"
	"regexp"
	"strconv"
	"strings"
)

var monthMap = map[string]int{
	// English
	"january": 1, "jan": 1,
	"february": 2, "feb": 2,
	"march": 3, "mar": 3,
	"april": 4, "apr": 4,
	"may":  5,
	"june": 6, "jun": 6,
	"july": 7, "jul": 7,
	"august": 8, "aug": 8,
	"september": 9, "sep": 9,
	"october": 10, "oct": 10,
	"november": 11, "nov": 11,
	"december": 12, "dec": 12,

	// Russian
	"январь": 1, "января": 1, "янв": 1,
	"февраль": 2, "февраля": 2, "фев": 2,
	"март": 3, "марта": 3,
	"апрель": 4, "апреля": 4, "апр": 4,
	"май": 5, "мая": 5,
	"июнь": 6, "июня": 6,
	"июль": 7, "июля": 7,
	"август": 8, "августа": 8, "авг": 8,
	"сентябрь": 9, "сентября": 9, "сен": 9,
	"октябрь": 10, "октября": 10, "окт": 10,
	"ноябрь": 11, "ноября": 11, "ноя": 11,
	"декабрь": 12, "декабря": 12, "дек": 12,
}

func ParseYearMonth(yearInput, monthInput string) (int, int, error) {
	yearStr := normalize(yearInput)
	monthStr := normalize(monthInput)

	year, err := parseYear(yearStr)
	if err != nil {
		return 0, 0, err
	}

	month, err := parseMonth(monthStr)
	if err != nil {
		return 0, 0, err
	}

	return year, month, nil
}

func normalize(s string) string {
	s = strings.ToLower(strings.TrimSpace(s))
	s = regexp.MustCompile(`\b(года|год|year)\b`).ReplaceAllString(s, "")
	return s
}

func parseYear(s string) (int, error) {
	re := regexp.MustCompile(`\d{4}`)
	match := re.FindString(s)
	if match == "" {
		return 0, errors.New("invalid year")
	}

	year, _ := strconv.Atoi(match)
	if year < 1900 {
		return 0, errors.New("year out of range")
	}

	return year, nil
}

func parseMonth(s string) (int, error) {
	if m, err := strconv.Atoi(s); err == nil {
		if m >= 1 && m <= 12 {
			return m, nil
		}
	}

	words := regexp.MustCompile(`[^\p{L}]+`).Split(s, -1)
	for _, w := range words {
		if m, ok := monthMap[w]; ok {
			return m, nil
		}
	}

	return 0, errors.New("invalid month")
}
