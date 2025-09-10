import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from "@mui/material";
import { useModal } from "../context/ModalContext";

function ConfirmDeleteUserModal({
  title = "Подтверждение удаления",
  userId,
  login,
  name,
  onConfirm,
}) {
  const { isOpen, close } = useModal("deleteUser");

  const handleConfirm = () => {
    onConfirm(userId);
    close();
  };

  const message = `Вы уверены, что хотите удалить пользователя ${login} - ${name || "не указан"}? Это действие нельзя отменить.`;

  return (
    <Dialog open={isOpen} onClose={close} aria-labelledby="confirm-delete-user">
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText>{message}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={close} color="primary">
          Отмена
        </Button>
        <Button onClick={handleConfirm} color="error" variant="contained">
          Удалить
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default ConfirmDeleteUserModal;
