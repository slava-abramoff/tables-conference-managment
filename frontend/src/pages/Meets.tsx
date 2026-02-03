import { useState, useEffect, useMemo, useCallback } from "react";
import EditableCell from "../components/EditableCell";
import EditableSelectCell from "../components/EditableSelectCell";
import ColumnSettingsModal from "../components/ColumnSettingsModal";
import MeetsExportModal from "../components/MeetsExportModal";
import { getMeets, updateMeet } from "../api/meets/meets";
import type { MeetResponse } from "../types/response/meet";
import type { MeetUpdateRequest } from "../types/request/meets";
import type { Pagination } from "../types/response/pagination";
import {
  MEET_STATUS_FILTER_OPTIONS,
  MEET_STATUS_ROW_OPTIONS,
} from "../utils/meetStatusUtils";

interface Meet {
  id: number;
  title: string;
  fullName: string;
  email: string;
  phone: string;
  start: string;
  end: string;
  place: string;
  platform: string;
  equipment: string;
  url: string;
  shortUrl: string;
  status: string;
  notes: string;
  admin: string;
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY = "meets_visible_columns";

const columns = [
  { key: "id", label: "ID" },
  { key: "title", label: "Название" },
  { key: "fullName", label: "ФИО" },
  { key: "email", label: "Почта" },
  { key: "phone", label: "Телефон" },
  { key: "start", label: "Начало" },
  { key: "end", label: "Конец" },
  { key: "place", label: "Место" },
  { key: "platform", label: "Платформа" },
  { key: "equipment", label: "Оборудование" },
  { key: "url", label: "URL" },
  { key: "shortUrl", label: "Короткий URL" },
  { key: "status", label: "Статус" },
  { key: "notes", label: "Примечание" },
  { key: "admin", label: "Админ" },
  { key: "createdAt", label: "Создано" },
  { key: "updatedAt", label: "Обновлено" },
];

type SortDirection = "asc" | "desc" | null;

const PAGE_SIZE = 10;

const API_SORT_FIELDS = [
  "eventName",
  "customerName",
  "email",
  "phone",
  "location",
  "platform",
  "devices",
  "url",
  "shortUrl",
  "status",
  "description",
  "admin",
  "start",
  "end",
  "createdAt",
  "updatedAt",
] as const;

/** Маппинг ключа колонки таблицы в имя поля для сортировки/фильтрации на сервере. */
function tableColumnToApiSortField(columnKey: string): string | undefined {
  const map: Record<string, string> = {
    title: "eventName",
    fullName: "customerName",
    place: "location",
    equipment: "devices",
    notes: "description",
    email: "email",
    phone: "phone",
    platform: "platform",
    url: "url",
    shortUrl: "shortUrl",
    status: "status",
    admin: "admin",
    start: "start",
    end: "end",
    createdAt: "createdAt",
    updatedAt: "updatedAt",
  };
  const api = map[columnKey] ?? columnKey;
  return API_SORT_FIELDS.includes(api as (typeof API_SORT_FIELDS)[number]) ? api : undefined;
}

/**
 * Форматирует значение start/end для отправки на сервер: 2026-01-22T13:00:00+03:00
 */
function formatStartEndForApi(value: string): string {
  if (!value || typeof value !== "string") return value;
  const trimmed = value.trim();
  if (!trimmed) return value;
  if (/[+-]\d{2}:\d{2}$/.test(trimmed) || trimmed.endsWith("Z")) return trimmed;
  const hasSeconds = /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(trimmed);
  const normalized = hasSeconds ? trimmed.slice(0, 19) : trimmed.slice(0, 16) + ":00";
  return `${normalized}+03:00`;
}

/** Маппинг ключа таблицы в ключ тела PATCH (MeetUpdateRequest). */
function tableFieldToApiField(field: keyof Meet): keyof MeetUpdateRequest | null {
  const map: Partial<Record<keyof Meet, keyof MeetUpdateRequest>> = {
    title: "eventName",
    fullName: "customerName",
    place: "location",
    equipment: "devices",
    notes: "description",
    status: "status",
    start: "start",
    end: "end",
    email: "email",
    phone: "phone",
    platform: "platform",
    url: "url",
    shortUrl: "shortUrl",
    admin: "admin",
  };
  if (field === "id" || field === "createdAt" || field === "updatedAt") return null;
  return map[field] ?? (field as keyof MeetUpdateRequest);
}

function mapMeetResponseToMeet(r: MeetResponse): Meet {
  return {
    id: r.id,
    title: r.eventName ?? "",
    fullName: r.customerName ?? "",
    email: r.email ?? "",
    phone: r.phone ?? "",
    start: r.start ?? "",
    end: r.end ?? "",
    place: r.location ?? "",
    platform: r.platform ?? "",
    equipment: r.devices ?? "",
    url: r.url ?? "",
    shortUrl: r.shortUrl ?? "",
    status: r.status ?? "",
    notes: r.description ?? "",
    admin: r.admin ?? "",
    createdAt: r.CreatedAt ?? "",
    updatedAt: r.UpdatedAt ?? "",
  };
}

/** Форматирует строку даты/времени (YYYY-MM-DDTHH:mm или ISO) в человеко-понятный вид для ru. */
function formatDateTime(value: string): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function Meets() {
  const [meets, setMeets] = useState<Meet[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(
    new Set(columns.map((col) => col.key))
  );
  const [showSettings, setShowSettings] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchMeets = useCallback(() => {
    setLoading(true);
    const apiSortBy = sortColumn ? tableColumnToApiSortField(sortColumn) : undefined;
    getMeets({
      page: currentPage,
      limit: PAGE_SIZE,
      status: statusFilter || undefined,
      sortBy: apiSortBy,
      order: sortDirection ?? undefined,
    })
      .then((res) => {
        setMeets((res.data ?? []).map(mapMeetResponseToMeet));
        setPagination(res.pagination ?? null);
      })
      .catch(() => {
        setMeets([]);
        setPagination(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [currentPage, statusFilter, sortColumn, sortDirection]);

  useEffect(() => {
    fetchMeets();
  }, [fetchMeets]);

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

  const handleExportSubmit = (params: { dateFrom: string; dateTo: string }) => {
    console.log("Экспорт конференций:", params);
    // Здесь будет логика экспорта
  };

  const handleCellSave = (meetId: number, field: keyof Meet, value: string) => {
    const apiField = tableFieldToApiField(field);
    if (apiField == null) return;
    const sendValue =
      apiField === "start" || apiField === "end" ? formatStartEndForApi(value) : value;
    const body: MeetUpdateRequest = { [apiField]: sendValue };
    updateMeet(meetId, body)
      .then((updated) => {
        setMeets((prev) =>
          prev.map((m) =>
            m.id === meetId
              ? {
                  ...m,
                  [field]: value,
                  updatedAt: updated.UpdatedAt ?? new Date().toLocaleString("ru-RU"),
                }
              : m
          )
        );
      })
      .catch(() => {
        // Можно показать уведомление об ошибке
      });
  };

  const handleSort = (columnKey: string) => {
    if (sortColumn !== columnKey) {
      setSortColumn(columnKey);
      setSortDirection("asc");
      setCurrentPage(1);
      return;
    }
    if (sortDirection === "asc") {
      setSortDirection("desc");
      setCurrentPage(1);
      return;
    }
    if (sortDirection === "desc") {
      setSortColumn(null);
      setSortDirection(null);
      setCurrentPage(1);
    }
  };

  const filteredBySearchMeets = useMemo(() => {
    if (!search.trim()) return meets;
    const q = search.toLowerCase();
    return meets.filter(
      (m) =>
        m.title.toLowerCase().includes(q) ||
        m.fullName.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q)
    );
  }, [meets, search]);

  const totalPages = Math.max(1, pagination?.totalPages ?? 1);
  const totalItems = pagination?.totalItems ?? 0;
  const itemsPerPage = pagination?.itemsPerPage ?? PAGE_SIZE;

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) setCurrentPage(1);
  }, [currentPage, totalPages]);

  const visibleColumnsArray = columns.filter((col) => visibleColumns.has(col.key));

  const SortIcon = ({ columnKey }: { columnKey: string }) => {
    if (sortColumn !== columnKey) return null;
    return (
      <span className="ml-1 inline-block text-slate-500">
        {sortDirection === "asc" ? "↑" : "↓"}
      </span>
    );
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 p-4 lg:p-6">
      <div className="max-w-[calc(100vw-2rem)] mx-auto">
        {/* Тулбар */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <input
            type="text"
            placeholder="Поиск..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-500 w-48"
          />
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-500 bg-white min-w-[140px]"
          >
            {MEET_STATUS_FILTER_OPTIONS.map((opt) => (
              <option key={opt.value || "all"} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <button
            onClick={() => console.log("Создать")}
            className="px-4 py-2 text-sm font-medium text-white bg-slate-800 rounded-md hover:bg-slate-700"
          >
            Создать
          </button>
          <button
            onClick={() => console.log("Импорт")}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50"
          >
            Импорт
          </button>
          <button
            onClick={() => setShowExportModal(true)}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50"
          >
            Экспорт
          </button>
          <button
            onClick={() => setShowSettings(true)}
            className="p-2 text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50"
            aria-label="Настройки колонок"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>

        {/* Таблица */}
        {loading && meets.length === 0 ? (
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
                    onClick={() => handleSort(col.key)}
                    className="px-4 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider cursor-pointer hover:bg-slate-100 select-none"
                  >
                    {col.label}
                    <SortIcon columnKey={col.key} />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {filteredBySearchMeets.map((meet) => (
                <tr key={meet.id} className="hover:bg-slate-50">
                  {visibleColumnsArray.map((column) => {
                    const value = meet[column.key as keyof Meet] as string;
                    const isDisabled =
                      column.key === "id" ||
                      column.key === "shortUrl" ||
                      column.key === "createdAt" ||
                      column.key === "updatedAt";

                    if (column.key === "shortUrl" && value) {
                      return (
                        <td key={column.key} className="px-4 py-3 text-sm text-slate-600">
                          <a
                            href={value}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 underline"
                          >
                            {value}
                          </a>
                        </td>
                      );
                    }

                    if (column.key === "status") {
                      return (
                        <EditableSelectCell
                          key={column.key}
                          value={value || ""}
                          onSave={(v) => handleCellSave(meet.id, "status", v)}
                          options={MEET_STATUS_ROW_OPTIONS}
                        />
                      );
                    }

                    if (column.key === "phone") {
                      return (
                        <EditableCell
                          key={column.key}
                          value={value || ""}
                          onSave={(v) => {
                            const digits = v.replace(/\D/g, "").slice(0, 11);
                            handleCellSave(meet.id, "phone", digits);
                          }}
                          maxLength={11}
                          disabled={isDisabled}
                        />
                      );
                    }

                    const maxLength =
                      column.key === "title" || column.key === "equipment"
                        ? 70
                        : column.key === "fullName" ||
                          column.key === "email" ||
                          column.key === "place" ||
                          column.key === "platform" ||
                          column.key === "admin"
                        ? 50
                        : column.key === "url"
                        ? 2048
                        : column.key === "notes"
                        ? 150
                        : undefined;

                    const type =
                      column.key === "start" || column.key === "end"
                        ? "datetime-local"
                        : "text";

                    const displayValue =
                      column.key === "start" || column.key === "end"
                        ? formatDateTime(value || "")
                        : undefined;

                    return (
                      <EditableCell
                        key={column.key}
                        value={value || ""}
                        onSave={(v) => handleCellSave(meet.id, column.key as keyof Meet, v)}
                        maxLength={maxLength}
                        type={type}
                        disabled={isDisabled}
                        displayValue={displayValue}
                      />
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        )}

        {!loading && meets.length === 0 && (
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

        {showExportModal && (
          <MeetsExportModal
            onClose={() => setShowExportModal(false)}
            onSubmit={handleExportSubmit}
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
