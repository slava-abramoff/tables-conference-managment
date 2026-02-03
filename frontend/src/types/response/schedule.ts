// Один год с массивом месяцев
export interface YearSchedule {
  year: string;
  months: string[];
}

// Основной ответ API с данными о годах и месяцах
export interface ScheduleYearsResponse {
  data: {
    years: YearSchedule[]; // может быть пустым, т.к. массив пустой [] тоже валиден
  };
}

// Один день в расписании
export interface DaySchedule {
  date: string; // дата в формате "YYYY-MM-DD"
  lectors: string[]; // список лекторов
  groups: string[]; // список групп
  lectureCount: number; // количество лекций в этот день
}

// Ответ API с расписанием по дням
export interface ScheduleDaysResponse {
  data: DaySchedule[]; // может быть пустым []
}
