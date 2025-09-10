import { api } from "./api";

export const createUser = async (userData) => {
  const response = await api.post(`/users`, userData);
  return response.data;
};

export const fetchUsers = async ({ page = 1, limit = 10 } = {}) => {
  const response = await api.get(`/users/find`, {
    params: { page, limit },
  });
  return {
    data: response.data.data,
    pagination: response.data.pagination,
  };
};

export const searchUsers = async ({ term = "" } = {}) => {
  const response = await api.get(`/users/search`, {
    params: { term },
  });
  return {
    data: response.data.data,
    pagination: response.data.pagination,
  };
};

export const updateUser = async (id, userData) => {
  const response = await api.patch(`/users/${id}`, userData);
  return response.data;
};

export const removeUser = async (id) => {
  const response = await api.delete(`users/${id}`);
  return response.data;
};
