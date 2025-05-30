import React, { useState } from 'react';
import { useAuthStore } from '../stores/authStore';
import { useScheduleStore } from '../stores/scheduleStore';
import { format, parseISO, startOfWeek, addMonths } from 'date-fns';
import WeeklyCalendar from '../components/scheduling/WeeklyCalendar';
import { Calendar, Clock } from 'lucide-react';

const SchedulePage: React.FC = () => {
  const { user } = useAuthStore();
  const { getScheduleForUserByWeek } = useScheduleStore();
  const [currentDate, setCurrentDate] = useState(new Date());
  
  if (!user) return null;
  
  // Get schedules for the current week
  const weekSchedules = getScheduleForUserByWeek(user.id, currentDate);
  
  // Sort schedules by date
  const sortedSchedules = [...weekSchedules].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  
  // Calculate upcoming shifts
  const today = new Date();
  const upcomingSchedules = weekSchedules.filter(schedule => 
    parseISO(schedule.date) >= today
  ).sort((a, b) => 
    parseISO(a.date).getTime() - parseISO(b.date).getTime()
  );
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Schedule</h1>
        <p className="text-gray-500">View your weekly work schedule</p>
      </div>
      
      {/* Upcoming Shifts Section */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Upcoming Shifts</h2>
        
        {upcomingSchedules.length > 0 ? (
          <div className="space-y-4">
            {upcomingSchedules.slice(0, 3).map((schedule) => (
              <div 
                key={schedule.id} 
                className="flex items-center border-l-4 border-blue-500 bg-blue-50 p-4 rounded-r-md"
              >
                <div className="flex-shrink-0 mr-4">
                  <Calendar className="h-10 w-10 text-blue-500" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    {format(parseISO(schedule.date), 'EEEE, MMMM d, yyyy')}
                  </p>
                  <p className="text-gray-600 flex items-center mt-1">
                    <Clock className="h-4 w-4 mr-1" />
                    <span className="capitalize mr-1">{schedule.shiftType} Shift:</span>
                    <span>{schedule.startTime} - {schedule.endTime}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No upcoming shifts scheduled.</p>
        )}
      </div>
      
      {/* Weekly Calendar */}
      <WeeklyCalendar 
        currentDate={currentDate}
        schedules={sortedSchedules}
        onDateChange={setCurrentDate}
      />
      
      {/* Future Months Preview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2].map((monthOffset) => {
          const futureDate = addMonths(new Date(), monthOffset);
          const monthStart = startOfWeek(futureDate, { weekStartsOn: 1 });
          const futureSchedules = getScheduleForUserByWeek(user.id, futureDate);
          
          return (
            <div key={monthOffset} className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                {format(futureDate, 'MMMM yyyy')} Preview
              </h2>
              
              {futureSchedules.length > 0 ? (
                <div className="space-y-2">
                  {futureSchedules
                    .sort((a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime())
                    .slice(0, 3)
                    .map((schedule) => (
                      <div key={schedule.id} className="flex items-center p-3 border-b border-gray-100">
                        <div className="w-16 text-sm font-medium text-gray-600">
                          {format(parseISO(schedule.date), 'EEE, d')}
                        </div>
                        <div className={`
                          px-3 py-1 rounded-full text-xs font-medium
                          ${schedule.shiftType === 'morning' ? 'bg-blue-100 text-blue-800' :
                            schedule.shiftType === 'afternoon' ? 'bg-amber-100 text-amber-800' :
                            schedule.shiftType === 'night' ? 'bg-indigo-100 text-indigo-800' :
                            'bg-gray-100 text-gray-800'}
                        `}>
                          {schedule.shiftType === 'dayOff' ? 'Day Off' : `${schedule.startTime} - ${schedule.endTime}`}
                        </div>
                      </div>
                    ))
                  }
                </div>
              ) : (
                <p className="text-gray-500">No shifts scheduled yet.</p>
              )}
              
              <button
                onClick={() => setCurrentDate(futureDate)}
                className="mt-4 text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center"
              >
                View full {format(futureDate, 'MMMM')} schedule
                <span className="ml-1">→</span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SchedulePage;