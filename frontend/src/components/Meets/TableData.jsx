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
  const [editingCell, setEditingCell] = useState(null);
  const [editedValues, setEditedValues] = useState({});

  const statusOptions = [
    { value: "new", label: "Новые" },
    { value: "processed", label: "Состоятся" },
    { value: "completed", label: "Прошедшие" },
    { value: "rejected", label: "Отклоненные" },
  ];

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

  const handleStartEdit = (rowId, columnId, initialValue) => {
    setEditingCell({ rowId, columnId });

    if (columnId === "start" || columnId === "end") {
      const date = initialValue
        ? new Date(initialValue).toISOString().slice(0, 10)
        : "";
      const time = initialValue
        ? new Date(initialValue).toISOString().slice(11, 16)
        : "";
      setEditedValues((prev) => ({
        ...prev,
        [rowId]: {
          ...prev[rowId],
          [`${columnId}Date`]: date,
          [`${columnId}Time`]: time,
        },
      }));
    } else {
      setEditedValues((prev) => ({
        ...prev,
        [rowId]: { ...prev[rowId], [columnId]: initialValue || "" },
      }));
    }
  };

  const handleDateTimeChange = (rowId, columnId, type, value) => {
    setEditedValues((prev) => ({
      ...prev,
      [rowId]: { ...prev[rowId], [`${columnId}${type}`]: value },
    }));
  };

  const handleDateTimeSave = async (rowId, columnId) => {
    const { [`${columnId}Date`]: date, [`${columnId}Time`]: time } =
      editedValues[rowId] || {};
    if (date && time) {
      const combined = new Date(`${date}T${time}:00`);
      await handleFinishEdit(rowId, columnId, combined.toISOString());
    }
  };

  const handleFinishEdit = async (rowId, columnId, newValue) => {
    setEditingCell(null);
    setEditedValues((prev) => ({
      ...prev,
      [rowId]: { ...prev[rowId], [columnId]: newValue },
    }));
    try {
      await updateMeet(rowId, { [columnId]: newValue });
    } catch (error) {
      console.error("Ошибка обновления:", error);
    }
  };

  const getCellValue = (meet, columnId) => {
    const edited = editedValues[meet.id]?.[columnId];
    const value = edited !== undefined ? edited : meet[columnId] || "";
    if (columnId === "status") {
      const statusOption = statusOptions.find(
        (option) => option.value === value,
      );
      return statusOption ? statusOption.label : value;
    }
    return value;
  };

  if (loading) return <Typography>Загрузка...</Typography>;
  if (error) return <Typography color="error">{error}</Typography>;

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
                        onClick={() =>
                          !isEditing &&
                          column.id !== "createdAt" && // запрещаем редактирование
                          handleStartEdit(meet.id, column.id, value)
                        }
                      >
                        {isEditing ? (
                          column.id === "status" ? (
                            <Select
                              value={
                                editedValues[meet.id]?.[column.id] || value
                              }
                              onChange={(e) =>
                                handleFinishEdit(
                                  meet.id,
                                  column.id,
                                  e.target.value,
                                )
                              }
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
                          ) : column.id === "start" || column.id === "end" ? (
                            <div style={{ display: "flex", gap: "4px" }}>
                              <TextField
                                type="date"
                                value={
                                  editedValues[meet.id]?.[`${column.id}Date`] ||
                                  ""
                                }
                                onChange={(e) =>
                                  handleDateTimeChange(
                                    meet.id,
                                    column.id,
                                    "Date",
                                    e.target.value,
                                  )
                                }
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    handleDateTimeSave(meet.id, column.id);
                                  }
                                }}
                                autoFocus
                              />
                              <TextField
                                type="time"
                                value={
                                  editedValues[meet.id]?.[`${column.id}Time`] ||
                                  ""
                                }
                                onChange={(e) =>
                                  handleDateTimeChange(
                                    meet.id,
                                    column.id,
                                    "Time",
                                    e.target.value,
                                  )
                                }
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    handleDateTimeSave(meet.id, column.id);
                                  }
                                }}
                              />
                            </div>
                          ) : (
                            <TextField
                              defaultValue={value}
                              autoFocus
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
                          value ? (
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
