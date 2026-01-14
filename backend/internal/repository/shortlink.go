package repository

import (
	"context"
	"table-api/internal/models"

	"gorm.io/gorm"
)

type ShortLinkRepository interface {
	Create(ctx context.Context, url, code string) (*models.ShortLink, error)
	GetByCode(ctx context.Context, code string) (*models.ShortLink, error)
	IsUnique(ctx context.Context, code string) bool
	IncrementClickCount(
		ctx context.Context,
		id int,
	) error
}

type shortLinkRepository struct {
	db *gorm.DB
}

func NewShortLinkRepository(db *gorm.DB) ShortLinkRepository {
	return &shortLinkRepository{db: db}
}

func (s *shortLinkRepository) Create(ctx context.Context, url, code string) (*models.ShortLink, error) {
	link := &models.ShortLink{
		URL:        url,
		Code:       code,
		ClickCount: 0,
	}

	if err := s.db.WithContext(ctx).Create(link).Error; err != nil {
		return nil, err
	}

	return link, nil
}

func (s *shortLinkRepository) GetByCode(ctx context.Context, code string) (*models.ShortLink, error) {
	var shortLink models.ShortLink

	if err := s.db.Where("code = ?", code).First(&shortLink).Error; err != nil {
		return nil, err
	}

	return &shortLink, nil
}

func (s *shortLinkRepository) IsUnique(ctx context.Context, code string) bool {
	return s.db.WithContext(ctx).
		Select("1").
		Where("code = ?", code).
		Limit(1).
		Take(&struct{}{}).
		Error == gorm.ErrRecordNotFound
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
		return res.Error
	}

	if res.RowsAffected == 0 {
		return gorm.ErrRecordNotFound
	}

	return nil
}
