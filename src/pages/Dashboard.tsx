import React, { useState } from 'react';
import { useAuthStore } from '../stores/authStore';
import { useTimeEntryStore } from '../stores/timeEntryStore';
import { useScheduleStore } from '../stores/scheduleStore';
import { useLeaveRequestStore } from '../stores/leaveRequestStore';
import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, isToday, isWeekend } from 'date-fns';
import { Link } from 'react-router-dom';
import { 
  Calendar, Clock, Briefcase, CreditCard, ClipboardList, 
  AlertCircle, Check, UserCheck, FileText
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell 
} from 'recharts';

const Dashboard: React.FC = () => {
  const { user } = useAuthStore();
  const { entries, getTotalHoursInMonth, calculateSalary } = useTimeEntryStore();
  const { schedules, getScheduleForUserByWeek } = useScheduleStore();
  const { requests, getRequestsByUserId } = useLeaveRequestStore();
  
  if (!user) return null;
  
  // Get current date info
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();
  
  // Calculate hours and salary
  const totalHours = getTotalHoursInMonth(user.id, currentYear, currentMonth);
  const totalHoursLastMonth = getTotalHoursInMonth(
    user.id, 
    currentMonth === 1 ? currentYear - 1 : currentYear, 
    currentMonth === 1 ? 12 : currentMonth - 1
  );
  
  const salary = calculateSalary(user.id, currentYear, currentMonth, user.hourlyRate);
  
  // Get today's schedule
  const todaySchedules = getScheduleForUserByWeek(user.id, currentDate)
    .filter(schedule => format(parseISO(schedule.date), 'yyyy-MM-dd') === format(currentDate, 'yyyy-MM-dd'));
  
  const todaySchedule = todaySchedules.length > 0 ? todaySchedules[0] : null;
  
  // Get leave requests
  const leaveRequests = getRequestsByUserId(user.id);
  const pendingLeaveRequests = leaveRequests.filter(request => request.status === 'pending');
  
  // Prepare data for charts
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - 6 + i);
    return date;
  });
  
  const dailyHoursData = last7Days.map(date => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const dayEntries = entries.filter(
      entry => entry.userId === user.id && format(parseISO(entry.date), 'yyyy-MM-dd') === dateStr
    );
    const totalHours = dayEntries.reduce((sum, entry) => sum + entry.hoursWorked, 0);
    
    return {
      date: format(date, 'EEE'),
      hours: totalHours,
      isWeekend: isWeekend(date),
    };
  });
  
  const statusColors = {
    pending: '#F59E0B',
    approved: '#10B981',
    rejected: '#EF4444',
  };
  
  const leaveStatusData = [
    { name: 'Pending', value: leaveRequests.filter(req => req.status === 'pending').length },
    { name: 'Approved', value: leaveRequests.filter(req => req.status === 'approved').length },
    { name: 'Rejected', value: leaveRequests.filter(req => req.status === 'rejected').length },
  ].filter(item => item.value > 0);
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500">Welcome back, {user.name}</p>
      </div>
      
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-blue-100 rounded-md p-3">
              <Clock className="h-6 w-6 text-blue-800" />
            </div>
            <div className="ml-5">
              <p className="text-sm font-medium text-gray-500">Hours This Month</p>
              <p className="text-2xl font-semibold text-gray-900">{totalHours.toFixed(1)}</p>
              <p className="text-xs text-gray-500">
                {totalHours > totalHoursLastMonth ? (
                  <span className="text-green-600">
                    ↑ {((totalHours - totalHoursLastMonth) / Math.max(1, totalHoursLastMonth) * 100).toFixed(0)}% 
                    from last month
                  </span>
                ) : (
                  <span className="text-gray-500">
                    Minimum: 160h | Target: 200h+
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
              <CreditCard className="h-6 w-6 text-green-800" />
            </div>
            <div className="ml-5">
              <p className="text-sm font-medium text-gray-500">Est. Salary This Month</p>
              <p className="text-2xl font-semibold text-gray-900">${salary.finalTotal.toFixed(2)}</p>
              <p className="text-xs text-gray-500">
                {salary.bonus > 0 ? (
                  <span className="text-amber-600">
                    Includes ${salary.bonus.toFixed(2)} bonus
                  </span>
                ) : (
                  <span className="text-gray-500">
                    {200 - totalHours > 0 ? `${(200 - totalHours).toFixed(1)}h until bonus` : ''}
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-amber-100 rounded-md p-3">
              <Calendar className="h-6 w-6 text-amber-800" />
            </div>
            <div className="ml-5">
              <p className="text-sm font-medium text-gray-500">Today's Schedule</p>
              {todaySchedule ? (
                <>
                  <p className="text-lg font-semibold text-gray-900">
                    {todaySchedule.startTime} - {todaySchedule.endTime}
                  </p>
                  <p className="text-xs text-gray-500 capitalize">
                    {todaySchedule.shiftType} shift
                  </p>
                </>
              ) : (
                <>
                  <p className="text-lg font-semibold text-gray-900">No Shift Today</p>
                  <p className="text-xs text-gray-500">
                    <Link to="/schedule" className="text-blue-600 hover:underline">
                      View schedule →
                    </Link>
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-purple-100 rounded-md p-3">
              <FileText className="h-6 w-6 text-purple-800" />
            </div>
            <div className="ml-5">
              <p className="text-sm font-medium text-gray-500">Leave Requests</p>
              <p className="text-lg font-semibold text-gray-900">
                {pendingLeaveRequests.length} Pending
              </p>
              <p className="text-xs text-gray-500">
                <Link to="/leave-requests" className="text-blue-600 hover:underline">
                  Manage requests →
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Charts and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Hours Chart */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Weekly Hours</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={dailyHoursData}
                margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip 
                  formatter={(value: number) => [`${value} hours`, 'Hours Worked']}
                  labelFormatter={(label) => `${label}`}
                />
                <Bar 
                  dataKey="hours" 
                  fill="#1E40AF" 
                  radius={[4, 4, 0, 0]}
                  maxBarSize={50}
                  name="Hours Worked"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Leave Status */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Leave Requests</h2>
          {leaveStatusData.length > 0 ? (
            <div className="h-64 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={leaveStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {leaveStatusData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={statusColors[entry.name.toLowerCase() as keyof typeof statusColors]} 
                      />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [value, 'Requests']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-gray-500">
              <FileText className="h-12 w-12 mb-2 opacity-20" />
              <p>No leave requests yet</p>
              <Link to="/leave-requests" className="mt-2 text-blue-600 hover:underline text-sm">
                Request time off →
              </Link>
            </div>
          )}
        </div>
      </div>
      
      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link 
            to="/time-tracking" 
            className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Clock className="h-6 w-6 text-blue-600 mb-2" />
            <span className="text-sm font-medium text-gray-900">Log Hours</span>
          </Link>
          
          <Link 
            to="/schedule" 
            className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Calendar className="h-6 w-6 text-amber-600 mb-2" />
            <span className="text-sm font-medium text-gray-900">View Schedule</span>
          </Link>
          
          <Link 
            to="/leave-requests" 
            className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <ClipboardList className="h-6 w-6 text-purple-600 mb-2" />
            <span className="text-sm font-medium text-gray-900">Request Leave</span>
          </Link>
          
          <Link 
            to="/profile" 
            className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <UserCheck className="h-6 w-6 text-green-600 mb-2" />
            <span className="text-sm font-medium text-gray-900">Profile</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;