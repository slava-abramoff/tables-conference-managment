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
  console.log(timeStr);
  const [hours, minutes] = timeStr.split(":").map(Number);

  const now = new Date();
  now.setHours(hours, minutes, 0, 0);

  console.log(now.toISOString());
  return now.toISOString();
}

export function dateToISO(dateStr) {
  const date = new Date(dateStr);
  return date.toISOString();
}
