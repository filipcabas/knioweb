import React, { useState } from 'react';
import { useEmployeeStore } from '../stores/employeeStore';
import { useScheduleStore, ShiftType } from '../stores/scheduleStore';
import { format, parseISO, startOfWeek, addDays } from 'date-fns';
import WeeklyCalendar from '../components/scheduling/WeeklyCalendar';
import { Calendar, Clock, User, Plus } from 'lucide-react';

const AdminSchedule: React.FC = () => {
  const { getAllEmployees } = useEmployeeStore();
  const { addScheduleEntry, getSchedulesByWeek } = useScheduleStore();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    shiftType: 'morning' as ShiftType,
    startTime: '09:00',
    endTime: '17:00',
  });
  
  const employees = getAllEmployees();
  const weekSchedules = getSchedulesByWeek(currentDate);
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedEmployee) return;
    
    addScheduleEntry({
      userId: selectedEmployee,
      date: formData.date,
      shiftType: formData.shiftType,
      startTime: formData.startTime,
      endTime: formData.endTime,
      createdBy: '1', // Admin ID
    });
    
    setShowAddModal(false);
    setFormData({
      date: format(new Date(), 'yyyy-MM-dd'),
      shiftType: 'morning',
      startTime: '09:00',
      endTime: '17:00',
    });
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Schedule Management</h1>
          <p className="text-gray-500">Create and manage employee schedules</p>
        </div>
        
        <button
          onClick={() => setShowAddModal(true)}
          className="btn btn-primary flex items-center"
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Schedule
        </button>
      </div>
      
      {/* Employee Filter */}
      <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
        <label htmlFor="employee" className="block text-sm font-medium text-gray-700">
          Select Employee
        </label>
        <select
          id="employee"
          value={selectedEmployee}
          onChange={(e) => setSelectedEmployee(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
        >
          <option value="">All Employees</option>
          {employees.map((employee) => (
            <option key={employee.id} value={employee.id}>
              {employee.name} - {employee.department}
            </option>
          ))}
        </select>
      </div>
      
      {/* Calendar View */}
      <WeeklyCalendar
        currentDate={currentDate}
        schedules={selectedEmployee ? weekSchedules.filter(s => s.userId === selectedEmployee) : weekSchedules}
        onDateChange={setCurrentDate}
      />
      
      {/* Add Schedule Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Add New Schedule</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="scheduleEmployee" className="block text-sm font-medium text-gray-700">
                  Employee
                </label>
                <select
                  id="scheduleEmployee"
                  value={selectedEmployee}
                  onChange={(e) => setSelectedEmployee(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  required
                >
                  <option value="">Select Employee</option>
                  {employees.map((employee) => (
                    <option key={employee.id} value={employee.id}>
                      {employee.name} - {employee.department}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                  Date
                </label>
                <input
                  type="date"
                  id="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="shiftType" className="block text-sm font-medium text-gray-700">
                  Shift Type
                </label>
                <select
                  id="shiftType"
                  value={formData.shiftType}
                  onChange={(e) => setFormData({ ...formData, shiftType: e.target.value as ShiftType })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  required
                >
                  <option value="morning">Morning Shift</option>
                  <option value="afternoon">Afternoon Shift</option>
                  <option value="night">Night Shift</option>
                  <option value="dayOff">Day Off</option>
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="startTime" className="block text-sm font-medium text-gray-700">
                    Start Time
                  </label>
                  <input
                    type="time"
                    id="startTime"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="endTime" className="block text-sm font-medium text-gray-700">
                    End Time
                  </label>
                  <input
                    type="time"
                    id="endTime"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    required
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  Add Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSchedule;