import { Box, Typography, Button, Paper } from "@mui/material";
import { useNavigate } from "react-router-dom";

function NotFound() {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate("/");
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        width: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)",
        margin: 0,
        padding: 0,
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
          textAlign: "center",
        }}
      >
        <Typography
          variant="h1"
          color="error"
          gutterBottom
          sx={{ fontSize: "4rem", fontWeight: "bold" }}
        >
          404
        </Typography>
        <Typography variant="h5" color="text.primary" gutterBottom>
          Страница не найдена
        </Typography>
        <Typography variant="body1" color="text.secondary" gutterBottom>
          Похоже, вы забрели не туда. Давайте вернемся на главную!
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={handleGoHome}
          fullWidth
          sx={{ height: 56, fontSize: "1.1rem", fontWeight: "bold" }}
        >
          Вернуться на главную
        </Button>
      </Paper>
    </Box>
  );
}

export default NotFound;
