import React from 'react';
import { Resource } from '../types';
import { ExternalLink, Plus, Trash2, Link as LinkIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ResourceListProps {
  resources: Resource[];
  onDelete: (id: string) => void;
  onAddResource: () => void;
}

const ResourceList: React.FC<ResourceListProps> = ({ resources, onDelete, onAddResource }) => {
  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#0A0A0A] rounded-2xl border border-gray-200 dark:border-white/5 overflow-hidden shadow-2xl shadow-black/5 dark:shadow-black/50">
      <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200 dark:border-white/5">
        <h2 className="text-xl font-medium text-gray-900 dark:text-gray-200">
           Bookmarks
        </h2>
        <motion.button 
          whileHover={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
          whileTap={{ scale: 0.95 }}
          onClick={onAddResource}
          className="p-2 rounded-lg text-gray-400 hover:text-emerald-600 dark:text-gray-500 dark:hover:text-emerald-400 transition-colors hover:bg-gray-100 dark:hover:bg-white/5"
        >
          <Plus className="w-5 h-5" />
        </motion.button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2 no-scrollbar">
        <AnimatePresence mode="popLayout">
          {resources.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-12 px-6 border border-dashed border-gray-200 dark:border-white/5 rounded-xl m-2 bg-gray-50 dark:bg-white/[0.01]"
            >
              <p className="text-gray-600 text-sm font-medium">No bookmarks yet</p>
            </motion.div>
          ) : (
            resources.map((resource) => (
              <motion.div 
                layout
                key={resource.id} 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="group flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-white/[0.03] border border-transparent hover:border-gray-200 dark:hover:border-white/5 transition-all duration-200"
              >
                <div className="flex-shrink-0 text-gray-600 group-hover:text-emerald-500/80 transition-colors">
                  <LinkIcon className="w-4 h-4" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate group-hover:text-gray-900 dark:group-hover:text-gray-100 transition-colors">
                    {resource.title}
                  </h3>
                  <p className="text-[10px] text-gray-600 truncate group-hover:text-gray-500">
                    {resource.url.replace(/^https?:\/\//, '')}
                  </p>
                </div>

                <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity gap-1">
                  <a 
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 text-gray-400 hover:text-emerald-600 dark:text-gray-500 dark:hover:text-emerald-400 transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  <button 
                    onClick={() => onDelete(resource.id)}
                    className="p-1.5 text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ResourceList;
