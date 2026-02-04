import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

interface RoleProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: string[];
  redirectTo?: string;
}

/**
 * Компонент для защиты маршрутов по ролям пользователя.
 * Если роль пользователя не входит в список разрешённых, выполняется редирект.
 */
export default function RoleProtectedRoute({
  children,
  allowedRoles,
  redirectTo = "/",
}: RoleProtectedRouteProps) {
  const { isAuthenticated, user } = useAuth();

  // Если пользователь не авторизован, редирект на главную
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  // Проверяем, есть ли роль пользователя в списке разрешённых
  if (!allowedRoles.includes(user.role)) {
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
}
