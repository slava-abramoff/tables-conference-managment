package repository

import (
	"context"
	"table-api/internal/entitys"
	"table-api/internal/models"

	"gorm.io/gorm"
)

type UserRepo interface {
	Create(ctx context.Context, user *models.User) (*models.User, error)
	GetByID(ctx context.Context, id string) (*models.User, error)
	GetByLogin(ctx context.Context, login string) (*models.User, error)
	List(
		ctx context.Context,
		page int,
		limit int,
	) ([]*models.User, *entitys.Pagination, error)
	Search(ctx context.Context, searchTerm string) ([]*models.User, error)
	Update(ctx context.Context, user *models.User) (*models.User, error)
	Delete(ctx context.Context, id string) (*models.User, error)
}

type UserRepository struct {
	db *gorm.DB
}

func NewUserRepository(db *gorm.DB) *UserRepository {
	return &UserRepository{db: db}
}

func (u *UserRepository) Create(ctx context.Context, user *models.User) (*models.User, error) {
	if err := u.db.Create(user).Error; err != nil {
		return nil, err
	}

	return user, nil
}

func (u *UserRepository) GetByID(ctx context.Context, id string) (*models.User, error) {
	var user models.User

	if err := u.db.First(&user, id).Error; err != nil {
		return nil, err
	}

	return &user, nil
}

func (u *UserRepository) GetByLogin(ctx context.Context, login string) (*models.User, error) {
	var user models.User

	if err := u.db.First(&user, id).Error; err != nil {
		return nil, err
	}

	return &user, nil
}

func (u *UserRepository) List(
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

func (u *UserRepository) Search(ctx context.Context, searchTerm string) ([]*models.User, error) {

}

func (u *UserRepository) Update() {}

func (u *UserRepository) Delete() {}
