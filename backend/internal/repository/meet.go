package repository

import (
	"context"
	"log"

	"table-api/internal/entities"
	"table-api/internal/handler/dto"
	"table-api/internal/models"
	"table-api/internal/repository/gormerrors"
	common "table-api/pkg"
	"time"

	"gorm.io/gorm"
)

type meetRepository struct {
	db *gorm.DB
}

func NewMeetRepository(db *gorm.DB) *meetRepository {
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
) ([]*models.Meet, *entities.Pagination, error) {
	log.Println("Start function")
	offset := (page - 1) * limit

	var (
		meets      []*models.Meet
		totalItems int64
	)

	query := m.db.WithContext(ctx).Model(&models.Meet{})
	log.Println("Make query")

	if filter.Status != nil {
		log.Println("Status not nil")
		query = query.Where("status = ?", *filter.Status)
	} else {
		log.Println("Status is nil")
	}

	if err := query.Count(&totalItems).Error; err != nil {
		log.Println("Make error: ", err.Error())
		return nil, nil, gormerrors.Map(err)
	}

	if filter.SortBy != nil && filter.Order != nil {
		var sortField string
		camelCase := map[string]string{
			"eventName":    "event_name",
			"customerName": "customer_name",
			"shortUrl":     "short_url",
			"end":          "`end`",
			"createdAt":    "created_at",
			"updatedAt":    "updated_at",
		}

		if i, r := camelCase[*filter.SortBy]; r {
			sortField = i
		} else {
			sortField = *filter.SortBy
		}

		orderDir := string(*filter.Order)

		allowed := map[string]bool{
			"event_name":    true,
			"customer_name": true,
			"email":         true,
			"phone":         true,
			"location":      true,
			"platform":      true,
			"devices":       true,
			"url":           true,
			"short_url":     true,
			"status":        true,
			"description":   true,
			"admin":         true,
			"start":         true,
			"end":           true,
			"created_at":    true,
			"updated_at":    true,
		}

		if allowed[sortField] {
			query = query.Order(sortField + ` ` + orderDir)
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

	pagination := entities.BuildPagination(page, limit, totalItems)
	return meets, &pagination, nil
}

func (m *meetRepository) MarkCompletedIfEnded() error {
	now := time.Now()

	return m.db.
		Model(&models.Meet{}).
		Where(
			`status = ? AND "end" <= ?`,
			"active",
			now,
		).
		Update("status", "completed").
		Error
}

func (m *meetRepository) FindByDateRange(ctx context.Context, start, end time.Time) ([]*models.Meet, error) {
	var meets []*models.Meet

	query := m.db.WithContext(ctx).Model(&models.Meet{})

	query = query.Where(`
		"start" BETWEEN ? AND ?
		AND status != ?
		`,
		start.Format("2006-01-02"),
		end.Format("2006-01-02"),
		"canceled",
	)

	if err := query.Find(&meets).Error; err != nil {
		return nil, gormerrors.Map(err)
	}

	return meets, nil
}
