import React from 'react';
import { Task, TaskCategory } from '../types';
import { CheckCircle2, Circle, Plus, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface TodoListProps {
  tasks: Task[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onAddTask: () => void;
}

const TodoList: React.FC<TodoListProps> = ({ tasks, onToggle, onDelete, onAddTask }) => {
  const sortedTasks = [...tasks].sort((a, b) => {
    if (a.completed === b.completed) return b.createdAt - a.createdAt;
    return a.completed ? 1 : -1;
  });

  const getCategoryColor = (category: TaskCategory) => {
    switch (category) {
      case TaskCategory.WORK: return 'bg-pastel-blue text-blue-700 dark:bg-blue-900/40 dark:text-blue-200';
      case TaskCategory.URGENT: return 'bg-pastel-red text-red-700 dark:bg-red-900/40 dark:text-red-200';
      case TaskCategory.HEALTH: return 'bg-pastel-green text-green-700 dark:bg-green-900/40 dark:text-green-200';
      case TaskCategory.PERSONAL: return 'bg-pastel-orange text-orange-700 dark:bg-orange-900/40 dark:text-orange-200';
      case TaskCategory.LEARNING: return 'bg-pastel-purple text-purple-700 dark:bg-purple-900/40 dark:text-purple-200';
      default: return 'bg-notion-hover text-notion-muted dark:bg-notion-darkHover dark:text-notion-darkMuted';
    }
  };

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between mb-4 px-2">
        <h2 className="text-2xl font-serif text-notion-text dark:text-notion-darkText italic transition-colors">Tasks</h2>
        <motion.button 
          whileHover={{ scale: 1.1, rotate: 90 }}
          whileTap={{ scale: 0.9 }}
          onClick={onAddTask}
          className="p-2 hover:bg-notion-hover dark:hover:bg-notion-darkHover rounded-full text-notion-text dark:text-notion-darkText transition-colors"
        >
          <Plus className="w-7 h-7" />
        </motion.button>
      </div>

      <div className="max-h-[45vh] overflow-y-auto custom-scrollbar space-y-4 pr-3 pb-4">
        <AnimatePresence mode="popLayout">
          {sortedTasks.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-10 px-4 border-2 border-dashed border-notion-border dark:border-notion-darkBorder rounded-[2.5rem] transition-colors"
            >
              <p className="text-notion-muted dark:text-notion-darkMuted font-light italic text-sm">Quiet as a whisper.</p>
            </motion.div>
          ) : (
            sortedTasks.map((task) => (
              <motion.div 
                layout
                key={task.id} 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20, height: 0, marginBottom: 0, padding: 0 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className={`group flex items-start gap-4 p-4 rounded-[1.5rem] border transition-all duration-500 overflow-hidden ${task.completed ? 'bg-notion-hover/30 dark:bg-notion-darkHover/30 border-transparent opacity-60' : 'bg-white dark:bg-[#1C1C1E] border-notion-border dark:border-notion-darkBorder hover:border-notion-text/20 dark:hover:border-notion-darkText/20'}`}
              >
                <motion.button 
                  whileTap={{ scale: 0.8 }}
                  onClick={() => onToggle(task.id)}
                  className="mt-1 flex-shrink-0"
                >
                  {task.completed ? (
                    <CheckCircle2 className="w-5 h-5 text-green-500/80" />
                  ) : (
                    <Circle className="w-5 h-5 text-notion-border dark:text-notion-darkBorder group-hover:text-notion-muted dark:group-hover:text-notion-darkMuted" />
                  )}
                </motion.button>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1.5">
                    <h3 className={`font-semibold text-[0.95rem] truncate transition-all duration-500 ${task.completed ? 'text-notion-muted dark:text-notion-darkMuted line-through' : 'text-notion-text dark:text-notion-darkText'}`}>
                      {task.title}
                    </h3>
                    <span className={`text-[9px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider transition-colors duration-500 ${getCategoryColor(task.category)}`}>
                      {task.category}
                    </span>
                  </div>
                  {task.description && (
                    <p className={`text-[0.8rem] leading-relaxed transition-all duration-500 ${task.completed ? 'text-notion-muted/40 dark:text-notion-darkMuted/40' : 'text-notion-muted dark:text-notion-darkMuted'}`}>
                      {task.description}
                    </p>
                  )}
                </div>

                <motion.button 
                  whileHover={{ scale: 1.1, color: '#ef4444' }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => onDelete(task.id)}
                  className="opacity-0 group-hover:opacity-100 p-2 text-notion-muted/40 dark:text-notion-darkMuted/40 transition-opacity"
                >
                  <Trash2 className="w-4.5 h-4.5" />
                </motion.button>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default TodoList;
