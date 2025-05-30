import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { parseISO, differenceInDays, addDays } from 'date-fns';

export type LeaveType = 'vacation' | 'sick' | 'personal' | 'unpaid';
export type LeaveStatus = 'pending' | 'approved' | 'rejected';

export interface LeaveRequest {
  id: string;
  userId: string;
  startDate: string;
  endDate: string;
  type: LeaveType;
  reason: string;
  status: LeaveStatus;
  reviewedBy?: string;
  reviewedAt?: string;
  comments?: string;
  createdAt: string;
}

interface LeaveRequestState {
  requests: LeaveRequest[];
  addRequest: (request: Omit<LeaveRequest, 'id' | 'status' | 'createdAt'>) => void;
  updateRequest: (id: string, requestData: Partial<LeaveRequest>) => void;
  deleteRequest: (id: string) => void;
  getRequestsByUserId: (userId: string) => LeaveRequest[];
  getRequestsByStatus: (status: LeaveStatus) => LeaveRequest[];
  approveRequest: (id: string, adminId: string, comments?: string) => void;
  rejectRequest: (id: string, adminId: string, comments?: string) => void;
  getLeaveRequestDays: (request: LeaveRequest) => number;
}

export const useLeaveRequestStore = create<LeaveRequestState>()(
  persist(
    (set, get) => ({
      requests: [],
      
      addRequest: (request) => {
        const newRequest: LeaveRequest = {
          id: Math.random().toString(36).substring(2, 9),
          ...request,
          status: 'pending',
          createdAt: new Date().toISOString(),
        };
        
        set((state) => ({
          requests: [...state.requests, newRequest],
        }));
      },
      
      updateRequest: (id, requestData) => {
        set((state) => ({
          requests: state.requests.map((request) =>
            request.id === id ? { ...request, ...requestData } : request
          ),
        }));
      },
      
      deleteRequest: (id) => {
        set((state) => ({
          requests: state.requests.filter((request) => request.id !== id),
        }));
      },
      
      getRequestsByUserId: (userId) => {
        return get().requests.filter((request) => request.userId === userId);
      },
      
      getRequestsByStatus: (status) => {
        return get().requests.filter((request) => request.status === status);
      },
      
      approveRequest: (id, adminId, comments) => {
        set((state) => ({
          requests: state.requests.map((request) =>
            request.id === id
              ? {
                  ...request,
                  status: 'approved',
                  reviewedBy: adminId,
                  reviewedAt: new Date().toISOString(),
                  comments: comments || request.comments,
                }
              : request
          ),
        }));
      },
      
      rejectRequest: (id, adminId, comments) => {
        set((state) => ({
          requests: state.requests.map((request) =>
            request.id === id
              ? {
                  ...request,
                  status: 'rejected',
                  reviewedBy: adminId,
                  reviewedAt: new Date().toISOString(),
                  comments: comments || request.comments,
                }
              : request
          ),
        }));
      },
      
      getLeaveRequestDays: (request) => {
        const startDate = parseISO(request.startDate);
        const endDate = parseISO(request.endDate);
        return differenceInDays(endDate, startDate) + 1; // Include both start and end dates
      },
    }),
    {
      name: 'leave-requests-storage',
    }
  )
);