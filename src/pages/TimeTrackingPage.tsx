import React, { useState } from 'react';
import { useAuthStore } from '../stores/authStore';
import { useTimeEntryStore, TimeEntry } from '../stores/timeEntryStore';
import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { Clock, Calendar, Edit, Trash2, PlusCircle } from 'lucide-react';

const TimeTrackingPage: React.FC = () => {
  const { user } = useAuthStore();
  const { entries, addEntry, updateEntry, deleteEntry, calculateSalary } = useTimeEntryStore();
  
  const [selectedDate, setSelectedDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [hoursWorked, setHoursWorked] = useState<number>(8);
  const [project, setProject] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);
  
  // Get current month and year for salary calculation
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();
  
  // Get user entries
  const userEntries = entries.filter(entry => entry.userId === user?.id);
  
  // Get current month entries
  const currentMonthEntries = userEntries.filter(entry => {
    const entryDate = parseISO(entry.date);
    return (
      entryDate.getMonth() + 1 === currentMonth &&
      entryDate.getFullYear() === currentYear
    );
  });
  
  // Calculate salary
  const salary = user ? calculateSalary(user.id, currentYear, currentMonth, user.hourlyRate) : null;
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    
    if (editingEntryId) {
      updateEntry(editingEntryId, {
        date: selectedDate,
        hoursWorked,
        project,
        notes,
      });
      
      // Reset form
      setEditingEntryId(null);
    } else {
      addEntry({
        userId: user.id,
        date: selectedDate,
        hoursWorked,
        project,
        notes,
      });
    }
    
    // Reset form
    setSelectedDate(format(new Date(), 'yyyy-MM-dd'));
    setHoursWorked(8);
    setProject('');
    setNotes('');
  };
  
  // Handle edit entry
  const handleEdit = (entry: TimeEntry) => {
    setEditingEntryId(entry.id);
    setSelectedDate(entry.date);
    setHoursWorked(entry.hoursWorked);
    setProject(entry.project || '');
    setNotes(entry.notes || '');
  };
  
  // Handle cancel edit
  const handleCancelEdit = () => {
    setEditingEntryId(null);
    setSelectedDate(format(new Date(), 'yyyy-MM-dd'));
    setHoursWorked(8);
    setProject('');
    setNotes('');
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Time Tracking</h1>
          <p className="text-gray-500">Log and manage your work hours</p>
        </div>
        
        {salary && (
          <div className="mt-4 md:mt-0 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="text-sm font-medium text-gray-500">Current Month Summary</div>
            <div className="mt-1 grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-gray-500">Total Hours:</span>
                <span className="ml-1 font-medium">{salary.totalHours}</span>
              </div>
              <div>
                <span className="text-sm text-gray-500">Estimated Salary:</span>
                <span className="ml-1 font-semibold text-green-600">${salary.finalTotal.toFixed(2)}</span>
              </div>
              {salary.bonus > 0 && (
                <div className="col-span-2">
                  <span className="text-sm text-gray-500">Bonus:</span>
                  <span className="ml-1 font-semibold text-amber-600">+${salary.bonus.toFixed(2)}</span>
                  <span className="ml-1 text-xs text-gray-500">(for 200+ hours)</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* Time Entry Form */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          {editingEntryId ? 'Edit Time Entry' : 'Add New Time Entry'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                Date
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Calendar className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="date"
                  id="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="form-input block w-full pl-10 sm:text-sm"
                  required
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="hours" className="block text-sm font-medium text-gray-700">
                Hours Worked
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Clock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="number"
                  id="hours"
                  min="0.5"
                  max="24"
                  step="0.5"
                  value={hoursWorked}
                  onChange={(e) => setHoursWorked(parseFloat(e.target.value))}
                  className="form-input block w-full pl-10 sm:text-sm"
                  required
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="project" className="block text-sm font-medium text-gray-700">
                Project (Optional)
              </label>
              <input
                type="text"
                id="project"
                value={project}
                onChange={(e) => setProject(e.target.value)}
                className="form-input block w-full sm:text-sm"
                placeholder="Project name"
              />
            </div>
            
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                Notes (Optional)
              </label>
              <input
                type="text"
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="form-input block w-full sm:text-sm"
                placeholder="Any additional notes"
              />
            </div>
          </div>
          
          <div className="flex justify-end space-x-3">
            {editingEntryId && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="btn btn-secondary"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              className="btn btn-primary flex items-center"
            >
              <PlusCircle className="h-4 w-4 mr-1" />
              {editingEntryId ? 'Update Entry' : 'Add Entry'}
            </button>
          </div>
        </form>
      </div>
      
      {/* Time Entries List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Time Entries</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hours
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Project
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Notes
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentMonthEntries.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                    No time entries for this month yet
                  </td>
                </tr>
              ) : (
                currentMonthEntries
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .map((entry) => (
                    <tr key={entry.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {format(parseISO(entry.date), 'MMM dd, yyyy')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {entry.hoursWorked} {entry.hoursWorked === 1 ? 'hour' : 'hours'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {entry.project || '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                        {entry.notes || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleEdit(entry)}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => deleteEntry(entry.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TimeTrackingPage;