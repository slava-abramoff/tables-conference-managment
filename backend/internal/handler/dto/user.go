package dto

import "time"

type UserResponse struct {
	ID        string    `json:"id"`
	Login     string    `json:"login"`
	Name      *string   `json:"name"`
	Role      string    `json:"role"`
	Password  string    `json:"password"`
	CreatedAt time.Time `json:"createdAt"`
}

type CreateUserRequest struct {
	Login    string  `json:"login"    validate:"required,min=3,max=50,alphanum"`
	Name     *string `json:"name,omitempty"    validate:"omitempty,min=2,max=100"`
	Role     *string `json:"role,omitempty"    validate:"omitempty,oneof=admin editor viewer manager"`
	Password string  `json:"password" validate:"required,min=6,max=72"` // 72 — разумный лимит для bcrypt
}

type UpdateUserRequest struct {
	Login    *string `json:"login,omitempty"    validate:"omitempty,min=3,max=50,alphanum"`
	Name     *string `json:"name,omitempty"     validate:"omitempty,min=2,max=100"`
	Role     *string `json:"role,omitempty"     validate:"omitempty,oneof=admin moderator viewer"`
	Password *string `json:"password,omitempty" validate:"omitempty,min=6,max=72"`
}
