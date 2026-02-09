package mappers

import (
	"table-api/internal/entities"
	"table-api/internal/handler/dto"
	"table-api/internal/models"
)

func ToUserResponse(u models.User) dto.UserResponse {
	return dto.UserResponse{
		ID:        u.ID.String(),
		Login:     u.Login,
		Name:      u.Name,
		Role:      u.Role,
		Password:  "",
		CreatedAt: u.CreatedAt,
	}
}

func ToUsersResponse(users []*models.User) []dto.UserResponse {
	resp := make([]dto.UserResponse, 0, len(users))
	for _, u := range users {
		resp = append(resp, ToUserResponse(*u))
	}
	return resp
}

func DtoCreateRequestToUser(user dto.CreateUserRequest) entities.User {
	var role string

	if user.Role != nil {
		role = *user.Role
	} else {
		role = "viewer"
	}

	return entities.User{
		Login:    user.Login,
		Name:     user.Name,
		Role:     role,
		Password: user.Password,
	}
}

func UserToModel(user entities.User) models.User {
	return models.User{
		Login:    user.Login,
		Name:     user.Name,
		Role:     user.Role,
		Password: user.Password,
	}
}

func UserToInfo(u models.User) dto.UserInfo {
	return dto.UserInfo{
		Login: u.Login,
		Role:  u.Role,
		Name:  u.Name,
	}
}
