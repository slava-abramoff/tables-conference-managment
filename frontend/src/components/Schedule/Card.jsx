import { Card, CardContent, Typography, Button } from "@mui/material";

function ScheduleCard({ date, lecturesCount, lecturers }) {
  const formattedDate = new Date(date).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const handleScheduleClick = () => {
    console.log(`Открыть расписание для ${date}`); // Заглушка
  };

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
          {formattedDate}
        </Typography>
        <Typography variant="body2">Лекций: {lecturesCount || 0}</Typography>
        <Typography variant="body2">Лекторы: {lecturers || "-"}</Typography>
      </CardContent>
      <Button
        variant="outlined"
        href="#outlined-buttons"
        onClick={handleScheduleClick}
        sx={{ m: 2 }}
      >
        Расписание
      </Button>
    </Card>
  );
}

export default ScheduleCard;
