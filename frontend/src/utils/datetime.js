const months = [
  "январь",
  "февраль",
  "март",
  "апрель",
  "май",
  "июнь",
  "июль",
  "август",
  "сентябрь",
  "октябрь",
  "ноябрь",
  "декабрь",
];

const otherMonths = [
  "января",
  "февраля",
  "марта",
  "апреля",
  "мая",
  "июня",
  "июля",
  "августа",
  "сентября",
  "октября",
  "ноября",
  "декабря",
];

export function getCurrentYear() {
  return new Date().getFullYear().toString();
}

export function getCurrentMonth() {
  return months[new Date().getMonth()];
}

export function formatDate(dateString) {
  const [year, month, day] = dateString.split("-").map(Number);

  return `${day} ${otherMonths[month - 1]} ${year}`;
}

export function timeToISO(timeStr) {
  const [hours, minutes] = timeStr.split(":").map(Number);

  // можно взять произвольную дату, например 1970-01-01
  const date = new Date(1970, 0, 1, hours, minutes, 0, 0);

  return date.toISOString();
}

export function dateToISO(dateStr) {
  const date = new Date(dateStr);
  return date.toISOString();
}
