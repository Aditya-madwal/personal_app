import React from 'react';
import { CalendarEvent, PASTEL_COLORS } from '../types';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CalendarProps {
  events: CalendarEvent[];
  onAddEvent: (date?: string) => void;
  onEventClick: (event: CalendarEvent) => void;
}

const Calendar: React.FC<CalendarProps> = ({ events, onAddEvent, onEventClick }) => {
  const [currentDate, setCurrentDate] = React.useState(new Date());

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const startDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthName = currentDate.toLocaleString('default', { month: 'long' });
  
  const totalDays = daysInMonth(year, month);
  const startDay = startDayOfMonth(year, month);
  
  const calendarGrid = [];
  
  for (let i = 0; i < startDay; i++) {
    calendarGrid.push(null);
  }
  
  for (let i = 1; i <= totalDays; i++) {
    calendarGrid.push(i);
  }

  const getEventsForDay = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return events.filter(e => e.date === dateStr);
  };

  const isToday = (day: number) => {
    const today = new Date();
    return today.getDate() === day && today.getMonth() === month && today.getFullYear() === year;
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col h-full bg-white dark:bg-[#191919] rounded-2xl border border-gray-200/60 dark:border-[#2f2f2f] shadow-sm transition-all duration-500 overflow-hidden hover:shadow-md"
    >
      <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-[#2f2f2f]">
        <div className="flex items-center gap-4">
          <motion.h2 
            key={monthName}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-xl font-semibold text-notion-text dark:text-gray-100 flex items-baseline gap-2"
          >
            {monthName} <span className="text-sm text-gray-400 font-normal">{year}</span>
          </motion.h2>
          <div className="flex bg-gray-50 dark:bg-[#2f2f2f] rounded-lg p-1 gap-1">
            <motion.button whileHover={{ backgroundColor: 'rgba(0,0,0,0.05)' }} onClick={prevMonth} className="p-1.5 rounded-md text-gray-500 dark:text-gray-400 transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </motion.button>
            <motion.button whileHover={{ backgroundColor: 'rgba(0,0,0,0.05)' }} onClick={nextMonth} className="p-1.5 rounded-md text-gray-500 dark:text-gray-400 transition-colors">
              <ChevronRight className="w-4 h-4" />
            </motion.button>
          </div>
        </div>
        
        <button 
          onClick={() => onAddEvent()}
          className="text-xs bg-notion-text dark:bg-[#37352f] text-white px-4 py-2 rounded-lg font-medium hover:opacity-90 transition-all shadow-sm active:scale-95"
        >
          New Event
        </button>
      </div>

      <div className="grid grid-cols-7 border-b border-gray-100 dark:border-[#2f2f2f]">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
          <div key={d} className="text-center text-[10px] font-medium text-gray-400 uppercase py-2 border-r border-gray-50 dark:border-[#2f2f2f] last:border-r-0">
            {d}
          </div>
        ))}
      </div>

      <div className="flex-1 grid grid-cols-7 grid-rows-5 sm:grid-rows-6">
        {calendarGrid.map((day, idx) => (
          <div 
            key={idx} 
            className={`
              relative p-1 border-b border-r border-gray-100 dark:border-[#2f2f2f] 
              ${(idx + 1) % 7 === 0 ? 'border-r-0' : ''} 
              bg-white dark:bg-[#191919] 
              hover:bg-gray-50 dark:hover:bg-[#202020] transition-colors
              flex flex-col
            `}
            onClick={() => day && onAddEvent(`${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`)}
          >
            {day && (
              <>
                <div className="flex justify-between items-start mb-1">
                  <span className={`text-xs font-medium w-6 h-6 flex items-center justify-center rounded-sm ${isToday(day) ? 'bg-red-500 text-white' : 'text-gray-500 dark:text-gray-400'}`}>
                    {day}
                  </span>
                </div>
                <div className="flex-1 overflow-y-auto w-full space-y-0.5 no-scrollbar">
                  {getEventsForDay(day).map(event => (
                    <motion.button 
                      layoutId={event.id}
                      key={event.id} 
                      onClick={(e) => { e.stopPropagation(); onEventClick(event); }}
                      className={`${event.color} bg-opacity-20 hover:bg-opacity-30 text-[10px] px-1.5 py-0.5 rounded-sm font-medium truncate w-full text-left text-notion-text dark:text-gray-200 block`}
                    >
                      {event.title}
                    </motion.button>
                  ))}
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default Calendar;
