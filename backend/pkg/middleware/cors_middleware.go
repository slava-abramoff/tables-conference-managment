package middleware

import (
	"net/http"

	"github.com/julienschmidt/httprouter"
)

func CorsMiddleware(allowedFrontendDomain string) Middleware {
	return func(next httprouter.Handle) httprouter.Handle {
		return func(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
			origin := r.Header.Get("Origin")

			allowedOrigins := map[string]bool{
				allowedFrontendDomain: true,
				// Для обратной совместимости с локальной разработкой
				"http://localhost:5173": true,
				"http://127.0.0.1:5173": true,
			}

			if allowedOrigins[origin] {
				w.Header().Set("Access-Control-Allow-Origin", origin)
				w.Header().Set("Vary", "Origin")
			}

			w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS")
			w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
			w.Header().Set("Access-Control-Allow-Credentials", "true")

			next(w, r, ps)
		}
	}
}
