import { useState, useEffect, useCallback } from "react";
import EditableCell from "../components/EditableCell";
import EditableSelectCell from "../components/EditableSelectCell";
import ColumnSettingsModal from "../components/ColumnSettingsModal";
import ConfirmDeleteModal from "../components/ConfirmDeleteModal";
import CreateUserModal from "../components/CreateUserModal.tsx";
import {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
} from "../api/users/users";
import type { UserResponse } from "../types/response/user";
import type { UserUpdateRequest } from "../types/request/user";
import type { Pagination } from "../types/response/pagination";
import { ROLE_OPTIONS } from "../utils/roleUtils";

interface User {
  id: string;
  login: string;
  password: string;
  name: string | null;
  role: string;
  createdAt: string;
}

const STORAGE_KEY = "users_visible_columns";

const columns = [
  { key: "id", label: "ID" },
  { key: "login", label: "Логин" },
  { key: "password", label: "Пароль" },
  { key: "name", label: "Имя" },
  { key: "role", label: "Роль" },
  { key: "createdAt", label: "Создан" },
  { key: "actions", label: "Действия" },
];

const PAGE_SIZE = 10;

function mapUserResponseToUser(r: UserResponse): User {
  return {
    id: r.id,
    login: r.login ?? "",
    password: "",
    name: r.name ?? null,
    role: r.role ?? "",
    createdAt: r.createdAt ?? "",
  };
}

export default function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(
    new Set(columns.map((col) => col.key))
  );
  const [showSettings, setShowSettings] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchUsers = useCallback(() => {
    setLoading(true);
    getUsers({ page: currentPage, limit: PAGE_SIZE })
      .then((res) => {
        setUsers((res.data ?? []).map(mapUserResponseToUser));
        setPagination(res.pagination ?? null);
      })
      .catch(() => {
        setUsers([]);
        setPagination(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [currentPage]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

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

  const handleCellSave = (userId: string, field: keyof User, value: string) => {
    const body: UserUpdateRequest = {};
    if (field === "login") body.login = value;
    else if (field === "password") body.password = value;
    else if (field === "name") body.name = value || null;
    else if (field === "role") body.role = value;
    else return;
    updateUser(userId, body)
      .then((updated) => {
        setUsers((prev) =>
          prev.map((u) =>
            u.id === userId
              ? {
                  ...u,
                  [field]: field === "password" ? "" : value,
                  ...(field === "name" ? { name: value || null } : {}),
                  ...(updated.createdAt ? { createdAt: updated.createdAt } : {}),
                }
              : u
          )
        );
      })
      .catch(() => {});
  };

  const handleDelete = (userId: string) => {
    deleteUser(userId)
      .then(() => {
        setUsers((prev) => prev.filter((u) => u.id !== userId));
        setDeleteTargetId(null);
      })
      .catch(() => {});
  };

  const handleCreateUser = (payload: {
    login: string;
    password: string;
    name: string;
    role: string;
  }) => {
    createUser({
      login: payload.login,
      password: payload.password,
      name: payload.name.trim() || null,
      role: payload.role || undefined,
    })
      .then(() => {
        setShowCreateModal(false);
        fetchUsers();
      })
      .catch(() => {});
  };

  const totalPages = Math.max(1, pagination?.totalPages ?? 1);
  const totalItems = pagination?.totalItems ?? 0;
  const itemsPerPage = pagination?.itemsPerPage ?? PAGE_SIZE;

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) setCurrentPage(1);
  }, [currentPage, totalPages]);

  const visibleColumnsArray = columns.filter((col) => visibleColumns.has(col.key));

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 p-4 lg:p-6">
      <div className="max-w-[calc(100vw-2rem)] mx-auto">
        {/* Тулбар */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 text-sm font-medium text-white bg-slate-800 rounded-md hover:bg-slate-700 transition-colors"
          >
            Создать
          </button>
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
        {loading && users.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-12 text-center text-slate-500">
            Загрузка...
          </div>
        ) : (
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
              {users.map((user) => (
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

                    const rawValue = user[column.key as keyof User];
                    const value =
                      typeof rawValue === "string"
                        ? rawValue
                        : rawValue == null
                          ? ""
                          : String(rawValue);
                    const isDisabled = column.key === "id" || column.key === "createdAt";

                    if (column.key === "role") {
                      return (
                        <EditableSelectCell
                          key={column.key}
                          value={value}
                          onSave={(v) => handleCellSave(user.id, "role", v)}
                          options={ROLE_OPTIONS}
                        />
                      );
                    }

                    if (column.key === "password") {
                      return (
                        <EditableCell
                          key={column.key}
                          value={value}
                          onSave={(v) => handleCellSave(user.id, "password", v)}
                          maxLength={50}
                          type="password"
                          disabled={isDisabled}
                          displayValue={value ? undefined : "—"}
                        />
                      );
                    }

                    if (column.key === "login" || column.key === "name") {
                      return (
                        <EditableCell
                          key={column.key}
                          value={value}
                          onSave={(v) => handleCellSave(user.id, column.key as keyof User, v)}
                          maxLength={50}
                          disabled={isDisabled}
                        />
                      );
                    }

                    return (
                      <EditableCell
                        key={column.key}
                        value={value}
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
        )}

        {!loading && users.length === 0 && (
          <div className="text-center py-12 text-slate-500">Нет данных для отображения</div>
        )}

        {/* Пагинация */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4 px-1">
            <div className="text-sm text-slate-600">
              Показано {(currentPage - 1) * itemsPerPage + 1}–
              {Math.min(currentPage * itemsPerPage, totalItems)} из {totalItems}
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

        {showCreateModal && (
          <CreateUserModal
            onClose={() => setShowCreateModal(false)}
            onSubmit={handleCreateUser}
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
