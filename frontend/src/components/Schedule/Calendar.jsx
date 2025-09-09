import { useEffect } from "react";
import { Grid, Typography } from "@mui/material";
import ScheduleCard from "./Card";
import {
  useFetchLecturesByYearMonth,
  useLectureDays,
  useLecturesError,
  useLecturesLoading,
} from "../../store/lecturesStore";

function Calendar({ year, month }) {
  const fetchLecturesByYearMonth = useFetchLecturesByYearMonth();
  const schedule = useLectureDays();
  const loading = useLecturesLoading();
  const error = useLecturesError();

  console.log(schedule);

  useEffect(() => {
    if (year && month) {
      fetchLecturesByYearMonth({ year, month });
    }
  }, [year, month, fetchLecturesByYearMonth]);

  if (loading) {
    return <Typography>Загрузка...</Typography>;
  }

  if (error) {
    return <Typography color="error">Ошибка: {error}</Typography>;
  }

  return (
    <Grid container spacing={2}>
      {schedule.map((day) => (
        <Grid item xs={2.4} key={day.date}>
          <ScheduleCard
            date={day.date}
            lecturers={day.lectors}
            groups={day.groups}
          />
        </Grid>
      ))}
    </Grid>
  );
}

export default Calendar;
