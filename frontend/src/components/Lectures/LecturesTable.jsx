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
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { useParams } from "react-router-dom";
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

function LecturesTable({ search, sortBy, order, visibleColumns, date }) {
  const fetchLecturesByDate = useFetchLecturesByDate();
  const lectures = useLectures();
  const loading = useLecturesLoading();
  const error = useLecturesError();
  const updateLecture = useUpdateLecture();
  const removeLecture = useRemoveLecture();
  const { open: openConfirm } = useModal("deleteLecture");

  const [editingCell, setEditingCell] = useState(null); // { rowId, columnId }
  const [editedValues, setEditedValues] = useState({}); // { rowId: { columnId: value } }

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
    { id: "adminId", label: "ID админа" },
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

  const handleStartEdit = (rowId, columnId) => {
    setEditingCell({ rowId, columnId });
  };

  const handleFinishEdit = async (rowId, columnId, newValue) => {
    // Если это время, конвертируем, иначе оставляем как есть
    const valueToStore = ["start", "end"].includes(columnId)
      ? timeToISO(newValue)
      : newValue;

    // Сохраняем в локальное состояние
    setEditedValues((prev) => ({
      ...prev,
      [rowId]: { ...prev[rowId], [columnId]: valueToStore },
    }));

    setEditingCell(null);

    try {
      // Отправляем на сервер именно "чистое" значение, которое пользователь ввёл
      // Сервер сам конвертирует start/end через timeToISO
      await updateLecture(rowId, { [columnId]: newValue });
    } catch (error) {
      console.error("Ошибка обновления:", error);
    }
  };

  // const handleFinishEdit = async (rowId, columnId, newValue) => {
  //   setEditedValues((prev) => ({
  //     ...prev,
  //     [rowId]: { ...prev[rowId], [columnId]: newValue },
  //   }));
  //   setEditingCell(null);
  //   try {
  //     await updateLecture(rowId, { [columnId]: newValue });
  //   } catch (error) {
  //     console.error("Ошибка обновления:", error);
  //   }
  // };

  const handleOpenDeleteDialog = (lecture) => {
    openConfirm({
      lectureId: lecture.id,
      group: lecture.group,
      lector: lecture.lector,
      onConfirm: handleConfirmDelete,
    });
  };

  const handleConfirmDelete = async (id) => {
    try {
      await removeLecture(id);
    } catch (error) {
      console.error("Ошибка удаления:", error);
    }
  };

  const getCellValue = (lecture, columnId) => {
    const edited = editedValues[lecture.id]?.[columnId];
    return edited !== undefined ? edited : lecture[columnId] || "-";
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
                          ["createdAt", "updatedAt"].includes(column.id)
                            ? null
                            : handleStartEdit(lecture.id, column.id)
                        }
                      >
                        {isEditing ? (
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
