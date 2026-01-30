import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

interface HeaderProps {
  onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate("/login");
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-40">
      <div className="flex items-center justify-between px-4 h-16">
        {/* Левая часть */}
        <div className="flex items-center gap-4">
          {isAuthenticated && (
            <>
              <button
                onClick={onMenuClick}
                className="p-2 rounded-md hover:bg-slate-100 transition-colors"
                aria-label="Открыть меню"
              >
                <svg
                  className="w-6 h-6 text-slate-700"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
              {user && (
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-white text-sm font-medium">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-slate-900">
                      {user.name}
                    </span>
                    <span className="text-xs text-slate-500">{user.role}</span>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Правая часть */}
        <div className="flex items-center">
          {isAuthenticated ? (
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
            >
              Выйти
            </button>
          ) : (
            <button
              onClick={handleLogin}
              className="px-4 py-2 text-sm font-medium text-white bg-slate-800 hover:bg-slate-700 rounded-md transition-colors"
            >
              Войти
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
