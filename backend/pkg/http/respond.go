package httprespond

import (
	"encoding/json"
	"errors"
	"net/http"
	common "table-api/pkg"
)

func JsonResponse(w http.ResponseWriter, data any, code int) error {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(code)
	err := json.NewEncoder(w).Encode(data)
	if err != nil {
		return err
	}

	return nil
}

func ErrorResponse(w http.ResponseWriter, message string, code int) error {
	err := JsonResponse(w, map[string]any{
		"status":  "error",
		"message": message,
	}, code)
	if err != nil {
		return err
	}

	return nil
}

func HandleErrorResponse(w http.ResponseWriter, err error) error {

	switch {
	case errors.Is(err, common.ErrNotFound):
		return ErrorResponse(w, err.Error(), http.StatusNotFound)
	case errors.Is(err, common.ErrAlreadyExists):
		return ErrorResponse(w, err.Error(), http.StatusConflict)
	case errors.Is(err, common.ErrInvalidInput):
		return ErrorResponse(w, err.Error(), http.StatusBadRequest)
	case errors.Is(err, common.ErrUnauthorized):
		return ErrorResponse(w, err.Error(), http.StatusUnauthorized)
	case errors.Is(err, common.ErrForbidden):
		return ErrorResponse(w, err.Error(), http.StatusForbidden)
	default:
		return ErrorResponse(w, "internal server error", http.StatusInternalServerError)
	}
}
