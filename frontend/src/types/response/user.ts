import type { Pagination } from "./pagination";

// --- Один пользователь ---
export interface UserResponse {
  id: string; // UUID
  login: string;
  name?: string | null; // может быть null или отсутствовать
  role: string;
  createdAt: string; // ISO дата-время
}

// --- Ответ API для списка пользователей с пагинацией ---
export interface UsersListResponse {
  data: UserResponse[]; // массив пользователей, может быть пустым []
  pagination: Pagination; // используем интерфейс Pagination, который уже есть
}
