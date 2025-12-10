package dto

type CreateUserRequest struct {
	Login    string  `json:"login" validate:"required,min=3,max=50"`
	Name     *string `json:"name,omitempty" validate:"omitempty,min=2,max=50"`
	Role     *string `json:"role,omitempty"`
	Password string  `json:"password" validate:"required,min=6"`
}

type UpdateUserRequest struct {
	Login    *string `json:"login,omitempty" validate:"omitempty,min=3,max=50"`
	Name     *string `json:"name,omitempty" validate:"omitempty,min=2,max=50"`
	Role     *string `json:"role,omitempty"`
	Password *string `json:"password,omitempty" validate:"omitempty,min=6"`
}
