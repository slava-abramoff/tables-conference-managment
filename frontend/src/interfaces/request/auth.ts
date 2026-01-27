// --- Запрос на логин ---
export interface LoginRequest {
  login: string;
  password: string;
}

// --- Запрос на refresh token ---
export interface RefreshRequest {
  refreshToken: string;
}

// --- Запрос на logout ---
export interface LogoutRequest {
  refreshToken: string;
}
