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
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
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
  const [editingCell, setEditingCell] = useState(null); // { rowIndex, field }
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

  const handleSend = async () => {
    for (let i = 0; i < lectures.length; i++) {
      if (!lectures[i].date) {
        setError(`Дата обязательна для строки ${i + 1}`);
        return;
      }
    }

    try {
      // Преобразуем значения в ISO-8601, если это нужно
      const payload = lectures.map((lec) => ({
        ...lec,
        date: new Date(lec.date).toISOString(),
        start: lec.start ? `1970-01-01T${lec.start}:00.000Z` : null,
        end: lec.end ? `1970-01-01T${lec.end}:00.000Z` : null,
      }));

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

    // Выбор типа инпута
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
