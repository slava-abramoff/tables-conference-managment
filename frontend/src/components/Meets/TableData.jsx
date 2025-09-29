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
  Autocomplete,
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
import { searchUsers } from "../../services/users.service";
import useAuthStore from "../../store/authStore";
import Loader from "../Navbar/Loader";

function TableData({ search, status, sortBy, order, visibleColumns }) {
  const meets = useMeets();
  const pagination = useMeetsPagination();
  const loading = useMeetsLoading();
  const error = useMeetsError();
  const fetchMeets = useFetchMeets();
  const searchMeets = useSearchMeets();
  const updateMeet = useUpdateMeet();
  const { user } = useAuthStore();
  const isViewer = user?.role === "viewer";

  const [editingCell, setEditingCell] = useState(null);
  const [editedValues, setEditedValues] = useState({});
  const [adminOptions, setAdminOptions] = useState([]);

  const statusOptions = [
    { value: "new", label: "Новые" },
    { value: "processed", label: "Состоятся" },
    { value: "completed", label: "Прошедшие" },
    { value: "rejected", label: "Отклоненные" },
  ];

  const allColumns = [
    { id: "start", label: "Начало" },
    { id: "end", label: "Конец" },
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
    { id: "admin", label: "Админ" },
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

  const handleStartEdit = (rowId, columnId, initialValue) => {
    if (isViewer) return;
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
    if (isViewer) return;
    setEditedValues((prev) => ({
      ...prev,
      [rowId]: { ...prev[rowId], [`${columnId}${type}`]: value },
    }));
  };

  const handleDateTimeSave = async (rowId, columnId) => {
    if (isViewer) return;
    const { [`${columnId}Date`]: date, [`${columnId}Time`]: time } =
      editedValues[rowId] || {};
    if (date && time) {
      const combined = new Date(`${date}T${time}:00`);
      await handleFinishEdit(rowId, columnId, combined.toISOString());
    }
  };

  const handleFinishEdit = async (rowId, columnId, newValue) => {
    if (isViewer) return;
    setEditingCell(null);
    setEditedValues((prev) => ({
      ...prev,
      [rowId]: { ...prev[rowId], [columnId]: newValue },
    }));

    try {
      if (columnId === "admin") {
        await updateMeet(rowId, { adminId: newValue });
      } else {
        await updateMeet(rowId, { [columnId]: newValue });
      }
    } catch (error) {
      console.error("Ошибка обновления:", error);
    }
  };

  const getCellValue = (meet, columnId) => {
    if (columnId === "status") {
      const currentValue = editedValues[meet.id]?.[columnId] ?? meet[columnId];
      const statusOption = statusOptions.find(
        (option) => option.value === currentValue,
      );
      return statusOption ? statusOption.label : currentValue;
    }

    if (columnId === "admin") {
      const admin = meet.admin;
      if (!admin) return "";
      return admin.name || admin.login || "";
    }

    const edited = editedValues[meet.id]?.[columnId];
    return edited !== undefined ? edited : meet[columnId] || "";
  };

  const handleAdminSearch = async (term) => {
    if (isViewer) return;
    if (term.length < 2) return;
    try {
      const res = await searchUsers({ term });
      setAdminOptions(res.data || []);
    } catch (err) {
      console.error("Ошибка поиска админов", err);
    }
  };

  if (loading) return <Loader />;
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
                          column.id !== "createdAt" &&
                          !isViewer &&
                          handleStartEdit(meet.id, column.id, value)
                        }
                      >
                        {isEditing && column.id === "status" ? (
                          <Select
                            value={editedValues[meet.id]?.[column.id] || value}
                            onChange={(e) =>
                              handleFinishEdit(
                                meet.id,
                                column.id,
                                e.target.value,
                              )
                            }
                            autoFocus
                            sx={{ width: "100%" }}
                          >
                            {statusOptions.map((option) => (
                              <MenuItem key={option.value} value={option.value}>
                                {option.label}
                              </MenuItem>
                            ))}
                          </Select>
                        ) : isEditing && column.id === "admin" ? (
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
                                handleFinishEdit(meet.id, "admin", newValue.id);
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
                        ) : isEditing &&
                          (column.id === "start" || column.id === "end") ? (
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
                        ) : isEditing ? (
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
        onPageChange={(e, newPage) => {
          fetchMeets({
            page: newPage + 1,
            limit: pagination.itemsPerPage,
            status,
            sortBy,
            order,
          });
        }}
        onRowsPerPageChange={(e) => {
          fetchMeets({
            page: 1,
            limit: parseInt(e.target.value, 10),
            status,
            sortBy,
            order,
          });
        }}
      />
    </Paper>
  );
}

export default TableData;
