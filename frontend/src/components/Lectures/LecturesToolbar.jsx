import {
  Box,
  TextField,
  IconButton,
  Popover,
  FormControlLabel,
  Checkbox,
  Button,
  Typography,
} from "@mui/material";
import SettingsIcon from "@mui/icons-material/Settings";
import { useState } from "react";

function LecturesToolbar({
  search,
  setSearch,
  visibleColumns,
  setVisibleColumns,
}) {
  const [anchorEl, setAnchorEl] = useState(null);

  const sortOptions = [
    { value: "group", label: "Группа" },
    { value: "lector", label: "Лектор" },
    { value: "platform", label: "Платформа" },
    { value: "unit", label: "Корпус" },
    { value: "location", label: "Место" },
    { value: "url", label: "Ссылка" },
    { value: "shortUrl", label: "Короткая ссылка" },
    { value: "streamKey", label: "Ключ стрима" },
    { value: "description", label: "Описание" },
    { value: "adminId", label: "ID админа" },
    { value: "start", label: "Начало" },
    { value: "end", label: "Конец" },
    { value: "abnormalTime", label: "Нестандартное время" },
    { value: "createdAt", label: "Создано" },
    { value: "updatedAt", label: "Обновлено" },
  ];

  const allColumns = sortOptions;

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
    console.log('Кнопка "Добавить лекцию" нажата'); // Заглушка
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
        sx={{
          minWidth: 150,
          height: 56,
          "& .MuiInputBase-root": { height: 56, boxSizing: "border-box" },
        }}
      />
      <Button
        variant="contained"
        color="primary"
        onClick={handleCreate}
        sx={{ minWidth: 150, height: 56, boxSizing: "border-box" }}
      >
        Добавить лекцию
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

export default LecturesToolbar;
