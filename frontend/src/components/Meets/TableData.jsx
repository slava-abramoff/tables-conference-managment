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
} from "@mui/material";

function TableData({ search, status, sortBy, order, visibleColumns }) {
  const [meets, setMeets] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [error, setError] = useState(null);
  const [editingCell, setEditingCell] = useState(null); // { rowId, columnId }
  const [editedValues, setEditedValues] = useState({}); // { rowId: { columnId: value } }

  // Определение всех возможных колонок из модели Meet
  const allColumns = [
    { id: "eventName", label: "Название" },
    { id: "customerName", label: "Заказчик" },
    { id: "email", label: "Email" },
    { id: "phone", label: "Телефон" },
    { id: "location", label: "Место" },
    { id: "platform", label: "Платформа" },
    { id: "devices", label: "Оборудование" },
    { id: "url", label: "Ссылка" },
    { id: "shortUrl", label: "Короткая ссылка" },
    { id: "status", label: "Статус" },
    { id: "description", label: "Описание" },
    { id: "start", label: "Начало" },
    { id: "end", label: "Конец" },
    { id: "createdAt", label: "Создано" },
  ];

  // Загрузка данных
  useEffect(() => {
    // const fetchMeets = async () => {
    //   try {
    //     const { data, pagination } = await getMeets({
    //       page: page + 1,
    //       pageSize: rowsPerPage,
    //       search,
    //       status,
    //       sortBy,
    //       order,
    //     });
    //     setMeets(data || []);
    //     setTotalItems(pagination?.totalItems || 0);
    //     setError(null);
    //   } catch (error) {
    //     setError("Ошибка загрузки данных");
    //   }
    // };
    // fetchMeets();
  }, [page, rowsPerPage, search, status, sortBy, order]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Начать редактирование ячейки
  const handleStartEdit = (rowId, columnId) => {
    setEditingCell({ rowId, columnId });
  };

  // Завершить редактирование
  const handleFinishEdit = async (rowId, columnId, newValue) => {
    setEditedValues((prev) => ({
      ...prev,
      [rowId]: { ...prev[rowId], [columnId]: newValue },
    }));
    setEditingCell(null);

    // Заглушка для API-обновления
    try {
      console.log(`Обновление для ID ${rowId}: ${columnId} = ${newValue}`);
      // await updateMeet(rowId, { [columnId]: newValue }); // Реальный эндпоинт
    } catch (error) {
      console.error("Ошибка обновления:", error);
    }
  };

  // Получить значение ячейки
  const getCellValue = (meet, columnId) => {
    const edited = editedValues[meet.id]?.[columnId];
    return edited !== undefined ? edited : meet[columnId] || "-";
  };

  // Моковые данные
  const mockMeets = [
    {
      id: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
      eventName: "Технологический форум 2025",
      customerName: "Иван Иванов",
      email: "ivan.ivanov@example.com",
      phone: "+79991234567",
      location: "Москва, Красный зал",
      platform: "Zoom",
      devices: "Камера, микрофон, проектор",
      url: "https://zoom.us/j/1234567890",
      shortUrl: "zoom.us/123",
      status: "new",
      description: "Ежегодный форум по новым технологиям",
      adminId: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      start: "2025-09-15T10:00:00Z",
      end: "2025-09-15T14:00:00Z",
      createdAt: "2025-09-01T08:00:00Z",
      updatedAt: "2025-09-02T10:00:00Z",
    },
    {
      id: "a9b8c7d6-12ef-3456-7890-abcdef123456",
      eventName: "Вебинар по маркетингу",
      customerName: "Анна Петрова",
      email: "anna.petрова@example.com",
      phone: "+79998765432",
      location: "Онлайн",
      platform: "Microsoft Teams",
      devices: "Ноутбук",
      url: "https://teams.microsoft.com/l/meetup-join/456",
      shortUrl: "teams.ms/456",
      status: "in_progress",
      description: "Обсуждение стратегий цифрового маркетинга",
      adminId: "b2c3d4e5-f6a7-8901-bcde-f23456789012",
      start: "2025-09-16T12:00:00Z",
      end: "2025-09-16T13:30:00Z",
      createdAt: "2025-09-02T09:00:00Z",
      updatedAt: "2025-09-03T11:00:00Z",
    },
    {
      id: "123e4567-e89b-12d3-a456-426614174000",
      eventName: "Конференция AI 2025",
      customerName: "Сергей Сидоров",
      email: "sergey.sidorov@example.com",
      phone: "+79991112233",
      location: "Санкт-Петербург",
      platform: "Google Meet",
      devices: "Проектор, колонки",
      url: "https://meet.google.com/abc-def-ghi",
      shortUrl: "meet.google/abc",
      status: "completed",
      description: "Конференция по искусственному интеллекту",
      adminId: "c3d4e5f6-7890-1234-cdef-345678901234",
      start: "2025-09-10T09:00:00Z",
      end: "2025-09-10T17:00:00Z",
      createdAt: "2025-08-25T07:00:00Z",
      updatedAt: "2025-09-11T12:00:00Z",
    },
    {
      id: "7890abcd-12ef-3456-7890-abcdef123457",
      eventName: "Семинар по блокчейну",
      customerName: "Мария Кузнецова",
      email: "maria.kuznetsova@example.com",
      phone: "+79993334455",
      location: "Екатеринбург",
      platform: "Zoom",
      devices: "Микрофон, камера",
      url: "https://zoom.us/j/9876543210",
      shortUrl: "zoom.us/987",
      status: "new",
      description: "Введение в блокчейн-технологии",
      adminId: "d4e5f6a7-8901-2345-def0-456789012345",
      start: "2025-09-20T11:00:00Z",
      end: "2025-09-20T15:00:00Z",
      createdAt: "2025-09-05T10:00:00Z",
      updatedAt: null,
    },
    {
      id: "4567bcde-23fa-4567-8901-bcdef2345678",
      eventName: "Встреча разработчиков",
      customerName: "Дмитрий Смирнов",
      email: "dmitry.smirnov@example.com",
      phone: "+79995556677",
      location: "Онлайн",
      platform: "Discord",
      devices: "Наушники",
      url: "https://discord.gg/xyz123",
      shortUrl: "discord.gg/xyz",
      status: "in_progress",
      description: "Обсуждение новых фреймворков",
      adminId: "e5f6a7b8-9012-3456-ef01-567890123456",
      start: "2025-09-18T14:00:00Z",
      end: "2025-09-18T16:00:00Z",
      createdAt: "2025-09-03T08:00:00Z",
      updatedAt: "2025-09-04T09:00:00Z",
    },
    {
      id: "8901cdef-34ab-5678-9012-cdef34567890",
      eventName: "Хакатон 2025",
      customerName: "Елена Васильева",
      email: "elena.vasilyeva@example.com",
      phone: "+79997778899",
      location: "Казань",
      platform: "Zoom",
      devices: "Ноутбуки, проектор",
      url: "https://zoom.us/j/1122334455",
      shortUrl: "zoom.us/112",
      status: "new",
      description: "Хакатон по разработке приложений",
      adminId: "f6a7b8c9-0123-4567-f012-678901234567",
      start: "2025-09-25T09:00:00Z",
      end: "2025-09-27T18:00:00Z",
      createdAt: "2025-09-10T07:00:00Z",
      updatedAt: null,
    },
    {
      id: "2345ef01-45bc-6789-0123-def012345678",
      eventName: "Вебинар по UX",
      customerName: "Алексей Морозов",
      email: "alexey.morozov@example.com",
      phone: "+79996667788",
      location: "Онлайн",
      platform: "Google Meet",
      devices: "Камера",
      url: "https://meet.google.com/jkl-mno-pqr",
      shortUrl: "meet.google/jkl",
      status: "completed",
      description: "Основы проектирования интерфейсов",
      adminId: "a7b8c9d0-1234-5678-9012-789012345678",
      start: "2025-09-12T13:00:00Z",
      end: "2025-09-12T15:00:00Z",
      createdAt: "2025-08-30T10:00:00Z",
      updatedAt: "2025-09-13T11:00:00Z",
    },
    {
      id: "6789f012-56cd-7890-1234-ef0123456789",
      eventName: "Конференция по безопасности",
      customerName: "Ольга Соколова",
      email: "olga.sokolova@example.com",
      phone: "+79994445566",
      location: "Новосибирск",
      platform: "Zoom",
      devices: "Микрофон, проектор",
      url: "https://zoom.us/j/2233445566",
      shortUrl: "zoom.us/223",
      status: "in_progress",
      description: "Кибербезопасность в 2025 году",
      adminId: "b8c9d0e1-2345-6789-0123-890123456789",
      start: "2025-09-17T10:00:00Z",
      end: "2025-09-17T14:00:00Z",
      createdAt: "2025-09-04T09:00:00Z",
      updatedAt: "2025-09-05T10:00:00Z",
    },
    {
      id: "0123a456-67de-8901-2345-f01234567890",
      eventName: "Семинар по облачным технологиям",
      customerName: "Павел Зайцев",
      email: "pavel.zaytsev@example.com",
      phone: "+79993336677",
      location: "Онлайн",
      platform: "Microsoft Teams",
      devices: "Ноутбук, камера",
      url: "https://teams.microsoft.com/l/meetup-join/789",
      shortUrl: "teams.ms/789",
      status: "new",
      description: "Облачные решения для бизнеса",
      adminId: "c9d0e1f2-3456-7890-1234-901234567890",
      start: "2025-09-22T11:00:00Z",
      end: "2025-09-22T13:00:00Z",
      createdAt: "2025-09-07T08:00:00Z",
      updatedAt: null,
    },
    {
      id: "3456b789-78ef-9012-3456-a12345678901",
      eventName: "Встреча по DevOps",
      customerName: "Наталья Козлова",
      email: "natalya.kozlova@example.com",
      phone: "+79992223344",
      location: "Самара",
      platform: "Zoom",
      devices: "Проектор, колонки",
      url: "https://zoom.us/j/3344556677",
      shortUrl: "zoom.us/334",
      status: "completed",
      description: "Автоматизация процессов разработки",
      adminId: "d0e1f2a3-4567-8901-2345-012345678901",
      start: "2025-09-14T15:00:00Z",
      end: "2025-09-14T17:00:00Z",
      createdAt: "2025-09-01T09:00:00Z",
      updatedAt: "2025-09-15T10:00:00Z",
    },
  ];

  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  return (
    <Paper sx={{ width: "100%", overflow: "hidden" }}>
      <TableContainer sx={{ maxHeight: 540, overflowX: "auto" }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              {allColumns
                .filter((col) => visibleColumns[col.id] ?? true)
                .map((column) => (
                  <TableCell key={column.id}>{column.label}</TableCell>
                ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {(meets.length > 0 ? meets : mockMeets).map((meet) => (
              <TableRow key={meet.id}>
                {allColumns
                  .filter((col) => visibleColumns[col.id] ?? true)
                  .map((column) => {
                    const isEditing =
                      editingCell?.rowId === meet.id &&
                      editingCell?.columnId === column.id;
                    const value = getCellValue(meet, column.id);
                    return (
                      <TableCell
                        key={column.id}
                        onClick={() => handleStartEdit(meet.id, column.id)}
                      >
                        {isEditing ? (
                          <TextField
                            defaultValue={value}
                            autoFocus
                            onBlur={(e) =>
                              handleFinishEdit(
                                meet.id,
                                column.id,
                                e.target.value,
                              )
                            }
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                handleFinishEdit(
                                  meet.id,
                                  column.id,
                                  e.target.value,
                                );
                              }
                            }}
                            sx={{ width: "100%" }}
                          />
                        ) : column.id === "start" ||
                          column.id === "end" ||
                          column.id === "createdAt" ? (
                          value !== "-" ? (
                            new Date(value).toLocaleString()
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

export default TableData;
