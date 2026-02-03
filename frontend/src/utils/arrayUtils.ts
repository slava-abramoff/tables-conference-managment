/**
 * Возвращает массив с уникальными строками (без дубликатов).
 * Порядок первого вхождения сохраняется.
 */
export function uniqueStrings(arr: string[]): string[] {
  return [...new Set(arr)];
}
