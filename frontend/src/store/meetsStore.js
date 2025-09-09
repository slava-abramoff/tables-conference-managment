import { create } from "zustand";
import { devtools } from "zustand/middleware";
import {
  createMeets,
  getMeets,
  searchMeets,
  updateMeet,
} from "../services/meets.service";

const useMeetsStore = create(
  devtools((set) => ({
    meets: [],
    pagination: {
      currentPage: 1,
      totalPages: 1,
      totalItems: 0,
      itemsPerPage: 15,
      hasNextPage: false,
      hasPreviousPage: false,
    },
    loading: false,
    error: null,

    fetchMeets: async ({
      page = 1,
      limit = 15,
      status,
      sortBy = "createdAt",
      order = "asc",
    }) => {
      set({ loading: true, error: null });
      try {
        const { data, pagination } = await getMeets({
          page,
          limit,
          status,
          sortBy,
          order,
        });
        set({ meets: data, pagination, loading: false });
      } catch (error) {
        set({ error: error.message, loading: false });
      }
    },

    searchMeets: async ({ searchTerm = "", page = 1, limit = 15 }) => {
      set({ loading: true, error: null });
      try {
        const { data, pagination } = await searchMeets({
          searchTerm,
          page,
          limit,
        });
        set({ meets: data, pagination, loading: false });
      } catch (error) {
        set({ error: error.message, loading: false });
      }
    },

    addMeets: async (meetsData) => {
      set({ loading: true, error: null });
      try {
        const newMeets = await createMeets(meetsData);
        set((state) => ({
          meets: [...state.meets, ...newMeets],
          loading: false,
        }));
      } catch (error) {
        set({ error: error.message, loading: false });
      }
    },

    updateMeet: async (id, data) => {
      set({ loading: true, error: null });
      try {
        const updatedMeet = await updateMeet(id, data);
        set((state) => ({
          meets: state.meets.map((meet) =>
            meet.id === id ? updatedMeet : meet,
          ),
          loading: false,
        }));
      } catch (error) {
        set({ error: error.message, loading: false });
      }
    },
  })),
);

// Селекторы
export const useMeets = () => useMeetsStore((state) => state.meets);
export const useMeetsPagination = () =>
  useMeetsStore((state) => state.pagination);
export const useMeetsLoading = () => useMeetsStore((state) => state.loading);
export const useMeetsError = () => useMeetsStore((state) => state.error);
export const useFetchMeets = () => useMeetsStore((state) => state.fetchMeets);
export const useSearchMeets = () => useMeetsStore((state) => state.searchMeets);
export const useAddMeets = () => useMeetsStore((state) => state.addMeets);
export const useUpdateMeet = () => useMeetsStore((state) => state.updateMeet);

export default useMeetsStore;
