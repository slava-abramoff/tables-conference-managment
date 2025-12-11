package entitys

type Pagination struct {
	CurrentPage     int
	TotalPages      int
	TotalItems      int
	ItemsPerPage    int
	HasNextPage     bool
	HasPreviousPage bool
}
