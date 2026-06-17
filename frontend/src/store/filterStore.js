import { create } from 'zustand';

export const useFilterStore = create((set) => ({
    selectedMonth: 'all', // 'all' or '1'-'12'
    selectedYear: 'all',  // 'all' or string like '2026'

    setFilters: (month, year) => set({ selectedMonth: month, selectedYear: year }),
    setMonth: (month) => set({ selectedMonth: month }),
    setYear: (year) => set({ selectedYear: year }),
    resetFilters: () => set({ selectedMonth: 'all', selectedYear: 'all' }),
}));
