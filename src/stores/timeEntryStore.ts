import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';

export interface TimeEntry {
  id: string;
  userId: string;
  date: string;
  hoursWorked: number;
  project?: string;
  notes?: string;
  createdAt: string;
}

interface TimeEntryState {
  entries: TimeEntry[];
  addEntry: (entry: Omit<TimeEntry, 'id' | 'createdAt'>) => void;
  updateEntry: (id: string, entryData: Partial<Omit<TimeEntry, 'id' | 'createdAt'>>) => void;
  deleteEntry: (id: string) => void;
  getEntriesByUserId: (userId: string) => TimeEntry[];
  getEntriesByMonth: (userId: string, year: number, month: number) => TimeEntry[];
  getTotalHoursInMonth: (userId: string, year: number, month: number) => number;
  calculateSalary: (userId: string, year: number, month: number, hourlyRate: number) => {
    regularHours: number;
    overtimeHours: number;
    totalHours: number;
    regularPay: number;
    overtimePay: number;
    totalPay: number;
    bonus: number;
    finalTotal: number;
  };
}

export const useTimeEntryStore = create<TimeEntryState>()(
  persist(
    (set, get) => ({
      entries: [],
      
      addEntry: (entry) => {
        const newEntry: TimeEntry = {
          id: Math.random().toString(36).substring(2, 9),
          ...entry,
          createdAt: new Date().toISOString(),
        };
        
        set((state) => ({
          entries: [...state.entries, newEntry],
        }));
      },
      
      updateEntry: (id, entryData) => {
        set((state) => ({
          entries: state.entries.map((entry) =>
            entry.id === id ? { ...entry, ...entryData } : entry
          ),
        }));
      },
      
      deleteEntry: (id) => {
        set((state) => ({
          entries: state.entries.filter((entry) => entry.id !== id),
        }));
      },
      
      getEntriesByUserId: (userId) => {
        return get().entries.filter((entry) => entry.userId === userId);
      },
      
      getEntriesByMonth: (userId, year, month) => {
        const monthDate = new Date(year, month - 1);
        const start = startOfMonth(monthDate);
        const end = endOfMonth(monthDate);
        
        return get().entries.filter((entry) => {
          const entryDate = parseISO(entry.date);
          return (
            entry.userId === userId &&
            entryDate >= start &&
            entryDate <= end
          );
        });
      },
      
      getTotalHoursInMonth: (userId, year, month) => {
        const entries = get().getEntriesByMonth(userId, year, month);
        return entries.reduce((total, entry) => total + entry.hoursWorked, 0);
      },
      
      calculateSalary: (userId, year, month, hourlyRate) => {
        const totalHours = get().getTotalHoursInMonth(userId, year, month);
        const regularHours = Math.min(totalHours, 160); // Standard monthly hours
        const overtimeHours = Math.max(0, totalHours - 160);
        
        const regularPay = regularHours * hourlyRate;
        const overtimePay = overtimeHours * hourlyRate * 1.5; // Overtime at 1.5x
        const totalPay = regularPay + overtimePay;
        
        // Bonus for 200+ hours in a month
        const bonus = totalHours >= 200 ? 0.1 * totalPay : 0; // 10% bonus
        
        const finalTotal = totalPay + bonus;
        
        return {
          regularHours,
          overtimeHours,
          totalHours,
          regularPay,
          overtimePay,
          totalPay,
          bonus,
          finalTotal,
        };
      },
    }),
    {
      name: 'time-entries-storage',
    }
  )
);