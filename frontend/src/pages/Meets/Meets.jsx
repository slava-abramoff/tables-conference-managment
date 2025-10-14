import { useState, useEffect } from "react";
import { Box, Typography } from "@mui/material";
import Toolbar from "../../components/Meets/Toolbar";
import TableData from "../../components/Meets/TableData";
import Layout from "../../components/Layout/Layout";

function Meets() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("new"); // Устанавливаем 'new' по умолчанию
  const [sortBy, setSortBy] = useState("");
  const [order, setOrder] = useState("asc");
  const [visibleColumns, setVisibleColumns] = useState({});

  useEffect(() => {
    const status = localStorage.getItem("status");
    const sortBy = localStorage.getItem("sortBy");
    const order = localStorage.getItem("order");

    if (status && sortBy && order) {
      setOrder(order);
      setStatus(status);
      setSortBy(sortBy);
    }

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
        admin: true,
        start: true,
        end: true,
        createdAt: true,
      };
      setVisibleColumns(defaultVisible);
    }
  }, []);

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
