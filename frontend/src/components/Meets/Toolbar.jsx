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
import { useState, useCallback } from "react";
import { debounce } from "lodash";
import { useSearchMeets } from "../../store/meetsStore";
import { useModal } from "../../context/ModalContext";
import useAuthStore from "../../store/authStore";
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
  const searchMeets = useSearchMeets();
  const { open: openCreateMeet } = useModal("createMeet");
  const { user } = useAuthStore();
  const isViewer = user?.role === "viewer";

  const statusOptions = [
    { value: "new", label: "Новые" },
    { value: "processed", label: "Состоятся" },
    { value: "completed", label: "Прошедшие" },
    { value: "rejected", label: "Отклоненные" },
  ];

  const sortOptions = [
    { value: "eventName", label: "Название" },
    { value: "customerName", label: "ФИО" },
    { value: "email", label: "Email" },
    { value: "phone", label: "Телефон" },
    { value: "location", label: "Место" },
    { value: "platform", label: "Платформа" },
    { value: "devices", label: "Оборудование" },
    { value: "url", label: "Ссылка" },
    { value: "shortUrl", label: "Короткая ссылка" },
    { value: "status", label: "Статус" },
    { value: "description", label: "Описание" },
    { value: "admin", label: "Админ" },
    { value: "start", label: "Начало" },
    { value: "end", label: "Конец" },
    { value: "createdAt", label: "Дата создания" },
  ];

  const allColumns = sortOptions;

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce((value) => {
      searchMeets({ searchTerm: value, page: 1, limit: 10 });
    }, 300),
    [searchMeets],
  );

  const changeFilter = (option, value) => {
    if (option === "status") {
      setStatus(value);
      localStorage.setItem("status", value);
    }

    if (option === "sortBy") {
      setSortBy(value);
      localStorage.setItem("sortBy", value);
    }

    if (option === "order") {
      setOrder(value);
      localStorage.setItem("order", value);
    }
  };

  const handleSearchChange = (value) => {
    setSearch(value);
    debouncedSearch(value);
  };

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
    if (isViewer) return;
    openCreateMeet();
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
        onChange={(e) => handleSearchChange(e.target.value)}
        sx={{ flex: 1, minWidth: 200 }}
      />
      <FormControl sx={{ minWidth: 120 }}>
        <InputLabel>Статус</InputLabel>
        <Select
          value={status}
          onChange={(e) => changeFilter("status", e.target.value)}
          label="Статус"
        >
          {statusOptions.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl sx={{ minWidth: 120 }}>
        <InputLabel>Сортировать по</InputLabel>
        <Select
          value={sortBy}
          onChange={(e) => changeFilter("sortBy", e.target.value)}
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
          onChange={(e) => changeFilter("order", e.target.value)}
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
        disabled={isViewer} // Отключаем кнопку для viewer
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
