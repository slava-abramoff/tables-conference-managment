import type { ScheduleDaysRequest } from "../../types/request/schedule";
import type {
  ScheduleDaysResponse,
  ScheduleYearsResponse,
} from "../../types/response/schedule";
import api from "../api";

export const getAvailableDates = async (): Promise<ScheduleYearsResponse> => {
  const { data } = await api.get<ScheduleYearsResponse>("/lectures/dates");
  return data;
};

export const getScheduleDays = async (
  params: ScheduleDaysRequest
): Promise<ScheduleDaysResponse> => {
  const { data } = await api.get<ScheduleDaysResponse>("/lectures/days", {
    params: { year: params.year, month: params.month },
  });
  return data;
};

