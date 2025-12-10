package httprespond

import (
	"encoding/json"
	"net/http"
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
