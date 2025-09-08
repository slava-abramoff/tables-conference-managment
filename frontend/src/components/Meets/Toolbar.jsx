import {
  Box,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Popover,
  FormControlLabel,
  Checkbox,
  Button,
  Typography,
} from "@mui/material";
import SettingsIcon from "@mui/icons-material/Settings";
import { useState } from "react";

function Toolbar({
  search,
  setSearch,
  status,
  setStatus,
  sortBy,
  setSortBy,
  order,
  setOrder,
  visibleColumns,
  setVisibleColumns,
}) {
  const [anchorEl, setAnchorEl] = useState(null);

  const statusOptions = ["new", "in_progress", "completed"]; // Замени на реальные значения Status
  const sortOptions = [
    { value: "eventName", label: "Название" },
    { value: "customerName", label: "Заказчик" },
    { value: "email", label: "Email" },
    { value: "phone", label: "Телефон" },
    { value: "location", label: "Место" },
    { value: "platform", label: "Платформа" },
    { value: "devices", label: "Оборудование" },
    { value: "url", label: "Ссылка" },
    { value: "shortUrl", label: "Короткая ссылка" },
    { value: "status", label: "Статус" },
    { value: "description", label: "Описание" },
    { value: "start", label: "Начало" },
    { value: "end", label: "Конец" },
    { value: "createdAt", label: "Дата создания" },
  ];

  const allColumns = sortOptions; // Используем те же поля, что в сортировке, для согласованности

  const handleClickSettings = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClosePopover = () => {
    setAnchorEl(null);
  };

  const handleToggleColumn = (columnId) => {
    setVisibleColumns((prev) => ({
      ...prev,
      [columnId]: !prev[columnId],
    }));
  };

  const handleCreate = () => {
    console.log('Кнопка "Создать" нажата'); // Заглушка для действия
    // Можно добавить переход: window.location.href = '/form';
  };

  const open = Boolean(anchorEl);

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
      <TextField
        label="Поиск"
        variant="outlined"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        sx={{ flex: 1, minWidth: 200 }}
      />
      <FormControl sx={{ minWidth: 120 }}>
        <InputLabel>Статус</InputLabel>
        <Select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          label="Статус"
        >
          <MenuItem value="">Все</MenuItem>
          {statusOptions.map((option) => (
            <MenuItem key={option} value={option}>
              {option}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl sx={{ minWidth: 120 }}>
        <InputLabel>Сортировать по</InputLabel>
        <Select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          label="Сортировать по"
        >
          <MenuItem value="">Без сортировки</MenuItem>
          {sortOptions.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl sx={{ minWidth: 120 }}>
        <InputLabel>Порядок</InputLabel>
        <Select
          value={order}
          onChange={(e) => setOrder(e.target.value)}
          label="Порядок"
        >
          <MenuItem value="asc">По возрастанию</MenuItem>
          <MenuItem value="desc">По убыванию</MenuItem>
        </Select>
      </FormControl>
      <Button
        variant="contained"
        color="primary"
        sx={{ minWidth: 150, height: 56, boxSizing: "border-box" }}
        onClick={handleCreate}
      >
        Создать
      </Button>
      <IconButton onClick={handleClickSettings} aria-label="Настройка колонок">
        <SettingsIcon />
      </IconButton>
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClosePopover}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Box sx={{ p: 2, display: "flex", flexDirection: "column", gap: 1 }}>
          <Typography variant="subtitle1" gutterBottom>
            Выберите видимые столбцы
          </Typography>
          {allColumns.map((col) => (
            <FormControlLabel
              key={col.value}
              control={
                <Checkbox
                  checked={visibleColumns[col.value] ?? true}
                  onChange={() => handleToggleColumn(col.value)}
                />
              }
              label={col.label}
            />
          ))}
        </Box>
      </Popover>
    </Box>
  );
}

export default Toolbar;
