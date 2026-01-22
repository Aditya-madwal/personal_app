
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
    <div className="flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div className="flex items-center justify-between mb-6 px-2">
        <h2 className="text-2xl font-serif text-notion-text dark:text-notion-darkText italic transition-colors">Bookmarks</h2>
        <motion.button 
          whileHover={{ scale: 1.1, rotate: 90 }}
          whileTap={{ scale: 0.9 }}
          onClick={onAddResource}
          className="p-1.5 hover:bg-notion-hover dark:hover:bg-notion-darkHover rounded-full text-notion-text dark:text-notion-darkText transition-colors"
        >
          <Plus className="w-5 h-5" />
        </motion.button>
      </div>

      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {resources.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-8 px-4 border border-notion-border dark:border-notion-darkBorder rounded-[2rem] bg-white/30 dark:bg-notion-darkHover/30 transition-colors"
            >
              <p className="text-notion-muted dark:text-notion-darkMuted font-light italic text-xs">No resources saved yet.</p>
            </motion.div>
          ) : (
            resources.map((resource) => (
              <motion.div 
                layout
                key={resource.id} 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                className="group flex items-center gap-4 p-4 rounded-2xl border border-notion-border dark:border-notion-darkBorder bg-white dark:bg-[#1C1C1E] hover:bg-notion-hover/20 dark:hover:bg-notion-darkHover/20 transition-all duration-300"
              >
                <div className="flex-shrink-0 p-2.5 bg-pastel-blue/30 dark:bg-blue-900/30 rounded-xl">
                  <LinkIcon className="w-4 h-4 text-blue-600/70 dark:text-blue-400/70" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm text-notion-text dark:text-notion-darkText truncate transition-colors">
                    {resource.title}
                  </h3>
                  <p className="text-[10px] text-notion-muted dark:text-notion-darkMuted truncate opacity-60">
                    {resource.url.replace(/^https?:\/\//, '')}
                  </p>
                </div>

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <motion.a 
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-2 text-notion-muted dark:text-notion-darkMuted hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </motion.a>
                  <motion.button 
                    whileHover={{ scale: 1.1, color: '#ef4444' }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => onDelete(resource.id)}
                    className="p-2 text-notion-muted/40 dark:text-notion-darkMuted/40 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </motion.button>
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
