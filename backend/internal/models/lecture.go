package models

import (
	"time"

	"github.com/google/uuid"
)

type Lecture struct {
	ID        int     `gorm:"primaryKey;autoIncrement"`
	Group     *string `gorm:"type:text"`
	Lector    *string `gorm:"type:text"`
	Platform  *string `gorm:"type:text"`
	Unit      *string `gorm:"type:text"`
	Location  *string `gorm:"type:text"`
	URL       *string `gorm:"type:text"`
	ShortURL  *string `gorm:"type:text"`
	StreamKey *string `gorm:"type:text"`

	Description *string    `gorm:"type:text"`
	AdminID     *uuid.UUID `gorm:"type:uuid"`
	Admin       *User      `gorm:"foreignKey:AdminID"`

	Date         time.Time `gorm:"not null"`
	Start        *time.Time
	End          *time.Time
	AbnormalTime *string `gorm:"type:text"`

	CreatedAt time.Time  `gorm:"autoCreateTime"`
	UpdatedAt *time.Time `gorm:"autoUpdateTime"`
}
