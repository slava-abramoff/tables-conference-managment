import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from "@mui/material";
import { useModal } from "../context/ModalContext";

function ConfirmDeleteLectureModal({
  title = "Подтверждение удаления",
  lectureId,
  group,
  lector,
  onConfirm,
}) {
  const { isOpen, close } = useModal("deleteLecture"); // <-- тут было "confirm"

  const handleConfirm = () => {
    onConfirm(lectureId);
    close();
  };

  const message = `Вы уверены, что хотите удалить лекцию группы ${group || "не указана"} с лектором ${lector || "не указан"}? Это действие нельзя отменить.`;

  return (
    <Dialog
      open={isOpen}
      onClose={close}
      aria-labelledby="confirm-delete-lecture"
    >
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

export default ConfirmDeleteLectureModal;
