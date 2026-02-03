import { useState } from "react";
import { createPortal } from "react-dom";
import { ROLE_OPTIONS as ROLE_OPTIONS_BASE } from "../utils/roleUtils";

export interface CreateUserPayload {
  login: string;
  password: string;
  name: string;
  role: string;
}

const ROLE_OPTIONS = [
  { value: "", label: "— не выбрано —" },
  ...ROLE_OPTIONS_BASE,
];

interface CreateUserModalProps {
  onClose: () => void;
  onSubmit: (payload: CreateUserPayload) => void;
}

export default function CreateUserModal({
  onClose,
  onSubmit,
}: CreateUserModalProps) {
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("");

  const handleSubmit = () => {
    onSubmit({
      login: login.trim().slice(0, 50),
      password: password.slice(0, 50),
      name: name.trim().slice(0, 50),
      role: role.trim(),
    });
    onClose();
  };

  const isValid = login.trim().length > 0 && password.length > 0;

  const modal = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl border border-slate-200 max-w-md w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <h2 className="text-xl font-semibold text-slate-900 mb-6">
            Создать пользователя
          </h2>

          <div className="space-y-4">
            <div>
              <label
                htmlFor="create-user-login"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                Логин <span className="text-red-500">*</span>
              </label>
              <input
                id="create-user-login"
                type="text"
                value={login}
                onChange={(e) => setLogin(e.target.value.slice(0, 50))}
                maxLength={50}
                className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 text-slate-900"
                placeholder="Введите логин"
              />
              <p className="mt-1 text-xs text-slate-500">{login.length}/50</p>
            </div>

            <div>
              <label
                htmlFor="create-user-password"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                Пароль <span className="text-red-500">*</span>
              </label>
              <input
                id="create-user-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value.slice(0, 50))}
                maxLength={50}
                className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 text-slate-900"
                placeholder="Введите пароль"
              />
              <p className="mt-1 text-xs text-slate-500">{password.length}/50</p>
            </div>

            <div>
              <label
                htmlFor="create-user-name"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                Имя
              </label>
              <input
                id="create-user-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value.slice(0, 50))}
                maxLength={50}
                className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 text-slate-900"
                placeholder="Введите имя (необязательно)"
              />
              <p className="mt-1 text-xs text-slate-500">{name.length}/50</p>
            </div>

            <div>
              <label
                htmlFor="create-user-role"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                Роль
              </label>
              <select
                id="create-user-role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 text-slate-900 bg-white"
              >
                {ROLE_OPTIONS.map((opt) => (
                  <option key={opt.value || "empty"} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors"
            >
              Отмена
            </button>
            <button
              onClick={handleSubmit}
              disabled={!isValid}
              className="px-4 py-2 text-sm font-medium text-white bg-slate-800 rounded-md hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Отправить
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  if (typeof document === "undefined") return null;
  return createPortal(modal, document.body);
}
