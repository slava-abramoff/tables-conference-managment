import { Card, CardContent, Typography, Button } from "@mui/material";
import { formatDate } from "../../utils/datetime";

function ScheduleCard({ date, groups, lecturers }) {
  function getUnique(arr) {
    return [
      ...new Set(arr.flatMap((item) => item.split(",").map((el) => el.trim()))),
    ].join(", ");
  }

  return (
    <Card
      sx={{
        width: 200, // Фиксированная ширина
        minHeight: 150, // Минимальная высота, может увеличиваться
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        boxSizing: "border-box",
      }}
    >
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {formatDate(date)}
        </Typography>
        <Typography variant="body2">Группы: {getUnique(groups)}</Typography>
        <Typography variant="body2">Лекторы: {getUnique(lecturers)}</Typography>
      </CardContent>
      <Button variant="outlined" href={`schedule/${date}`} sx={{ m: 2 }}>
        Расписание
      </Button>
    </Card>
  );
}

export default ScheduleCard;
