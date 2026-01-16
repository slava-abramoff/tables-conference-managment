package validator

import (
	"fmt"

	"github.com/go-playground/validator/v10"
)

// Validator — глобальный экземпляр валидатора
var v *validator.Validate

// Init инициализирует валидатор (вызывать один раз при старте приложения)
func Init() {
	if v != nil {
		return // уже инициализирован
	}

	v = validator.New(
		validator.WithRequiredStructEnabled(),
	)

	// Здесь можно добавить кастомные теги, переводы и т.д.
	// Пример:
	// _ = v.RegisterValidation("password_strength", customPasswordValidator)
}

// Get возвращает глобальный валидатор
func Get() *validator.Validate {
	if v == nil {
		Init()
	}
	return v
}

// FormatValidationErrors форматирует ошибки валидации в читаемый вид
func FormatValidationErrors(err error) []string {
	if err == nil {
		return nil
	}

	validationErrs, ok := err.(validator.ValidationErrors)
	if !ok {
		return []string{"validation failed"}
	}

	var messages []string

	for _, e := range validationErrs {
		field := e.Field()
		tag := e.Tag()
		param := e.Param()

		var msg string

		switch tag {
		case "required":
			msg = fmt.Sprintf("%s is required", field)
		case "min":
			msg = fmt.Sprintf("%s must be at least %s characters", field, param)
		case "max":
			msg = fmt.Sprintf("%s must be at most %s characters", field, param)
		case "oneof":
			msg = fmt.Sprintf("%s must be one of: %s", field, param)
		case "alphanum":
			msg = fmt.Sprintf("%s must contain only letters and numbers", field)
		case "len":
			msg = fmt.Sprintf("%s must be exactly %s characters", field, param)
		default:
			msg = fmt.Sprintf("invalid value for %s (%s)", field, tag)
		}

		messages = append(messages, msg)
	}

	return messages
}
