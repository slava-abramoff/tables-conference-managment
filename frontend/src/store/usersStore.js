import { create } from "zustand";
import {
  createUser,
  fetchUsers,
  searchUsers,
  updateUser,
  removeUser,
} from "../services/users.service";

const useUsersStore = create((set) => ({
  users: [],
  loading: false,
  error: null,
  pagination: {
    currentPage: 1,
    totalPages: 0,
    totalItems: 0,
    itemsPerPage: 10,
    hasNextPage: false,
    hasPreviousPage: false,
  },

  fetchUsers: async ({ page = 1, limit = 10 } = {}) => {
    set({ loading: true, error: null });
    try {
      const { data, pagination } = await fetchUsers({ page, limit });
      set({
        users: data,
        pagination: {
          currentPage: pagination.currentPage,
          totalPages: pagination.totalPages,
          totalItems: pagination.totalItems,
          itemsPerPage: pagination.itemsPerPage,
          hasNextPage: pagination.hasNextPage,
          hasPreviousPage: pagination.hasPreviousPage,
        },
        loading: false,
      });
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  searchUsers: async ({ term = "" } = {}) => {
    set({ loading: true, error: null });
    try {
      const { data, pagination } = await searchUsers({ term });
      set({
        users: data,
        pagination: {
          currentPage: pagination.currentPage,
          totalPages: pagination.totalPages,
          totalItems: pagination.totalItems,
          itemsPerPage: pagination.itemsPerPage,
          hasNextPage: pagination.hasNextPage,
          hasPreviousPage: pagination.hasPreviousPage,
        },
        loading: false,
      });
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  createUser: async (userData) => {
    set({ loading: true, error: null });
    try {
      const user = await createUser(userData);
      set((state) => ({
        users: [...state.users, user],
        pagination: {
          ...state.pagination,
          totalItems: state.pagination.totalItems + 1,
        },
        loading: false,
      }));
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  updateUser: async (id, userData) => {
    set({ loading: true, error: null });
    try {
      const updatedUser = await updateUser(id, userData);
      set((state) => ({
        users: state.users.map((user) =>
          user.id === id ? { ...user, ...updatedUser } : user,
        ),
        loading: false,
      }));
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  removeUser: async (id) => {
    set({ loading: true, error: null });
    try {
      await removeUser(id);
      set((state) => ({
        users: state.users.filter((user) => user.id !== id),
        pagination: {
          ...state.pagination,
          totalItems: state.pagination.totalItems - 1,
        },
        loading: false,
      }));
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },
}));

export const useFetchUsers = () => useUsersStore((state) => state.fetchUsers);
export const useSearchUsers = () => useUsersStore((state) => state.searchUsers);
export const useUsers = () => useUsersStore((state) => state.users);
export const useUsersLoading = () => useUsersStore((state) => state.loading);
export const useUsersError = () => useUsersStore((state) => state.error);
export const useUsersPagination = () =>
  useUsersStore((state) => state.pagination);
export const useCreateUser = () => useUsersStore((state) => state.createUser);
export const useUpdateUser = () => useUsersStore((state) => state.updateUser);
export const useRemoveUser = () => useUsersStore((state) => state.removeUser);
