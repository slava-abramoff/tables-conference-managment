package repository

import (
	"context"
	"sync"
	"table-api/internal/entitys"
	"table-api/internal/models"
	common "table-api/pkg"
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

type UserRepoMock struct {
	mu    sync.RWMutex
	users map[string]*models.User
}

func NewUserRepoMock() *UserRepoMock {
	return &UserRepoMock{
		users: make(map[string]*models.User),
	}
}

func (r *UserRepoMock) Create(ctx context.Context, user *models.User) (*models.User, error) {
	r.mu.Lock()
	defer r.mu.Unlock()

	for _, u := range r.users {
		if u.Login == user.Login {
			return nil, common.ErrAlreadyExists
		}
	}

	r.users[user.ID] = user
	return user, nil
}

func (r *UserRepoMock) GetByID(ctx context.Context, id string) (*models.User, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	user, ok := r.users[id]
	if !ok {
		return nil, common.ErrNotFound
	}

	return user, nil
}

func (r *UserRepoMock) GetByLogin(ctx context.Context, login string) (*models.User, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	for _, user := range r.users {
		if user.Login == login {
			return user, nil
		}
	}

	return nil, common.ErrNotFound
}

func (r *UserRepoMock) List(
	ctx context.Context,
	page int,
	limit int,
) ([]*models.User, *entitys.Pagination, error) {

	r.mu.RLock()
	defer r.mu.RUnlock()

	totalItems := len(r.users)
	if totalItems == 0 {
		return []*models.User{}, &entitys.Pagination{
			CurrentPage:  page,
			TotalPages:   0,
			TotalItems:   0,
			ItemsPerPage: limit,
		}, nil
	}

	// переводим map → slice
	allUsers := make([]*models.User, 0, totalItems)
	for _, u := range r.users {
		allUsers = append(allUsers, u)
	}

	start := (page - 1) * limit
	end := start + limit

	if start > totalItems {
		start = totalItems
	}
	if end > totalItems {
		end = totalItems
	}

	items := allUsers[start:end]

	totalPages := (totalItems + page - 1) / limit

	pagination := &entitys.Pagination{
		CurrentPage:     page,
		TotalPages:      totalPages,
		TotalItems:      totalItems,
		ItemsPerPage:    limit,
		HasNextPage:     page < totalPages,
		HasPreviousPage: limit > 1,
	}

	return items, pagination, nil
}

func (r *UserRepoMock) Search(
	ctx context.Context,
	searchTerm string,
) ([]*models.User, error) {
	return nil, common.ErrNotFound
}

func (r *UserRepoMock) Update(ctx context.Context, user *models.User) (*models.User, error) {
	r.mu.Lock()
	defer r.mu.Unlock()

	if _, ok := r.users[user.ID]; !ok {
		return nil, common.ErrNotFound
	}

	r.users[user.ID] = user
	return user, nil
}

func (r *UserRepoMock) Delete(ctx context.Context, id string) (*models.User, error) {
	r.mu.Lock()
	defer r.mu.Unlock()

	user, ok := r.users[id]
	if !ok {
		return nil, common.ErrNotFound
	}

	delete(r.users, id)
	return user, nil
}
