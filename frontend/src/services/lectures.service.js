import { api } from "./api";

export async function createLecture(dto) {
  try {
    const response = await api.post("/lectures", dto);
    return response.data; // Lecture
  } catch (error) {
    throw new Error(error.response?.data?.message || "Ошибка создания лекции");
  }
}

export async function createManyLectures(dtos) {
  try {
    const response = await api.post("/lectures/advanced", dtos);
    return response.data; // Lecture[]
  } catch (error) {
    throw new Error(error.response?.data?.message || "Ошибка создания лекций");
  }
}

export async function createManyLinks(dto) {
  try {
    const response = await api.post("/lectures/links", dto);
    return response.data; // number (количество обновленных записей)
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Ошибка обновления ссылок",
    );
  }
}

export async function getLectureDates() {
  try {
    const response = await api.get("/lectures/dates");
    return response.data; // { data: { years: [{ year: number, months: string[] }] } }
  } catch (error) {
    throw new Error(error.response?.data?.message || "Ошибка получения дат");
  }
}

export async function getLecturesByYearMonth({ year, month }) {
  try {
    const response = await api.get("/lectures/days", {
      params: { year, month },
    });
    return response.data; // [{ date: string, lectors: string[], groups: string[] }]
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Ошибка получения дней расписания",
    );
  }
}

export async function getLecturesByDate(date) {
  try {
    const response = await api.get(`/lectures/schedule/${date}`);
    return response.data; // Lecture[]
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Ошибка получения расписания",
    );
  }
}

export async function updateLecture(id, dto) {
  try {
    const response = await api.patch(`/lectures/${id}`, dto);
    return response.data; // Lecture
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Ошибка обновления лекции",
    );
  }
}

export async function deleteLecture(id) {
  try {
    const response = await api.delete(`/lectures/${id}`);
    return response.data; // Lecture или { message: string }
  } catch (error) {
    throw new Error(error.response?.data?.message || "Ошибка удаления лекции");
  }
}

export async function exportLectures(dto) {
  try {
    const response = await api.get("/lectures/export", {
      params: dto,
      responseType: "blob",
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "lectures_export.xlsx");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    return response;
  } catch (error) {
    console.error("Ошибка при экспорте Excel:", error);
    throw error;
  }
}
