package repository

import (
	"context"
	"fmt"
	"strconv"
	"table-api/internal/models"
	common "table-api/pkg"
	"time"

	"gorm.io/gorm"
)

type LectureRepo interface {
	// CREATE
	Create(lecture *models.Lecture) (*models.Lecture, error)
	CreateMany(lecture []*models.Lecture) ([]*models.Lecture, error)

	// UPDATE
	Update(id int, updates map[string]interface{}) (*models.Lecture, error)

	// // DELETE
	Delete(id int) (*models.Lecture, error)

	// BULK UPDATE
	UpdateURLsByGroup(
		groupName string,
		url string,
		shortURL *string,
	) ([]*models.Lecture, error)

	// READ
	FindByDateRange(start, end time.Time) ([]*models.Lecture, error)
	FindByExactDate(date time.Time) ([]*models.Lecture, error)
	FindForSchedule(year, month string) ([]*models.Lecture, error)

	// AGGREGATES
	FindWithUniqueDates() ([]*models.Lecture, error)
}

type LectureRepository struct {
	db *gorm.DB
}

func NewLectureRepository(db *gorm.DB) *LectureRepository {
	return &LectureRepository{db: db}
}

func (l *LectureRepository) Create(ctx context.Context, lecture *models.Lecture) (*models.Lecture, error) {
	if err := l.db.Create(lecture).Error; err != nil {
		return nil, err
	}

	return lecture, nil
}

func (l *LectureRepository) CreateMany(ctx context.Context, lectures []*models.Lecture) ([]*models.Lecture, error) {
	if len(lectures) == 0 {
		return nil, nil
	}

	result := l.db.WithContext(ctx).Create(lectures)
	if result.Error != nil {
		return nil, result.Error
	}

	return lectures, nil
}

func (l *LectureRepository) GetByID(ctx context.Context, id int) (*models.Lecture, error) {
	var lecture models.Lecture

	if err := l.db.First(&lecture, id).Error; err != nil {
		return nil, err
	}

	return &lecture, nil
}

func (l *LectureRepository) Update(ctx context.Context, id int, updates map[string]interface{}) (*models.Lecture, error) {
	if len(updates) == 0 {
		return l.GetByID(ctx, id)
	}

	result := l.db.
		WithContext(ctx).
		Model(&models.Lecture{}).
		Where("id = ?", id).
		Updates(updates)

	if result.Error != nil {
		return nil, result.Error
	}

	if result.RowsAffected == 0 {
		return nil, common.ErrNotFound
	}

	return l.GetByID(ctx, id)
}

func (l *LectureRepository) Delete(ctx context.Context, id int) (*models.Lecture, error) {
	var lecture models.Lecture

	if _, err := l.GetByID(ctx, id); err != nil {
		return nil, common.ErrNotFound
	}

	if err := l.db.Delete(&lecture).Error; err != nil {
		return nil, err
	}

	return &lecture, nil
}

func (l *LectureRepository) UpdateURLsByGroup(
	ctx context.Context,
	groupName string,
	url string,
	shortURL string,
) ([]*models.Lecture, error) {
	updates := map[string]interface{}{
		"url": url,
	}

	result := l.db.
		WithContext(ctx).
		Model(&models.Lecture{}).
		Where("group = ?", groupName).
		Updates(updates)

	if result.Error != nil {
		return nil, result.Error
	}

	if result.RowsAffected == 0 {
		return nil, nil
	}

	var updatedLectures []*models.Lecture
	err := l.db.
		WithContext(ctx).
		Where("group = ?", groupName).
		Find(&updatedLectures).
		Error

	if err != nil {
		return nil, err
	}

	return updatedLectures, nil
}

func (l *LectureRepository) FindByDateRange(ctx context.Context, startDate, endDate time.Time) ([]*models.Lecture, error) {
	var lectures []*models.Lecture

	err := l.db.
		WithContext(ctx).
		Where("date >= ? AND date <= ?", startDate, endDate).
		Order("date ASC, start ASC").
		Find(&lectures).
		Error

	if err != nil {
		return nil, err
	}

	return lectures, nil
}

func (l *LectureRepository) FindByExactDate(ctx context.Context, date time.Time) ([]*models.Lecture, error) {
	startOfDay := time.Date(date.Year(), date.Month(), date.Day(), 0, 0, 0, 0, date.Location())
	endOfDay := startOfDay.Add(24*time.Hour - time.Second)

	var lectures []*models.Lecture

	err := l.db.WithContext(ctx).
		Where("date >= ? AND date <= ?", startOfDay, endOfDay).
		Order("start ASC, id ASC").
		Find(&lectures).
		Error

	if err != nil {
		return nil, err
	}

	return lectures, nil
}

func (l *LectureRepository) FindForSchedule(
	ctx context.Context,
	year, month string,
) ([]*models.Lecture, error) {
	y, err := strconv.Atoi(year)
	if err != nil {
		return nil, fmt.Errorf("invalid year format: %w", err)
	}

	m, err := strconv.Atoi(month)
	if err != nil || m < 1 || m > 12 {
		return nil, fmt.Errorf("invalid month format: %w", err)
	}

	start := time.Date(y, time.Month(m), 1, 0, 0, 0, 0, time.UTC)
	end := start.AddDate(0, 1, 0).Add(-time.Second)

	var lectures []*models.Lecture

	err = l.db.WithContext(ctx).
		Where("date >= ? AND date <= ?", start, end).
		Order("date ASC, start ASC").
		Find(&lectures).
		Error

	if err != nil {
		return nil, err
	}

	return lectures, nil
}

func (l *LectureRepository) FindWithUniqueDates(ctx context.Context) ([]*models.Lecture, error) {
	var lectures []*models.Lecture

	err := l.db.WithContext(ctx).
		Select("DISTINCT ON (date) *").
		Order("date ASC, start ASC").
		Find(&lectures).
		Error

	if err != nil {
		return nil, err
	}

	return lectures, nil
}
