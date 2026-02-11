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

/**
 * Проверяет дату строкой "YYYY-MM-DD" на актуальность, true == сегодняшнее число
 */
export function isToday(dateStr: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return false;
  }

  const [year, month, day] = dateStr.split("-").map(Number);

  const inputDate = new Date(year, month - 1, day);
  const today = new Date();

  return (
    inputDate.getFullYear() === today.getFullYear() &&
    inputDate.getMonth() === today.getMonth() &&
    inputDate.getDate() === today.getDate()
  );
}
