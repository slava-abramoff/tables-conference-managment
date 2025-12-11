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
	Login    string  `json:"login" validate:"required,min=3,max=50"`
	Name     *string `json:"name,omitempty" validate:"min=2,max=50"`
	Role     *string `json:"role,omitempty"`
	Password string  `json:"password" validate:"required,min=6"`
}

type UpdateUserRequest struct {
	Login    *string `json:"login,omitempty" validate:"omitempty,min=3,max=50"`
	Name     *string `json:"name,omitempty" validate:"omitempty,min=2,max=50"`
	Role     *string `json:"role,omitempty"`
	Password *string `json:"password,omitempty" validate:"omitempty,min=6"`
}
