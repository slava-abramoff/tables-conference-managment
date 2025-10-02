/*
 * Вернуть в человекочитаемом виде
 */
export function formatComplexDate(dateString: string): string {
  const date = new Date(dateString);

  if (isNaN(date.getTime())) {
    throw new Error('Неверный формат даты');
  }

  return date.toLocaleString('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    weekday: 'long',
  });
}

/**
 * Вернуть дату на русском
 */
export function formatDateToRussian(date: Date): string {
  const day = date.getUTCDate();
  const month = date.getUTCMonth();
  const year = date.getUTCFullYear();

  // Массив названий месяцев
  const months = [
    'января',
    'февраля',
    'марта',
    'апреля',
    'мая',
    'июня',
    'июля',
    'августа',
    'сентября',
    'октября',
    'ноября',
    'декабря',
  ];

  return `${day} ${months[month]} ${year}`;
}

/**
 * Вернуть время или дату
 */
export function formatDateOrTime(
  date: Date | null,
  includeTime: boolean = false
): string | null {
  // Обрабатываем случай, когда date равен null или undefined
  if (!date) {
    return null;
  }

  // Проверяем, что date является валидным объектом Date
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    return null;
  }

  if (!includeTime) {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    return `${day}.${month}.${year}`;
  } else {
    const mskOffset = 3 * 60 * 60 * 1000;
    const mskDate = new Date(date.getTime() + mskOffset);

    const hours = String(mskDate.getUTCHours()).padStart(2, '0');
    const minutes = String(mskDate.getUTCMinutes()).padStart(2, '0');

    return `${hours}:${minutes}`;
  }
}
