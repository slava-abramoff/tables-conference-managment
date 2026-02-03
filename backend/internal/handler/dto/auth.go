package dto

type LoginRequest struct {
	Login    string `json:"login"    validate:"required,min=1,max=50,alphanum"`
	Password string `json:"password" validate:"required,min=1,max=72"`
}

type LogoutRequest struct {
	RefreshToken string `json:"refreshToken" validate:"required"`
}

type RefreshRequest struct {
	RefreshToken string `json:"refreshToken" validate:"required"`
}

type TokenResponse struct {
	User         UserInfo `json:"user"`
	AccessToken  string   `json:"accessToken"`
	RefreshToken string   `json:"refreshToken"`
}

type UserInfo struct {
	Login string  `json:"login"`
	Role  string  `json:"role"`
	Name  *string `json:"name"`
}
