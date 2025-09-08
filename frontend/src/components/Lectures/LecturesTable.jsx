import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  Typography,
  TextField,
  IconButton,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

function LecturesTable({ search, sortBy, order, visibleColumns }) {
  const [lectures, setLectures] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [error, setError] = useState(null);
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

  // Моковые данные
  const mockLectures = [
    {
      id: "1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d",
      group: "Группа 101",
      lector: "Иванов И.И.",
      platform: "Zoom",
      unit: "Корпус А",
      location: "Ауд. 101",
      url: "https://zoom.us/j/123456789",
      shortUrl: "zoom.us/123",
      streamKey: "key123",
      description: "Введение в программирование",
      adminId: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
      start: "2025-09-01T14:00:00Z",
      end: "2025-09-01T15:30:00Z",
      abnormalTime: "",
      createdAt: "2025-08-30T08:00:00Z",
      updatedAt: "2025-08-30T08:00:00Z",
    },
    {
      id: "2b3c4d5e-6f7a-8b9c-0d1e-2f3a4b5c6d7e",
      group: "Группа 102",
      lector: "Петрова А.А.",
      platform: "Teams",
      unit: "Корпус Б",
      location: "Ауд. 202",
      url: "https://teams.microsoft.com/l/meetup-join/123",
      shortUrl: "teams.ms/123",
      streamKey: "key456",
      description: "Основы алгоритмов",
      adminId: "a9b8c7d6-12ef-3456-7890-abcdef123456",
      start: "2025-09-01T10:00:00Z",
      end: "2025-09-01T11:30:00Z",
      abnormalTime: "После обеда",
      createdAt: "2025-08-31T09:00:00Z",
      updatedAt: "2025-08-31T09:00:00Z",
    },
    {
      id: "3c4d5e6f-7a8b-9c0d-1e2f-3a4b5c6d7e8f",
      group: "Группа 103",
      lector: "Сидоров С.С.",
      platform: "Google Meet",
      unit: "Корпус В",
      location: "Ауд. 303",
      url: "https://meet.google.com/abc-123",
      shortUrl: "meet.google/abc",
      streamKey: "key789",
      description: "Базы данных",
      adminId: "123e4567-e89b-12d3-a456-426614174000",
      start: "2025-09-02T09:00:00Z",
      end: "2025-09-02T10:30:00Z",
      abnormalTime: "",
      createdAt: "2025-09-01T07:00:00Z",
      updatedAt: "2025-09-01T07:00:00Z",
    },
    {
      id: "4d5e6f7a-8b9c-0d1e-2f3a-4b5c6d7e8f9a",
      group: "Группа 104",
      lector: "Кузнецова М.М.",
      platform: "Zoom",
      unit: "Корпус А",
      location: "Ауд. 104",
      url: "https://zoom.us/j/987654321",
      shortUrl: "zoom.us/987",
      streamKey: "key012",
      description: "Машинное обучение",
      adminId: "7890abcd-12ef-3456-7890-abcdef123457",
      start: "2025-09-02T13:00:00Z",
      end: "2025-09-02T14:30:00Z",
      abnormalTime: "Утренний блок",
      createdAt: "2025-09-01T08:00:00Z",
      updatedAt: "2025-09-01T08:00:00Z",
    },
    {
      id: "5e6f7a8b-9c0d-1e2f-3a4b-5c6d7e8f9a0b",
      group: "Группа 105",
      lector: "Смирнов Д.Д.",
      platform: "Teams",
      unit: "Корпус Б",
      location: "Ауд. 205",
      url: "https://teams.microsoft.com/l/meetup-join/456",
      shortUrl: "teams.ms/456",
      streamKey: "key345",
      description: "Веб-разработка",
      adminId: "4567bcde-23fa-4567-8901-bcdef2345678",
      start: "2025-09-03T11:00:00Z",
      end: "2025-09-03T12:30:00Z",
      abnormalTime: "",
      createdAt: "2025-09-02T09:00:00Z",
      updatedAt: "2025-09-02T09:00:00Z",
    },
    {
      id: "6f7a8b9c-0d1e-2f3a-4b5c-6d7e8f9a0b1c",
      group: "Группа 106",
      lector: "Васильева Е.Е.",
      platform: "Google Meet",
      unit: "Корпус В",
      location: "Ауд. 306",
      url: "https://meet.google.com/def-456",
      shortUrl: "meet.google/def",
      streamKey: "key678",
      description: "Искусственный интеллект",
      adminId: "8901cdef-34ab-5678-9012-cdef34567890",
      start: "2025-09-03T15:00:00Z",
      end: "2025-09-03T16:30:00Z",
      abnormalTime: "",
      createdAt: "2025-09-02T10:00:00Z",
      updatedAt: "2025-09-02T10:00:00Z",
    },
    {
      id: "7a8b9c0d-1e2f-3a4b-5c6d-7e8f9a0b1c2d",
      group: "Группа 107",
      lector: "Морозов А.А.",
      platform: "Zoom",
      unit: "Корпус А",
      location: "Ауд. 107",
      url: "https://zoom.us/j/654321987",
      shortUrl: "zoom.us/654",
      streamKey: "key901",
      description: "Кибербезопасность",
      adminId: "2345ef01-45bc-6789-0123-def012345678",
      start: "2025-09-04T10:00:00Z",
      end: "2025-09-04T11:30:00Z",
      abnormalTime: "Вечерний блок",
      createdAt: "2025-09-03T08:00:00Z",
      updatedAt: "2025-09-03T08:00:00Z",
    },
    {
      id: "8b9c0d1e-2f3a-4b5c-6d7e-8f9a0b1c2d3e",
      group: "Группа 108",
      lector: "Соколова О.О.",
      platform: "Teams",
      unit: "Корпус Б",
      location: "Ауд. 208",
      url: "https://teams.microsoft.com/l/meetup-join/789",
      shortUrl: "teams.ms/789",
      streamKey: "key234",
      description: "Мобильная разработка",
      adminId: "6789f012-56cd-7890-1234-ef0123456789",
      start: "2025-09-04T14:00:00Z",
      end: "2025-09-04T15:30:00Z",
      abnormalTime: "",
      createdAt: "2025-09-03T09:00:00Z",
      updatedAt: "2025-09-03T09:00:00Z",
    },
    {
      id: "9c0d1e2f-3a4b-5c6d-7e8f-9a0b1c2d3e4f",
      group: "Группа 109",
      lector: "Зайцев П.П.",
      platform: "Google Meet",
      unit: "Корпус В",
      location: "Ауд. 309",
      url: "https://meet.google.com/ghi-789",
      shortUrl: "meet.google/ghi",
      streamKey: "key567",
      description: "Облачные технологии",
      adminId: "0123a456-67de-8901-2345-f01234567890",
      start: "2025-09-05T09:00:00Z",
      end: "2025-09-05T10:30:00Z",
      abnormalTime: "",
      createdAt: "2025-09-04T07:00:00Z",
      updatedAt: "2025-09-04T07:00:00Z",
    },
    {
      id: "0d1e2f3a-4b5c-6d7e-8f9a-0b1c2d3e4f5a",
      group: "Группа 110",
      lector: "Козлова Н.Н.",
      platform: "Zoom",
      unit: "Корпус А",
      location: "Ауд. 110",
      url: "https://zoom.us/j/321654987",
      shortUrl: "zoom.us/321",
      streamKey: "key890",
      description: "Блокчейн",
      adminId: "3456b789-78ef-9012-3456-a12345678901",
      start: "2025-09-05T13:00:00Z",
      end: "2025-09-05T14:30:00Z",
      abnormalTime: "Утренний блок",
      createdAt: "2025-09-04T08:00:00Z",
      updatedAt: "2025-09-04T08:00:00Z",
    },
  ];

  // Загрузка данных
  useEffect(() => {
    // const fetchLectures = async () => {
    //   try {
    //     const { data, pagination } = await getLectures({
    //       page: page + 1,
    //       pageSize: rowsPerPage,
    //       search,
    //       sortBy: sortBy || "start", // По умолчанию сортировка по start
    //       order: order || "asc",
    //     });
    //     setLectures(data || []);
    //     setTotalItems(pagination?.totalItems || 0);
    //     setError(null);
    //   } catch (error) {
    //     setError("Ошибка загрузки лекций");
    //   }
    // };
    // fetchLectures();
  }, [page, rowsPerPage, search, sortBy, order]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleStartEdit = (rowId, columnId) => {
    setEditingCell({ rowId, columnId });
  };

  const handleFinishEdit = async (rowId, columnId, newValue) => {
    setEditedValues((prev) => ({
      ...prev,
      [rowId]: { ...prev[rowId], [columnId]: newValue },
    }));
    setEditingCell(null);

    try {
      // await updateLecture(rowId, { [columnId]: newValue });
    } catch (error) {
      console.error("Ошибка обновления:", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      // await deleteLecture(id);
      setLectures((prev) => prev.filter((lecture) => lecture.id !== id));
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

  if (error) {
    return <Typography color="error">{error}</Typography>;
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
            {(lectures.length > 0 ? lectures : mockLectures).map((lecture) => (
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
                            onClick={() => handleDelete(lecture.id)}
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
                              ["start", "end"].includes(column.id) &&
                              isValidDate(value)
                                ? new Date(value).toLocaleTimeString("ru-RU", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    hour12: false,
                                  })
                                : value === "-"
                                  ? ""
                                  : value
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
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={totalItems}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Paper>
  );
}

export default LecturesTable;
