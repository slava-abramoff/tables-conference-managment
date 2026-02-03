export interface UserInfo {
  login: string;
  role: string;
  name?: string | null;
}

export interface AuthResponse {
  user: UserInfo;
  accessToken: string;
  refreshToken: string;
}
