import { useEffect } from "react";
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Typography,
} from "@mui/material";
import {
  useFetchLectureDates,
  useLectureDates,
  useLecturesError,
  useLecturesLoading,
} from "../../store/lecturesStore";
import { useModal } from "../../context/ModalContext";
import useAuthStore from "../../store/authStore";
import Loader from "../Navbar/Loader";

function ScheduleToolbar({ year, setYear, month, setMonth }) {
  const { open: openScheduleLecture } = useModal("scheduleLecture");
  const fetchLectureDates = useFetchLectureDates();
  const dates = useLectureDates();
  const loading = useLecturesLoading();
  const error = useLecturesError();
  const { user } = useAuthStore(); // Получаем данные пользователя из Zustand
  const isViewer = user?.role === "viewer"; // Проверяем, является ли пользователь viewer

  // Маппинг месяцев: строка → номер месяца и обратно
  const monthMapping = {
    январь: 1,
    февраль: 2,
    март: 3,
    апрель: 4,
    май: 5,
    июнь: 6,
    июль: 7,
    август: 8,
    сентябрь: 9,
    октябрь: 10,
    ноябрь: 11,
    декабрь: 12,
  };
  const reverseMonthMapping = Object.fromEntries(
    Object.entries(monthMapping).map(([key, value]) => [value, key]),
  );

  // Загрузка данных при монтировании
  useEffect(() => {
    if (!dates.years?.length) {
      fetchLectureDates();
    }
  }, [fetchLectureDates, dates.years]);

  // Получение доступных годов
  const years = dates.years?.length > 0 ? dates.years.map((y) => y.year) : [];

  // Получение доступных месяцев для выбранного года
  const availableMonths = year
    ? dates.years
        ?.find((y) => y.year === year)
        ?.months?.map((month) => ({
          value: monthMapping[month.toLowerCase()],
          label: month.charAt(0).toUpperCase() + month.slice(1),
        })) || []
    : [];

  // Синхронизация начальных значений
  useEffect(() => {
    if (dates.years?.length > 0) {
      // Если текущий год недоступен, выбираем первый доступный
      if (!years.includes(year)) {
        setYear(years[0] || "");
      }
      // Если год выбран, синхронизируем месяц
      if (year && availableMonths.length > 0) {
        const currentMonthNumber = monthMapping[month.toLowerCase()];
        if (!availableMonths.some((m) => m.value === currentMonthNumber)) {
          setMonth(reverseMonthMapping[availableMonths[0].value] || "");
        }
      } else {
        setMonth("");
      }
    }
  }, [dates.years, year, month, availableMonths, setYear, setMonth]);

  const handlePlan = () => {
    if (isViewer) return; // Блокируем планирование для viewer
    openScheduleLecture();
  };

  const handleExport = () => {
    console.log('Кнопка "Выгрузить" нажата');
  };

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return <Typography color="error">Ошибка: {error}</Typography>;
  }

  return (
    <Box
      sx={{
        display: "flex",
        gap: 2,
        mb: 2,
        flexWrap: "wrap",
        alignItems: "center",
      }}
    >
      <FormControl sx={{ minWidth: 150, height: 56 }}>
        <InputLabel>Год</InputLabel>
        <Select
          value={year}
          onChange={(e) => setYear(e.target.value)}
          label="Год"
          sx={{ height: 56, boxSizing: "border-box" }}
        >
          <MenuItem value="">
            <em>Выберите год</em>
          </MenuItem>
          {years.map((y) => (
            <MenuItem key={y} value={y}>
              {y}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl
        sx={{ minWidth: 150, height: 56 }}
        disabled={!year || availableMonths.length === 0}
      >
        <InputLabel>Месяц</InputLabel>
        <Select
          value={monthMapping[month.toLowerCase()] || ""}
          onChange={(e) => setMonth(reverseMonthMapping[e.target.value] || "")}
          label="Месяц"
          sx={{ height: 56, boxSizing: "border-box" }}
        >
          <MenuItem value="">
            <em>Выберите месяц</em>
          </MenuItem>
          {availableMonths.map((m) => (
            <MenuItem key={m.value} value={m.value}>
              {m.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <Button
        variant="contained"
        color="secondary"
        onClick={handleExport}
        sx={{ minWidth: 150, height: 56, boxSizing: "border-box" }}
      >
        Выгрузить
      </Button>
      <Button
        variant="contained"
        color="primary"
        onClick={handlePlan}
        disabled={isViewer} // Отключаем кнопку для viewer
        sx={{
          minWidth: 150,
          height: 56,
          boxSizing: "border-box",
          marginLeft: "auto",
        }}
      >
        Запланировать
      </Button>
    </Box>
  );
}

export default ScheduleToolbar;
