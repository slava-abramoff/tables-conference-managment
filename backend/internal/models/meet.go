package models

import (
	"time"

	"github.com/google/uuid"
)

type Status string

const (
	StatusNew      Status = "new"
	StatusPending  Status = "pending"
	StatusFinished Status = "finished"
)

// Meet — мероприятие
type Meet struct {
	ID           int     `gorm:"primaryKey;autoIncrement"`
	EventName    *string `gorm:"type:text"`
	CustomerName *string `gorm:"type:text"`
	Email        *string `gorm:"type:text"`
	Phone        *string `gorm:"type:text"`
	Location     *string `gorm:"type:text"`
	Platform     *string `gorm:"type:text"`
	Devices      *string `gorm:"type:text"`
	URL          *string `gorm:"type:text"`
	ShortURL     *string `gorm:"type:text"`

	Status      Status  `gorm:"type:text;default:'new'"`
	Description *string `gorm:"type:text"`

	AdminID *uuid.UUID `gorm:"type:uuid"`
	Admin   *User      `gorm:"foreignKey:AdminID"`

	Start     *time.Time
	End       *time.Time
	CreatedAt time.Time  `gorm:"autoCreateTime"`
	UpdatedAt *time.Time `gorm:"autoUpdateTime"`
}
