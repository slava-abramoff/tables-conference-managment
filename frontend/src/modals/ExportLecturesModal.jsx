import React, { useState } from "react";
import {
  Modal,
  Box,
  TextField,
  Button,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
} from "@mui/material";
import { useModal } from "../context/ModalContext";
import { exportLectures } from "../services/lectures.service";

export default function ExportLecturesModal() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [group, setGroup] = useState("");
  const { isOpen, close } = useModal("exportLecture");

  const handleSubmit = () => {
    const payload = {
      start: startDate ? new Date(startDate).toISOString() : null,
      end: endDate ? new Date(endDate).toISOString() : null,
      group: group || null,
    };
    exportLectures(payload);
    close();
  };

  const isDisabled = (!startDate || !endDate) && !group; // кнопка активна, если либо диапазон, либо группа заполнены

  return (
    <Dialog open={isOpen} onClose={close} fullWidth maxWidth="sm">
      <DialogTitle>Выгрузка</DialogTitle>
      <DialogContent
        sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 2 }}
      >
        <Typography variant="body2" mb={2} color="text.secondary">
          Укажите даты начала и конца периода и/или введите название группы.
          <br />- Если хотите получить записи по времени — заполните только
          даты.
          <br />- Если хотите получить записи по группе — заполните только поле
          группы.
          <br />- Можно указать и то, и другое одновременно.
        </Typography>

        <TextField
          label="Начало диапазона"
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          fullWidth
          InputLabelProps={{ shrink: true }}
          margin="normal"
        />

        <TextField
          label="Конец диапазона"
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          fullWidth
          InputLabelProps={{ shrink: true }}
          margin="normal"
        />

        <TextField
          label="Группа"
          value={group}
          onChange={(e) => setGroup(e.target.value)}
          fullWidth
          margin="normal"
        />

        <Button
          variant="contained"
          color="primary"
          fullWidth
          sx={{ mt: 2 }}
          onClick={handleSubmit}
          disabled={isDisabled}
        >
          Выгрузить
        </Button>
      </DialogContent>
    </Dialog>
  );
}
