package service

import (
	"context"
	"table-api/internal/entitys"
	"table-api/internal/handler/dto"
	"table-api/internal/mappers"
	"table-api/internal/models"
	"table-api/internal/repository"

	"github.com/google/uuid"
)

type UserService interface {
	Create(ctx context.Context, user entitys.User) (*models.User, error)
	FindMany(ctx context.Context, page int, limit int) ([]*models.User, *entitys.Pagination, error)
	Search(ctx context.Context, searchTerm string) ([]*models.User, error)
	Update(ctx context.Context, id uuid.UUID, dto dto.UpdateUserRequest) (*models.User, error)
	Remove(ctx context.Context, id uuid.UUID) (*models.User, error)
}

type UserSerivce struct {
	repo repository.UserRepo
}

func NewUserService(repo repository.UserRepo) *UserSerivce {
	return &UserSerivce{repo: repo}
}

func (u *UserSerivce) Create(ctx context.Context, user entitys.User) (*models.User, error) {
	data := mappers.UserToModel(user)

	newUser, err := u.repo.Create(ctx, &data)
	if err != nil {
		return nil, err
	}
	return newUser, nil
}

func (u *UserSerivce) FindMany(ctx context.Context, page int, limit int) ([]*models.User, *entitys.Pagination, error) {
	if page < 1 {
		page = 1
	}
	if limit < 1 {
		limit = 10
	}
	if limit > 100 {
		limit = 100
	}

	users, pagination, err := u.repo.List(ctx, page, limit)
	if err != nil {
		return nil, nil, err
	}

	return users, pagination, nil
}

func (u *UserSerivce) Search(
	ctx context.Context,
	searchTerm string,
) ([]*models.User, error) {
	return u.repo.Search(ctx, searchTerm)
}

func (u *UserSerivce) Update(ctx context.Context, id uuid.UUID, dto dto.UpdateUserRequest) (*models.User, error) {
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
		return u.repo.GetByID(ctx, id)
	}

	return u.repo.Update(ctx, id, updates)
}

func (u *UserSerivce) Remove(ctx context.Context, id uuid.UUID) (*models.User, error) {
	deletedUser, err := u.repo.Delete(ctx, id)
	if err != nil {
		return nil, err
	}

	return deletedUser, nil
}
