import { useState } from "react";
import { createPortal } from "react-dom";

export interface SetUnifiedLectureLinkPayload {
  groupName: string;
  url: string;
}

interface SetUnifiedLectureLinkModalProps {
  onClose: () => void;
  onSubmit: (payload: SetUnifiedLectureLinkPayload) => void;
}

export default function SetUnifiedLectureLinkModal({
  onClose,
  onSubmit,
}: SetUnifiedLectureLinkModalProps) {
  const [groupName, setGroupName] = useState("");
  const [url, setUrl] = useState("");

  const handleSubmit = () => {
    onSubmit({
      groupName: groupName.slice(0, 50),
      url: url.slice(0, 2048),
    });
  };

  const modal = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl border border-slate-200 max-w-lg w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <p className="text-sm text-slate-700 mb-6">
            Укажите наименование группы, для которой необходимо установить единую
            ссылку для подключения ко всем занятиям.
          </p>

          <div className="space-y-4">
            <div>
              <label
                htmlFor="lectures-setlink-group"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                Название группы
              </label>
              <input
                id="lectures-setlink-group"
                type="text"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value.slice(0, 50))}
                maxLength={50}
                className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 text-slate-900"
                placeholder="Например: CS-01"
              />
              <p className="mt-1 text-xs text-slate-500">{groupName.length}/50</p>
            </div>

            <div>
              <label
                htmlFor="lectures-setlink-url"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                Ссылка
              </label>
              <input
                id="lectures-setlink-url"
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value.slice(0, 2048))}
                maxLength={2048}
                className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 text-slate-900"
                placeholder="https://..."
              />
              <p className="mt-1 text-xs text-slate-500">{url.length}/2048</p>
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

  if (typeof document === "undefined") return null;
  return createPortal(modal, document.body);
}

