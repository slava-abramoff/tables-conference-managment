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
  IconButton,
  Pagination,
  Box,
  TextField,
  MenuItem,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  useFetchUsers,
  useSearchUsers,
  useUsers,
  useUsersLoading,
  useUsersError,
  useUsersPagination,
  useRemoveUser,
  useUpdateUser,
} from "../../store/usersStore";
import { useModal } from "../../context/ModalContext";
import Loader from "../Navbar/Loader";

function UsersTable() {
  const fetchUsers = useFetchUsers();
  const searchUsers = useSearchUsers();
  const users = useUsers();
  const loading = useUsersLoading();
  const error = useUsersError();
  const pagination = useUsersPagination();
  const removeUser = useRemoveUser();
  const updateUser = useUpdateUser();
  const { open: openConfirm } = useModal("deleteUser");
  const [page, setPage] = useState(1);
  const [editingCell, setEditingCell] = useState(null); // { rowId, columnId }
  const [editedValues, setEditedValues] = useState({}); // { rowId: { columnId: value } }

  useEffect(() => {
    fetchUsers({ page, limit: pagination.itemsPerPage });
  }, [page, fetchUsers, searchUsers, pagination.itemsPerPage]);

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
      await updateUser(rowId, { [columnId]: newValue });
    } catch (error) {
      console.error("Ошибка обновления:", error);
    }
  };

  const handleOpenDeleteDialog = (user) => {
    openConfirm({
      userId: user.id,
      login: user.login,
      name: user.name,
      onConfirm: handleConfirmDelete,
    });
  };

  const handleConfirmDelete = async (id) => {
    try {
      await removeUser(id);
    } catch (error) {
      console.error("Ошибка удаления:", error);
    }
  };

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const getCellValue = (user, columnId) => {
    const edited = editedValues[user.id]?.[columnId];
    return edited !== undefined ? edited : user[columnId] || "-";
  };

  const isValidDate = (value) => {
    return value && value !== "-" && !isNaN(new Date(value).getTime());
  };

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return <Typography color="error">Ошибка: {error}</Typography>;
  }

  const columns = [
    { id: "login", label: "Логин" },
    { id: "name", label: "Имя" },
    { id: "email", label: "Email" },
    { id: "role", label: "Роль" },
    { id: "password", label: "Пароль" },
    { id: "createdAt", label: "Создано" },
    { id: "actions", label: "Действия" },
  ];

  return (
    <Paper sx={{ width: "100%", overflow: "hidden" }}>
      <TableContainer
        sx={{
          maxHeight: "calc(80vh - 200px)",
          overflowX: "auto",
        }}
      >
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell key={column.id}>{column.label}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                {columns.map((column) => {
                  const isEditing =
                    editingCell?.rowId === user.id &&
                    editingCell?.columnId === column.id;
                  const value = getCellValue(user, column.id);

                  if (column.id === "actions") {
                    return (
                      <TableCell key={column.id}>
                        <IconButton
                          onClick={() => handleOpenDeleteDialog(user)}
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
                          : handleStartEdit(user.id, column.id)
                      }
                    >
                      {isEditing ? (
                        column.id === "role" ? (
                          <TextField
                            select
                            defaultValue={value === "-" ? "" : value}
                            autoFocus
                            onBlur={(e) =>
                              handleFinishEdit(
                                user.id,
                                column.id,
                                e.target.value,
                              )
                            }
                            onChange={(e) =>
                              handleFinishEdit(
                                user.id,
                                column.id,
                                e.target.value,
                              )
                            }
                            sx={{ width: "100%" }}
                          >
                            <MenuItem value="admin">Админ</MenuItem>
                            <MenuItem value="moderator">Модератор</MenuItem>
                            <MenuItem value="viewer">Зритель</MenuItem>
                          </TextField>
                        ) : (
                          <TextField
                            type={
                              column.id === "password" ? "password" : "text"
                            }
                            defaultValue={value === "-" ? "" : value}
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
      <Box sx={{ display: "flex", justifyContent: "center", p: 2 }}>
        <Pagination
          count={pagination.totalPages}
          page={pagination.currentPage}
          onChange={handlePageChange}
          color="primary"
        />
      </Box>
    </Paper>
  );
}

export default UsersTable;
