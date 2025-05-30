import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from './authStore';

// Extended employee data beyond what's in the User interface
export interface Employee extends User {
  phone?: string;
  address?: string;
  emergencyContact?: {
    name: string;
    relationship: string;
    phone: string;
  };
  bankDetails?: {
    accountNumber: string;
    bankName: string;
  };
  documents?: {
    id: string;
    name: string;
    type: string;
    uploadDate: string;
  }[];
}

interface EmployeeState {
  employees: Employee[];
  addEmployee: (employee: Employee) => void;
  updateEmployee: (id: string, employeeData: Partial<Employee>) => void;
  deleteEmployee: (id: string) => void;
  getEmployeeById: (id: string) => Employee | undefined;
  getAllEmployees: () => Employee[];
}

// Mock initial data
const initialEmployees: Employee[] = [
  {
    id: '1',
    name: 'Admin User',
    email: 'admin@example.com',
    role: 'admin',
    hourlyRate: 30,
    department: 'Management',
    position: 'System Administrator',
    hireDate: '2023-01-01',
    phone: '555-123-4567',
    address: '123 Admin St, City, ST 12345',
  },
  {
    id: '2',
    name: 'John Employee',
    email: 'employee@example.com',
    role: 'employee',
    hourlyRate: 20,
    department: 'Development',
    position: 'Software Developer',
    hireDate: '2023-03-15',
    phone: '555-987-6543',
    address: '456 Dev Ave, City, ST 12345',
  },
  {
    id: '3',
    name: 'Jane Smith',
    email: 'jane@example.com',
    role: 'employee',
    hourlyRate: 22,
    department: 'Design',
    position: 'UI/UX Designer',
    hireDate: '2023-02-10',
    phone: '555-456-7890',
    address: '789 Design Blvd, City, ST 12345',
  },
];

export const useEmployeeStore = create<EmployeeState>()(
  persist(
    (set, get) => ({
      employees: initialEmployees,
      
      addEmployee: (employee) => {
        set((state) => ({
          employees: [...state.employees, employee],
        }));
      },
      
      updateEmployee: (id, employeeData) => {
        set((state) => ({
          employees: state.employees.map((employee) =>
            employee.id === id ? { ...employee, ...employeeData } : employee
          ),
        }));
      },
      
      deleteEmployee: (id) => {
        set((state) => ({
          employees: state.employees.filter((employee) => employee.id !== id),
        }));
      },
      
      getEmployeeById: (id) => {
        return get().employees.find((employee) => employee.id === id);
      },
      
      getAllEmployees: () => {
        return get().employees;
      },
    }),
    {
      name: 'employees-storage',
    }
  )
);