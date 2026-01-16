package handler

import (
	"encoding/json"
	"errors"
	"net/http"
	"table-api/internal/handler/dto"
	"table-api/internal/mappers"
	"table-api/internal/service"
	httprespond "table-api/pkg/http"

	"github.com/julienschmidt/httprouter"
	"gorm.io/gorm"
)

type AuthHandlers struct {
	authService service.AuthService
}

func NewAuthHandlers(service service.AuthService) *AuthHandlers {
	return &AuthHandlers{authService: service}
}

func (a *AuthHandlers) Login(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	ctx := r.Context()

	var req dto.LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		httprespond.ErrorResponse(w, "Bad request", http.StatusBadRequest)
		return
	}

	if message, err := dto.Validate(w, req); err != nil {
		httprespond.ErrorResponse(w, message, http.StatusBadRequest)
		return
	}

	user, access, refresh, err := a.authService.Login(ctx, req.Login, req.Password)
	if err != nil {
		httprespond.HandleErrorResponse(w, err)
		return
	}

	userData := mappers.ToUserResponse(*user)

	resp := dto.TokenResponse{User: userData, AccessToken: access, RefreshToken: refresh}
	httprespond.JsonResponse(w, resp, http.StatusOK)
}

func (a *AuthHandlers) Refresh(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	ctx := r.Context()

	var req dto.RefreshRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		httprespond.ErrorResponse(w, "Bad request", http.StatusBadRequest)
		return
	}

	if message, err := dto.Validate(w, req); err != nil {
		httprespond.ErrorResponse(w, message, http.StatusBadRequest)
		return
	}

	access, refresh, err := a.authService.Refresh(ctx, req.RefreshToken)
	if err != nil {
		httprespond.HandleErrorResponse(w, err)
		return
	}

	resp := dto.TokenResponse{AccessToken: access, RefreshToken: refresh}
	httprespond.JsonResponse(w, resp, http.StatusOK)
}

func (a *AuthHandlers) Logout(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	ctx := r.Context()

	var req dto.LogoutRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		httprespond.ErrorResponse(w, "Bad request", http.StatusBadRequest)
		return
	}

	if message, err := dto.Validate(w, req); err != nil {
		httprespond.ErrorResponse(w, message, http.StatusBadRequest)
		return
	}

	err := a.authService.Logout(ctx, req.RefreshToken)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			httprespond.JsonResponse(w, map[string]string{"message": "Logged out"}, http.StatusOK)
			return
		}
		httprespond.HandleErrorResponse(w, err)
		return
	}

	httprespond.JsonResponse(w, map[string]string{
		"message": "Successfully logged out",
	}, http.StatusOK)
}
