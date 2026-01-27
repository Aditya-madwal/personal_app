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
    <div className="flex flex-col h-full bg-white dark:bg-[#191919] rounded-2xl border border-gray-200/60 dark:border-[#2f2f2f] overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
      <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-[#2f2f2f]">
        <h2 className="text-xl font-semibold text-notion-text dark:text-gray-200">
           Bookmarks
        </h2>
        <motion.button 
          whileHover={{ backgroundColor: 'rgba(0,0,0,0.05)' }}
          whileTap={{ scale: 0.95 }}
          onClick={onAddResource}
          className="p-2 rounded-lg text-gray-400 hover:text-notion-text dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
        >
          <Plus className="w-5 h-5" />
        </motion.button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        <AnimatePresence mode="popLayout">
          {resources.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-12 px-6 border border-dashed border-gray-200 dark:border-[#2f2f2f] rounded-xl m-2"
            >
              <p className="text-gray-400 text-sm font-medium">No bookmarks yet</p>
            </motion.div>
          ) : (
            resources.map((resource) => (
              <motion.div 
                layout
                key={resource.id} 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="group flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-[#202020] border border-transparent hover:border-gray-100 dark:hover:border-[#2f2f2f] transition-all duration-200"
              >
                <div className="flex-shrink-0 text-gray-400">
                  <LinkIcon className="w-3.5 h-3.5" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="text-xs font-medium text-notion-text dark:text-gray-200 truncate">
                    {resource.title}
                  </h3>
                  <p className="text-[10px] text-gray-400 truncate">
                    {resource.url.replace(/^https?:\/\//, '')}
                  </p>
                </div>

                <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <a 
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors"
                  >
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  <button 
                    onClick={() => onDelete(resource.id)}
                    className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
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
