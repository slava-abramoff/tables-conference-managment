interface ErrorMessageProps {
  message?: string;
  onClose?: () => void;
}

export default function ErrorMessage({ 
  message = "Произошла ошибка при отправке заявки. Попробуйте позже.", 
  onClose 
}: ErrorMessageProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" role="dialog" aria-modal="true">
      <div className="bg-white rounded-lg shadow-xl border border-slate-200 max-w-md w-full mx-4">
        <div className="p-6">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg
                className="h-6 w-6 text-red-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="ml-3 flex-1">
              <h3 className="text-lg font-medium text-slate-900">
                Ошибка
              </h3>
              <p className="mt-1 text-sm text-slate-600">{message}</p>
            </div>
            {onClose && (
              <button
                onClick={onClose}
                className="ml-4 text-slate-400 hover:text-slate-600"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          {onClose && (
            <div className="mt-4 flex justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium rounded-md transition-colors"
              >
                Закрыть
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
