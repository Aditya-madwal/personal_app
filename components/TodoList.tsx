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
      case TaskCategory.WORK: return 'bg-pastel-blue/20 text-blue-700 dark:bg-blue-900/40 dark:text-blue-200';
      case TaskCategory.URGENT: return 'bg-pastel-red/20 text-red-700 dark:bg-red-900/40 dark:text-red-200';
      case TaskCategory.HEALTH: return 'bg-pastel-green/20 text-green-700 dark:bg-green-900/40 dark:text-green-200';
      case TaskCategory.PERSONAL: return 'bg-pastel-orange/20 text-orange-700 dark:bg-orange-900/40 dark:text-orange-200';
      case TaskCategory.LEARNING: return 'bg-pastel-purple/20 text-purple-700 dark:bg-purple-900/40 dark:text-purple-200';
      default: return 'bg-notion-hover text-notion-muted dark:bg-notion-darkHover dark:text-notion-darkMuted';
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#191919] rounded-2xl border border-gray-200/60 dark:border-[#2f2f2f] overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
      <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-[#2f2f2f]">
        <h2 className="text-lg font-semibold text-notion-text dark:text-gray-200 flex items-center gap-3">
           Tasks <span className="bg-gray-100 dark:bg-[#2f2f2f] text-gray-500 dark:text-gray-400 px-2.5 py-0.5 rounded-full text-xs font-medium">{tasks.length}</span>
        </h2>
        <motion.button 
          whileHover={{ backgroundColor: 'rgba(0,0,0,0.05)' }}
          whileTap={{ scale: 0.95 }}
          onClick={onAddTask}
          className="p-2 rounded-lg text-gray-400 hover:text-notion-text dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
        >
          <Plus className="w-5 h-5" />
        </motion.button>
      </div>

      <div className="flex-1 overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="border-b border-gray-100 dark:border-[#2f2f2f] bg-gray-50/30 dark:bg-[#202020]">
                <th className="p-4 text-[11px] font-semibold text-gray-400 uppercase tracking-wider w-[120px]">Category</th>
                <th className="p-4 text-[11px] font-semibold text-gray-400 uppercase tracking-wider min-w-[200px]">Description</th>
                <th className="p-4 text-[11px] font-semibold text-gray-400 uppercase tracking-wider min-w-[150px]">Title</th>
                <th className="p-4 text-[11px] font-semibold text-gray-400 uppercase tracking-wider text-center w-[100px]">Status</th>
                <th className="p-4 text-[11px] font-semibold text-gray-400 uppercase tracking-wider text-center w-[80px]">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-[#2f2f2f]">
              <AnimatePresence mode="popLayout" initial={false}>
                {sortedTasks.length === 0 ? (
                  <motion.tr 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <td colSpan={5} className="p-8 text-center text-sm text-gray-400 italic">
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
                      className="group hover:bg-gray-50 dark:hover:bg-[#202020] transition-colors"
                    >
                      <td className="p-3 align-top">
                        <span className={`inline-flex items-center px-1.5 py-0.5 rounded-sm text-[10px] font-medium ${getCategoryColor(task.category)} bg-opacity-10`}>
                          {task.category}
                        </span>
                      </td>
                      <td className="p-3 align-top">
                        <p className={`text-xs text-gray-600 dark:text-gray-400 line-clamp-2 ${task.completed ? 'line-through opacity-50' : ''}`}>
                          {task.description || '-'}
                        </p>
                      </td>
                      <td className="p-3 align-top">
                        <p className={`text-xs font-medium ${task.completed ? 'text-gray-400 line-through' : 'text-notion-text dark:text-gray-200'}`}>
                          {task.title}
                        </p>
                      </td>
                      <td className="p-3 align-top text-center">
                        <button 
                          onClick={() => onToggle(task.id)}
                          className={`rounded-sm p-0.5 transition-colors ${task.completed ? 'text-blue-600' : 'text-gray-300 hover:text-gray-500 dark:text-gray-600 dark:hover:text-gray-400'}`}
                        >
                          {task.completed ? (
                            <CheckCircle2 className="w-4 h-4" />
                          ) : (
                            <Circle className="w-4 h-4" />
                          )}
                        </button>
                      </td>
                      <td className="p-3 align-top text-center">
                        <button 
                          onClick={() => onDelete(task.id)}
                          className="p-1 text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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
