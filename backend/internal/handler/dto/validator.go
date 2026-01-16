package dto

import (
	"net/http"
	"strings"
	"table-api/pkg/validator"
)

func Validate(w http.ResponseWriter, req any) (string, error) {
	var errors []string

	if err := validator.Get().Struct(&req); err != nil {
		errors = validator.FormatValidationErrors(err)
		return strings.Join(errors, "; "), err
	}

	return "", nil
}
