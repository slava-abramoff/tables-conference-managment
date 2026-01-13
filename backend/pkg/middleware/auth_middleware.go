package middleware

import (
	"context"
	"fmt"
	"net/http"
	"strings"
	"table-api/internal/config"
	httprespond "table-api/pkg/http"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"github.com/julienschmidt/httprouter"
)

func AuthMiddleware(next httprouter.Handle) httprouter.Handle {
	return func(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
		authHeader := r.Header.Get("Authorization")
		if authHeader == "" {
			httprespond.ErrorResponse(w, "Unauthorized", http.StatusUnauthorized)
			return
		}

		bearerToken := strings.Split(authHeader, " ")
		if len(bearerToken) != 2 || bearerToken[0] != "Bearer" {
			httprespond.ErrorResponse(w, "Invalid token", http.StatusUnauthorized)
			return
		}

		tokenStr := bearerToken[1]
		claims := jwt.MapClaims{}
		token, err := jwt.ParseWithClaims(tokenStr, &claims, func(token *jwt.Token) (interface{}, error) {
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, fmt.Errorf("unexpected signing method")
			}
			return []byte(config.JwtSecret), nil
		})

		if err != nil || !token.Valid {
			httprespond.ErrorResponse(w, "Invalid token", http.StatusUnauthorized)
			return
		}

		userIDStr, _ := claims["sub"].(string)
		userID, _ := uuid.Parse(userIDStr)
		role, _ := claims["role"].(string)

		ctx := context.WithValue(r.Context(), "userID", userID)
		ctx = context.WithValue(ctx, "role", role)

		next(w, r.WithContext(ctx), ps)
	}
}

func RoleMiddleware(requiredRole string, next httprouter.Handle) httprouter.Handle {
	return func(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
		role, ok := r.Context().Value("role").(string)
		if !ok || role != requiredRole {
			httprespond.ErrorResponse(w, "Forbidden", http.StatusForbidden)
			return
		}
		next(w, r, ps)
	}
}
