package dto

import "time"

type CreateLectureRequest struct {
	Group        *string   `json:"group,omitempty"       validate:"omitempty,min=1,max=100"`
	Lector       *string   `json:"lector,omitempty"      validate:"omitempty,min=2,max=100"`
	Platform     *string   `json:"platform,omitempty"    validate:"omitempty,max=100"`
	Unit         *string   `json:"unit,omitempty"        validate:"omitempty,max=100"`
	Location     *string   `json:"location,omitempty"    validate:"omitempty,max=150"`
	URL          *string   `json:"url,omitempty"         validate:"omitempty,url"`
	ShortURL     *string   `json:"shortUrl,omitempty"    validate:"omitempty,url"`
	StreamKey    *string   `json:"streamKey,omitempty"   validate:"omitempty,max=100"`
	Description  *string   `json:"description,omitempty" validate:"omitempty,max=2000"`
	Admin        *string   `json:"admin,omitempty"       validate:"omitempty,max=100"`
	Date         time.Time `json:"date"                  validate:"required"`       // ← единственное обязательное поле
	Start        *string   `json:"start,omitempty"       validate:"omitempty,time"` // формат "15:04"
	End          *string   `json:"end,omitempty"         validate:"omitempty,time"` // формат "15:04"
	AbnormalTime *string   `json:"abnormalTime,omitempty" validate:"omitempty,max=100"`
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
	Date         *time.Time `json:"date,omitempty"        validate:"omitempty"`      // теперь опционально
	Start        *string    `json:"start,omitempty"       validate:"omitempty,time"` // "15:04"
	End          *string    `json:"end,omitempty"         validate:"omitempty,time"` // "15:04"
	AbnormalTime *string    `json:"abnormalTime,omitempty" validate:"omitempty,max=100"`
}

type UpdateManyLinksRequest struct {
	GroupName string `json:"groupName"`
	Url       string `json:"url"`
}
