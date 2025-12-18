package models

import (
	"time"

	"github.com/google/uuid"
)

type ShortLink struct {
	ID        int       `gorm:"primaryKey;autoIncrement"`
	URL       string    `gorm:"not null"`
	Code      string    `gorm:"unique;not null"`
	UserID    uuid.UUID `gorm:"type:uuid;not null"`
	CreatedAt time.Time `gorm:"autoCreateTime"`
}
