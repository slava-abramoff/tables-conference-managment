package gormerrors

import (
	"errors"
	"strings"
	common "table-api/pkg"

	"gorm.io/gorm"
)

func Map(err error) error {
	if err == nil {
		return nil
	}

	if errors.Is(err, gorm.ErrRecordNotFound) {
		return common.ErrNotFound
	}

	if isDuplicateKey(err) {
		return common.ErrAlreadyExists
	}

	if isConstraintError(err) {
		return common.ErrInvalidInput
	}

	return err
}

func isDuplicateKey(err error) bool {
	msg := strings.ToLower(err.Error())

	return strings.Contains(msg, "duplicate") ||
		strings.Contains(msg, "unique constraint") ||
		strings.Contains(msg, "unique failed") ||
		strings.Contains(msg, "duplicate key")
}

func isConstraintError(err error) bool {
	msg := strings.ToLower(err.Error())

	return strings.Contains(msg, "constraint failed") ||
		strings.Contains(msg, "violates foreign key") ||
		strings.Contains(msg, "not null constraint") ||
		strings.Contains(msg, "foreign key constraint") ||
		strings.Contains(msg, "check constraint")
}
