import { Card, CardContent, Typography, Button } from "@mui/material";
import { formatDate } from "../../utils/datetime";
import { useNavigate } from "react-router-dom";

function ScheduleCard({ date, groups, lecturers }) {
  const navigate = useNavigate();
  function getUnique(arr) {
    return [
      ...new Set(arr.flatMap((item) => item.split(",").map((el) => el.trim()))),
    ].join(", ");
  }

  return (
    <Card
      sx={{
        width: 200,
        minHeight: 150,
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
      <Button
        variant="outlined"
        onClick={() => navigate(`${date}`)}
        sx={{ m: 2 }}
      >
        Расписание
      </Button>
    </Card>
  );
}

export default ScheduleCard;
