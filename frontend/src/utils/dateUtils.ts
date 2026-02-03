/**
 * Форматирует дату строкой "YYYY-MM-DD" в вид "11 февраля 2026 г." (русская локаль с «г.»).
 */
export function formatDateRuLong(value: string): string {
  if (!value) return "";
  const date = new Date(value + "T12:00:00");
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
