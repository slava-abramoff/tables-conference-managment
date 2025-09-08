import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import { useModal } from "../context/ModalContext";

function ConfirmModal({ title = "Подтверждение", message = "Вы уверены?" }) {
  const { isOpen, close } = useModal("confirm");

  const handleConfirm = () => {
    console.log("Подтверждено"); // Заглушка для действия
    close();
  };

  return (
    <Dialog open={isOpen} onClose={close}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>{message}</DialogContent>
      <DialogActions>
        <Button onClick={close}>Отмена</Button>
        <Button onClick={handleConfirm} color="primary">
          Подтвердить
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default ConfirmModal;
