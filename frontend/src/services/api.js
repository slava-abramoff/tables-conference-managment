import axios from "axios";
import useAuthStore from "../store/authStore";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const { refreshToken } = useAuthStore.getState();
      const result = await refreshToken();
      if (result.success) {
        originalRequest.headers["Authorization"] =
          `Bearer ${localStorage.getItem("accessToken")}`;
        return api(originalRequest);
      }
    }
    return Promise.reject(error);
  },
);
