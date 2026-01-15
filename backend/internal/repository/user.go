package repository

import (
	"context"
	"table-api/internal/entitys"
	"table-api/internal/models"
	common "table-api/pkg"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type UserRepository interface {
	Create(ctx context.Context, user *models.User) (*models.User, error)
	GetByID(ctx context.Context, id uuid.UUID) (*models.User, error)
	GetByLogin(ctx context.Context, login string) (*models.User, error)
	List(
		ctx context.Context,
		page int,
		limit int,
	) ([]*models.User, *entitys.Pagination, error)
	Search(ctx context.Context, searchTerm string) ([]*models.User, error)
	Update(ctx context.Context, id uuid.UUID, updates map[string]interface{}) (*models.User, error)
	Delete(ctx context.Context, id uuid.UUID) (*models.User, error)
}

type userRepository struct {
	db *gorm.DB
}

func NewUserRepository(db *gorm.DB) UserRepository {
	return &userRepository{db: db}
}

func (u *userRepository) Create(ctx context.Context, user *models.User) (*models.User, error) {
	if err := u.db.Create(user).Error; err != nil {
		return nil, err
	}

	return user, nil
}

func (u *userRepository) GetByID(ctx context.Context, id uuid.UUID) (*models.User, error) {
	var user models.User

	if err := u.db.First(&user, id).Error; err != nil {
		return nil, err
	}

	return &user, nil
}

func (u *userRepository) GetByLogin(ctx context.Context, login string) (*models.User, error) {
	var user models.User

	if err := u.db.Where("login = ?", login).First(&user).Error; err != nil {
		return nil, err
	}
	return &user, nil
}

func (u *userRepository) List(
	ctx context.Context,
	page int,
	limit int,
) ([]*models.User, *entitys.Pagination, error) {
	offset := (page - 1) * limit

	var (
		users      []*models.User
		totalItems int64
	)

	// get total count
	if err := u.db.Model(&models.User{}).Count(&totalItems).Error; err != nil {
		return nil, nil, err
	}

	// get users
	if err := u.db.Limit(limit).Offset(offset).Find(&users).Error; err != nil {
		return nil, nil, err
	}

	// compute pagination
	pagination := entitys.BuildPagination(page, limit, totalItems)

	return users, &pagination, nil
}

func (u *userRepository) Search(ctx context.Context, searchTerm string) ([]*models.User, error) {
	var users []*models.User

	searchPattern := "%" + searchTerm + "%"

	err := u.db.
		Where("login ILIKE ?", searchPattern).
		Or("name ILIKE ?", searchPattern).
		Find(&users).
		Error

	if err != nil {
		return nil, err
	}

	return users, nil
}

func (r *userRepository) Update(ctx context.Context, id uuid.UUID, updates map[string]interface{}) (*models.User, error) {
	if len(updates) == 0 {
		return r.GetByID(ctx, id)
	}

	result := r.db.
		WithContext(ctx).
		Model(&models.User{}).
		Where("id = ?", id).
		Updates(updates)

	if result.Error != nil {
		return nil, result.Error
	}
	if result.RowsAffected == 0 {
		return nil, common.ErrNotFound
	}

	return r.GetByID(ctx, id)
}

func (u *userRepository) Delete(ctx context.Context, id uuid.UUID) (*models.User, error) {
	var user models.User

	if err := u.db.First(&user, "id = ?", id).Error; err != nil {
		return nil, common.ErrNotFound
	}

	if err := u.db.Delete(&user).Error; err != nil {
		return nil, err
	}

	return &user, nil
}
