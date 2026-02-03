import { useState } from "react";
import { createPortal } from "react-dom";

export interface MeetsExportParams {
  dateFrom: string;
  dateTo: string;
}

interface MeetsExportModalProps {
  onClose: () => void;
  onSubmit?: (params: MeetsExportParams) => void;
}

export default function MeetsExportModal({
  onClose,
  onSubmit,
}: MeetsExportModalProps) {
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const handleSubmit = () => {
    onSubmit?.({ dateFrom, dateTo });
    onClose();
  };

  const modalContent = (
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
            Экспорт конференций
          </h2>

          <div className="space-y-4">
            <div>
              <label
                htmlFor="meets-export-date-from"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                От
              </label>
              <input
                id="meets-export-date-from"
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 text-slate-900"
              />
            </div>

            <div>
              <label
                htmlFor="meets-export-date-to"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                До
              </label>
              <input
                id="meets-export-date-to"
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 text-slate-900"
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-2">
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
    </div>
  );

  if (typeof document === "undefined") return null;
  return createPortal(modalContent, document.body);
}
