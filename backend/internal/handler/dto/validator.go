package dto

import (
	"strings"
	"table-api/pkg/validator"
)

func Validate(req any) (string, error) {
	var errors []string

	if err := validator.Get().Struct(req); err != nil {
		errors = validator.FormatValidationErrors(err)
		return strings.Join(errors, "; "), err
	}

	return "", nil
}
