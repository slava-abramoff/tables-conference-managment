import type { LoginRequest, LogoutRequest, RefreshRequest } from "../../types/request/auth"
import type { AuthResponse } from "../../types/response/auth"
import api from "../api"

export const login = async (body: LoginRequest): Promise<AuthResponse> => {
  const { data } = await api.post<AuthResponse>("/auth/login", body)
  return data
}

export const refresh = async (body: RefreshRequest): Promise<AuthResponse> => {
    const { data } = await api.post<AuthResponse>("/auth/refresh", body)
    return data
}

export const logout = async (body: LogoutRequest): Promise<void> => {
  await api.post("/auth/logout", body);
};
