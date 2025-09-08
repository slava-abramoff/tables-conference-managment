import { useState, useEffect } from "react";
import { Box, Typography } from "@mui/material";
import LecturesToolbar from "../../components/Lectures/LecturesToolbar";
import LecturesTable from "../../components/Lectures/LecturesTable";
import Layout from "../../components/Layout/Layout";

function Lectures() {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("start"); // По умолчанию сортировка по start
  const [order, setOrder] = useState("asc");
  const [visibleColumns, setVisibleColumns] = useState({});

  // Загрузка видимых колонок из localStorage
  useEffect(() => {
    const savedColumns = localStorage.getItem("lecturesTableColumns");
    if (savedColumns) {
      setVisibleColumns(JSON.parse(savedColumns));
    } else {
      const defaultVisible = {
        group: true,
        lector: true,
        platform: true,
        unit: true,
        location: true,
        url: true,
        shortUrl: true,
        streamKey: true,
        description: true,
        adminId: true,
        start: true,
        end: true,
        abnormalTime: true,
        createdAt: true,
        updatedAt: true,
      };
      setVisibleColumns(defaultVisible);
    }
  }, []);

  // Сохранение видимых колонок в localStorage
  useEffect(() => {
    if (Object.keys(visibleColumns).length > 0) {
      localStorage.setItem(
        "lecturesTableColumns",
        JSON.stringify(visibleColumns),
      );
    }
  }, [visibleColumns]);

  return (
    <Layout>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Лекции на 5 сентября 2025
        </Typography>
        <LecturesToolbar
          search={search}
          setSearch={setSearch}
          sortBy={sortBy}
          setSortBy={setSortBy}
          order={order}
          setOrder={setOrder}
          visibleColumns={visibleColumns}
          setVisibleColumns={setVisibleColumns}
        />
        <LecturesTable
          search={search}
          sortBy={sortBy}
          order={order}
          visibleColumns={visibleColumns}
        />
      </Box>
    </Layout>
  );
}

export default Lectures;
