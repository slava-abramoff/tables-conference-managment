package dto

type LoginRequest struct {
	Login    string `json:"login"    validate:"required,min=3,max=50,alphanum"`
	Password string `json:"password" validate:"required,min=6,max=72"`
}

type LogoutRequest struct {
	RefreshToken string `json:"refreshToken" validate:"required"`
}

type RefreshRequest struct {
	RefreshToken string `json:"refreshToken" validate:"required"`
}

type TokenResponse struct {
	User         UserResponse `json:"user"`
	AccessToken  string       `json:"accessToken"`
	RefreshToken string       `json:"refreshToken"`
}
