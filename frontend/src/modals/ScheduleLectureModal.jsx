import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  IconButton,
  Paper,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import { useModal } from "../context/ModalContext";
import { useAddManyLectures } from "../store/lecturesStore";

export default function ScheduleLectureModal() {
  const { isOpen, close } = useModal("scheduleLecture");
  const createLectures = useAddManyLectures();

  const emptyLecture = () => ({
    group: "",
    lector: "",
    platform: "",
    unit: "",
    location: "",
    description: "",
    date: "",
    start: "",
    end: "",
    abnormalTime: "",
  });

  const [lectures, setLectures] = useState([emptyLecture()]);
  const [editingCell, setEditingCell] = useState(null);
  const [error, setError] = useState("");

  const handleChange = (index, field, value) => {
    const updated = [...lectures];
    updated[index][field] = value;
    setLectures(updated);
  };

  const handleAddRow = () => {
    setLectures((prev) => [...prev, emptyLecture()]);
  };

  const handleDuplicateRow = (index) => {
    setLectures((prev) => [...prev, { ...prev[index] }]);
  };

  const handleDeleteRow = (index) => {
    setLectures((prev) => prev.filter((_, i) => i !== index));
  };

  const moscowDateToUTC = (dateStr) => {
    if (!dateStr) return null;
    const [y, m, d] = dateStr.split("-").map(Number);
    // Создаем дату в московском времени (UTC+3) на 12:00, затем конвертируем в UTC
    const dt = new Date(y, m - 1, d, 12, 0, 0);
    // Конвертируем в UTC (это будет 09:00 UTC для 12:00 Москвы)
    const utcDate = new Date(dt.getTime() - 3 * 60 * 60 * 1000);
    return utcDate.toISOString();
  };

  const moscowTimeToUTC = (timeStr) => {
    if (!timeStr) return null;
    const [h, m] = timeStr.split(":").map(Number);
    const dt = new Date(Date.UTC(1970, 0, 1, h, m, 0));
    dt.setUTCHours(dt.getUTCHours() - 3);
    return dt.toISOString();
  };

  const handleSend = async () => {
    for (let i = 0; i < lectures.length; i++) {
      if (!lectures[i].date) {
        setError(`Дата обязательна для строки ${i + 1}`);
        return;
      }
    }

    try {
      const payload = lectures.map((lec) => ({
        ...lec,
        date: moscowDateToUTC(lec.date),
        start: lec.start ? moscowTimeToUTC(lec.start) : null,
        end: lec.end ? moscowTimeToUTC(lec.end) : null,
      }));

      console.log("payload:", payload);

      await createLectures(payload);
      setLectures([emptyLecture()]);
      setError("");
      close();
    } catch (err) {
      setError(err.message || "Ошибка отправки лекций");
    }
  };

  const columns = [
    { id: "date", label: "Дата *" },
    { id: "start", label: "Начало" },
    { id: "end", label: "Конец" },
    { id: "group", label: "Группа" },
    { id: "lector", label: "Лектор" },
    { id: "platform", label: "Платформа" },
    { id: "unit", label: "Корпус" },
    { id: "location", label: "Место" },
    { id: "description", label: "Комментарий" },
    { id: "actions", label: "Действия" },
  ];

  const renderCell = (lecture, rowIndex, col) => {
    const isEditing =
      editingCell?.rowIndex === rowIndex && editingCell?.field === col.id;

    if (col.id === "actions") {
      return (
        <TableCell key={col.id}>
          <IconButton onClick={() => handleDuplicateRow(rowIndex)}>
            <AddIcon />
          </IconButton>
          <IconButton onClick={() => handleDeleteRow(rowIndex)}>
            <DeleteIcon />
          </IconButton>
        </TableCell>
      );
    }

    let type = "text";
    if (col.id === "date") type = "date";
    if (col.id === "start" || col.id === "end") type = "time";

    return (
      <TableCell
        key={col.id}
        onClick={() => setEditingCell({ rowIndex, field: col.id })}
      >
        {isEditing ? (
          <TextField
            type={type}
            value={lecture[col.id]}
            onChange={(e) => handleChange(rowIndex, col.id, e.target.value)}
            onBlur={() => setEditingCell(null)}
            autoFocus
            fullWidth
          />
        ) : lecture[col.id] ? (
          lecture[col.id]
        ) : (
          ""
        )}
      </TableCell>
    );
  };

  return (
    <Dialog open={isOpen} onClose={close} fullWidth maxWidth="xl">
      <DialogTitle>Планирование лекций</DialogTitle>
      <DialogContent dividers>
        {error && <p style={{ color: "red" }}>{error}</p>}
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                {columns.map((col) => (
                  <TableCell key={col.id}>{col.label}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {lectures.map((lecture, rowIndex) => (
                <TableRow key={rowIndex}>
                  {columns.map((col) => renderCell(lecture, rowIndex, col))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <Button
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={handleAddRow}
          sx={{ mt: 2 }}
        >
          Добавить лекцию
        </Button>
      </DialogContent>
      <DialogActions>
        <Button onClick={close}>Отмена</Button>
        <Button variant="contained" onClick={handleSend}>
          Отправить
        </Button>
      </DialogActions>
    </Dialog>
  );
}
