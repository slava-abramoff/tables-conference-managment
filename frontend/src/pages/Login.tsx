import { useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loginValue, setLoginValue] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    // Заглушка: авторизуем пользователя
    console.log("Login attempt:", { login: loginValue, password });
    // Устанавливаем авторизацию (заглушка - всегда "Ivanov, admin")
    login("Ivanov", "admin");
    navigate("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-lg border border-slate-200 overflow-hidden">
          {/* Заголовок блока в стиле CRM */}
          <div className="bg-slate-800 px-6 py-4">
            <h1 className="text-xl font-semibold text-white tracking-tight">
              CRM — Расписания и мероприятия
            </h1>
            <p className="text-slate-300 text-sm mt-0.5">
              Войдите в систему
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label
                htmlFor="login"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                Логин
              </label>
              <input
                id="login"
                type="text"
                value={loginValue}
                onChange={(e) => setLoginValue(e.target.value)}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 text-slate-900"
                placeholder="Введите логин"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                Пароль
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 text-slate-900"
                placeholder="Введите пароль"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
            >
              Отправить
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
