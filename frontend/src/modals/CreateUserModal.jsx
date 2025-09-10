import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  MenuItem,
} from "@mui/material";
import { useModal } from "../context/ModalContext";
import { useCreateUser } from "../store/usersStore";

export default function CreateUserModal() {
  const { isOpen, close } = useModal("createUser");
  const createUser = useCreateUser();

  const [login, setLogin] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    switch (name) {
      case "login":
        setLogin(value);
        break;
      case "name":
        setName(value);
        break;
      case "email":
        setEmail(value);
        break;
      case "password":
        setPassword(value);
        break;
      case "role":
        setRole(value);
        break;
      default:
        break;
    }
  };

  const handleSave = async () => {
    if (!login || !password) {
      setError("Логин и пароль обязательны");
      return;
    }

    try {
      await createUser({
        login,
        name,
        email,
        password,
        role,
      });
      close();

      setLogin("");
      setName("");
      setEmail("");
      setPassword("");
      setRole("");
      setError("");
    } catch (error) {
      setError(error.message || "Ошибка создания пользователя");
    }
  };

  return (
    <Dialog open={isOpen} onClose={close} fullWidth maxWidth="sm">
      <DialogTitle>Создание пользователя</DialogTitle>
      <DialogContent dividers>
        {error && <p style={{ color: "red", marginBottom: "10px" }}>{error}</p>}
        <TextField
          margin="dense"
          label="Login *"
          name="login"
          value={login}
          onChange={handleChange}
          fullWidth
          required
        />
        <TextField
          margin="dense"
          label="Имя"
          name="name"
          value={name}
          onChange={handleChange}
          fullWidth
        />
        <TextField
          margin="dense"
          label="Почта"
          name="email"
          type="email"
          value={email}
          onChange={handleChange}
          fullWidth
        />
        <TextField
          margin="dense"
          label="Пароль *"
          name="password"
          type="password"
          value={password}
          onChange={handleChange}
          fullWidth
          required
        />
        <TextField
          margin="dense"
          label="Роль"
          name="role"
          select
          value={role}
          onChange={handleChange}
          fullWidth
        >
          <MenuItem value="admin">Админ</MenuItem>
          <MenuItem value="moderator">Модератор</MenuItem>
          <MenuItem value="viewer">Зритель</MenuItem>
        </TextField>
      </DialogContent>
      <DialogActions>
        <Button onClick={close}>Отмена</Button>
        <Button variant="contained" onClick={handleSave}>
          Создать
        </Button>
      </DialogActions>
    </Dialog>
  );
}
