import type {
  ExportLecturesRequest,
  LectureCreateAdvancedRequest,
  LectureCreateRequest,
  LectureUpdateLinksRequest,
  LectureUpdateRequest,
} from "../../types/request/lecture";
import type {
  LectureResponse,
  LecturesResponse,
} from "../../types/response/lecture";
import api from "../api";

export const getLecturesByDate = async (
  date: string,
): Promise<LecturesResponse> => {
  const { data } = await api.get<LecturesResponse>(
    `/lectures/schedule/${date}`,
  );
  return data;
};

export const createLecture = async (
  body: LectureCreateRequest,
): Promise<LectureResponse> => {
  const { data } = await api.post<LectureResponse>("/lectures", body);
  return data;
};

export const exportLectures = async (params: ExportLecturesRequest) => {
  const response = await api.get("/lectures/export", {
    params,
    responseType: "blob",
  });

  const blob = new Blob([response.data], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  const url = window.URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = "lectures.xlsx";
  document.body.appendChild(link);
  link.click();

  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

export const createManyLectures = async (
  body: LectureCreateAdvancedRequest,
): Promise<LecturesResponse> => {
  const { data } = await api.post<LecturesResponse>("/lectures/advanced", body);
  return data;
};

export const updateLecture = async (
  id: number,
  body: LectureUpdateRequest,
): Promise<LectureResponse> => {
  const { data } = await api.patch<LectureResponse>(`/lectures/${id}`, body);
  return data;
};

export const updateLecturesLink = async (
  body: LectureUpdateLinksRequest,
): Promise<LecturesResponse> => {
  const { data } = await api.post<LecturesResponse>("/lectures/links", body);
  return data;
};

export const deleteLecture = async (id: number): Promise<LectureResponse> => {
  const { data } = await api.delete<LectureResponse>(`/lectures/${id}`);
  return data;
};
