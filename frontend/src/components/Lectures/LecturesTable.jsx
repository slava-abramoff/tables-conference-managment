import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  TextField,
  IconButton,
  Autocomplete,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  useFetchLecturesByDate,
  useLectures,
  useLecturesError,
  useLecturesLoading,
  useRemoveLecture,
  useUpdateLecture,
} from "../../store/lecturesStore";
import { useModal } from "../../context/ModalContext";
import ConfirmDeleteLectureModal from "../../modals/ConfirmDeleteLectureModal";
import { timeToISO } from "../../utils/datetime";
import { searchUsers } from "../../services/users.service";
import useAuthStore from "../../store/authStore";

function LecturesTable({ search, sortBy, order, visibleColumns, date }) {
  const fetchLecturesByDate = useFetchLecturesByDate();
  const lectures = useLectures();
  const loading = useLecturesLoading();
  const error = useLecturesError();
  const updateLecture = useUpdateLecture();
  const removeLecture = useRemoveLecture();
  const { open: openConfirm } = useModal("deleteLecture");
  const { user } = useAuthStore(); // Получаем данные пользователя из Zustand
  const isViewer = user?.role === "viewer"; // Проверяем, является ли пользователь viewer

  const [editingCell, setEditingCell] = useState(null); // { rowId, columnId }
  const [editedValues, setEditedValues] = useState({}); // { rowId: { columnId: value } }
  const [adminOptions, setAdminOptions] = useState([]);

  // Определение всех возможных колонок
  const allColumns = [
    { id: "group", label: "Группа" },
    { id: "lector", label: "Лектор" },
    { id: "platform", label: "Платформа" },
    { id: "unit", label: "Корпус" },
    { id: "location", label: "Место" },
    { id: "url", label: "Ссылка" },
    { id: "shortUrl", label: "Короткая ссылка" },
    { id: "streamKey", label: "Ключ стрима" },
    { id: "description", label: "Описание" },
    { id: "adminId", label: "Админ" },
    { id: "start", label: "Начало" },
    { id: "end", label: "Конец" },
    { id: "abnormalTime", label: "Нестандартное время" },
    { id: "createdAt", label: "Создано" },
    { id: "updatedAt", label: "Обновлено" },
    { id: "actions", label: "Действия" },
  ];

  // Загрузка данных по date
  useEffect(() => {
    if (date) {
      fetchLecturesByDate(date);
    }
  }, [date, fetchLecturesByDate]);

  // Функция поиска администраторов
  const handleAdminSearch = async (term) => {
    if (term.length < 2) return;
    try {
      const res = await searchUsers({ term });
      setAdminOptions(res.data || []);
    } catch (err) {
      console.error("Ошибка поиска админов", err);
    }
  };

  // Фильтрация и сортировка на клиенте
  const filteredLectures = lectures
    .filter((lecture) =>
      search
        ? Object.values(lecture).some(
            (value) =>
              value &&
              value.toString().toLowerCase().includes(search.toLowerCase()),
          )
        : true,
    )
    .sort((a, b) => {
      if (!sortBy) return 0;
      const aValue = a[sortBy] || "";
      const bValue = b[sortBy] || "";
      if (order === "asc") {
        return aValue.localeCompare(bValue);
      }
      return bValue.localeCompare(aValue);
    });

  const handleStartEdit = (rowId, columnId, initialValue) => {
    if (isViewer) return; // Блокируем редактирование для viewer
    setEditingCell({ rowId, columnId });
    setEditedValues((prev) => ({
      ...prev,
      [rowId]: { ...prev[rowId], [columnId]: initialValue || "" },
    }));
  };

  const handleFinishEdit = async (rowId, columnId, newValue) => {
    if (isViewer) return;

    let valueToStore = newValue;

    if (["start", "end"].includes(columnId)) {
      const lecture = lectures.find((l) => l.id === rowId);
      if (!lecture) return;
      valueToStore = timeToISO(newValue);
    } else if (columnId === "adminId") {
      // Сохраняем adminId как есть
      valueToStore = newValue;
    }

    // Сохраняем в локальное состояние
    setEditedValues((prev) => ({
      ...prev,
      [rowId]: { ...prev[rowId], [columnId]: valueToStore },
    }));

    setEditingCell(null);

    try {
      if (columnId === "adminId") {
        await updateLecture(rowId, { adminId: valueToStore });
      } else {
        await updateLecture(rowId, { [columnId]: valueToStore });
      }
    } catch (error) {
      console.error("Ошибка обновления:", error);
    }
  };

  const handleOpenDeleteDialog = (lecture) => {
    if (isViewer) return; // Блокируем удаление для viewer
    openConfirm({
      lectureId: lecture.id,
      group: lecture.group,
      lector: lecture.lector,
      onConfirm: handleConfirmDelete,
    });
  };

  const handleConfirmDelete = async (id) => {
    if (isViewer) return; // Блокируем удаление для viewer
    try {
      await removeLecture(id);
    } catch (error) {
      console.error("Ошибка удаления:", error);
    }
  };

  const getCellValue = (lecture, columnId) => {
    if (columnId === "adminId") {
      const admin = lecture.admin;
      if (!admin) return "";
      return admin.name || admin.login || "";
    }
    const edited = editedValues[lecture.id]?.[columnId];
    return edited !== undefined ? edited : lecture[columnId] || "";
  };

  const isValidDate = (value) => {
    return value && value !== "-" && !isNaN(new Date(value).getTime());
  };

  if (loading) {
    return <Typography>Загрузка...</Typography>;
  }

  if (error) {
    return <Typography color="error">Ошибка: {error}</Typography>;
  }

  return (
    <Paper sx={{ width: "100%", overflow: "hidden" }}>
      <TableContainer sx={{ maxHeight: 440, overflowX: "auto" }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              {allColumns
                .filter(
                  (col) =>
                    col.id === "actions" || (visibleColumns[col.id] ?? true),
                )
                .map((column) => (
                  <TableCell key={column.id}>{column.label}</TableCell>
                ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredLectures.map((lecture) => (
              <TableRow key={lecture.id}>
                {allColumns
                  .filter(
                    (col) =>
                      col.id === "actions" || (visibleColumns[col.id] ?? true),
                  )
                  .map((column) => {
                    const isEditing =
                      editingCell?.rowId === lecture.id &&
                      editingCell?.columnId === column.id;
                    const value = getCellValue(lecture, column.id);

                    if (column.id === "actions") {
                      return (
                        <TableCell key={column.id}>
                          <IconButton
                            onClick={() => handleOpenDeleteDialog(lecture)}
                            aria-label="Удалить"
                            disabled={isViewer} // Отключаем кнопку для viewer
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      );
                    }

                    return (
                      <TableCell
                        key={column.id}
                        onClick={() =>
                          ["createdAt", "updatedAt"].includes(column.id) ||
                          isViewer
                            ? null
                            : handleStartEdit(lecture.id, column.id, value)
                        }
                      >
                        {isEditing && column.id === "adminId" ? (
                          <Autocomplete
                            options={adminOptions}
                            getOptionLabel={(option) =>
                              option.name || option.login || ""
                            }
                            onInputChange={(e, newInput) =>
                              handleAdminSearch(newInput)
                            }
                            onChange={(e, newValue) => {
                              if (newValue) {
                                handleFinishEdit(
                                  lecture.id,
                                  "adminId",
                                  newValue.id,
                                );
                              }
                            }}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                autoFocus
                                placeholder="Поиск админа..."
                              />
                            )}
                          />
                        ) : isEditing ? (
                          <TextField
                            type={
                              ["start", "end"].includes(column.id)
                                ? "time"
                                : "text"
                            }
                            defaultValue={
                              ["start", "end"].includes(column.id)
                                ? isValidDate(value)
                                  ? new Date(value).toLocaleTimeString(
                                      "ru-RU",
                                      {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                        hour12: false,
                                      },
                                    )
                                  : ""
                                : value || ""
                            }
                            autoFocus
                            onBlur={(e) =>
                              handleFinishEdit(
                                lecture.id,
                                column.id,
                                e.target.value,
                              )
                            }
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                handleFinishEdit(
                                  lecture.id,
                                  column.id,
                                  e.target.value,
                                );
                              }
                            }}
                            sx={{ width: "100%" }}
                          />
                        ) : column.id === "start" || column.id === "end" ? (
                          isValidDate(value) ? (
                            new Date(value).toLocaleTimeString("ru-RU", {
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: false,
                            })
                          ) : (
                            "-"
                          )
                        ) : column.id === "createdAt" ||
                          column.id === "updatedAt" ? (
                          isValidDate(value) ? (
                            new Date(value).toLocaleString("ru-RU")
                          ) : (
                            "-"
                          )
                        ) : (
                          value
                        )}
                      </TableCell>
                    );
                  })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}

export default LecturesTable;
