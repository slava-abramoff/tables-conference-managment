package handler

import (
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"strings"
	"table-api/internal/handler/dto"
	"table-api/internal/mappers"
	"table-api/internal/service"
	httprespond "table-api/pkg/http"
	"table-api/pkg/validator"
	"time"

	"github.com/julienschmidt/httprouter"
	"gorm.io/gorm"
)

type AuthHandlers struct {
	service service.AuthServiceInterface
}

func NewAuthHandlers(service service.AuthServiceInterface) *AuthHandlers {
	return &AuthHandlers{service: service}
}

func (a *AuthHandlers) Login(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	var req dto.LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		httprespond.ErrorResponse(w, "Bad request", http.StatusBadRequest)
		return
	}

	if err := validator.Get().Struct(&req); err != nil {
		errs := validator.FormatValidationErrorsRussian(err)
		httprespond.ErrorResponse(w, strings.Join(errs, "; "), http.StatusBadRequest)
		return
	}

	user, access, refresh, err := a.service.Login(r.Context(), req.Login, req.Password)
	if err != nil {
		httprespond.HandleErrorResponse(w, err)
		return
	}

	userData := mappers.ToUserResponse(*user)

	resp := dto.TokenResponse{User: userData, AccessToken: access, RefreshToken: refresh}
	httprespond.JsonResponse(w, resp, http.StatusOK)
}

func (a *AuthHandlers) Refresh(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	var req dto.RefreshRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		httprespond.ErrorResponse(w, "Bad request", http.StatusBadRequest)
		return
	}

	if err := validator.Get().Struct(&req); err != nil {
		errs := validator.FormatValidationErrorsRussian(err)
		httprespond.ErrorResponse(w, strings.Join(errs, "; "), http.StatusBadRequest)
		return
	}

	access, refresh, err := a.service.Refresh(r.Context(), req.RefreshToken)
	if err != nil {
		httprespond.HandleErrorResponse(w, err)
		return
	}

	resp := dto.TokenResponse{AccessToken: access, RefreshToken: refresh}
	httprespond.JsonResponse(w, resp, http.StatusOK)
}

func (a *AuthHandlers) Logout(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	ctx, cancel := context.WithTimeout(r.Context(), 10*time.Second)
	defer cancel()

	var req dto.LogoutRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		httprespond.ErrorResponse(w, "Bad request", http.StatusBadRequest)
		return
	}

	if err := validator.Get().Struct(&req); err != nil {
		errs := validator.FormatValidationErrorsRussian(err)
		httprespond.ErrorResponse(w, strings.Join(errs, "; "), http.StatusBadRequest)
		return
	}

	err := a.service.Logout(ctx, req.RefreshToken)
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
