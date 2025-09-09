import { Box, Typography } from "@mui/material";
import ScheduleToolbar from "../../components/Schedule/Toolbar";
import Calendar from "../../components/Schedule/Calendar";
import Layout from "../../components/Layout/Layout";
import {
  useCurrentMonth,
  useCurrentYear,
  useSetCurrentMonth,
  useSetCurrentYear,
} from "../../store/lecturesStore";

function Schedule() {
  const year = useCurrentYear();
  const month = useCurrentMonth();
  const setYear = useSetCurrentYear();
  const setMonth = useSetCurrentMonth();

  return (
    <Layout>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Расписание
        </Typography>
        <ScheduleToolbar
          year={year}
          setYear={setYear}
          month={month}
          setMonth={setMonth}
        />
        <Calendar year={year} month={month} />
      </Box>
    </Layout>
  );
}

export default Schedule;
