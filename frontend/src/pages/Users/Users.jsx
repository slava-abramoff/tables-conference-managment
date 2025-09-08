import { useState, useEffect } from "react";
import { Box, Typography } from "@mui/material";
import UsersToolbar from "../../components/Users/UsersToolbar";
import UsersTable from "../../components/Users/UsersTable";
import Layout from "../../components/Layout/Layout";

function Users() {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [order, setOrder] = useState("asc");
  const [visibleColumns, setVisibleColumns] = useState({});

  // Загрузка видимых колонок из localStorage
  useEffect(() => {
    const savedColumns = localStorage.getItem("usersTableColumns");
    if (savedColumns) {
      setVisibleColumns(JSON.parse(savedColumns));
    } else {
      const defaultVisible = {
        login: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      };
      setVisibleColumns(defaultVisible);
    }
  }, []);

  // Сохранение видимых колонок в localStorage
  useEffect(() => {
    if (Object.keys(visibleColumns).length > 0) {
      localStorage.setItem("usersTableColumns", JSON.stringify(visibleColumns));
    }
  }, [visibleColumns]);

  return (
    <Layout>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Пользователи
        </Typography>
        <UsersToolbar
          search={search}
          setSearch={setSearch}
          sortBy={sortBy}
          setSortBy={setSortBy}
          order={order}
          setOrder={setOrder}
          visibleColumns={visibleColumns}
          setVisibleColumns={setVisibleColumns}
        />
        <UsersTable
          search={search}
          sortBy={sortBy}
          order={order}
          visibleColumns={visibleColumns}
        />
      </Box>
    </Layout>
  );
}

export default Users;
