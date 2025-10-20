import { create } from "zustand";

const useNewsStore = create((set) => ({
  selectedNews: null,
  setSelectedNews: (news) => set({ selectedNews: news }),
  clearSelectedNews: () => set({ selectedNews: null }),
}));

export default useNewsStore;
