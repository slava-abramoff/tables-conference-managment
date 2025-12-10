package user

import "time"

type UserModel struct {
	ID        string
	Login     string
	Name      string
	Role      string
	Password  string
	CreatedAt time.Time
}

type UserRepo interface {
	Create(user User) UserModel
	FindMany(page int, limit int) []UserModel
	Search(searchTerm string) []UserModel
	Update(id string, user User) UserModel
	Remove(id string) UserModel
}
