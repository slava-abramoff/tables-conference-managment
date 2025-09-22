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
  Autocomplete,
  FormControl,
  InputLabel,
  FormHelperText,
} from "@mui/material";
import { useModal } from "../context/ModalContext";
import { useAddMeets } from "../store/meetsStore";
import { searchUsers } from "../services/users.service";

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
  const [admin, setAdmin] = useState(null);
  const [adminOptions, setAdminOptions] = useState([]);
  const [status, setStatus] = useState("new");
  const [error, setError] = useState("");

  const handleAdminSearch = async (term) => {
    if (term.length < 2) return;
    try {
      const res = await searchUsers({ term });
      setAdminOptions(res.data || []);
    } catch (err) {
      console.error("Ошибка поиска админов", err);
    }
  };

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
        },
      ]);
      close();
    } catch (error) {
      setError(error.message || "Ошибка создания мероприятия");
    }
  };

  return (
    <Dialog open={isOpen} onClose={close} fullWidth maxWidth="sm">
      <DialogTitle>Создать мероприятие</DialogTitle>
      <DialogContent
        sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 2 }}
      >
        {error && <Typography color="error">{error}</Typography>}

        <TextField
          label="Название мероприятия"
          helperText="Укажите официальное название конференции или встречи"
          value={eventName}
          onChange={(e) => setEventName(e.target.value)}
          fullWidth
        />

        <TextField
          label="Начало мероприятия"
          type="datetime-local"
          helperText="Укажите дату и время (ISO8601 отправляется на сервер)"
          value={start ? new Date(start).toISOString().slice(0, 16) : ""}
          onChange={(e) => setStart(new Date(e.target.value).toISOString())}
          fullWidth
          InputLabelProps={{ shrink: true }}
        />

        <TextField
          label="Конец мероприятия"
          type="datetime-local"
          helperText="Укажите дату и время окончания"
          value={end ? new Date(end).toISOString().slice(0, 16) : ""}
          onChange={(e) => setEnd(new Date(e.target.value).toISOString())}
          fullWidth
          InputLabelProps={{ shrink: true }}
        />

        <TextField
          label="Имя организатора"
          helperText="ФИО или название организации"
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          fullWidth
        />

        <TextField
          label="Email"
          helperText="Для уведомлений и обратной связи"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          fullWidth
        />

        <TextField
          label="Телефон"
          helperText="Контактный номер организатора"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          fullWidth
        />

        <TextField
          label="Место проведения"
          helperText="Адрес или название площадки (если оффлайн)"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          fullWidth
        />

        <TextField
          label="Платформа"
          helperText="Например: Zoom, Teams, Google Meet"
          value={platform}
          onChange={(e) => setPlatform(e.target.value)}
          fullWidth
        />

        <TextField
          label="Аппаратура"
          helperText="Перечислите необходимое оборудование"
          value={devices}
          onChange={(e) => setDevices(e.target.value)}
          fullWidth
        />

        <TextField
          label="Комментарий"
          helperText="Дополнительная информация для команды"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          fullWidth
          multiline
          minRows={3}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={close}>Отмена</Button>
        <Button onClick={handleSave} color="primary" variant="contained">
          Создать
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default CreateMeetModal;
