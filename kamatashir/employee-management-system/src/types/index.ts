export type Employee = {
  id: number;
  name: string;
  position: string;
  department: string;
  dateOfJoining: Date;
};

export type Department = {
  id: number;
  name: string;
};

export type Position = {
  id: number;
  title: string;
  level: string;
};