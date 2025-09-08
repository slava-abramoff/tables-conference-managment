import { useState, useEffect } from "react";
import { Grid, Typography } from "@mui/material";
import ScheduleCard from "./Card";

function Calendar({ year, month }) {
  const [schedule, setSchedule] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    // const fetchSchedule = async () => {
    //   try {
    //     const data = await getSchedule({ year, month });
    //     setSchedule(data?.data || []);
    //     setError(null);
    //   } catch (error) {
    //     setError('Ошибка загрузки расписания');
    //   }
    // };
    // fetchSchedule();
  }, [year, month]);

  // Моковые данные для 30 дней
  const mockSchedule = Array.from({ length: 30 }, (_, index) => ({
    date: `2025-09-${String(index + 1).padStart(2, "0")}`,
    lecturesCount: Math.floor(Math.random() * 5),
    lecturers: ["Иванов", "Петров", "Сидоров"]
      .slice(0, Math.floor(Math.random() * 3) + 1)
      .join(", "),
  }));

  // Создаем массив из 30 дней (можно настроить под конкретный месяц)
  const days = Array.from({ length: 30 }, (_, index) => {
    const date = `2025-09-${String(index + 1).padStart(2, "0")}`;
    const dayData = (schedule.length > 0 ? schedule : mockSchedule).find(
      (item) => item.date === date,
    ) || { date, lecturesCount: 0, lecturers: "-" };
    return dayData;
  });

  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  return (
    <Grid container spacing={2}>
      {days.map((day) => (
        <Grid item xs={2.4} key={day.date}>
          <ScheduleCard
            date={day.date}
            lecturesCount={day.lecturesCount}
            lecturers={day.lecturers}
          />
        </Grid>
      ))}
    </Grid>
  );
}

export default Calendar;
