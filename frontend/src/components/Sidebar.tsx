import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { ROLE_API } from "../utils/roleUtils";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface MenuItem {
  path: string;
  label: string;
  icon: string;
  requiredRole?: string;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const location = useLocation();
  const { user } = useAuth();

  const menuItems: MenuItem[] = [
    { path: "/", label: "Заявка на конференцию", icon: "📅" },
    { path: "/schedule", label: "Лекции", icon: "📚" },
    { path: "/meets", label: "Конференции", icon: "🎯" },
    { path: "/users", label: "Пользователи", icon: "👤", requiredRole: ROLE_API.ADMIN },
  ];

  // Фильтруем пункты меню по роли пользователя
  const visibleMenuItems = menuItems.filter((item) => {
    if (item.requiredRole) {
      return user?.role === item.requiredRole;
    }
    return true;
  });

  return (
    <>
      {/* Overlay - только на мобильных */}
      {isOpen && (
        <div
          className="fixed top-16 left-0 right-0 bottom-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-16 left-0 h-[calc(100vh-4rem)] bg-white border-r border-slate-200 shadow-lg z-50 w-64 transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-4">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-slate-900">Навигация</h2>
          </div>
          <nav className="space-y-1">
            {visibleMenuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={`flex items-center gap-3 px-4 py-3 rounded-md transition-colors ${
                    isActive
                      ? "bg-slate-800 text-white"
                      : "text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>
    </>
  );
}
