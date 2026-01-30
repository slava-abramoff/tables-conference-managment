import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ScheduleCard from "../components/ScheduleCard";
import SchedulePlanningModal from "../components/SchedulePlanningModal";
import ScheduleExportModal from "../components/ScheduleExportModal";

// Моковые данные
const mockYears = ["2025", "2026"];
const mockMonths = [
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

// Моковые данные для карточек
const generateMockCards = () => {
  const cards = [];
  const lecturers = [
    ["Иванова И.И.", "Петрова А.И."],
    ["Сидоров В.В."],
    ["Козлова М.П.", "Новикова Е.С.", "Морозов Д.А."],
    ["Волкова О.Н."],
  ];
  const groups = [
    ["CS-01", "CS-02"],
    ["CS-03"],
    ["CS-01", "CS-02", "CS-03"],
    ["CS-04"],
  ];
  
  const dates = [
    "25 февраля 2026",
    "26 февраля 2026",
    "27 февраля 2026",
    "1 марта 2026",
    "2 марта 2026",
    "3 марта 2026",
    "4 марта 2026",
    "5 марта 2026",
    "8 марта 2026",
    "9 марта 2026",
    "10 марта 2026",
    "11 марта 2026",
    "12 марта 2026",
    "15 марта 2026",
    "16 марта 2026",
    "17 марта 2026",
    "18 марта 2026",
    "19 марта 2026",
    "22 марта 2026",
    "23 марта 2026",
    "24 марта 2026",
    "25 марта 2026",
    "26 марта 2026",
    "29 марта 2026",
    "30 марта 2026",
    "31 марта 2026",
  ];

  for (let i = 0; i < Math.min(26, dates.length); i++) {
    cards.push({
      date: dates[i],
      lecturers: lecturers[i % lecturers.length],
      groups: groups[i % groups.length],
      lessonsCount: Math.floor(Math.random() * 3) + 1,
    });
  }

  return cards;
};

export default function Schedule() {
  const navigate = useNavigate();
  const [selectedYear, setSelectedYear] = useState("2026");
  const [selectedMonth, setSelectedMonth] = useState("февраль");
  const [cards] = useState(generateMockCards());
  const [showPlanningModal, setShowPlanningModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);

  const handleExport = () => {
    setShowExportModal(true);
  };

  const handleExportSubmit = (params: { dateFrom: string; dateTo: string; group: string }) => {
    console.log("Экспорт расписания:", params);
    // Здесь будет логика экспорта
  };

  const handleSchedule = () => {
    setShowPlanningModal(true);
  };

  const handlePlanningSubmit = (rows: { id: number; date: string; start: string; end: string; group: string; lecturer: string; platform: string; building: string; place: string; comment: string }[]) => {
    console.log("Отправка планирования:", rows);
    // Здесь будет логика отправки на сервер
  };

  const handleCardClick = (date: string) => {
    console.log("Клик по карточке:", date);
    navigate("/lectures");
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 p-4 lg:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Заголовок страницы */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-slate-900">Расписание лекций</h1>
        </div>

        {/* Тулбар */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            {/* Год */}
            <div className="flex items-center gap-2">
              <label htmlFor="year" className="text-sm font-medium text-slate-700">
                Год:
              </label>
              <select
                id="year"
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 text-slate-900 bg-white min-w-[100px]"
              >
                {mockYears.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>

            {/* Месяц */}
            <div className="flex items-center gap-2">
              <label htmlFor="month" className="text-sm font-medium text-slate-700">
                Месяц:
              </label>
              <select
                id="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 text-slate-900 bg-white min-w-[150px]"
              >
                {mockMonths.map((month) => (
                  <option key={month} value={month}>
                    {month}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex-1" />

            {/* Кнопки */}
            <button
              onClick={() => console.log("Импорт")}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors"
            >
              Импорт
            </button>
            <button
              onClick={handleExport}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors"
            >
              Экспорт
            </button>
            <button
              onClick={handleSchedule}
              className="px-4 py-2 text-sm font-medium text-white bg-slate-800 rounded-md hover:bg-slate-700 transition-colors"
            >
              Запланировать
            </button>
          </div>
        </div>

        {showPlanningModal && (
          <SchedulePlanningModal
            onClose={() => setShowPlanningModal(false)}
            onSubmit={handlePlanningSubmit}
          />
        )}

        {showExportModal && (
          <ScheduleExportModal
            onClose={() => setShowExportModal(false)}
            onSubmit={handleExportSubmit}
          />
        )}

        {/* Календарь из карточек */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {cards.map((card, index) => (
            <ScheduleCard
              key={index}
              date={card.date}
              lecturers={card.lecturers}
              groups={card.groups}
              lessonsCount={card.lessonsCount}
              onClick={() => handleCardClick(card.date)}
            />
          ))}
        </div>

        {cards.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            Нет запланированных лекций на выбранный период
          </div>
        )}
      </div>
    </div>
  );
}
