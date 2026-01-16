package dto

import (
	"table-api/internal/entitys"
	"time"
)

type CreateLectureRequest struct {
	Group        *string   `json:"group,omitempty"       validate:"omitempty,min=1,max=1"`
	Lector       *string   `json:"lector,omitempty"      validate:"omitempty,min=2,max=100"`
	Platform     *string   `json:"platform,omitempty"    validate:"omitempty,max=100"`
	Unit         *string   `json:"unit,omitempty"        validate:"omitempty,max=100"`
	Location     *string   `json:"location,omitempty"    validate:"omitempty,max=150"`
	URL          *string   `json:"url,omitempty"         validate:"omitempty,url"`
	ShortURL     *string   `json:"shortUrl,omitempty"    validate:"omitempty,url"`
	StreamKey    *string   `json:"streamKey,omitempty"   validate:"omitempty,max=100"`
	Description  *string   `json:"description,omitempty" validate:"omitempty,max=2000"`
	Admin        *string   `json:"admin,omitempty"       validate:"omitempty,max=100"`
	Date         time.Time `json:"date"                  validate:"required"`
	Start        *string   `json:"start,omitempty" validate:"omitempty,max=10"`
	End          *string   `json:"end,omitempty"   validate:"omitempty,max=10"`
	AbnormalTime *string   `json:"abnormalTime,omitempty" validate:"omitempty,max=100"`
}

type CreateLecturesRequest struct {
	Lectures []CreateLectureRequest `json:"lectures" validate:"required,dive"`
}

type UpdateLectureRequest struct {
	Group        *string    `json:"group,omitempty"       validate:"omitempty,min=1,max=100"`
	Lector       *string    `json:"lector,omitempty"      validate:"omitempty,min=2,max=100"`
	Platform     *string    `json:"platform,omitempty"    validate:"omitempty,max=100"`
	Unit         *string    `json:"unit,omitempty"        validate:"omitempty,max=100"`
	Location     *string    `json:"location,omitempty"    validate:"omitempty,max=150"`
	URL          *string    `json:"url,omitempty"         validate:"omitempty,url"`
	ShortURL     *string    `json:"shortUrl,omitempty"    validate:"omitempty,url"`
	StreamKey    *string    `json:"streamKey,omitempty"   validate:"omitempty,max=100"`
	Description  *string    `json:"description,omitempty" validate:"omitempty,max=2000"`
	Admin        *string    `json:"admin,omitempty"       validate:"omitempty,max=100"`
	Date         *time.Time `json:"date,omitempty"        validate:"omitempty"`
	Start        *string    `json:"start,omitempty"       validate:"omitempty"`
	End          *string    `json:"end,omitempty"         validate:"omitempty"`
	AbnormalTime *string    `json:"abnormalTime,omitempty" validate:"omitempty,max=100"`
}

type UpdateManyLinksRequest struct {
	GroupName string `json:"groupName"`
	Url       string `json:"url"`
}

type DailySchedulesResponse struct {
	Data []*entitys.DailySchedule `json:"data"`
}
