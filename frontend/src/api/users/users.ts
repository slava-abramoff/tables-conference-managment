import type {
  QueryUsersRequest,
  UserCreateRequest,
  UserUpdateRequest,
} from "../../types/request/user";
import type { UserResponse, UsersListResponse } from "../../types/response/user";
import api from "../api";

export const createUser = async (body: UserCreateRequest): Promise<UserResponse> => {
  const { data } = await api.post<UserResponse>("/users", body);
  return data;
};

export const updateUser = async (
  id: string,
  body: UserUpdateRequest
): Promise<UserResponse> => {
  const { data } = await api.patch<UserResponse>(`/users/${id}`, body);
  return data;
};

export const getUsers = async (params: QueryUsersRequest): Promise<UsersListResponse> => {
  const { data } = await api.get<UsersListResponse>("/users/find", { params });
  return data;
};

export const deleteUser = async (id: string): Promise<UserResponse> => {
  const { data } = await api.delete<UserResponse>(`/users/${id}`);
  return data;
};