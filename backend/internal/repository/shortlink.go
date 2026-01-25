package repository

import (
	"context"
	"table-api/internal/models"
	"table-api/internal/repository/gormerrors"

	"gorm.io/gorm"
)

type shortLinkRepository struct {
	db *gorm.DB
}

func NewShortLinkRepository(db *gorm.DB) *shortLinkRepository {
	return &shortLinkRepository{db: db}
}

func (s *shortLinkRepository) Create(ctx context.Context, url, code string) (*models.ShortLink, error) {
	link := &models.ShortLink{
		URL:        url,
		Code:       code,
		ClickCount: 0,
	}

	if err := s.db.WithContext(ctx).Create(link).Error; err != nil {
		return nil, gormerrors.Map(err)
	}

	return link, nil
}

func (s *shortLinkRepository) GetByCode(ctx context.Context, code string) (*models.ShortLink, error) {
	var shortLink models.ShortLink

	if err := s.db.Where("code = ?", code).First(&shortLink).Error; err != nil {
		return nil, gormerrors.Map(err)
	}

	return &shortLink, nil
}

func (r *shortLinkRepository) IsUnique(ctx context.Context, code string) bool {
	var count int64

	err := r.db.WithContext(ctx).
		Model(&models.ShortLink{}).
		Where("code = ?", code).
		Count(&count).Error

	if err != nil {
		return false
	}

	return count == 0
}

func (s *shortLinkRepository) IncrementClickCount(
	ctx context.Context,
	id int,
) error {

	res := s.db.WithContext(ctx).
		Model(&models.ShortLink{}).
		Where("id = ?", id).
		UpdateColumn("click_count", gorm.Expr("click_count + 1"))

	if res.Error != nil {
		return gormerrors.Map(res.Error)
	}

	if res.RowsAffected == 0 {
		return gorm.ErrRecordNotFound
	}

	return nil
}
