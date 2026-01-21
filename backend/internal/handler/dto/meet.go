package dto

import "time"

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
	Status *Status `validate:"omitempty,oneof=new active completed canceled"`

	SortBy *string `validate:"omitempty,oneof=eventName customerName email phone location platform devices url shortUrl status description admin start end createdAt updatedAt"`

	Order *SortOrder `validate:"omitempty,oneof=asc desc"`
}

type CreateMeetRequest struct {
	EventName    *string `json:"eventName,omitempty"    validate:"omitempty,max=255"`
	CustomerName *string `json:"customerName,omitempty" validate:"omitempty,max=255"`
	Email        *string `json:"email,omitempty"        validate:"omitempty,email,max=255"`
	Phone        *string `json:"phone,omitempty"        validate:"omitempty,max=50"`
	Location     *string `json:"location,omitempty"     validate:"omitempty,max=255"`
	Platform     *string `json:"platform,omitempty"     validate:"omitempty,max=100"`
	Devices      *string `json:"devices,omitempty"      validate:"omitempty,max=255"`
	URL          *string `json:"url,omitempty"          validate:"omitempty,url"`
	ShortURL     *string `json:"shortUrl,omitempty"     validate:"omitempty,url"`

	Description *string `json:"description,omitempty"  validate:"omitempty,max=2000"`

	Admin *string `json:"admin,omitempty" validate:"omitempty,max=100"`

	Start *time.Time `json:"start,omitempty" validate:"omitempty"`
	End   *time.Time `json:"end,omitempty"   validate:"omitempty"`
}

type UpdateMeetRequest struct {
	EventName    *string `json:"eventName,omitempty"    validate:"omitempty,max=255"`
	CustomerName *string `json:"customerName,omitempty" validate:"omitempty,max=255"`
	Email        *string `json:"email,omitempty"        validate:"omitempty,email,max=255"`
	Phone        *string `json:"phone,omitempty"        validate:"omitempty,max=50"`
	Location     *string `json:"location,omitempty"     validate:"omitempty,max=255"`
	Platform     *string `json:"platform,omitempty"     validate:"omitempty,max=100"`
	Devices      *string `json:"devices,omitempty"      validate:"omitempty,max=255"`
	URL          *string `json:"url,omitempty"          validate:"omitempty,url"`
	ShortURL     *string `json:"shortUrl,omitempty"     validate:"omitempty,url"`

	Status      *string `json:"status,omitempty"      validate:"omitempty,oneof=new approved completed canceled"`
	Description *string `json:"description,omitempty" validate:"omitempty,max=2000"`
	Admin       *string `json:"admin,omitempty"       validate:"omitempty,max=100"`

	Start *time.Time `json:"start,omitempty"`
	End   *time.Time `json:"end,omitempty"`
}

type MeetResponse struct {
	Id           int     `json:"id"`
	EventName    *string `json:"eventName"`
	CustomerName *string `json:"customerName"`
	Email        *string `json:"email"`
	Phone        *string `json:"phone"`
	Location     *string `json:"location"`
	Platform     *string `json:"platform"`
	Devices      *string `json:"devices"`
	URL          *string `json:"url"`
	ShortURL     *string `json:"shortUrl"`

	Status      *string `json:"status"`
	Description *string `json:"description"`

	Admin *string `json:"admin"`

	Start     *time.Time `json:"start"`
	End       *time.Time `json:"end"`
	CreatedAt time.Time  `gorm:"createdAt"`
	UpdatedAt *time.Time `gorm:"updatedAt"`
}
