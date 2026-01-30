import { useState } from "react";
import EditableCell from "./EditableCell";

export interface PlanningRow {
  id: number;
  date: string;
  start: string;
  end: string;
  group: string;
  lecturer: string;
  platform: string;
  building: string;
  place: string;
  comment: string;
}

interface SchedulePlanningModalProps {
  onClose: () => void;
  onSubmit?: (rows: PlanningRow[]) => void;
}

let nextId = 1;

/** Форматирует дату (YYYY-MM-DD) в вид "25 февраля 2025" (без "г"). */
function formatDate(value: string): string {
  if (!value) return "";
  const date = new Date(value + "T12:00:00");
  if (Number.isNaN(date.getTime())) return value;
  return date
    .toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })
    .replace(/\s*г\.?\s*$/, "");
}

function createEmptyRow(): PlanningRow {
  return {
    id: nextId++,
    date: "",
    start: "",
    end: "",
    group: "",
    lecturer: "",
    platform: "",
    building: "",
    place: "",
    comment: "",
  };
}

export default function SchedulePlanningModal({
  onClose,
  onSubmit,
}: SchedulePlanningModalProps) {
  const [rows, setRows] = useState<PlanningRow[]>([]);

  const updateRow = (id: number, field: keyof PlanningRow, value: string) => {
    setRows((prev) =>
      prev.map((row) => (row.id === id ? { ...row, [field]: value } : row))
    );
  };

  const addRow = () => {
    setRows((prev) => [...prev, createEmptyRow()]);
  };

  const duplicateRow = (id: number) => {
    const row = rows.find((r) => r.id === id);
    if (!row) return;
    const { id: _, ...rest } = row;
    setRows((prev) => [...prev, { ...rest, id: nextId++ }]);
  };

  const removeRow = (id: number) => {
    setRows((prev) => prev.filter((row) => row.id !== id));
  };

  const handleSubmit = () => {
    onSubmit?.(rows);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-white rounded-lg shadow-xl border border-slate-200 max-w-5xl w-full mx-4 max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-xl font-semibold text-slate-900">
            Планирование действий
          </h2>
        </div>

        <div className="p-6 overflow-x-auto overflow-y-auto flex-1">
          <table className="min-w-full divide-y divide-slate-200 border border-slate-200 rounded-lg">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                  Дата
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                  Начало
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                  Конец
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                  Группа
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                  Лектор
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                  Платформа
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                  Корпус
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                  Место
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                  Комментарий
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider w-24">
                  Действие
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {rows.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50">
                  <EditableCell
                    value={row.date}
                    onSave={(v) => updateRow(row.id, "date", v)}
                    type="date"
                    displayValue={formatDate(row.date)}
                  />
                  <EditableCell
                    value={row.start}
                    onSave={(v) => updateRow(row.id, "start", v)}
                    type="time"
                  />
                  <EditableCell
                    value={row.end}
                    onSave={(v) => updateRow(row.id, "end", v)}
                    type="time"
                  />
                  <EditableCell
                    value={row.group}
                    onSave={(v) => updateRow(row.id, "group", v)}
                    maxLength={50}
                  />
                  <EditableCell
                    value={row.lecturer}
                    onSave={(v) => updateRow(row.id, "lecturer", v)}
                    maxLength={50}
                  />
                  <EditableCell
                    value={row.platform}
                    onSave={(v) => updateRow(row.id, "platform", v)}
                    maxLength={50}
                  />
                  <EditableCell
                    value={row.building}
                    onSave={(v) => updateRow(row.id, "building", v)}
                    maxLength={50}
                  />
                  <EditableCell
                    value={row.place}
                    onSave={(v) => updateRow(row.id, "place", v)}
                    maxLength={50}
                  />
                  <EditableCell
                    value={row.comment}
                    onSave={(v) => updateRow(row.id, "comment", v)}
                    maxLength={150}
                  />
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => duplicateRow(row.id)}
                        className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors"
                        aria-label="Дублировать строку"
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
                            d="M12 4v16m8-8H4"
                          />
                        </svg>
                      </button>
                      <button
                        onClick={() => removeRow(row.id)}
                        className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        aria-label="Удалить строку"
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
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <button
            onClick={addRow}
            type="button"
            className="mt-4 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors"
          >
            Добавить лекцию
          </button>
        </div>

        <div className="p-6 border-t border-slate-200 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors"
          >
            Отменить
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 text-sm font-medium text-white bg-slate-800 rounded-md hover:bg-slate-700 transition-colors"
          >
            Отправить
          </button>
        </div>
      </div>
    </div>
  );
}
