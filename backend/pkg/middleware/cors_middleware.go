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
				allowedFrontendDomain:   true,
				"http://localhost:5173": true,
				"http://127.0.0.1:5173": true,
			}

			if allowedOrigins[origin] {
				w.Header().Set("Access-Control-Allow-Origin", origin)
				w.Header().Set("Vary", "Origin")
				w.Header().Set("Access-Control-Allow-Credentials", "true")
				// w.Header().Set("Access-Control-Expose-Headers", "Content-Disposition")
			}

			w.Header().Set("Access-Control-Expose-Headers", "Content-Disposition")
			w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS")
			w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

			if r.Method == http.MethodOptions {
				w.WriteHeader(http.StatusNoContent)
				return
			}

			next(w, r, ps)
		}
	}
}
