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
  Select,
  MenuItem,
  IconButton,
} from "@mui/material";

import {
  useFetchMeets,
  useMeets,
  useMeetsError,
  useMeetsLoading,
  useMeetsPagination,
  useSearchMeets,
  useUpdateMeet,
} from "../../store/meetsStore";

function TableData({ search, status, sortBy, order, visibleColumns }) {
  const meets = useMeets();
  const pagination = useMeetsPagination();
  const loading = useMeetsLoading();
  const error = useMeetsError();
  const fetchMeets = useFetchMeets();
  const searchMeets = useSearchMeets();
  const updateMeet = useUpdateMeet();
  const [editingCell, setEditingCell] = useState(null); // { rowId, columnId }
  const [editedValues, setEditedValues] = useState({}); // { rowId: { columnId: value } }

  // Маппинг статусов
  const statusOptions = [
    { value: "new", label: "Новые" },
    { value: "processed", label: "Состоятся" },
    { value: "completed", label: "Прошедшие" },
    { value: "rejected", label: "Отклоненные" },
  ];

  // Определение всех возможных колонок из модели Meet
  const allColumns = [
    { id: "eventName", label: "Название" },
    { id: "customerName", label: "ФИО" },
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
    if (search) {
      searchMeets({
        searchTerm: search,
        page: pagination.currentPage,
        limit: pagination.itemsPerPage,
      });
    } else {
      fetchMeets({
        page: pagination.currentPage,
        limit: pagination.itemsPerPage,
        status,
        sortBy,
        order,
      });
    }
  }, [
    pagination.currentPage,
    pagination.itemsPerPage,
    search,
    status,
    sortBy,
    order,
    fetchMeets,
    searchMeets,
  ]);

  const handleChangePage = (event, newPage) => {
    if (search) {
      searchMeets({
        searchTerm: search,
        page: newPage + 1,
        limit: pagination.itemsPerPage,
      });
    } else {
      fetchMeets({
        page: newPage + 1,
        limit: pagination.itemsPerPage,
        status,
        sortBy,
        order,
      });
    }
  };

  const handleChangeRowsPerPage = (event) => {
    const newRowsPerPage = parseInt(event.target.value, 10);
    if (search) {
      searchMeets({
        searchTerm: search,
        page: 1,
        limit: newRowsPerPage,
      });
    } else {
      fetchMeets({
        page: 1,
        limit: newRowsPerPage,
        status,
        sortBy,
        order,
      });
    }
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

    try {
      await updateMeet(rowId, { [columnId]: newValue });
    } catch (error) {
      console.error("Ошибка обновления:", error);
    }
  };

  // Получить значение ячейки
  const getCellValue = (meet, columnId) => {
    const edited = editedValues[meet.id]?.[columnId];
    const value = edited !== undefined ? edited : meet[columnId] || "-";
    if (columnId === "status") {
      const statusOption = statusOptions.find(
        (option) => option.value === value,
      );
      return statusOption ? statusOption.label : value;
    }
    return value;
  };

  if (loading) {
    return <Typography>Загрузка...</Typography>;
  }

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
            {meets.map((meet) => (
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
                          column.id === "status" ? (
                            <Select
                              value={value}
                              onChange={(e) =>
                                handleFinishEdit(
                                  meet.id,
                                  column.id,
                                  e.target.value,
                                )
                              }
                              onBlur={() => setEditingCell(null)}
                              autoFocus
                              fullWidth
                            >
                              {statusOptions.map((option) => (
                                <MenuItem
                                  key={option.value}
                                  value={option.value}
                                >
                                  {option.label}
                                </MenuItem>
                              ))}
                            </Select>
                          ) : (
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
                          )
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
        count={pagination.totalItems}
        rowsPerPage={pagination.itemsPerPage}
        page={pagination.currentPage - 1}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Paper>
  );
}

export default TableData;
