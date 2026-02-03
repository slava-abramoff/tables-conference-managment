import type {
  MeetCreateRequest,
  MeetQueryRequest,
  MeetUpdateRequest,
} from "../../types/request/meets";
import type { MeetResponse, MeetsListResponse } from "../../types/response/meet";
import api from "../api";

export const createMeet = async (body: MeetCreateRequest): Promise<MeetResponse> => {
  const { data } = await api.post<MeetResponse>("/meets", body);
  return data;
};

export const updateMeet = async (
  id: number,
  body: MeetUpdateRequest
): Promise<MeetResponse> => {
  const { data } = await api.patch<MeetResponse>(`/meets/${id}`, body);
  return data;
};

export const getMeets = async (params: MeetQueryRequest): Promise<MeetsListResponse> => {
  const { data } = await api.get<MeetsListResponse>("/meets/find", { params });
  return data;
};