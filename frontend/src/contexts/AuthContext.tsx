import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import type { UserInfo } from "../types/response/auth";
import type { AuthResponse } from "../types/response/auth";
import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY } from "../api/api";
import * as authApi from "../api/auth/auth";

interface AuthContextType {
  isAuthenticated: boolean;
  user: UserInfo | null;
  login: (authData: AuthResponse) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USER_STORAGE_KEY = "user";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<UserInfo | null>(null);

  useEffect(() => {
    const token = localStorage.getItem(ACCESS_TOKEN_KEY);
    const storedUser = localStorage.getItem(USER_STORAGE_KEY);
    if (token && storedUser) {
      setIsAuthenticated(true);
      setUser(JSON.parse(storedUser) as UserInfo);
    }
  }, []);

  const login = (authData: AuthResponse) => {
    localStorage.setItem(ACCESS_TOKEN_KEY, authData.accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, authData.refreshToken);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(authData.user));
    setUser(authData.user);
    setIsAuthenticated(true);
  };

  const logout = () => {
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
    if (refreshToken) {
      authApi.logout({ refreshToken }).catch(() => {});
    }
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
