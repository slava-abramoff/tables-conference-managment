package user

type UserService interface {
	Create(user User) UserModel
	FindMany(page int, limit int) ([]UserModel, Pagination)
	Search(searchTerm string) []UserModel
	Update(id string, user User) UserModel
	Remove(id string) UserModel
}

type Pagination struct {
	CurrentPage     int
	TotalPages      int
	TotalItems      int
	ItemsPerPage    int
	HasNextPage     bool
	HasPreviousPage bool
}
