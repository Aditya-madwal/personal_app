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
      case TaskCategory.WORK: return 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-200 border border-blue-200 dark:border-blue-700/30';
      case TaskCategory.URGENT: return 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-200 border border-red-200 dark:border-red-700/30';
      case TaskCategory.HEALTH: return 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-200 border border-green-200 dark:border-green-700/30';
      case TaskCategory.PERSONAL: return 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-200 border border-orange-200 dark:border-orange-700/30';
      case TaskCategory.LEARNING: return 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-200 border border-purple-200 dark:border-purple-700/30';
      default: return 'bg-gray-100 text-gray-600 dark:bg-notion-darkHover dark:text-notion-darkMuted border border-gray-200 dark:border-white/10';
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#0A0A0A] rounded-2xl border border-gray-200 dark:border-white/5 overflow-hidden shadow-2xl shadow-black/5 dark:shadow-black/50">
      <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200 dark:border-white/5">
        <h2 className="text-xl font-medium text-gray-900 dark:text-gray-200 flex items-center gap-3">
           Tasks <span className="bg-gray-100 dark:bg-[#121212] text-gray-500 border border-gray-200 dark:border-white/5 px-2.5 py-0.5 rounded-full text-xs font-medium">{tasks.length}</span>
        </h2>
        <motion.button 
          whileHover={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
          whileTap={{ scale: 0.95 }}
          onClick={onAddTask}
          className="p-2 rounded-lg text-gray-400 hover:text-emerald-600 dark:text-gray-500 dark:hover:text-emerald-400 transition-colors hover:bg-gray-100 dark:hover:bg-white/5"
        >
          <Plus className="w-5 h-5" />
        </motion.button>
      </div>

      <div className="flex-1 overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="border-b border-gray-200 dark:border-white/5 bg-gray-50 dark:bg-white/[0.01]">
                <th className="p-4 text-[11px] font-semibold text-gray-500 uppercase tracking-wider w-[120px]">Category</th>
                <th className="p-4 text-[11px] font-semibold text-gray-500 uppercase tracking-wider min-w-[200px]">Description</th>
                <th className="p-4 text-[11px] font-semibold text-gray-500 uppercase tracking-wider min-w-[150px]">Title</th>
                <th className="p-4 text-[11px] font-semibold text-gray-500 uppercase tracking-wider text-center w-[100px]">Status</th>
                <th className="p-4 text-[11px] font-semibold text-gray-500 uppercase tracking-wider text-center w-[80px]">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-white/5">
              <AnimatePresence mode="popLayout" initial={false}>
                {sortedTasks.length === 0 ? (
                  <motion.tr 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <td colSpan={5} className="p-8 text-center text-sm text-gray-600 italic">
                      No tasks yet. Press + to create one.
                    </td>
                  </motion.tr>
                ) : (
                  sortedTasks.map((task) => (
                    <motion.tr 
                      layout
                      key={task.id} 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="group hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="p-4 align-top">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-medium shadow-sm ${getCategoryColor(task.category)}`}>
                          {task.category}
                        </span>
                      </td>
                      <td className="p-4 align-top">
                        <p className={`text-xs text-gray-400 line-clamp-2 ${task.completed ? 'line-through opacity-40' : ''}`}>
                          {task.description || '-'}
                        </p>
                      </td>
                      <td className="p-4 align-top">
                        <p className={`text-sm font-medium ${task.completed ? 'text-gray-500 line-through decoration-gray-700' : 'text-gray-900 dark:text-gray-200'}`}>
                          {task.title}
                        </p>
                      </td>
                      <td className="p-4 align-top text-center">
                        <button 
                          onClick={() => onToggle(task.id)}
                          className={`rounded-md p-0.5 transition-colors ${task.completed ? 'text-emerald-500' : 'text-gray-600 hover:text-emerald-400'}`}
                        >
                          {task.completed ? (
                            <CheckCircle2 className="w-5 h-5" />
                          ) : (
                            <Circle className="w-5 h-5" />
                          )}
                        </button>
                      </td>
                      <td className="p-4 align-top text-center">
                        <button 
                          onClick={() => onDelete(task.id)}
                          className="p-1 text-gray-400 hover:text-red-500 dark:text-gray-600 dark:hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </motion.tr>
                  ))
                )}
              </AnimatePresence>
            </tbody>
          </table>
      </div>
    </div>
  );
};

export default TodoList;
