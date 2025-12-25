package service

import (
	"context"
	"table-api/internal/entitys"
	"table-api/internal/mappers"
	"table-api/internal/models"
	"table-api/internal/repository"
)

type UserService interface {
	Create(ctx context.Context, user entitys.User) (*models.User, error)
	FindMany(ctx context.Context, page int, limit int) ([]*models.User, *entitys.Pagination, error)
	Search(ctx context.Context, searchTerm string) ([]*models.User, error)
	Update(ctx context.Context, id string, user entitys.User) (*models.User, error)
	Remove(ctx context.Context, id string) (*models.User, error)
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
	if page < 0 || limit < 0 {
		page *= -1
		limit *= -1
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

func (u *UserSerivce) Update(ctx context.Context, id string, user entitys.User) (*models.User, error) {
	data := mappers.UserToModel(user)
	data.ID = id.
	updatedUser, err := u.repo.Update(ctx, &data)
	if err != nil {
		return nil, err
	}

	return updatedUser, nil
}

func (u *UserSerivce) Remove(ctx context.Context, id string) (*models.User, error) {
	deletedUser, err := u.repo.Delete(ctx, id)
	if err != nil {
		return nil, err
	}

	return deletedUser, nil
}
