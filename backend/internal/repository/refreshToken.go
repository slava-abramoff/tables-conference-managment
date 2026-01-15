package repository

import (
	"context"
	"table-api/internal/models"
	"table-api/internal/repository/gormerrors"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type RefreshTokenRepository interface {
	Create(ctx context.Context, rt *models.RefreshToken) error
	GetByToken(ctx context.Context, token string) (*models.RefreshToken, error)
	DeleteByToken(ctx context.Context, token string) error
	DeleteByUserID(ctx context.Context, userID uuid.UUID) error
}

type refreshTokenRepository struct {
	db *gorm.DB
}

func NewRefreshTokenRepository(db *gorm.DB) RefreshTokenRepository {
	return &refreshTokenRepository{db: db}
}

func (r *refreshTokenRepository) Create(ctx context.Context, rt *models.RefreshToken) error {
	return r.db.Create(rt).Error
}

func (r *refreshTokenRepository) GetByToken(ctx context.Context, token string) (*models.RefreshToken, error) {
	var rt models.RefreshToken
	if err := r.db.Where("token = ?", token).First(&rt).Error; err != nil {
		return nil, gormerrors.Map(err)
	}
	return &rt, nil
}

func (r *refreshTokenRepository) DeleteByToken(ctx context.Context, token string) error {
	return r.db.Where("token = ?", token).Delete(&models.RefreshToken{}).Error
}

func (r *refreshTokenRepository) DeleteByUserID(ctx context.Context, userID uuid.UUID) error {
	return r.db.Where("user_id = ?", userID).Delete(&models.RefreshToken{}).Error
}
