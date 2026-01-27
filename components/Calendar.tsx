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
      className="flex flex-col h-full bg-[#0A0A0A] rounded-2xl border border-white/5 shadow-2xl shadow-black/50 overflow-hidden"
    >
      <div className="flex items-center justify-between px-6 py-5 border-b border-white/5">
        <div className="flex items-center gap-4">
          <motion.h2 
            key={monthName}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-xl font-medium text-gray-200 flex items-baseline gap-2"
          >
            {monthName} <span className="text-sm text-gray-600 font-normal">{year}</span>
          </motion.h2>
          <div className="flex bg-[#121212] rounded-lg p-1 gap-1 border border-white/5">
            <motion.button whileHover={{ backgroundColor: 'rgba(255,255,255,0.05)' }} onClick={prevMonth} className="p-1.5 rounded-md text-gray-500 hover:text-gray-300 transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </motion.button>
            <motion.button whileHover={{ backgroundColor: 'rgba(255,255,255,0.05)' }} onClick={nextMonth} className="p-1.5 rounded-md text-gray-500 hover:text-gray-300 transition-colors">
              <ChevronRight className="w-4 h-4" />
            </motion.button>
          </div>
        </div>
        
        <button 
          onClick={() => onAddEvent()}
          className="text-xs bg-emerald-900/30 text-emerald-400 border border-emerald-500/20 px-4 py-2 rounded-lg font-medium hover:bg-emerald-900/50 transition-all shadow-sm active:scale-95"
        >
          New Event
        </button>
      </div>

      <div className="grid grid-cols-7 border-b border-white/5">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
          <div key={d} className="text-center text-[10px] font-medium text-gray-600 uppercase py-3 border-r border-white/5 last:border-r-0 tracking-wider">
            {d}
          </div>
        ))}
      </div>

      <div className="flex-1 grid grid-cols-7 grid-rows-5 sm:grid-rows-6">
        {calendarGrid.map((day, idx) => (
          <div 
            key={idx} 
            className={`
              relative p-1 border-b border-r border-white/5
              ${(idx + 1) % 7 === 0 ? 'border-r-0' : ''} 
              bg-[#0A0A0A]
              hover:bg-white/[0.02] transition-colors
              flex flex-col group
            `}
            onClick={() => day && onAddEvent(`${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`)}
          >
            {day && (
              <>
                <div className="flex justify-between items-start mb-1">
                  <span className={`text-xs font-medium w-6 h-6 flex items-center justify-center rounded-sm transition-colors ${isToday(day) ? 'bg-emerald-500/20 text-emerald-400' : 'text-gray-600 group-hover:text-gray-400'}`}>
                    {day}
                  </span>
                </div>
                <div className="flex-1 overflow-y-auto w-full space-y-0.5 no-scrollbar">
                  {getEventsForDay(day).map(event => (
                    <motion.button 
                      layoutId={event.id}
                      key={event.id} 
                      onClick={(e) => { e.stopPropagation(); onEventClick(event); }}
                      className={`${event.color} bg-opacity-10 hover:bg-opacity-20 text-[10px] px-1.5 py-1 rounded-sm font-medium truncate w-full text-left text-gray-300 block border-l-2 border-opacity-50`}
                      style={{ borderColor: 'currentColor' }}
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
