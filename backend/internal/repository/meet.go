package repository

import (
	"context"
	"table-api/internal/entitys"
	"table-api/internal/handler/dto"
	"table-api/internal/models"
	"table-api/internal/repository/gormerrors"
	common "table-api/pkg"

	"gorm.io/gorm"
)

type MeetRepository interface {
	Create(ctx context.Context, meet *models.Meet) (*models.Meet, error)
	Update(ctx context.Context, id int, updates map[string]interface{}) (*models.Meet, error)
	List(ctx context.Context, page, limit int, filter dto.GetQueryMeetDto) ([]*models.Meet, *entitys.Pagination, error)
	GetByID(ctx context.Context, id int) (*models.Meet, error)
}

type meetRepository struct {
	db *gorm.DB
}

func NewMeetRepository(db *gorm.DB) MeetRepository {
	return &meetRepository{db: db}
}

func (m *meetRepository) Create(ctx context.Context, meet *models.Meet) (*models.Meet, error) {
	if err := m.db.WithContext(ctx).Create(meet).Error; err != nil {
		return nil, gormerrors.Map(err)
	}

	return meet, nil
}

func (m *meetRepository) Update(ctx context.Context, id int, updates map[string]interface{}) (*models.Meet, error) {
	if len(updates) == 0 {
		return m.GetByID(ctx, id)
	}

	result := m.db.
		WithContext(ctx).
		Model(&models.Meet{}).
		Where("id = ?", id).
		Updates(updates)

	if result.Error != nil {
		return nil, gormerrors.Map(result.Error)
	}
	if result.RowsAffected == 0 {
		return nil, common.ErrNotFound
	}

	return m.GetByID(ctx, id)
}

func (m *meetRepository) GetByID(ctx context.Context, id int) (*models.Meet, error) {
	var meet models.Meet

	if err := m.db.WithContext(ctx).First(&meet, id).Error; err != nil {
		return nil, gormerrors.Map(err)
	}

	return &meet, nil
}

func (m *meetRepository) List(
	ctx context.Context,
	page int,
	limit int,
	filter dto.GetQueryMeetDto,
) ([]*models.Meet, *entitys.Pagination, error) {
	offset := (page - 1) * limit

	var (
		meets      []*models.Meet
		totalItems int64
	)

	query := m.db.WithContext(ctx).Model(&models.Meet{})

	if filter.Status != nil {
		query = query.Where("status = ?", *filter.Status)
	}

	if err := query.Count(&totalItems).Error; err != nil {
		return nil, nil, gormerrors.Map(err)
	}

	if filter.SortBy != nil && filter.Order != nil {
		sortField := *filter.SortBy
		orderDir := string(*filter.Order)

		allowed := map[string]bool{
			"eventName":    true,
			"customerName": true,
			"email":        true,
			"phone":        true,
			"location":     true,
			"platform":     true,
			"devices":      true,
			"url":          true,
			"shortUrl":     true,
			"status":       true,
			"description":  true,
			"admin":        true,
			"start":        true,
			"end":          true,
			"createdAt":    true,
			"updatedAt":    true,
		}

		if allowed[sortField] {
			query = query.Order(sortField + " " + orderDir)
		} else {
			query = query.Order("created_at DESC")
		}
	} else {
		query = query.Order("created_at DESC")
	}

	if err := query.
		Limit(limit).
		Offset(offset).
		Find(&meets).
		Error; err != nil {
		return nil, nil, gormerrors.Map(err)
	}

	pagination := entitys.BuildPagination(page, limit, totalItems)
	return meets, &pagination, nil
}
