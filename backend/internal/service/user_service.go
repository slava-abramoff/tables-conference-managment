package service

import (
	"context"
	"errors"
	"fmt"
	"table-api/internal/entitys"
	"table-api/internal/handler/dto"
	"table-api/internal/mappers"
	"table-api/internal/models"
	"table-api/internal/repository"
	common "table-api/pkg"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type UserService interface {
	Create(ctx context.Context, user entitys.User) (*models.User, error)
	FindMany(ctx context.Context, page int, limit int) ([]*models.User, *entitys.Pagination, error)
	Search(ctx context.Context, searchTerm string) ([]*models.User, error)
	Update(ctx context.Context, id uuid.UUID, dto dto.UpdateUserRequest) (*models.User, error)
	Remove(ctx context.Context, id uuid.UUID) (*models.User, error)
}

type userService struct {
	userRepo repository.UserRepository
}

func NewUserService(repo repository.UserRepository) UserService {
	return &userService{userRepo: repo}
}

func (u *userService) Create(ctx context.Context, user entitys.User) (*models.User, error) {
	existUser, err := u.userRepo.GetByLogin(ctx, user.Login)
	if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, fmt.Errorf("failed to check login existence: %w", err)
	}
	if existUser != nil {
		return nil, common.ErrAlreadyExists
	}

	data := mappers.UserToModel(user)

	newUser, err := u.userRepo.Create(ctx, &data)
	if err != nil {
		return nil, err
	}
	return newUser, nil
}

func (u *userService) FindMany(ctx context.Context, page int, limit int) ([]*models.User, *entitys.Pagination, error) {
	if page < 1 {
		page = 1
	}
	if limit < 1 {
		limit = 10
	}
	if limit > 100 {
		limit = 100
	}

	users, pagination, err := u.userRepo.List(ctx, page, limit)
	if err != nil {
		return nil, nil, err
	}

	return users, pagination, nil
}

func (u *userService) Search(
	ctx context.Context,
	searchTerm string,
) ([]*models.User, error) {
	return u.userRepo.Search(ctx, searchTerm)
}

func (u *userService) Update(ctx context.Context, id uuid.UUID, dto dto.UpdateUserRequest) (*models.User, error) {
	updates := map[string]interface{}{}

	if dto.Login != nil {
		updates["login"] = *dto.Login
	}
	if dto.Name != nil {
		updates["name"] = *dto.Name
	}
	if dto.Role != nil {
		updates["role"] = *dto.Role
	}
	if dto.Password != nil && *dto.Password != "" {
		updates["password"] = *dto.Password
	}

	if len(updates) == 0 {
		return u.userRepo.GetByID(ctx, id)
	}

	return u.userRepo.Update(ctx, id, updates)
}

func (u *userService) Remove(ctx context.Context, id uuid.UUID) (*models.User, error) {
	deletedUser, err := u.userRepo.Delete(ctx, id)
	if err != nil {
		return nil, err
	}

	return deletedUser, nil
}
