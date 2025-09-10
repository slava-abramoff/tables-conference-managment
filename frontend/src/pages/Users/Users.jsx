import { useState, useEffect } from "react";
import { Box, Typography } from "@mui/material";
import UsersToolbar from "../../components/Users/UsersToolbar";
import UsersTable from "../../components/Users/UsersTable";
import Layout from "../../components/Layout/Layout";

function Users() {
  const [visibleColumns, setVisibleColumns] = useState({});

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
          visibleColumns={visibleColumns}
          setVisibleColumns={setVisibleColumns}
        />
        <UsersTable visibleColumns={visibleColumns} />
      </Box>
    </Layout>
  );
}

export default Users;
