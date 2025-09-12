import { api } from "./api";

// Получить список мероприятий
export async function getMeets({
  page = 1,
  limit = 15,
  status,
  sortBy = "createdAt",
  order = "asc",
}) {
  try {
    const response = await api.get("/meets/find", {
      params: { page, limit, status, sortBy, order },
    });
    return response.data; // { data: Meet[], pagination: { currentPage, totalPages, totalItems, itemsPerPage, hasNextPage, hasPreviousPage } }
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Ошибка загрузки мероприятий",
    );
  }
}

// Поиск мероприятий
export async function searchMeets({ searchTerm = "", page = 1, limit = 15 }) {
  try {
    const response = await api.get("/meets/search", {
      params: { searchTerm, page, limit },
    });
    return response.data; // { data: Meet[], pagination: { currentPage, totalPages, totalItems, itemsPerPage, hasNextPage, hasPreviousPage } }
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Ошибка поиска мероприятий",
    );
  }
}

// Создать множество мероприятий
export async function createMeets(meets) {
  try {
    const response = await api.post("/meets/advanced", meets);
    return response.data; // Meet[]
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Ошибка создания мероприятий",
    );
  }
}

export async function addNewMeet(meet) {
  try {
    const response = await api.post("/meets", meet);
    return response.data; // Meet[]
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Ошибка создания мероприятия",
    );
  }
}

// Обновить мероприятие
export async function updateMeet(id, data) {
  try {
    const response = await api.patch(`/meets/${id}`, data);
    return response.data; // Meet
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Ошибка обновления мероприятия",
    );
  }
}
