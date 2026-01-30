import { useState, useEffect, useMemo } from "react";
import EditableCell from "../components/EditableCell";
import EditableSelectCell from "../components/EditableSelectCell";
import ColumnSettingsModal from "../components/ColumnSettingsModal";
import ConfirmDeleteModal from "../components/ConfirmDeleteModal";

interface User {
  id: number;
  login: string;
  password: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY = "users_visible_columns";

const ROLE_OPTIONS = [
  { value: "admin", label: "Админ" },
  { value: "moder", label: "Модер" },
  { value: "viewer", label: "Зритель" },
];

const columns = [
  { key: "id", label: "ID" },
  { key: "login", label: "Логин" },
  { key: "password", label: "Пароль" },
  { key: "role", label: "Роль" },
  { key: "createdAt", label: "Создан" },
  { key: "updatedAt", label: "Обновлен" },
  { key: "actions", label: "Действия" },
];

const PAGE_SIZE = 10;

const generateMockUsers = (): User[] =>
  Array.from({ length: 25 }, (_, i) => ({
    id: i + 1,
    login: `user${i + 1}`,
    password: `password${i + 1}`,
    role: ["admin", "moder", "viewer"][i % 3],
    createdAt: "2026-01-15 10:00",
    updatedAt: "2026-01-20 14:30",
  }));

export default function Users() {
  const [users, setUsers] = useState<User[]>(generateMockUsers());
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(
    new Set(columns.map((col) => col.key))
  );
  const [showSettings, setShowSettings] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const savedColumns = JSON.parse(saved) as string[];
        if (savedColumns.length > 0) {
          setVisibleColumns(new Set(savedColumns));
        }
      } catch (e) {
        console.error("Ошибка загрузки настроек колонок:", e);
      }
    }
  }, []);

  const handleSaveColumnSettings = (newVisibleColumns: Set<string>) => {
    setVisibleColumns(newVisibleColumns);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(newVisibleColumns)));
  };

  const handleCellSave = (userId: number, field: keyof User, value: string) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === userId
          ? { ...u, [field]: value, updatedAt: new Date().toLocaleString("ru-RU") }
          : u
      )
    );
  };

  const handleDelete = (userId: number) => {
    setUsers((prev) => prev.filter((u) => u.id !== userId));
    setDeleteTargetId(null);
  };

  const totalPages = Math.max(1, Math.ceil(users.length / PAGE_SIZE));
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return users.slice(start, start + PAGE_SIZE);
  }, [users, currentPage]);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(1);
  }, [currentPage, totalPages]);

  const visibleColumnsArray = columns.filter((col) => visibleColumns.has(col.key));

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 p-4 lg:p-6">
      <div className="max-w-[calc(100vw-2rem)] mx-auto">
        {/* Тулбар: только шестерёнка */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => setShowSettings(true)}
            className="p-2 text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50"
            aria-label="Настройки колонок"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </button>
        </div>

        {/* Таблица */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                {visibleColumnsArray.map((col) => (
                  <th
                    key={col.key}
                    className="px-4 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider"
                  >
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {paginatedUsers.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50">
                  {visibleColumnsArray.map((column) => {
                    if (column.key === "actions") {
                      return (
                        <td key={column.key} className="px-4 py-3">
                          <button
                            onClick={() => setDeleteTargetId(user.id)}
                            className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                            aria-label="Удалить"
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        </td>
                      );
                    }

                    const value = user[column.key as keyof User] as string;
                    const isDisabled =
                      column.key === "id" ||
                      column.key === "createdAt" ||
                      column.key === "updatedAt";

                    if (column.key === "role") {
                      return (
                        <EditableSelectCell
                          key={column.key}
                          value={value || ""}
                          onSave={(v) => handleCellSave(user.id, "role", v)}
                          options={ROLE_OPTIONS}
                        />
                      );
                    }

                    if (column.key === "login") {
                      return (
                        <EditableCell
                          key={column.key}
                          value={value || ""}
                          onSave={(v) => handleCellSave(user.id, "login", v)}
                          maxLength={50}
                          disabled={isDisabled}
                        />
                      );
                    }

                    if (column.key === "password") {
                      return (
                        <EditableCell
                          key={column.key}
                          value={value || ""}
                          onSave={(v) => handleCellSave(user.id, "password", v)}
                          maxLength={50}
                          type="password"
                          disabled={isDisabled}
                        />
                      );
                    }

                    return (
                      <EditableCell
                        key={column.key}
                        value={value || ""}
                        onSave={(v) => handleCellSave(user.id, column.key as keyof User, v)}
                        disabled={isDisabled}
                      />
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {users.length === 0 && (
          <div className="text-center py-12 text-slate-500">Нет данных для отображения</div>
        )}

        {/* Пагинация */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4 px-1">
            <div className="text-sm text-slate-600">
              Показано {(currentPage - 1) * PAGE_SIZE + 1}–
              {Math.min(currentPage * PAGE_SIZE, users.length)} из {users.length}
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Назад
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 2)
                .reduce<number[]>((acc, p) => {
                  if (acc.length && acc[acc.length - 1] !== p - 1) acc.push(-1);
                  acc.push(p);
                  return acc;
                }, [])
                .map((p) =>
                  p === -1 ? (
                    <span key="ellipsis" className="px-2 text-slate-400">
                      …
                    </span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => setCurrentPage(p)}
                      className={`min-w-[2rem] py-1.5 text-sm font-medium rounded ${
                        currentPage === p
                          ? "bg-slate-800 text-white"
                          : "text-slate-700 bg-white border border-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      {p}
                    </button>
                  )
                )}
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Вперёд
              </button>
            </div>
          </div>
        )}

        {/* Модальное окно подтверждения удаления */}
        {deleteTargetId !== null && (
          <ConfirmDeleteModal
            title="Удалить пользователя?"
            message="Вы уверены, что хотите удалить этого пользователя? Это действие нельзя отменить."
            onConfirm={() => handleDelete(deleteTargetId)}
            onCancel={() => setDeleteTargetId(null)}
          />
        )}

        {showSettings && (
          <ColumnSettingsModal
            columns={columns}
            visibleColumns={visibleColumns}
            onClose={() => setShowSettings(false)}
            onSave={handleSaveColumnSettings}
          />
        )}
      </div>
    </div>
  );
}
