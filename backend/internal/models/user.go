package models

import "time"

type User struct {
	ID        string
	Login     string
	Name      *string
	Role      string
	Password  string
	CreatedAt time.Time
}
