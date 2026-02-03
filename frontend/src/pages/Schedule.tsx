import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ScheduleCard from "../components/ScheduleCard";
import SchedulePlanningModal from "../components/SchedulePlanningModal";
import ScheduleExportModal from "../components/ScheduleExportModal";
import { getAvailableDates, getScheduleDays } from "../api/schedule/schedule";
import { createManyLectures } from "../api/lectures/lectures";
import type { YearSchedule, DaySchedule } from "../types/response/schedule";
import type { LectureCreateRequest } from "../types/request/lecture";
import { englishToRussianMonth, monthToTwoDigits } from "../utils/monthUtils";
import type { PlanningRow } from "../components/SchedulePlanningModal";

function monthToIndex(month: string): number {
  const two = monthToTwoDigits(month);
  return two ? parseInt(two, 10) : 1;
}

function pickDefaultYearAndMonth(years: YearSchedule[]): { year: string; month: string } | null {
  if (years.length === 0) return null;
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  const yearStrings = years.map((y) => y.year);
  const currentYearStr = String(currentYear);
  const pastOrCurrentYears = yearStrings
    .filter((y) => parseInt(y, 10) <= currentYear)
    .sort((a, b) => parseInt(b, 10) - parseInt(a, 10));
  const bestYear =
    yearStrings.includes(currentYearStr)
      ? currentYearStr
      : pastOrCurrentYears[0] ?? yearStrings[0];

  const yearData = years.find((y) => y.year === bestYear);
  if (!yearData || yearData.months.length === 0) return { year: bestYear, month: yearData?.months[0] ?? "" };

  const monthIndices = yearData.months.map((m) => monthToIndex(m));
  const validMonthIndices = monthIndices.filter((i) => i <= currentMonth);
  const bestMonthIndex =
    validMonthIndices.length > 0 ? Math.max(...validMonthIndices) : monthIndices[0];
  const bestMonth =
    yearData.months.find((m) => monthToIndex(m) === bestMonthIndex) ?? yearData.months[0];
  return { year: bestYear, month: bestMonth };
}


export default function Schedule() {
  const navigate = useNavigate();
  const [yearsData, setYearsData] = useState<YearSchedule[]>([]);
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [loading, setLoading] = useState(true);
  const [cards, setCards] = useState<DaySchedule[]>([]);
  const [cardsLoading, setCardsLoading] = useState(false);
  const [showPlanningModal, setShowPlanningModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);

  const availableYears = yearsData.map((y) => y.year);
  const selectedYearData = yearsData.find((y) => y.year === selectedYear);
  const availableMonths = selectedYearData?.months ?? [];

  useEffect(() => {
    getAvailableDates()
      .then((res) => {
        const years = (res.data?.years ?? []).map((y) => ({
          ...y,
          months: y.months.map(englishToRussianMonth),
        }));
        setYearsData(years);
        const defaultPick = pickDefaultYearAndMonth(years);
        if (defaultPick) {
          setSelectedYear(defaultPick.year);
          setSelectedMonth(defaultPick.month);
        } else if (years.length > 0) {
          setSelectedYear(years[0].year);
          setSelectedMonth(years[0].months[0] ?? "");
        }
      })
      .finally(() => setLoading(false));
  }, []);


  const fetchScheduleDays = () => {
    if (!selectedYear || !selectedMonth) return;
    const monthNumber = parseInt(monthToTwoDigits(selectedMonth), 10);
    if (Number.isNaN(monthNumber)) return;
    setCardsLoading(true);
    getScheduleDays({ year: parseInt(selectedYear, 10), month: monthNumber })
      .then((res) => {
        setCards(res.data ?? []);
      })
      .catch(() => {
        setCards([]);
      })
      .finally(() => {
        setCardsLoading(false);
      });
  };

  useEffect(() => {
    fetchScheduleDays();
  }, [selectedYear, selectedMonth]);

  const handleYearChange = (year: string) => {
    setSelectedYear(year);
    const yearInfo = yearsData.find((y) => y.year === year);
    const months = yearInfo?.months ?? [];
    setSelectedMonth(months.includes(selectedMonth) ? selectedMonth : months[0] ?? "");
  };

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

  const handlePlanningSubmit = (rows: PlanningRow[]) => {
    if (rows.length === 0) return;
    const lectures: LectureCreateRequest[] = rows
      .filter((row) => row.date.trim() !== "")
      .map((row) => {
        const dateISO = row.date.trim()
          ? `${row.date}T${row.start.trim() || "00:00"}:00Z`
          : "";
        return {
          date: dateISO,
          group: row.group.trim() || undefined,
          lector: row.lecturer.trim() || undefined,
          platform: row.platform.trim() || undefined,
          unit: row.building.trim() || undefined,
          location: row.place.trim() || undefined,
          description: row.comment.trim() || undefined,
          start: row.start.trim() || undefined,
          end: row.end.trim() || undefined,
        };
      });
    if (lectures.length === 0) return;
    createManyLectures({ lectures })
      .then(() => {
        setShowPlanningModal(false);
        fetchScheduleDays();
      })
      .catch(() => {
        // Можно показать уведомление об ошибке
      });
  };

  const handleCardClick = (date: string) => {
    navigate(`/lectures/${date}`);
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
                onChange={(e) => handleYearChange(e.target.value)}
                disabled={loading}
                className="px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 text-slate-900 bg-white min-w-[100px] disabled:opacity-50"
              >
                {availableYears.length === 0 && !loading && (
                  <option value="">Нет данных</option>
                )}
                {availableYears.map((year) => (
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
                disabled={loading || availableMonths.length === 0}
                className="px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 text-slate-900 bg-white min-w-[150px] disabled:opacity-50"
              >
                {availableMonths.length === 0 && !loading && (
                  <option value="">Нет данных</option>
                )}
                {availableMonths.map((month) => (
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
        {cardsLoading ? (
          <div className="text-center py-12 text-slate-500">
            Загрузка расписания...
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {cards.map((card) => (
                <ScheduleCard
                  key={card.date}
                  data={card}
                  onClick={() => handleCardClick(card.date)}
                />
              ))}
            </div>

            {cards.length === 0 && (
              <div className="text-center py-12 text-slate-500">
                Нет запланированных лекций на выбранный период
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
