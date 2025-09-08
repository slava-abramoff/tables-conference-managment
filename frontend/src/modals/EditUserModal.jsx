import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
} from "@mui/material";
import { useModal } from "../context/ModalContext";
import { useState } from "react";

function EditUserModal({ userId }) {
  const { isOpen, data, close } = useModal("editUser");
  const [name, setName] = useState(data.name || "");

  const handleSave = () => {
    console.log("Сохранение пользователя:", { userId, name }); // Заглушка
    close();
  };

  return (
    <Dialog open={isOpen} onClose={close}>
      <DialogTitle>Редактировать пользователя</DialogTitle>
      <DialogContent>
        <TextField
          label="Имя"
          value={name}
          onChange={(e) => setName(e.target.value)}
          fullWidth
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={close}>Отмена</Button>
        <Button onClick={handleSave} color="primary">
          Сохранить
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default EditUserModal;
