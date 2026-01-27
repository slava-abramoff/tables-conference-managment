import type { Pagination } from "./pagination";

export interface MeetResponse {
  id: number;
  eventName: string;
  customerName: string;
  email: string;
  phone: string;
  location: string;
  platform: string;
  devices: string;

  url?: string | null; // может быть null или отсутствовать
  shortUrl?: string | null; // может быть null или отсутствовать
  status: string;
  description?: string | null; // может быть null или отсутствовать
  admin?: string | null; // может быть null или отсутствовать

  start: string; // ISO дата-время
  end: string; // ISO дата-время
  CreatedAt: string; // дата создания
  UpdatedAt: string; // дата обновления
}

export interface MeetsListResponse {
  data: MeetResponse[]; // массив встреч, может быть пустым []
  pagination: Pagination;
}
