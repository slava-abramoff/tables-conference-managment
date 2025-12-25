package entitys

import "math"

type Pagination struct {
	CurrentPage     int
	TotalPages      int
	TotalItems      int
	ItemsPerPage    int
	HasNextPage     bool
	HasPreviousPage bool
}

func BuildPagination(page, limit int, totalItems int64) Pagination {
	totalPages := int(math.Ceil(float64(totalItems) / float64(limit)))

	return Pagination{
		CurrentPage:     page,
		TotalPages:      totalPages,
		TotalItems:      int(totalItems),
		ItemsPerPage:    limit,
		HasNextPage:     page < totalPages,
		HasPreviousPage: page > 1,
	}
}
