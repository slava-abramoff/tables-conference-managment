import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
} from "@mui/material";

function ScheduleToolbar({ year, setYear, month, setMonth }) {
  const years = [2024, 2025, 2026];
  const months = [
    { value: 4, label: "Апрель" },
    { value: 5, label: "Май" },
    { value: 6, label: "Июнь" },
  ];

  const handlePlan = () => {
    console.log('Кнопка "Запланировать" нажата'); // Заглушка
  };

  const handleExport = () => {
    console.log('Кнопка "Выгрузить" нажата'); // Заглушка
  };

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
          {years.map((y) => (
            <MenuItem key={y} value={y}>
              {y}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl sx={{ minWidth: 150, height: 56 }}>
        <InputLabel>Месяц</InputLabel>
        <Select
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          label="Месяц"
          sx={{ height: 56, boxSizing: "border-box" }}
        >
          {months.map((m) => (
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
