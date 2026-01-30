import { useState } from "react";

export interface ExportParams {
  dateFrom: string;
  dateTo: string;
  group: string;
}

interface ScheduleExportModalProps {
  onClose: () => void;
  onSubmit?: (params: ExportParams) => void;
}

export default function ScheduleExportModal({
  onClose,
  onSubmit,
}: ScheduleExportModalProps) {
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [group, setGroup] = useState("");

  const handleSubmit = () => {
    onSubmit?.({ dateFrom, dateTo, group });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-white rounded-lg shadow-xl border border-slate-200 max-w-md w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <h2 className="text-xl font-semibold text-slate-900 mb-6">
            Экспорт расписания
          </h2>

          <div className="space-y-4">
            <div>
              <label
                htmlFor="export-date-from"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                От
              </label>
              <input
                id="export-date-from"
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 text-slate-900"
              />
            </div>

            <div>
              <label
                htmlFor="export-date-to"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                До
              </label>
              <input
                id="export-date-to"
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 text-slate-900"
              />
            </div>

            <div>
              <label
                htmlFor="export-group"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                Группа
              </label>
              <input
                id="export-group"
                type="text"
                value={group}
                onChange={(e) => setGroup(e.target.value.slice(0, 50))}
                maxLength={50}
                className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 text-slate-900"
                placeholder="Введите группу"
              />
              <p className="mt-1 text-xs text-slate-500">{group.length}/50</p>
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
              className="px-4 py-2 text-sm font-medium text-white bg-slate-800 rounded-md hover:bg-slate-700 transition-colors"
            >
              Отправить
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
