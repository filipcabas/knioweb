import React, { useState } from 'react';
import { useAuthStore } from '../stores/authStore';
import { useEmployeeStore } from '../stores/employeeStore';
import { useLeaveRequestStore, LeaveRequest } from '../stores/leaveRequestStore';
import { format, parseISO } from 'date-fns';
import { Calendar, Clock, Check, X, MessageSquare } from 'lucide-react';

const AdminLeaveRequests: React.FC = () => {
  const { user } = useAuthStore();
  const { getEmployeeById } = useEmployeeStore();
  const { requests, approveRequest, rejectRequest, getLeaveRequestDays } = useLeaveRequestStore();
  
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [comment, setComment] = useState('');
  const [commentingRequestId, setCommentingRequestId] = useState<string | null>(null);
  
  if (!user || user.role !== 'admin') return null;
  
  // Filter requests based on selected status
  const filteredRequests = requests.filter((request) => 
    selectedStatus === 'all' ? true : request.status === selectedStatus
  );
  
  // Handle request approval
  const handleApprove = (request: LeaveRequest) => {
    approveRequest(request.id, user.id, comment);
    setComment('');
    setCommentingRequestId(null);
  };
  
  // Handle request rejection
  const handleReject = (request: LeaveRequest) => {
    rejectRequest(request.id, user.id, comment);
    setComment('');
    setCommentingRequestId(null);
  };
  
  // Get status badge style
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-amber-100 text-amber-800';
    }
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Leave Requests</h1>
        <p className="text-gray-500">Review and manage employee leave requests</p>
      </div>
      
      {/* Status Filter */}
      <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
        <div className="flex space-x-2">
          {(['all', 'pending', 'approved', 'rejected'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setSelectedStatus(status)}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                selectedStatus === status
                  ? 'bg-blue-100 text-blue-800'
                  : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
              {status !== 'all' && (
                <span className="ml-2 text-xs">
                  ({requests.filter(r => r.status === status).length})
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
      
      {/* Requests List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Employee
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Leave Period
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reason
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                    No leave requests found
                  </td>
                </tr>
              ) : (
                filteredRequests
                  .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                  .map((request) => {
                    const employee = getEmployeeById(request.userId);
                    if (!employee) return null;
                    
                    return (
                      <React.Fragment key={request.id}>
                        <tr className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-800 font-medium">
                                {employee.name.charAt(0)}
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{employee.name}</div>
                                <div className="text-sm text-gray-500">{employee.department}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {format(parseISO(request.startDate), 'MMM d, yyyy')}
                            </div>
                            {request.startDate !== request.endDate && (
                              <div className="text-sm text-gray-500">
                                to {format(parseISO(request.endDate), 'MMM d, yyyy')}
                              </div>
                            )}
                            <div className="text-xs text-gray-500">
                              {getLeaveRequestDays(request)} days
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 py-1 text-xs rounded-full capitalize bg-blue-100 text-blue-800">
                              {request.type}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs rounded-full capitalize ${getStatusBadge(request.status)}`}>
                              {request.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                            {request.reason}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            {request.status === 'pending' ? (
                              <div className="flex justify-end space-x-2">
                                <button
                                  onClick={() => setCommentingRequestId(request.id)}
                                  className="text-gray-600 hover:text-gray-900"
                                >
                                  <MessageSquare className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleApprove(request)}
                                  className="text-green-600 hover:text-green-900"
                                >
                                  <Check className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleReject(request)}
                                  className="text-red-600 hover:text-red-900"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </div>
                            ) : (
                              <span className="text-sm text-gray-500">
                                {request.comments || 'No comments'}
                              </span>
                            )}
                          </td>
                        </tr>
                        
                        {/* Comment Form */}
                        {commentingRequestId === request.id && (
                          <tr className="bg-gray-50">
                            <td colSpan={6} className="px-6 py-4">
                              <div className="flex items-center space-x-4">
                                <input
                                  type="text"
                                  value={comment}
                                  onChange={(e) => setComment(e.target.value)}
                                  placeholder="Add a comment..."
                                  className="flex-1 form-input block w-full sm:text-sm"
                                />
                                <div className="flex space-x-2">
                                  <button
                                    onClick={() => handleApprove(request)}
                                    className="btn btn-success"
                                  >
                                    Approve
                                  </button>
                                  <button
                                    onClick={() => handleReject(request)}
                                    className="btn btn-danger"
                                  >
                                    Reject
                                  </button>
                                  <button
                                    onClick={() => {
                                      setCommentingRequestId(null);
                                      setComment('');
                                    }}
                                    className="btn btn-secondary"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminLeaveRequests;