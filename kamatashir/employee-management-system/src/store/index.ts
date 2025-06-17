import create from 'zustand';

interface Employee {
  id: number;
  name: string;
  position: string;
}

interface EmployeeState {
  employees: Employee[];
  addEmployee: (employee: Employee) => void;
  removeEmployee: (id: number) => void;
}

const useEmployeeStore = create<EmployeeState>((set) => ({
  employees: [],
  addEmployee: (employee) => set((state) => ({
    employees: [...state.employees, employee],
  })),
  removeEmployee: (id) => set((state) => ({
    employees: state.employees.filter(employee => employee.id !== id),
  })),
}));

export default useEmployeeStore;