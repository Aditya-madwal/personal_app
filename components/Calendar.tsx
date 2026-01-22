
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
      className="bg-white dark:bg-[#1C1C1E] rounded-[2.5rem] p-8 border border-notion-border dark:border-notion-darkBorder transition-colors duration-500 shadow-sm"
    >
      <div className="flex items-center justify-between mb-8 px-2">
        <div className="flex items-center gap-6">
          <motion.h2 
            key={monthName}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-4xl font-serif text-notion-text dark:text-notion-darkText"
          >
            {monthName} <span className="text-notion-muted dark:text-notion-darkMuted font-light">{year}</span>
          </motion.h2>
          <div className="flex gap-2 bg-notion-hover/50 dark:bg-notion-darkHover/50 p-1.5 rounded-full">
            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={prevMonth} className="p-2 hover:bg-white dark:hover:bg-notion-darkBorder rounded-full transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </motion.button>
            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={nextMonth} className="p-2 hover:bg-white dark:hover:bg-notion-darkBorder rounded-full transition-colors">
              <ChevronRight className="w-5 h-5" />
            </motion.button>
          </div>
        </div>
        
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onAddEvent()}
          className="flex items-center gap-2 bg-notion-text dark:bg-notion-darkText text-bone dark:text-darkbg px-6 py-3 rounded-full font-medium text-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>New Event</span>
        </motion.button>
      </div>

      <div className="grid grid-cols-7 mb-6">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
          <div key={d} className="text-center text-[10px] font-bold text-notion-muted dark:text-notion-darkMuted uppercase tracking-[0.3em] py-2 opacity-50">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-px bg-notion-border dark:bg-notion-darkBorder rounded-3xl overflow-hidden border border-notion-border dark:border-notion-darkBorder shadow-sm">
        {calendarGrid.map((day, idx) => (
          <div 
            key={idx} 
            className={`min-h-[120px] bg-white dark:bg-[#1C1C1E] p-3 group transition-colors duration-300 hover:bg-notion-hover/40 dark:hover:bg-notion-darkHover/40 ${day === null ? 'bg-bone/40 dark:bg-darkbg/20' : ''}`}
          >
            {day && (
              <div className="h-full flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <span className={`text-sm font-medium w-8 h-8 flex items-center justify-center rounded-full transition-colors ${isToday(day) ? 'bg-notion-text dark:bg-notion-darkText text-bone dark:text-darkbg' : 'text-notion-text dark:text-notion-darkText group-hover:text-black dark:group-hover:text-white'}`}>
                    {day}
                  </span>
                  <motion.button 
                    initial={{ opacity: 0 }}
                    whileHover={{ scale: 1.2 }}
                    className="group-hover:opacity-100 p-1.5 hover:bg-notion-hover dark:hover:bg-notion-darkHover rounded-lg transition-all"
                    onClick={() => onAddEvent(`${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`)}
                  >
                    <Plus className="w-4 h-4 text-notion-muted dark:text-notion-darkMuted" />
                  </motion.button>
                </div>
                <div className="flex flex-col gap-1.5 mt-1">
                  <AnimatePresence mode="popLayout">
                    {getEventsForDay(day).map(event => (
                      <motion.button 
                        layoutId={event.id}
                        key={event.id} 
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        whileHover={{ x: 2, filter: 'brightness(0.9)' }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => onEventClick(event)}
                        className={`${event.color} dark:brightness-75 text-[10px] px-2.5 py-2 rounded-xl font-semibold truncate border border-black/5 dark:text-black text-left transition-all`}
                      >
                        {event.title}
                      </motion.button>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default Calendar;
