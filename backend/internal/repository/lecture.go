package repository

import (
	"context"
	"table-api/internal/models"
	common "table-api/pkg"
	"time"

	"gorm.io/gorm"
)

type LectureRepository interface {
	Create(ctx context.Context, lecture *models.Lecture) (*models.Lecture, error)
	CreateMany(ctx context.Context, lectures []*models.Lecture) ([]*models.Lecture, error)
	Update(ctx context.Context, id int, updates map[string]interface{}) (*models.Lecture, error)
	Delete(ctx context.Context, id int) (*models.Lecture, error)
	UpdateURLsByGroup(ctx context.Context, groupName string, url string, shortURL string) ([]*models.Lecture, error)
	FindByDateRange(ctx context.Context, start, end time.Time) ([]*models.Lecture, error)
	FindByExactDate(ctx context.Context, date time.Time) ([]*models.Lecture, error)
	FindForSchedule(ctx context.Context, year, month int) ([]*models.Lecture, error)
	FindWithUniqueDates(ctx context.Context) ([]*models.Lecture, error)
}

type lectureRepository struct {
	db *gorm.DB
}

func NewLectureRepository(db *gorm.DB) LectureRepository {
	return &lectureRepository{db: db}
}

func (l *lectureRepository) Create(ctx context.Context, lecture *models.Lecture) (*models.Lecture, error) {
	if err := l.db.Create(lecture).Error; err != nil {
		return nil, err
	}

	return lecture, nil
}

func (l *lectureRepository) CreateMany(ctx context.Context, lectures []*models.Lecture) ([]*models.Lecture, error) {
	if len(lectures) == 0 {
		return nil, nil
	}

	result := l.db.WithContext(ctx).Create(lectures)
	if result.Error != nil {
		return nil, result.Error
	}

	return lectures, nil
}

func (l *lectureRepository) GetByID(ctx context.Context, id int) (*models.Lecture, error) {
	var lecture models.Lecture

	if err := l.db.First(&lecture, id).Error; err != nil {
		return nil, err
	}

	return &lecture, nil
}

func (l *lectureRepository) Update(ctx context.Context, id int, updates map[string]interface{}) (*models.Lecture, error) {
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

func (l *lectureRepository) Delete(ctx context.Context, id int) (*models.Lecture, error) {
	var lecture models.Lecture

	if _, err := l.GetByID(ctx, id); err != nil {
		return nil, common.ErrNotFound
	}

	if err := l.db.Delete(&lecture).Error; err != nil {
		return nil, err
	}

	return &lecture, nil
}

func (l *lectureRepository) UpdateURLsByGroup(
	ctx context.Context,
	groupName string,
	url string,
	shortURL string,
) ([]*models.Lecture, error) {
	updates := map[string]interface{}{
		"URL":      url,
		"ShortURL": shortURL,
	}

	result := l.db.
		WithContext(ctx).
		Model(&models.Lecture{}).
		Where(`"group" = ?`, groupName).
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
		Where(`"group" = ?`, groupName).
		Find(&updatedLectures).Error

	if err != nil {
		return nil, err
	}

	return updatedLectures, nil
}

func (l *lectureRepository) FindByDateRange(ctx context.Context, startDate, endDate time.Time) ([]*models.Lecture, error) {
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

func (l *lectureRepository) FindByExactDate(ctx context.Context, date time.Time) ([]*models.Lecture, error) {
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

func (l *lectureRepository) FindForSchedule(
	ctx context.Context,
	year, month int,
) ([]*models.Lecture, error) {

	start := time.Date(year, time.Month(month), 1, 0, 0, 0, 0, time.UTC)
	end := start.AddDate(0, 1, 0).Add(-time.Second)

	var lectures []*models.Lecture

	err := l.db.WithContext(ctx).
		Where("date >= ? AND date <= ?", start, end).
		Order("date ASC, start ASC").
		Find(&lectures).
		Error

	if err != nil {
		return nil, err
	}

	return lectures, nil
}

func (l *lectureRepository) FindWithUniqueDates(ctx context.Context) ([]*models.Lecture, error) {
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
