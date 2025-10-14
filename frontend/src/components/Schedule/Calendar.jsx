import { useEffect } from "react";
import { Grid, Typography } from "@mui/material";
import ScheduleCard from "./Card";
import {
  useFetchLecturesByYearMonth,
  useLectureDays,
  useLecturesError,
  useLecturesLoading,
} from "../../store/lecturesStore";
import Loader from "../Navbar/Loader";
import { useModal } from "../../context/ModalContext";

function Calendar({ year, month }) {
  const fetchLecturesByYearMonth = useFetchLecturesByYearMonth();
  const schedule = useLectureDays();
  const loading = useLecturesLoading();
  const { open: openErrorModal } = useModal("error");
  const error = useLecturesError();

  useEffect(() => {
    if (year && month) {
      fetchLecturesByYearMonth({ year, month });
    }

    if (error) {
      openErrorModal({ error });
    }
  }, [year, month, fetchLecturesByYearMonth, error]);

  if (loading) {
    return <Loader />;
  }

  if (error) return <Typography color="error">{error}</Typography>;

  const sortedSchedule = [...schedule].sort((a, b) =>
    b.date.localeCompare(a.date),
  );

  return (
    <Grid container spacing={2}>
      {sortedSchedule.map((day) => (
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
