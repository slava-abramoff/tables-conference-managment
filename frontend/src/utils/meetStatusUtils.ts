/** Значения статуса на сервере */
export const MEET_STATUS_API = {
  NEW: "new",
  ACTIVE: "active",
  COMPLETED: "completed",
  CANCELED: "canceled",
} as const;

export type MeetStatusApi = (typeof MEET_STATUS_API)[keyof typeof MEET_STATUS_API];

/** Подписи для строк таблицы (одна встреча) */
const API_TO_ROW: Record<string, string> = {
  [MEET_STATUS_API.NEW]: "Новая",
  [MEET_STATUS_API.ACTIVE]: "Состоится",
  [MEET_STATUS_API.COMPLETED]: "Прошедшая",
  [MEET_STATUS_API.CANCELED]: "Отклонена",
};

/** Подписи для фильтра (множественное) */
export const MEET_STATUS_FILTER_OPTIONS: { value: string; label: string }[] = [
  { value: "", label: "Все" },
  { value: MEET_STATUS_API.NEW, label: "Новые" },
  { value: MEET_STATUS_API.ACTIVE, label: "Состоятся" },
  { value: MEET_STATUS_API.COMPLETED, label: "Прошедшие" },
  { value: MEET_STATUS_API.CANCELED, label: "Отклоненные" },
];

/** Варианты для ячейки статуса в таблице (одна встреча) */
export const MEET_STATUS_ROW_OPTIONS: { value: string; label: string }[] = [
  { value: MEET_STATUS_API.NEW, label: "Новая" },
  { value: MEET_STATUS_API.ACTIVE, label: "Состоится" },
  { value: MEET_STATUS_API.COMPLETED, label: "Прошедшая" },
  { value: MEET_STATUS_API.CANCELED, label: "Отклонена" },
];

/**
 * Серверный статус → подпись для строки таблицы.
 * Если значение с сервера неизвестно, возвращается как есть.
 */
export function meetStatusApiToRow(apiStatus: string): string {
  return API_TO_ROW[apiStatus] ?? apiStatus;
}

/**
 * Подпись из таблицы/фильтра (или уже API-значение) → значение для сервера.
 * Если передан уже API-значение (new, active, completed, canceled), возвращается он.
 * Иначе по обратному маппингу (Новая → new и т.д.).
 */
export function meetStatusRowToApi(rowOrApiStatus: string): string {
  const reverse: Record<string, string> = {
    Новая: MEET_STATUS_API.NEW,
    Состоится: MEET_STATUS_API.ACTIVE,
    Прошедшая: MEET_STATUS_API.COMPLETED,
    Отклонена: MEET_STATUS_API.CANCELED,
  };
  return reverse[rowOrApiStatus] ?? rowOrApiStatus;
}
