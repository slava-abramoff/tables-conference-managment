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
import { useModal } from "../../context/ModalContext";

function UsersToolbar({ visibleColumns, setVisibleColumns }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const { open: openCreateUser } = useModal("createUser");

  const sortOptions = [
    { value: "login", label: "Логин" },
    { value: "name", label: "Имя" },
    { value: "email", label: "Email" },
    { value: "role", label: "Роль" },
    { value: "createdAt", label: "Создано" },
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
    openCreateUser();
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
      <Button
        variant="contained"
        color="primary"
        onClick={handleCreate}
        sx={{ minWidth: 150, height: 56, boxSizing: "border-box" }}
      >
        Добавить пользователя
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

export default UsersToolbar;
