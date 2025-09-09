import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Select,
  MenuItem,
  Typography,
} from "@mui/material";
import { useModal } from "../context/ModalContext";
import { useAddMeets } from "../store/meetsStore";

function CreateMeetModal() {
  const { isOpen, close } = useModal("createMeet");
  const addMeets = useAddMeets();
  const [eventName, setEventName] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [platform, setPlatform] = useState("");
  const [devices, setDevices] = useState("");
  const [description, setDescription] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [url, setUrl] = useState("");
  const [shortUrl, setShortUrl] = useState("");
  const [adminId, setAdminId] = useState("");
  const [status, setStatus] = useState("new");
  const [error, setError] = useState("");

  const handleSave = async () => {
    try {
      await addMeets([
        {
          eventName,
          customerName,
          email,
          phone,
          location,
          platform,
          devices,
          description,
          start,
          end,
          url,
          shortUrl,
          adminId,
          status,
        },
      ]);
      close();
    } catch (error) {
      setError(error.message || "Ошибка создания мероприятия");
    }
  };

  return (
    <Dialog open={isOpen} onClose={close}>
      <DialogTitle>Создать мероприятие</DialogTitle>
      <DialogContent
        sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 2 }}
      >
        {error && <Typography color="error">{error}</Typography>}
        <TextField
          label="Название мероприятия"
          value={eventName}
          onChange={(e) => setEventName(e.target.value)}
          fullWidth
        />
        <TextField
          label="Имя организатора"
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          fullWidth
        />
        <TextField
          label="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          fullWidth
        />
        <TextField
          label="Телефон"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          fullWidth
        />
        <TextField
          label="Место проведения"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          fullWidth
        />
        <TextField
          label="Платформа"
          value={platform}
          onChange={(e) => setPlatform(e.target.value)}
          fullWidth
        />
        <TextField
          label="Аппаратура"
          value={devices}
          onChange={(e) => setDevices(e.target.value)}
          fullWidth
        />
        <TextField
          label="Комментарий"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          fullWidth
          multiline
        />
        <TextField
          label="Начало мероприятия"
          type="datetime-local"
          value={start ? new Date(start).toISOString().slice(0, 16) : ""}
          onChange={(e) => setStart(new Date(e.target.value).toISOString())}
          fullWidth
        />
        <TextField
          label="Конец мероприятия"
          type="datetime-local"
          value={end ? new Date(end).toISOString().slice(0, 16) : ""}
          onChange={(e) => setEnd(new Date(e.target.value).toISOString())}
          fullWidth
        />
        <TextField
          label="Ссылка на конференцию"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          fullWidth
        />
        <TextField
          label="Короткая ссылка"
          value={shortUrl}
          onChange={(e) => setShortUrl(e.target.value)}
          fullWidth
        />
        <TextField
          label="ID администратора"
          value={adminId}
          onChange={(e) => setAdminId(e.target.value)}
          fullWidth
        />
        <Select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          fullWidth
        >
          <MenuItem value="new">New</MenuItem>
          <MenuItem value="in_progress">In Progress</MenuItem>
          <MenuItem value="completed">Completed</MenuItem>
        </Select>
      </DialogContent>
      <DialogActions>
        <Button onClick={close}>Отмена</Button>
        <Button onClick={handleSave} color="primary">
          Создать
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default CreateMeetModal;
