import React from 'react';
import { 
  format, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameDay, 
  isToday,
  parseISO
} from 'date-fns';
import { ScheduleEntry } from '../../stores/scheduleStore';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface WeeklyCalendarProps {
  currentDate: Date;
  schedules: ScheduleEntry[];
  onDateChange: (date: Date) => void;
}

const WeeklyCalendar: React.FC<WeeklyCalendarProps> = ({ 
  currentDate, 
  schedules, 
  onDateChange 
}) => {
  // Get days in the current week
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 }); // Start from Monday
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 }); // End on Sunday
  const days = eachDayOfInterval({ start: weekStart, end: weekEnd });
  
  // Navigate to previous/next week
  const goToPreviousWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() - 7);
    onDateChange(newDate);
  };
  
  const goToNextWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + 7);
    onDateChange(newDate);
  };
  
  // Get shift color based on type
  const getShiftColor = (shiftType: string) => {
    switch (shiftType) {
      case 'morning':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'afternoon':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'night':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'dayOff':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {/* Calendar header with navigation */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">
          {format(weekStart, 'MMM d')} - {format(weekEnd, 'MMM d, yyyy')}
        </h3>
        <div className="flex space-x-2">
          <button
            onClick={goToPreviousWeek}
            className="p-2 rounded-md text-gray-600 hover:bg-gray-100"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={() => onDateChange(new Date())}
            className="px-3 py-1 rounded-md bg-blue-100 text-blue-800 text-sm font-medium"
          >
            Today
          </button>
          <button
            onClick={goToNextWeek}
            className="p-2 rounded-md text-gray-600 hover:bg-gray-100"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
      
      {/* Calendar grid */}
      <div className="grid grid-cols-7">
        {/* Day headers */}
        {days.map((day) => (
          <div key={day.toString()} className="border-b border-r border-gray-200 p-2 text-center bg-gray-50">
            <div className="text-xs font-medium text-gray-500 uppercase">
              {format(day, 'EEE')}
            </div>
            <div className={`text-sm font-semibold ${isToday(day) ? 'text-blue-600' : 'text-gray-900'}`}>
              {format(day, 'd')}
            </div>
          </div>
        ))}
        
        {/* Calendar cells */}
        {days.map((day) => {
          const daySchedules = schedules.filter(
            (schedule) => isSameDay(parseISO(schedule.date), day)
          );
          
          return (
            <div 
              key={day.toString()} 
              className={`min-h-[100px] border-b border-r border-gray-200 p-2 ${
                isToday(day) ? 'bg-blue-50' : 'bg-white'
              }`}
            >
              {daySchedules.length > 0 ? (
                daySchedules.map((schedule) => (
                  <div 
                    key={schedule.id}
                    className={`mb-1 p-2 rounded text-xs border ${getShiftColor(schedule.shiftType)}`}
                  >
                    <div className="font-medium capitalize">{schedule.shiftType} Shift</div>
                    <div>{schedule.startTime} - {schedule.endTime}</div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-sm text-gray-500">
                  No shifts
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WeeklyCalendar;