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

export function getCurrentYear() {
  return new Date().getFullYear().toString();
}

export function getCurrentMonth() {
  return months[new Date().getMonth()];
}

export function formatDate(dateString) {
  const [year, month, day] = dateString.split("-").map(Number);

  return `${day} ${months[month - 1]} ${year}`;
}
