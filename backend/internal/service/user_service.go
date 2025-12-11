package service

import (
	"table-api/internal/entitys"
	"table-api/internal/models"
	"table-api/internal/repository"
)

type UserService interface {
	Create(user entitys.User) models.User
	FindMany(page int, limit int) ([]models.User, entitys.Pagination)
	Search(searchTerm string) []models.User
	Update(id string, user entitys.User) models.User
	Remove(id string) models.User
}

type UserSerivce struct {
	repo repository.UserRepo
}

func NewUserService(repo repository.UserRepo) *UserSerivce {
	return &UserSerivce{repo: repo}
}

func (u *UserSerivce) Create(user *entitys.User) {}
