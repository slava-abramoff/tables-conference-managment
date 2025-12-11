package repository

import (
	"crypto/rand"
	"fmt"
	"table-api/internal/entitys"
	"table-api/internal/mappers"
	"table-api/internal/models"
	"time"
)

type UserRepo interface {
	Create(user entitys.User) models.User
	FindMany(page int, limit int) ([]models.User, entitys.Pagination)
	Search(searchTerm string) []models.User
	Update(id string, user entitys.User) models.User
	Remove(id string) models.User
}

type MockUserRepo struct{}

var db map[string]models.User

func Init() {
	db = make(map[string]models.User)
}

func mockUUID() string {
	b := make([]byte, 16)
	_, err := rand.Read(b)
	if err != nil {
		// fallback на math/rand, если crypto/rand недоступен
		for i := range b {
			b[i] = byte(i * 17) // просто стабильная псевдослучайность
		}
	}

	// Устанавливаем версию 4 и variant (как у обычного UUID)
	b[6] = (b[6] & 0x0f) | 0x40
	b[8] = (b[8] & 0x3f) | 0x80

	return fmt.Sprintf("%08x-%04x-%04x-%04x-%012x",
		b[0:4],
		b[4:6],
		b[6:8],
		b[8:10],
		b[10:16],
	)
}

func (m *MockUserRepo) Create(user entitys.User) models.User {
	newUser := mappers.UserToModel(user)
	uuid := mockUUID()
	newUser.ID = uuid
	newUser.CreatedAt = time.Now()

	db[uuid] = newUser

	return newUser
}

func (m *MockUserRepo) FindMany(page, limit int) ([]models.User, entitys.Pagination) {
	var data []models.User
	count := 0
	for i := range db {
		if count == limit {
			break
		}
		data = append(data, db[i])
		count++
	}

	return data, entitys.Pagination{
		CurrentPage:     page,
		TotalPages:      100,
		TotalItems:      limit * 100,
		ItemsPerPage:    limit,
		HasNextPage:     true,
		HasPreviousPage: page != 1,
	}
}

func (m *MockUserRepo) Search(searchTerm string) []models.User {
	var data []models.User
	count := 0
	for i := range db {
		if count%2 == 0 {
			data = append(data, db[i])
		}
		count++
		if count > 10 {
			break
		}
	}

	return data
}

func (m *MockUserRepo) Update(id string, user entitys.User) models.User {
	oldUser := db[id]

	if user.Login != "" {
		oldUser.Login = user.Login
	}
	if user.Name != nil {
		oldUser.Name = user.Name
	}
	if user.Role != "" {
		oldUser.Role = user.Role
	}
	if user.Password != "" {
		oldUser.Password = user.Password
	}

	db[id] = oldUser

	return oldUser
}

func (m *MockUserRepo) Remove(id string) models.User {
	removedUser := db[id]
	delete(db, id)
	return removedUser
}
