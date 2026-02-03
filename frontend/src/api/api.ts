import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from "axios";
import type { AuthResponse } from "../types/response/auth";

declare module "axios" {
  interface InternalAxiosRequestConfig {
    _retry?: boolean;
  }
}

const baseURL = import.meta.env.VITE_API_URL ?? "http://localhost:8080/api";

/** Ключи для хранения токенов (используй при сохранении после login/refresh) */
export const ACCESS_TOKEN_KEY = "accessToken";
export const REFRESH_TOKEN_KEY = "refreshToken";

const isAuthEndpoint = (url?: string) =>
  url != null && (url.includes("/auth/login") || url.includes("/auth/refresh"));

let refreshPromise: Promise<AuthResponse | null> | null = null;

export const api: AxiosInstance = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (isAuthEndpoint(config.url)) return config;
  const token = localStorage.getItem(ACCESS_TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }
    if (isAuthEndpoint(originalRequest.url)) {
      return Promise.reject(error);
    }

    if (!refreshPromise) {
      const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
      if (!refreshToken) {
        clearTokensAndRedirect();
        return Promise.reject(error);
      }
      refreshPromise = api
        .post<AuthResponse>("/auth/refresh", { refreshToken })
        .then((res) => {
          const data = res.data;
          localStorage.setItem(ACCESS_TOKEN_KEY, data.accessToken);
          localStorage.setItem(REFRESH_TOKEN_KEY, data.refreshToken);
          return data;
        })
        .catch(() => {
          clearTokensAndRedirect();
          return null;
        })
        .finally(() => {
          refreshPromise = null;
        });
    }

    const data = await refreshPromise;
    if (!data) return Promise.reject(error);

    originalRequest._retry = true;
    originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
    return api(originalRequest);
  }
);

function clearTokensAndRedirect() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  window.location.href = "/login";
}

export default api;
