import React, { useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Container,
  Grid,
  MenuItem,
  Modal,
  TextField,
  Typography,
} from "@mui/material";
import { Link } from "react-router-dom";
import { addNewMeet } from "../../services/meets.service";

export default function Form() {
  const [open, setOpen] = useState(false);

  const [form, setForm] = useState({
    eventName: "",
    customerName: "",
    email: "",
    phone: "",
    location: "",
    platform: "",
    devices: "",
    description: "",
    startDate: "",
    startTime: "",
    endDate: "",
    endTime: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // склеиваем дату и время
    const start =
      form.startDate && form.startTime
        ? new Date(`${form.startDate}T${form.startTime}`).toISOString()
        : null;

    const end =
      form.endDate && form.endTime
        ? new Date(`${form.endDate}T${form.endTime}`).toISOString()
        : null;

    const payload = {
      eventName: form.eventName,
      customerName: form.customerName,
      email: form.email,
      phone: form.phone,
      location: form.location,
      platform: form.platform,
      devices: form.devices,
      description: form.description,
      start,
      end,
    };

    try {
      await addNewMeet(payload);
      setOpen(true);
      setForm({
        eventName: "",
        customerName: "",
        email: "",
        phone: "",
        location: "",
        platform: "",
        devices: "",
        description: "",
        startDate: "",
        startTime: "",
        endDate: "",
        endTime: "",
      });
    } catch (error) {
      alert(error.message || "Ошибка создания мероприятия");
    }
  };

  return (
    <Container
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
      }}
    >
      <Button
        component={Link}
        to="/login"
        variant="outlined"
        sx={{ position: "absolute", top: 16, right: 16 }}
      >
        Войти
      </Button>

      <Card sx={{ width: { xs: "100%", md: "60%" }, p: 2 }}>
        <CardHeader title="Создать конференцию" />
        <CardContent>
          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{ display: "flex", flexDirection: "column", gap: 2 }}
          >
            <TextField
              name="eventName"
              label="Мероприятие"
              value={form.eventName}
              onChange={handleChange}
              required
            />

            <TextField
              name="customerName"
              label="ФИО"
              value={form.customerName}
              onChange={handleChange}
              required
            />

            <TextField
              name="email"
              type="email"
              label="Почта"
              value={form.email}
              onChange={handleChange}
              required
            />

            <TextField
              name="phone"
              type="tel"
              label="Телефон"
              value={form.phone}
              onChange={handleChange}
              required
            />

            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Дата и время
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2">Начало</Typography>
                  <TextField
                    name="startDate"
                    type="date"
                    value={form.startDate}
                    onChange={handleChange}
                    fullWidth
                    required
                  />
                  <TextField
                    name="startTime"
                    type="time"
                    value={form.startTime}
                    onChange={handleChange}
                    fullWidth
                    required
                    sx={{ mt: 1 }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2">Конец</Typography>
                  <TextField
                    name="endDate"
                    type="date"
                    value={form.endDate}
                    onChange={handleChange}
                    fullWidth
                  />
                  <TextField
                    name="endTime"
                    type="time"
                    value={form.endTime}
                    onChange={handleChange}
                    fullWidth
                    sx={{ mt: 1 }}
                  />
                </Grid>
              </Grid>
            </Box>

            <TextField
              name="location"
              label="Место проведения"
              value={form.location}
              onChange={handleChange}
              required
            />

            <TextField
              name="platform"
              label="Платформа"
              select
              value={form.platform}
              onChange={handleChange}
              required
            >
              <MenuItem value="">Выберите платформу</MenuItem>
              <MenuItem value="sferum">СФЕРУМ</MenuItem>
              <MenuItem value="vk">ВК трансляции</MenuItem>
              <MenuItem value="other">Другое</MenuItem>
            </TextField>

            <TextField
              name="devices"
              label="Оборудование"
              select
              value={form.devices}
              onChange={handleChange}
              required
            >
              <MenuItem value="">Выберите оборудование</MenuItem>
              <MenuItem value="webcam">Вебкамера</MenuItem>
              <MenuItem value="none">Не требуется</MenuItem>
            </TextField>

            <TextField
              name="description"
              label="Примечание"
              value={form.description}
              onChange={handleChange}
            />

            <Button type="submit" variant="contained" fullWidth>
              Отправить
            </Button>
          </Box>
        </CardContent>
      </Card>

      <Modal open={open} onClose={() => setOpen(false)}>
        <Box
          sx={{
            bgcolor: "background.paper",
            p: 4,
            borderRadius: 2,
            boxShadow: 24,
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 300,
            textAlign: "center",
          }}
        >
          <Typography variant="h6" gutterBottom>
            Успешно
          </Typography>
          <Typography>✅ Конференция успешно создана!</Typography>
        </Box>
      </Modal>
    </Container>
  );
}
