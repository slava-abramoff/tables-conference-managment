package dto

type PaginationResponse struct {
	CurrentPage     int  `json:"currentPage"`
	TotalPages      int  `json:"totalPages"`
	TotalItems      int  `json:"totalItems"`
	ItemsPerPage    int  `json:"itemsPerPage"`
	HasNextPage     bool `json:"hasNextPage"`
	HasPreviousPage bool `json:"hasPreviousPage"`
}

type PaginatedResponse[T any] struct {
	Data       []T                `json:"data"`
	Pagination PaginationResponse `json:"pagination"`
}
