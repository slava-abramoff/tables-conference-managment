package dto

type Status string

const (
	StatusNew       Status = "new"
	StatusActive    Status = "active"
	StatusCompleted Status = "completed"
)

type SortOrder string

const (
	SortAsc  SortOrder = "asc"
	SortDesc SortOrder = "desc"
)

type GetQueryMeetDto struct {
	Status *Status `validate:"omitempty,oneof=new active completed"`

	SortBy *string `validate:"omitempty,oneof=eventName customerName email phone location platform devices url shortUrl status description admin start end createdAt updatedAt"`

	Order *SortOrder `validate:"omitempty,oneof=asc desc"`
}
