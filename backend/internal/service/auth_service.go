package service

import (
	"context"
	"crypto/rand"
	"encoding/base64"
	"table-api/internal/config"
	"table-api/internal/models"
	"table-api/internal/repository"
	common "table-api/pkg"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
)

const (
	accessTokenTTL  = 15 * time.Minute
	refreshTokenTTL = 7 * 24 * time.Hour
)

type AuthService interface {
	Login(ctx context.Context, login, password string) (*models.User, string, string, error)
	Refresh(ctx context.Context, refreshToken string) (newAccessToken string, newRefreshToken string, err error)
	Logout(ctx context.Context, refreshToken string) error
}

type authService struct {
	userRepo    UserRepository
	refreshRepo repository.RefreshTokenRepository
}

func NewAuthService(userRepo UserRepository, refreshRepo repository.RefreshTokenRepository) AuthService {
	return &authService{userRepo: userRepo, refreshRepo: refreshRepo}
}

func (a *authService) Login(ctx context.Context, login, password string) (*models.User, string, string, error) {
	user, err := a.userRepo.GetByLogin(ctx, login)
	if err != nil {
		return nil, "", "", common.ErrNotFound
	}

	if password != user.Password {
		return nil, "", "", common.ErrForbidden
	}

	accessToken, err := a.generateAccessToken(user)
	if err != nil {
		return nil, "", "", err
	}

	refreshToken, err := a.generateRefreshToken(ctx, user.ID)
	if err != nil {
		return nil, "", "", err
	}

	return user, accessToken, refreshToken, nil
}

func (a *authService) Refresh(ctx context.Context, refreshToken string) (string, string, error) {
	rt, err := a.refreshRepo.GetByToken(ctx, refreshToken)
	if err != nil || rt.ExpiresAt.Before(time.Now()) {
		return "", "", common.ErrForbidden
	}

	user, err := a.userRepo.GetByID(ctx, rt.UserID)
	if err != nil {
		return "", "", common.ErrNotFound
	}

	newAccess, err := a.generateAccessToken(user)
	if err != nil {
		return "", "", err
	}

	newRefresh, err := a.generateRefreshToken(ctx, user.ID)
	if err != nil {
		return "", "", err
	}
	_ = a.refreshRepo.DeleteByToken(ctx, refreshToken)

	return newAccess, newRefresh, nil
}

func (a *authService) generateAccessToken(user *models.User) (string, error) {
	claims := jwt.MapClaims{
		"sub":  user.ID.String(),
		"role": user.Role,
		"exp":  time.Now().Add(accessTokenTTL).Unix(),
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(config.JwtSecret))
}

func (a *authService) generateRefreshToken(ctx context.Context, userID uuid.UUID) (string, error) {
	buf := make([]byte, 32)
	if _, err := rand.Read(buf); err != nil {
		return "", err
	}
	token := base64.URLEncoding.EncodeToString(buf)

	rt := &models.RefreshToken{
		UserID:    userID,
		Token:     token,
		ExpiresAt: time.Now().Add(refreshTokenTTL),
	}
	if err := a.refreshRepo.Create(ctx, rt); err != nil {
		return "", err
	}
	return token, nil
}

func (a *authService) Logout(ctx context.Context, refreshToken string) error {
	return a.refreshRepo.DeleteByToken(ctx, refreshToken)
}
