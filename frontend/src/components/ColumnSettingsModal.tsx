interface Column {
  key: string;
  label: string;
}

import { useState } from "react";

interface ColumnSettingsModalProps {
  columns: Column[];
  visibleColumns: Set<string>;
  onClose: () => void;
  onSave: (visibleColumns: Set<string>) => void;
}

export default function ColumnSettingsModal({
  columns,
  visibleColumns,
  onClose,
  onSave,
}: ColumnSettingsModalProps) {
  const [selectedColumns, setSelectedColumns] = useState<Set<string>>(
    new Set(visibleColumns)
  );

  const handleToggle = (key: string) => {
    const newSet = new Set(selectedColumns);
    if (newSet.has(key)) {
      newSet.delete(key);
    } else {
      newSet.add(key);
    }
    setSelectedColumns(newSet);
  };

  const handleSave = () => {
    onSave(selectedColumns);
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
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900">
              Настройка колонок
            </h3>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto mb-4">
            {columns.map((column) => (
              <label
                key={column.key}
                className="flex items-center gap-3 px-3 py-2 hover:bg-slate-50 rounded-md cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selectedColumns.has(column.key)}
                  onChange={() => handleToggle(column.key)}
                  className="w-4 h-4 text-slate-800 border-slate-300 rounded focus:ring-slate-500"
                />
                <span className="text-sm text-slate-700">{column.label}</span>
              </label>
            ))}
          </div>

          <div className="flex justify-end gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors"
            >
              Отмена
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 text-sm font-medium text-white bg-slate-800 rounded-md hover:bg-slate-700 transition-colors"
            >
              Сохранить
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
