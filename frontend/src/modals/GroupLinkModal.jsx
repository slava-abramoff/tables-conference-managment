import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
} from "@mui/material";
import { useModal } from "../context/ModalContext";
import { useAddManyLinks } from "../store/lecturesStore";

function GroupLinkModal() {
  const { isOpen, close } = useModal("groupLink");
  const createLinks = useAddManyLinks();
  const [groupName, setGroupName] = useState("");
  const [link, setLink] = useState("");

  const handleSave = () => {
    createLinks({ groupName, url: link });
    close();
  };

  return (
    <Dialog open={isOpen} onClose={close} fullWidth maxWidth="sm">
      <DialogTitle>Единая ссылка для группы</DialogTitle>
      <DialogContent
        sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 2 }}
      >
        <Typography variant="body1">
          Укажите наименование группы, для которой необходимо установить единую
          ссылку для подключения ко всем занятиям.
        </Typography>

        <TextField
          label="Название группы"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          fullWidth
        />

        <TextField
          label="Ссылка на подключение"
          value={link}
          onChange={(e) => setLink(e.target.value)}
          fullWidth
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={close}>Отмена</Button>
        <Button onClick={handleSave} variant="contained" color="primary">
          Отправить
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default GroupLinkModal;
