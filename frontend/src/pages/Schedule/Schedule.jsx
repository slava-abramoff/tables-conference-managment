import { useState } from "react";
import { Box, Typography } from "@mui/material";
import ScheduleToolbar from "../../components/Schedule/Toolbar";
import Calendar from "../../components/Schedule/Calendar";
import Layout from "../../components/Layout/Layout";

function Schedule() {
  const [year, setYear] = useState(2025);
  const [month, setMonth] = useState(9); // Сентябрь для мока, можно изменить

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
