import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import { useModal } from "../context/ModalContext";

function ErrorModal({ error }) {
  const { isOpen, close } = useModal("error");

  console.log(error);

  return (
    <Dialog open={isOpen} onClose={close}>
      <DialogTitle>Приозошла ошибка!</DialogTitle>
      <DialogContent>
        <DialogContentText>
          {error ?? "Сервер не отвечает, отправьте запрос позже."}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={close} color="error" variant="contained">
          Закрыть
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default ErrorModal;
