import { Box, TextField, Button, Typography } from "@mui/material";

function Form() {
  return (
    <Box sx={{ maxWidth: 400, mx: "auto", mt: 5, p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Форма
      </Typography>
      <TextField
        label="Название"
        variant="outlined"
        fullWidth
        margin="normal"
      />
      <TextField
        label="Описание"
        variant="outlined"
        fullWidth
        multiline
        rows={4}
        margin="normal"
      />
      <Button variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>
        Отправить
      </Button>
    </Box>
  );
}

export default Form;
