import { create } from "zustand";
import { devtools } from "zustand/middleware";
import {
  createLecture,
  createManyLectures,
  createManyLinks,
  deleteLecture,
  getLectureDates,
  getLecturesByDate,
  getLecturesByYearMonth,
  updateLecture,
} from "../services/lectures.service";
import { getCurrentYear, getCurrentMonth, timeToISO } from "../utils/datetime";

const useLecturesStore = create(
  devtools((set) => ({
    lectures: [],
    dates: { years: [] },
    days: [],
    loading: false,
    error: null,
    currentYear: getCurrentYear(), // Например, 2025
    currentMonth: getCurrentMonth(), // Например, "сентябрь"

    fetchLectureDates: async () => {
      set({ loading: true, error: null });
      try {
        const response = await getLectureDates();
        set({ dates: response.data || { years: [] }, loading: false });
      } catch (error) {
        set({ error: error.message, loading: false });
      }
    },

    fetchLecturesByYearMonth: async ({ year, month }) => {
      set({ loading: true, error: null });
      try {
        const data = await getLecturesByYearMonth({ year, month });
        set({ days: data, loading: false });
      } catch (error) {
        set({ error: error.message, loading: false });
      }
    },

    fetchLecturesByDate: async (date) => {
      set({ loading: true, error: null });
      try {
        const data = await getLecturesByDate(date);
        set({ lectures: data, loading: false });
      } catch (error) {
        set({ error: error.message, loading: false });
      }
    },

    addLecture: async (lectureData) => {
      set({ loading: true, error: null });
      try {
        const newLecture = await createLecture(lectureData);
        set((state) => ({
          lectures: [...state.lectures, newLecture],
          loading: false,
        }));
      } catch (error) {
        set({ error: error.message, loading: false });
      }
    },

    addManyLectures: async (lecturesData) => {
      set({ loading: true, error: null });
      try {
        const newLectures = await createManyLectures(lecturesData);
        set((state) => ({
          lectures: [...state.lectures, ...newLectures],
          loading: false,
        }));
      } catch (error) {
        set({ error: error.message, loading: false });
      }
    },

    addManyLinks: async (linkData) => {
      set({ loading: true, error: null });
      try {
        const result = await createManyLinks(linkData);
        set({ loading: false });
        return result;
      } catch (error) {
        set({ error: error.message, loading: false });
      }
    },

    updateLecture: async (id, data) => {
      set({ loading: true, error: null });
      try {
        if (data.start) {
          data.start = timeToISO(data.start);
        }

        if (data.end) {
          data.end = timeToISO(data.end);
        }

        const updatedLecture = await updateLecture(id, data);
        set((state) => ({
          lectures: state.lectures.map((lecture) =>
            lecture.id === id ? updatedLecture : lecture,
          ),
          loading: false,
        }));
      } catch (error) {
        set({ error: error.message, loading: false });
      }
    },

    removeLecture: async (id) => {
      set({ loading: true, error: null });
      try {
        await deleteLecture(id);
        set((state) => ({
          lectures: state.lectures.filter((lecture) => lecture.id !== id),
          loading: false,
        }));
      } catch (error) {
        set({ error: error.message, loading: false });
      }
    },

    setCurrentYear: (year) => set({ currentYear: year }),
    setCurrentMonth: (month) => set({ currentMonth: month }),
  })),
);

export const useLectures = () => useLecturesStore((state) => state.lectures);
export const useLectureDates = () => useLecturesStore((state) => state.dates);
export const useLectureDays = () => useLecturesStore((state) => state.days);
export const useLecturesLoading = () =>
  useLecturesStore((state) => state.loading);
export const useLecturesError = () => useLecturesStore((state) => state.error);
export const useFetchLectureDates = () =>
  useLecturesStore((state) => state.fetchLectureDates);
export const useFetchLecturesByYearMonth = () =>
  useLecturesStore((state) => state.fetchLecturesByYearMonth);
export const useFetchLecturesByDate = () =>
  useLecturesStore((state) => state.fetchLecturesByDate);
export const useAddLecture = () =>
  useLecturesStore((state) => state.addLecture);
export const useAddManyLectures = () =>
  useLecturesStore((state) => state.addManyLectures);
export const useAddManyLinks = () =>
  useLecturesStore((state) => state.addManyLinks);
export const useUpdateLecture = () =>
  useLecturesStore((state) => state.updateLecture);
export const useRemoveLecture = () =>
  useLecturesStore((state) => state.removeLecture);
export const useCurrentYear = () =>
  useLecturesStore((state) => state.currentYear);
export const useCurrentMonth = () =>
  useLecturesStore((state) => state.currentMonth);
export const useSetCurrentYear = () =>
  useLecturesStore((state) => state.setCurrentYear);
export const useSetCurrentMonth = () =>
  useLecturesStore((state) => state.setCurrentMonth);

export default useLecturesStore;
