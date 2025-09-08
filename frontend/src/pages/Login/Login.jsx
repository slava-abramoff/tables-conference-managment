import { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  InputAdornment,
  IconButton,
} from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

function Login() {
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = () => {
    console.log("Попытка входа:", { login, password }); // Заглушка для API
  };

  const handleTogglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)",
        p: 2,
      }}
    >
      <Paper
        elevation={6}
        sx={{
          p: 4,
          maxWidth: 400,
          width: "100%",
          borderRadius: 2,
          display: "flex",
          flexDirection: "column",
          gap: 3,
          bgcolor: "white",
        }}
      >
        <Typography variant="h4" align="center" color="primary" gutterBottom>
          Вход
        </Typography>
        <TextField
          label="Логин"
          variant="outlined"
          value={login}
          onChange={(e) => setLogin(e.target.value)}
          inputProps={{ maxLength: 32 }}
          fullWidth
          sx={{
            "& .MuiInputBase-root": { height: 56, boxSizing: "border-box" },
          }}
        />
        <TextField
          label="Пароль"
          variant="outlined"
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          inputProps={{ maxLength: 32 }}
          fullWidth
          sx={{
            "& .MuiInputBase-root": { height: 56, boxSizing: "border-box" },
          }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={handleTogglePasswordVisibility}
                  edge="end"
                  aria-label="Переключить видимость пароля"
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleLogin}
          fullWidth
          sx={{ height: 56, fontSize: "1.1rem", fontWeight: "bold" }}
        >
          Войти
        </Button>
      </Paper>
    </Box>
  );
}

export default Login;
