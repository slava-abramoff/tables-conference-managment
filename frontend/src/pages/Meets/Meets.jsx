import { useState, useEffect } from "react";
import { Box, Typography } from "@mui/material";
import Toolbar from "../../components/Meets/Toolbar";
import TableData from "../../components/Meets/TableData";
import Layout from "../../components/Layout/Layout";

function Meets() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [order, setOrder] = useState("asc");
  const [visibleColumns, setVisibleColumns] = useState({});

  // Загрузка видимых колонок из localStorage
  useEffect(() => {
    const savedColumns = localStorage.getItem("conferencesTableColumns");
    if (savedColumns) {
      setVisibleColumns(JSON.parse(savedColumns));
    } else {
      const defaultVisible = {
        eventName: true,
        customerName: true,
        email: true,
        phone: true,
        location: true,
        platform: true,
        devices: true,
        url: true,
        shortUrl: true,
        status: true,
        description: true,
        start: true,
        end: true,
        createdAt: true,
      };
      setVisibleColumns(defaultVisible);
    }
  }, []);

  // Сохранение видимых колонок в localStorage
  useEffect(() => {
    if (Object.keys(visibleColumns).length > 0) {
      localStorage.setItem(
        "conferencesTableColumns",
        JSON.stringify(visibleColumns),
      );
    }
  }, [visibleColumns]);

  return (
    <Layout>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Конференции
        </Typography>
        <Toolbar
          search={search}
          setSearch={setSearch}
          status={status}
          setStatus={setStatus}
          sortBy={sortBy}
          setSortBy={setSortBy}
          order={order}
          setOrder={setOrder}
          visibleColumns={visibleColumns}
          setVisibleColumns={setVisibleColumns}
        />
        <TableData
          search={search}
          status={status}
          sortBy={sortBy}
          order={order}
          visibleColumns={visibleColumns}
        />
      </Box>
    </Layout>
  );
}

export default Meets;
