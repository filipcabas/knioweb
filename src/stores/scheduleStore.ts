import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { parseISO, format, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns';

export type ShiftType = 'morning' | 'afternoon' | 'night' | 'dayOff';

export interface ScheduleEntry {
  id: string;
  userId: string;
  date: string;
  shiftType: ShiftType;
  startTime: string; // HH:MM format
  endTime: string; // HH:MM format
  createdBy: string; // Admin user ID
  createdAt: string;
}

interface ScheduleState {
  schedules: ScheduleEntry[];
  addScheduleEntry: (entry: Omit<ScheduleEntry, 'id' | 'createdAt'>) => void;
  updateScheduleEntry: (id: string, entryData: Partial<Omit<ScheduleEntry, 'id' | 'createdAt'>>) => void;
  deleteScheduleEntry: (id: string) => void;
  getSchedulesByUserId: (userId: string) => ScheduleEntry[];
  getSchedulesByDateRange: (start: Date, end: Date) => ScheduleEntry[];
  getSchedulesByWeek: (date: Date) => ScheduleEntry[];
  getScheduleForUserByWeek: (userId: string, date: Date) => ScheduleEntry[];
}

export const useScheduleStore = create<ScheduleState>()(
  persist(
    (set, get) => ({
      schedules: [],
      
      addScheduleEntry: (entry) => {
        const newEntry: ScheduleEntry = {
          id: Math.random().toString(36).substring(2, 9),
          ...entry,
          createdAt: new Date().toISOString(),
        };
        
        set((state) => ({
          schedules: [...state.schedules, newEntry],
        }));
      },
      
      updateScheduleEntry: (id, entryData) => {
        set((state) => ({
          schedules: state.schedules.map((entry) =>
            entry.id === id ? { ...entry, ...entryData } : entry
          ),
        }));
      },
      
      deleteScheduleEntry: (id) => {
        set((state) => ({
          schedules: state.schedules.filter((entry) => entry.id !== id),
        }));
      },
      
      getSchedulesByUserId: (userId) => {
        return get().schedules.filter((entry) => entry.userId === userId);
      },
      
      getSchedulesByDateRange: (start, end) => {
        return get().schedules.filter((entry) => {
          const entryDate = parseISO(entry.date);
          return entryDate >= start && entryDate <= end;
        });
      },
      
      getSchedulesByWeek: (date) => {
        const weekStart = startOfWeek(date, { weekStartsOn: 1 }); // Monday
        const weekEnd = endOfWeek(date, { weekStartsOn: 1 }); // Sunday
        
        return get().getSchedulesByDateRange(weekStart, weekEnd);
      },
      
      getScheduleForUserByWeek: (userId, date) => {
        const weekSchedules = get().getSchedulesByWeek(date);
        return weekSchedules.filter((entry) => entry.userId === userId);
      },
    }),
    {
      name: 'schedule-storage',
    }
  )
);