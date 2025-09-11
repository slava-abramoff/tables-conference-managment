import { create } from "zustand";
import { api } from "../services/api";

const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  login: async (login, password) => {
    try {
      const response = await api.post("/auth/login", { login, password });
      const { user, accessToken, refreshToken } = response.data;

      // Сохраняем данные в localStorage
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      localStorage.setItem(
        "user",
        JSON.stringify({
          name: user.name,
          login: user.login,
          role: user.role,
        }),
      );

      // Устанавливаем токен в заголовки axios
      api.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;

      set({
        user: {
          name: user.name,
          login: user.login,
          role: user.role,
        },
        isAuthenticated: true,
      });

      return { success: true };
    } catch (error) {
      console.error("Ошибка входа:", error);
      return {
        success: false,
        error: error.response?.data?.message || "Ошибка входа",
      };
    }
  },
  logout: () => {
    // Очищаем localStorage и состояние
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    delete api.defaults.headers.common["Authorization"];
    set({ user: null, isAuthenticated: false });
  },
  refreshToken: async () => {
    try {
      const refreshToken = localStorage.getItem("refreshToken");
      if (!refreshToken) throw new Error("Нет refresh token");

      const response = await api.post("/auth/refresh", { refreshToken });
      const { accessToken, refreshToken: newRefreshToken } = response.data;

      // Обновляем токены
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", newRefreshToken);
      api.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;

      // Обновляем состояние
      const user = JSON.parse(localStorage.getItem("user"));
      set({ user, isAuthenticated: true });

      return { success: true };
    } catch (error) {
      console.error("Ошибка обновления токена:", error);
      set({ user: null, isAuthenticated: false });
      return { success: false };
    }
  },
  initialize: () => {
    // Проверяем наличие токена при инициализации
    const accessToken = localStorage.getItem("accessToken");
    const user = localStorage.getItem("user");
    if (accessToken && user) {
      api.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;
      set({
        user: JSON.parse(user),
        isAuthenticated: true,
      });
    }
  },
}));

export default useAuthStore;
