package service

import (
	"fmt"
	"math/rand"
	"strconv"
	"table-api/internal/domain/user"
	"time"
)

type MockUserService struct{}

func (u *MockUserService) Create(newUser user.User) user.UserModel {
	fmt.Printf("new user: %s", newUser.Login)

	return user.UserModel{
		ID:        "1",
		Name:      newUser.Name,
		Login:     newUser.Login,
		Password:  newUser.Password,
		Role:      newUser.Role,
		CreatedAt: time.Now(),
	}
}

func (u *MockUserService) FindMany(page int, limit int) ([]user.UserModel, user.Pagination) {
	fmt.Println("Page: ", page)
	return generateUsers(limit), user.Pagination{
		CurrentPage:     page,
		TotalPages:      100,
		TotalItems:      limit * 100,
		ItemsPerPage:    limit,
		HasNextPage:     true,
		HasPreviousPage: page != 1,
	}
}

func (u *MockUserService) Search(searchTerm string) []user.UserModel {
	fmt.Println("Search for: ", searchTerm)
	return generateUsers(4)
}

func (u *MockUserService) Update(id string, newUser user.User) user.UserModel {
	fmt.Printf("update user: %s", newUser.Login)

	return user.UserModel{
		ID:        id,
		Name:      newUser.Name,
		Login:     newUser.Login,
		Password:  newUser.Password,
		Role:      newUser.Role,
		CreatedAt: time.Now(),
	}
}

func (u *MockUserService) Remove(id string) user.UserModel {
	fmt.Println("Remove user ID: ", id)
	return user.UserModel{
		ID:        id,
		Name:      "User" + randomString(5),
		Login:     "login" + randomString(5),
		Password:  randomString(10),
		Role:      randomRole(),
		CreatedAt: time.Now(),
	}
}

func generateUsers(n int) []user.UserModel {
	users := make([]user.UserModel, n)
	for i := 0; i < n; i++ {
		id := strconv.Itoa(i + 1)
		users[i] = user.UserModel{
			ID:        id,
			Name:      "User" + randomString(5),
			Login:     "login" + randomString(5),
			Password:  randomString(10),
			Role:      randomRole(),
			CreatedAt: time.Now(),
		}
	}
	return users
}

func randomString(n int) string {
	letters := []rune("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789")
	s := make([]rune, n)
	for i := range s {
		s[i] = letters[rand.Intn(len(letters))]
	}
	return string(s)
}

func randomRole() string {
	roles := []string{"admin", "user", "moderator"}
	return roles[rand.Intn(len(roles))]
}
