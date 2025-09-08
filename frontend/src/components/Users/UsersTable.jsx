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
  Select,
  MenuItem,
  Button,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { useModal } from "../../context/ModalContext";
// import { getUsers, updateUser, deleteUser } from "../../services/api/userApi";

function UsersTable({ search, sortBy, order, visibleColumns }) {
  const [users, setUsers] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [error, setError] = useState(null);
  const [editingCell, setEditingCell] = useState(null); // { rowId, columnId }
  const [editedValues, setEditedValues] = useState({}); // { rowId: { columnId: value } }

  // Используем useModal для двух модалок
  const { open: openConfirm } = useModal("confirm");
  const { open: openEdit } = useModal("editUser");

  // Определение всех возможных колонок
  const allColumns = [
    { id: "login", label: "Логин" },
    { id: "name", label: "Имя" },
    { id: "email", label: "Email" },
    { id: "role", label: "Роль" },
    { id: "createdAt", label: "Создано" },
    { id: "actions", label: "Действия" },
  ];

  // Моковые данные
  const mockUsers = [
    {
      id: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
      login: "ivanov",
      name: "Иван Иванов",
      email: "ivan.ivanov@example.com",
      role: "admin",
      createdAt: "2025-09-01T08:00:00Z",
      password: "password123",
    },
    {
      id: "a9b8c7d6-12ef-3456-7890-abcdef123456",
      login: "petrova",
      name: "Анна Петрова",
      email: "anna.petrova@example.com",
      role: "editor",
      createdAt: "2025-09-02T09:00:00Z",
      password: "password456",
    },
    {
      id: "123e4567-e89b-12d3-a456-426614174000",
      login: "sidorov",
      name: "Сергей Сидоров",
      email: "sergey.sidorov@example.com",
      role: "viewer",
      createdAt: "2025-08-25T07:00:00Z",
      password: "password789",
    },
    {
      id: "7890abcd-12ef-3456-7890-abcdef123457",
      login: "kuznetsova",
      name: "Мария Кузнецова",
      email: "maria.kuznetsova@example.com",
      role: "editor",
      createdAt: "2025-09-05T10:00:00Z",
      password: "password012",
    },
    {
      id: "4567bcde-23fa-4567-8901-bcdef2345678",
      login: "smirnov",
      name: "Дмитрий Смирнов",
      email: "dmitry.smirnov@example.com",
      role: "viewer",
      createdAt: "2025-09-03T08:00:00Z",
      password: "password345",
    },
    {
      id: "8901cdef-34ab-5678-9012-cdef34567890",
      login: "vasilyeva",
      name: "Елена Васильева",
      email: "elena.vasilyeva@example.com",
      role: "admin",
      createdAt: "2025-09-10T07:00:00Z",
      password: "password678",
    },
    {
      id: "2345ef01-45bc-6789-0123-def012345678",
      login: "morozov",
      name: "Алексей Морозов",
      email: "alexey.morozov@example.com",
      role: "viewer",
      createdAt: "2025-08-30T10:00:00Z",
      password: "password901",
    },
    {
      id: "6789f012-56cd-7890-1234-ef0123456789",
      login: "sokolova",
      name: "Ольга Соколова",
      email: "olga.sokolova@example.com",
      role: "editor",
      createdAt: "2025-09-04T09:00:00Z",
      password: "password234",
    },
    {
      id: "0123a456-67de-8901-2345-f01234567890",
      login: "zaytsev",
      name: "Павел Зайцев",
      email: "pavel.zaytsev@example.com",
      role: "viewer",
      createdAt: "2025-09-07T08:00:00Z",
      password: "password567",
    },
    {
      id: "3456b789-78ef-9012-3456-a12345678901",
      login: "kozlova",
      name: "Наталья Козлова",
      email: "natalya.kozlova@example.com",
      role: "admin",
      createdAt: "2025-09-01T09:00:00Z",
      password: "password890",
    },
  ];

  // Загрузка данных
  useEffect(() => {
    // const fetchUsers = async () => {
    //   try {
    //     const { data, pagination } = await getUsers({
    //       page: page + 1,
    //       pageSize: rowsPerPage,
    //       search,
    //       sortBy,
    //       order,
    //     });
    //     setUsers(data || []);
    //     setTotalItems(pagination?.totalItems || 0);
    //     setError(null);
    //   } catch (error) {
    //     setError("Ошибка загрузки пользователей");
    //   }
    // };
    // fetchUsers();
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
      // await updateUser(rowId, { [columnId]: newValue });
    } catch (error) {
      console.error("Ошибка обновления:", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      // await deleteUser(id);
      setUsers((prev) => prev.filter((user) => user.id !== id));
    } catch (error) {
      console.error("Ошибка удаления:", error);
    }
  };

  const handleOpenConfirm = (userId, userName) => {
    openConfirm({
      title: "Подтверждение удаления",
      message: `Вы уверены, что хотите удалить пользователя ${userName}?`,
      onConfirm: () => handleDelete(userId), // Передаем callback для удаления
    });
  };

  const handleOpenEdit = (user) => {
    openEdit({
      userId: user.id,
      login: user.login,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  };

  const getCellValue = (user, columnId) => {
    const edited = editedValues[user.id]?.[columnId];
    return edited !== undefined ? edited : user[columnId] || "-";
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
            {(users.length > 0 ? users : mockUsers).map((user) => (
              <TableRow key={user.id}>
                {allColumns
                  .filter(
                    (col) =>
                      col.id === "actions" || (visibleColumns[col.id] ?? true),
                  )
                  .map((column) => {
                    const isEditing =
                      editingCell?.rowId === user.id &&
                      editingCell?.columnId === column.id;
                    const value = getCellValue(user, column.id);

                    if (column.id === "actions") {
                      return (
                        <TableCell key={column.id}>
                          <IconButton
                            onClick={() => handleOpenEdit(user)}
                            aria-label="Редактировать"
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            onClick={() =>
                              handleOpenConfirm(user.id, user.name)
                            }
                            aria-label="Удалить"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      );
                    }

                    if (column.id === "role") {
                      return (
                        <TableCell
                          key={column.id}
                          onClick={() => handleStartEdit(user.id, column.id)}
                        >
                          {isEditing ? (
                            <Select
                              value={value}
                              onChange={(e) =>
                                handleFinishEdit(
                                  user.id,
                                  column.id,
                                  e.target.value,
                                )
                              }
                              onBlur={() => setEditingCell(null)}
                              autoFocus
                              sx={{ width: "100%" }}
                            >
                              <MenuItem value="viewer">Viewer</MenuItem>
                              <MenuItem value="editor">Editor</MenuItem>
                              <MenuItem value="admin">Admin</MenuItem>
                            </Select>
                          ) : (
                            value
                          )}
                        </TableCell>
                      );
                    }

                    return (
                      <TableCell
                        key={column.id}
                        onClick={() => handleStartEdit(user.id, column.id)}
                      >
                        {isEditing ? (
                          <TextField
                            defaultValue={value}
                            autoFocus
                            onBlur={(e) =>
                              handleFinishEdit(
                                user.id,
                                column.id,
                                e.target.value,
                              )
                            }
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                handleFinishEdit(
                                  user.id,
                                  column.id,
                                  e.target.value,
                                );
                              }
                            }}
                            sx={{ width: "100%" }}
                          />
                        ) : column.id === "createdAt" ? (
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

export default UsersTable;
