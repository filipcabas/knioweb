import React from 'react';
import { useAuthStore } from '../stores/authStore';
import { useEmployeeStore } from '../stores/employeeStore';
import { useTimeEntryStore } from '../stores/timeEntryStore';
import { useLeaveRequestStore } from '../stores/leaveRequestStore';
import { Link } from 'react-router-dom';
import { 
  Users, Clock, Calendar, FileText, Award, AlertTriangle, 
  TrendingUp, CreditCard, CheckCircle
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';

const AdminDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const { getAllEmployees } = useEmployeeStore();
  const { entries, getTotalHoursInMonth } = useTimeEntryStore();
  const { requests, getRequestsByStatus } = useLeaveRequestStore();
  
  if (!user || user.role !== 'admin') return null;
  
  const employees = getAllEmployees();
  const pendingLeaveRequests = getRequestsByStatus('pending');
  
  // Get current date info
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();
  
  // Prepare data for department chart
  const departmentData = employees.reduce((acc: any[], employee) => {
    const existingDept = acc.find(item => item.name === employee.department);
    if (existingDept) {
      existingDept.value++;
    } else {
      acc.push({ name: employee.department, value: 1 });
    }
    return acc;
  }, []);
  
  // Prepare data for hours worked chart
  const employeeHoursData = employees
    .map(employee => {
      const hours = getTotalHoursInMonth(employee.id, currentYear, currentMonth);
      return {
        name: employee.name,
        hours: hours,
        target: hours >= 200 ? 'Above Target' : hours >= 160 ? 'On Target' : 'Below Target'
      };
    })
    .sort((a, b) => b.hours - a.hours)
    .slice(0, 5);
  
  // Colors for charts
  const COLORS = ['#1E40AF', '#3B82F6', '#93C5FD', '#BFDBFE', '#DBEAFE'];
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-500">Overview of employees, schedules, and leave requests</p>
      </div>
      
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-blue-100 rounded-md p-3">
              <Users className="h-6 w-6 text-blue-800" />
            </div>
            <div className="ml-5">
              <p className="text-sm font-medium text-gray-500">Total Employees</p>
              <p className="text-2xl font-semibold text-gray-900">{employees.length}</p>
              <Link to="/admin/employees" className="text-xs text-blue-600 hover:underline">
                View all employees →
              </Link>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-amber-100 rounded-md p-3">
              <Clock className="h-6 w-6 text-amber-800" />
            </div>
            <div className="ml-5">
              <p className="text-sm font-medium text-gray-500">Pending Leave Requests</p>
              <p className="text-2xl font-semibold text-gray-900">{pendingLeaveRequests.length}</p>
              <Link to="/admin/leave-requests" className="text-xs text-blue-600 hover:underline">
                Review requests →
              </Link>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
              <Award className="h-6 w-6 text-green-800" />
            </div>
            <div className="ml-5">
              <p className="text-sm font-medium text-gray-500">Top Performers</p>
              <p className="text-2xl font-semibold text-gray-900">
                {employeeHoursData.filter(e => e.hours >= 200).length}
              </p>
              <p className="text-xs text-gray-500">
                Employees with 200+ hours this month
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Distribution */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Department Distribution</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={departmentData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {departmentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value, name, props) => [value, 'Employees']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Top 5 Employees by Hours */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Top 5 Employees by Hours</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={employeeHoursData}
                margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
                layout="vertical"
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                <XAxis type="number" />
                <YAxis 
                  type="category" 
                  dataKey="name" 
                  tick={{ fontSize: 12 }}
                  width={100}
                />
                <Tooltip 
                  formatter={(value: number) => [`${value} hours`, 'Hours Worked']}
                  labelFormatter={(label) => `Employee: ${label}`}
                />
                <Bar 
                  dataKey="hours" 
                  fill="#1E40AF" 
                  radius={[0, 4, 4, 0]}
                  name="Hours Worked"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      {/* Quick Actions and Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
          <div className="space-y-4">
            <Link 
              to="/admin/employees" 
              className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Users className="h-5 w-5 text-blue-600 mr-3" />
              <span className="text-sm font-medium text-gray-900">Manage Employees</span>
            </Link>
            
            <Link 
              to="/admin/schedule" 
              className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Calendar className="h-5 w-5 text-amber-600 mr-3" />
              <span className="text-sm font-medium text-gray-900">Create Schedules</span>
            </Link>
            
            <Link 
              to="/admin/leave-requests" 
              className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <FileText className="h-5 w-5 text-purple-600 mr-3" />
              <span className="text-sm font-medium text-gray-900">Approve Leave Requests</span>
            </Link>
            
            <Link 
              to="#" 
              className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <TrendingUp className="h-5 w-5 text-green-600 mr-3" />
              <span className="text-sm font-medium text-gray-900">View Reports</span>
            </Link>
          </div>
        </div>
        
        {/* Alerts */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Alerts & Notifications</h2>
          
          <div className="space-y-4">
            {pendingLeaveRequests.length > 0 && (
              <div className="flex items-center p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800">
                <AlertTriangle className="h-5 w-5 mr-3 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium">
                    {pendingLeaveRequests.length} pending leave {pendingLeaveRequests.length === 1 ? 'request' : 'requests'} to review
                  </p>
                  <Link to="/admin/leave-requests" className="text-xs text-amber-900 font-medium hover:underline">
                    Review now
                  </Link>
                </div>
              </div>
            )}
            
            {employeeHoursData.filter(e => e.hours < 160 && e.hours > 0).length > 0 && (
              <div className="flex items-center p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-800">
                <AlertTriangle className="h-5 w-5 mr-3 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium">
                    {employeeHoursData.filter(e => e.hours < 160 && e.hours > 0).length} employees below minimum hours
                  </p>
                  <p className="text-xs">
                    Some employees may not reach the minimum 160 hours this month
                  </p>
                </div>
              </div>
            )}
            
            {employeeHoursData.filter(e => e.hours >= 200).length > 0 && (
              <div className="flex items-center p-3 bg-green-50 border border-green-200 rounded-lg text-green-800">
                <CheckCircle className="h-5 w-5 mr-3 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium">
                    {employeeHoursData.filter(e => e.hours >= 200).length} employees eligible for bonus
                  </p>
                  <p className="text-xs">
                    These employees have reached 200+ hours this month
                  </p>
                </div>
              </div>
            )}
            
            {pendingLeaveRequests.length === 0 && employeeHoursData.filter(e => e.hours < 160 && e.hours > 0).length === 0 && (
              <div className="flex items-center p-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-500">
                <CheckCircle className="h-5 w-5 mr-3 flex-shrink-0" />
                <p className="text-sm">No urgent alerts at this time</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;