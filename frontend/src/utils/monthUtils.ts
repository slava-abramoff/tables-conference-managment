const MONTHS_RU = [
  "январь", "февраль", "март", "апрель", "май", "июнь",
  "июль", "август", "сентябрь", "октябрь", "ноябрь", "декабрь",
] as const;

const MONTHS_EN = [
  "january", "february", "march", "april", "may", "june",
  "july", "august", "september", "october", "november", "december",
] as const;

const MONTHS_EN_TO_RU: Record<string, string> = Object.fromEntries(
  MONTHS_EN.map((en, i) => [en, MONTHS_RU[i]])
);

/** Нормализует название месяца к нижнему регистру для поиска */
function normalizeMonth(month: string): string {
  return month.trim().toLowerCase();
}

/**
 * Преобразует английское название месяца в русское.
 * Принимает полное название (например, "February") или число месяца "1"-"12".
 * Если месяц уже русский или не найден — возвращает исходную строку.
 */
export function englishToRussianMonth(month: string): string {
  const normalized = normalizeMonth(month);
  const enEntry = MONTHS_EN.find((en) => en === normalized);
  if (enEntry) return MONTHS_RU[MONTHS_EN.indexOf(enEntry)];
  const num = parseInt(month, 10);
  if (!Number.isNaN(num) && num >= 1 && num <= 12) return MONTHS_RU[num - 1];
  return month;
}

/**
 * Преобразует название месяца (русское или английское) или число в строку вида "01"-"12".
 * Примеры: "Февраль" -> "02", "February" -> "02", "2" -> "02", "февраль" -> "02".
 */
export function monthToTwoDigits(month: string): string {
  const normalized = normalizeMonth(month);
  const ruIndex = MONTHS_RU.findIndex((ru) => ru === normalized);
  if (ruIndex >= 0) return String(ruIndex + 1).padStart(2, "0");
  const enIndex = MONTHS_EN.findIndex((en) => en === normalized);
  if (enIndex >= 0) return String(enIndex + 1).padStart(2, "0");
  const num = parseInt(month, 10);
  if (!Number.isNaN(num) && num >= 1 && num <= 12) {
    return String(num).padStart(2, "0");
  }
  return "";
}
