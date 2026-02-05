import { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import EditableCell from "../components/EditableCell";
import ColumnSettingsModal from "../components/ColumnSettingsModal";
import ConfirmDeleteModal from "../components/ConfirmDeleteModal";
import SetUnifiedLectureLinkModal from "../components/SetUnifiedLectureLinkModal.tsx";
import { formatDateRuLong } from "../utils/dateUtils";
import {
  getLecturesByDate,
  createLecture,
  updateLecturesLink,
  updateLecture,
  deleteLecture,
} from "../api/lectures/lectures";
import type { LectureResponse } from "../types/response/lecture";
import type { LectureUpdateRequest } from "../types/request/lecture";
import { baseURL } from "../api/api.ts";

interface Lecture {
  id: number;
  date: string;
  lecturer: string;
  group: string;
  platform: string;
  building: string;
  place: string;
  url: string;
  shortUrl: string;
  stream: string;
  description: string;
  admin: string;
  start: string;
  end: string;
  customTime: string;
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY = "lectures_visible_columns";
const url = baseURL.replace("/api", "/l/");

const columns = [
  { key: "id", label: "ID" },
  { key: "start", label: "Начало" },
  { key: "end", label: "Конец" },
  { key: "group", label: "Группа" },
  { key: "lecturer", label: "Лектор" },
  { key: "platform", label: "Платформа" },
  { key: "building", label: "Корпус" },
  { key: "place", label: "Место" },
  { key: "url", label: "URL" },
  { key: "shortUrl", label: "Короткий URL" },
  { key: "stream", label: "Поток" },
  { key: "description", label: "Описание" },
  { key: "admin", label: "Админ" },
  { key: "customTime", label: "Нестандартное время" },
  { key: "createdAt", label: "Создано" },
  { key: "updatedAt", label: "Обновлено" },
  { key: "actions", label: "Действия" },
];

const POLL_INTERVAL_MS = 2 * 60 * 1000; // 2 минуты

/** Маппинг ключа таблицы в ключ тела PATCH (LectureUpdateRequest). */
function tableFieldToApiField(
  field: keyof Lecture,
): keyof LectureUpdateRequest | null {
  const map: Partial<Record<keyof Lecture, keyof LectureUpdateRequest>> = {
    lecturer: "lector",
    building: "unit",
    place: "location",
    stream: "streamKey",
    customTime: "abnormalTime",
    group: "group",
    platform: "platform",
    url: "url",
    shortUrl: "shortUrl",
    description: "description",
    admin: "admin",
    start: "start",
    end: "end",
  };
  return (
    map[field] ??
    (field === "id" || field === "createdAt" || field === "updatedAt"
      ? null
      : (field as keyof LectureUpdateRequest))
  );
}

function mapLectureResponseToLecture(r: LectureResponse): Lecture {
  return {
    id: r.id,
    date: r.date ?? "",
    lecturer: r.lector ?? "",
    group: r.group ?? "",
    platform: r.platform ?? "",
    building: r.unit ?? "",
    place: r.location ?? "",
    url: r.url ?? "",
    shortUrl: r.shortUrl ?? "",
    stream: r.streamKey ?? "",
    description: r.description ?? "",
    admin: r.admin ?? "",
    start: r.start ?? "",
    end: r.end ?? "",
    customTime: r.abnormalTime ?? "",
    createdAt: r.createdAt ?? "",
    updatedAt: r.updatedAt ?? "",
  };
}

export default function Lectures() {
  const { date } = useParams<{ date: string }>();
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [loading, setLoading] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(
    new Set(columns.map((col) => col.key)),
  );
  const [showSettings, setShowSettings] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const [showSetLinkModal, setShowSetLinkModal] = useState(false);

  const ruDate = date ? formatDateRuLong(date) : "";

  const fetchLectures = useCallback(() => {
    if (!date) return;
    setLoading(true);
    getLecturesByDate(date)
      .then((list) => {
        setLectures(
          Array.isArray(list) ? list.map(mapLectureResponseToLecture) : [],
        );
      })
      .catch(() => {
        setLectures([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [date]);

  useEffect(() => {
    fetchLectures();
    if (!date) return;
    const intervalId = setInterval(fetchLectures, POLL_INTERVAL_MS);
    return () => clearInterval(intervalId);
  }, [date, fetchLectures]);

  useEffect(() => {
    // Загружаем сохраненные настройки из localStorage
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const savedColumns = JSON.parse(saved);
        setVisibleColumns(new Set(savedColumns));
      } catch (e) {
        console.error("Ошибка загрузки настроек колонок:", e);
      }
    }
  }, []);

  const handleSaveColumnSettings = (newVisibleColumns: Set<string>) => {
    setVisibleColumns(newVisibleColumns);
    // Сохраняем в localStorage
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(Array.from(newVisibleColumns)),
    );
  };

  const handleCellSave = (
    lectureId: number,
    field: keyof Lecture,
    value: string,
  ) => {
    const apiField = tableFieldToApiField(field);
    if (apiField == null) return;
    const body: LectureUpdateRequest = { [apiField]: value };
    updateLecture(lectureId, body)
      .then((updated) => {
        setLectures((prev) =>
          prev.map((lecture) =>
            lecture.id === lectureId
              ? {
                  ...lecture,
                  [field]: value,
                  updatedAt:
                    updated.updatedAt ?? new Date().toLocaleString("ru-RU"),
                }
              : lecture,
          ),
        );
      })
      .catch(() => {
        // Можно показать уведомление об ошибке
      });
  };

  const handleDelete = (lectureId: number) => {
    deleteLecture(lectureId)
      .then(() => {
        setLectures((prev) =>
          prev.filter((lecture) => lecture.id !== lectureId),
        );
        setDeleteTargetId(null);
      })
      .catch(() => {
        // Можно показать уведомление об ошибке
      });
  };

  const handleAddLecture = () => {
    const dateToUse = lectures[0]?.date ?? date ?? "";
    if (!dateToUse) return;
    createLecture({ date: dateToUse })
      .then((created) => {
        setLectures((prev) => [mapLectureResponseToLecture(created), ...prev]);
      })
      .catch(() => {
        // Можно показать уведомление об ошибке
      });
  };

  const handleSetLink = () => {
    setShowSetLinkModal(true);
  };

  const visibleColumnsArray = columns.filter((col) =>
    visibleColumns.has(col.key),
  );

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 p-4 lg:p-6">
      <div className="max-w-[calc(100vw-2rem)] mx-auto">
        {/* Заголовок с датой */}
        {date && (
          <div className="mb-4">
            <h1 className="text-2xl font-semibold text-slate-900">
              Лекции на {ruDate}
            </h1>
          </div>
        )}
        {/* Кнопки вверху */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={handleAddLecture}
            className="px-4 py-2 text-sm font-medium text-white bg-slate-800 rounded-md hover:bg-slate-700 transition-colors"
          >
            Добавить лекцию
          </button>
          <button
            onClick={handleSetLink}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors"
          >
            Установить ссылку
          </button>
          <button
            onClick={() => setShowSettings(true)}
            className="p-2 text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors"
            aria-label="Настройки колонок"
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
        {loading && lectures.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-12 text-center text-slate-500">
            Загрузка лекций...
          </div>
        ) : !date ? (
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-12 text-center text-slate-500">
            Укажите дату в адресе страницы
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  {visibleColumnsArray.map((column) => (
                    <th
                      key={column.key}
                      className="px-4 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider"
                    >
                      {column.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {lectures.map((lecture) => (
                  <tr key={lecture.id} className="hover:bg-slate-50">
                    {visibleColumnsArray.map((column) => {
                      if (column.key === "actions") {
                        return (
                          <td key={column.key} className="px-4 py-3">
                            <button
                              onClick={() => setDeleteTargetId(lecture.id)}
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

                      const value = lecture[
                        column.key as keyof Lecture
                      ] as string;
                      const isDisabled =
                        column.key === "id" ||
                        column.key === "shortUrl" ||
                        column.key === "createdAt" ||
                        column.key === "updatedAt";

                      if (column.key === "shortUrl" && value) {
                        return (
                          <td
                            key={column.key}
                            className="px-4 py-3 text-sm text-slate-600"
                          >
                            <a
                              href={url + value}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 underline"
                            >
                              {url + value}
                            </a>
                          </td>
                        );
                      }

                      return (
                        <EditableCell
                          key={column.key}
                          value={value || ""}
                          onSave={(newValue) =>
                            handleCellSave(
                              lecture.id,
                              column.key as keyof Lecture,
                              newValue,
                            )
                          }
                          maxLength={
                            column.key === "lecturer" || column.key === "group"
                              ? 70
                              : column.key === "platform" ||
                                  column.key === "building" ||
                                  column.key === "place" ||
                                  column.key === "admin" ||
                                  column.key === "customTime"
                                ? 50
                                : column.key === "url" ||
                                    column.key === "stream"
                                  ? 2048
                                  : column.key === "description"
                                    ? 150
                                    : undefined
                          }
                          type={
                            column.key === "start" || column.key === "end"
                              ? "time"
                              : "text"
                          }
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

        {!loading && date && lectures.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            Нет данных для отображения
          </div>
        )}

        {/* Модальное окно подтверждения удаления */}
        {deleteTargetId !== null && (
          <ConfirmDeleteModal
            title="Удалить лекцию?"
            message="Вы уверены, что хотите удалить эту лекцию? Это действие нельзя отменить."
            onConfirm={() => handleDelete(deleteTargetId)}
            onCancel={() => setDeleteTargetId(null)}
          />
        )}

        {showSetLinkModal && (
          <SetUnifiedLectureLinkModal
            onClose={() => setShowSetLinkModal(false)}
            onSubmit={({ groupName, url }) => {
              updateLecturesLink({ groupName, url })
                .then(() => {
                  // После установки ссылки — обновляем данные на странице
                  fetchLectures();
                  setShowSetLinkModal(false);
                })
                .catch(() => {
                  // Можно показать уведомление об ошибке
                });
            }}
          />
        )}

        {/* Модальное окно настроек колонок */}
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
