package models

import (
	"time"

	"github.com/google/uuid"
)

type User struct {
	ID        uuid.UUID `gorm:"type:uuid;primaryKey;default:uuid_generate_v4()"`
	Login     string    `gorm:"unique;not null"`
	Name      *string   `gorm:"type:text"`
	Role      string    `gorm:"not null"`
	Password  string    `gorm:"not null"`
	CreatedAt time.Time `gorm:"autoCreateTime"`

	Meet     []Meet    `gorm:"foreignKey:UserID"`
	Lectures []Lecture `gorm:"foreignKey:UserID"`
}
