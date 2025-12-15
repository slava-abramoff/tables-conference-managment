package httprespond

import (
	"encoding/json"
	"errors"
	"net/http"
	common "table-api/pkg"
)

func JsonResponse(w http.ResponseWriter, data any, code int) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(code)
	json.NewEncoder(w).Encode(data)
}

func ErrorResponse(w http.ResponseWriter, message string, code int) {
	JsonResponse(w, map[string]any{
		"status":  "error",
		"message": message,
	}, code)
}

func HandleErrorResponse(w http.ResponseWriter, err error) {
	switch {
	case errors.Is(err, common.ErrNotFound):
		ErrorResponse(w, err.Error(), http.StatusNotFound)
	case errors.Is(err, common.ErrAlreadyExists):
		ErrorResponse(w, err.Error(), http.StatusConflict)
	case errors.Is(err, common.ErrInvalidInput):
		ErrorResponse(w, err.Error(), http.StatusBadRequest)
	case errors.Is(err, common.ErrUnauthorized):
		ErrorResponse(w, err.Error(), http.StatusUnauthorized)
	case errors.Is(err, common.ErrForbidden):
		ErrorResponse(w, err.Error(), http.StatusForbidden)
	default:
		ErrorResponse(w, "internal server error", http.StatusInternalServerError)
	}
}
