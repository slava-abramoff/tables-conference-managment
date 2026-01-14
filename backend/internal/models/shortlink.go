package models

import (
	"time"
)

type ShortLink struct {
	ID         int       `gorm:"primaryKey;autoIncrement"`
	URL        string    `gorm:"not null"`
	Code       string    `gorm:"unique;not null"`
	ClickCount int       `gorm:"not null;default:0"`
	CreatedAt  time.Time `gorm:"autoCreateTime"`
}
