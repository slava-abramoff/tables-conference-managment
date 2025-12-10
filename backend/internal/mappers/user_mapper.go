package mappers

import (
	"table-api/internal/domain/user"
	"table-api/internal/handler/dto"
)

func ToUserResponse(u user.UserModel) dto.UserResponse {
	return dto.UserResponse{
		ID:        u.ID,
		Login:     u.Login,
		Name:      u.Name,
		Role:      u.Role,
		Password:  u.Password,
		CreatedAt: u.CreatedAt,
	}
}

func ToUsersResponse(users []user.UserModel) []dto.UserResponse {
	resp := make([]dto.UserResponse, 0, len(users))
	for _, u := range users {
		resp = append(resp, ToUserResponse(u))
	}
	return resp
}
