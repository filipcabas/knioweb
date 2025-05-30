import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type UserRole = 'admin' | 'employee';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  hourlyRate: number;
  department: string;
  position: string;
  hireDate: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: Omit<User, 'id'> & { password: string }) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
}

// In a real application, this would connect to a backend
// For this demo, we'll use mock data and localStorage
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      
      login: async (email, password) => {
        // Mock login - in real app this would be an API call
        if (email === 'admin@example.com' && password === 'admin123') {
          set({
            user: {
              id: '1',
              name: 'Admin User',
              email: 'admin@example.com',
              role: 'admin',
              hourlyRate: 30,
              department: 'Management',
              position: 'System Administrator',
              hireDate: '2023-01-01',
            },
            isAuthenticated: true,
          });
          return;
        }
        
        if (email === 'employee@example.com' && password === 'employee123') {
          set({
            user: {
              id: '2',
              name: 'John Employee',
              email: 'employee@example.com',
              role: 'employee',
              hourlyRate: 20,
              department: 'Development',
              position: 'Software Developer',
              hireDate: '2023-03-15',
            },
            isAuthenticated: true,
          });
          return;
        }
        
        throw new Error('Invalid credentials');
      },
      
      register: async (userData) => {
        // Mock registration - in real app this would be an API call
        const newUser: User = {
          id: Math.random().toString(36).substring(2, 9),
          ...userData,
          role: 'employee', // Default role for new registrations
        };
        
        set({
          user: newUser,
          isAuthenticated: true,
        });
      },
      
      logout: () => {
        set({
          user: null,
          isAuthenticated: false,
        });
      },
      
      updateUser: (userData) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...userData } : null,
        }));
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);