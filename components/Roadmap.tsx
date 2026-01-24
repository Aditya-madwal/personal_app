
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Edit3, ChevronDown, ChevronRight, ExternalLink, AlertTriangle, Plus, BookOpen, Trash2, CheckCircle2, Circle, Loader2 } from 'lucide-react';
import Modal from './Modal';
import { RoadmapData, RoadmapItem, SubTopic } from '../types';

interface RoadmapProps {
  roadmaps: RoadmapItem[];
  activeId: string;
  onSelect: (id: string) => void;
  onAdd: (title: string, data: RoadmapData) => Promise<void>;
  onEdit: (id: string, data: RoadmapData) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  isUpdating?: boolean;
}

const Roadmap: React.FC<RoadmapProps> = ({ roadmaps, activeId, onSelect, onAdd, onEdit, onDelete, isUpdating }) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editContent, setEditContent] = useState('');
  const [newRoadmapName, setNewRoadmapName] = useState('');
  const [newRoadmapJson, setNewRoadmapJson] = useState('[]');
  const [error, setError] = useState<string | null>(null);
  const [expandedTopics, setExpandedTopics] = useState<Set<number>>(new Set([0]));

  // Ensure activeId is valid
  React.useEffect(() => {
    if (roadmaps.length > 0 && !roadmaps.find(r => r.id === activeId)) {
        onSelect(roadmaps[0].id);
    }
  }, [roadmaps, activeId, onSelect]);

  const activeRoadmap = roadmaps.find(r => r.id === activeId);

  // Calculate Progress (Memoized)
  const progressStats = useMemo(() => {
    if (!activeRoadmap) return { total: 0, completed: 0, percentage: 0 };
    
    let total = 0;
    let completed = 0;

    activeRoadmap.data.forEach(topicObj => {
      const topicName = Object.keys(topicObj)[0];
      const subtopics = topicObj[topicName];
      total += subtopics.length;
      completed += subtopics.filter(s => s.completed).length;
    });

    return {
      total,
      completed,
      percentage: total === 0 ? 0 : Math.round((completed / total) * 100)
    };
  }, [activeRoadmap]);

  const handleEditOpen = () => {
    if (!activeRoadmap) return;
    setEditContent(JSON.stringify(activeRoadmap.data, null, 2));
    setError(null);
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async () => {
    try {
      if (!activeRoadmap) return;
      const parsed = JSON.parse(editContent);
      if (!Array.isArray(parsed)) throw new Error("Root must be an array");
      
      await onEdit(activeRoadmap.id, parsed as RoadmapData);
      setIsEditModalOpen(false);
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const handleAddRoadmap = async () => {
    try {
      if (!newRoadmapName.trim()) {
        setError("Name is required");
        return;
      }
      
      const parsed = JSON.parse(newRoadmapJson);
      if (!Array.isArray(parsed)) throw new Error("JSON must be an array");

      await onAdd(newRoadmapName, parsed as RoadmapData);
      setIsAddModalOpen(false);
      setNewRoadmapName('');
      setNewRoadmapJson('[]');
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const deleteRoadmap = async (id: string) => {
    if (confirm('Are you sure you want to delete this roadmap?')) {
        await onDelete(id);
    }
  };

  const toggleTopic = (index: number) => {
    const newExpanded = new Set(expandedTopics);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedTopics(newExpanded);
  };

  const toggleSubtopic = async (topicIndex: number, subIndex: number) => {
    if (!activeRoadmap) return;

    // Deep copy to avoid mutation issues
    const newData = JSON.parse(JSON.stringify(activeRoadmap.data));
    const topicObj = newData[topicIndex];
    const topicName = Object.keys(topicObj)[0];
    const subtopics = topicObj[topicName];
    
    // Toggle
    subtopics[subIndex].completed = !subtopics[subIndex].completed;

    await onEdit(activeRoadmap.id, newData);
  };

  if (roadmaps.length === 0) {
      return (
          <div className="w-full text-center py-10 bg-notion-hover/20 dark:bg-notion-darkHover/20 rounded-3xl border border-dashed border-notion-border dark:border-notion-darkBorder">
              <button 
                onClick={() => setIsAddModalOpen(true)}
                className="px-6 py-3 bg-notion-text dark:bg-notion-darkText text-bone dark:text-darkbg rounded-full text-xs font-bold uppercase tracking-[0.2em]"
              >
                  Create First Roadmap
              </button>
              <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="New Roadmap">
                <div className="space-y-6">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-[0.3em] text-notion-muted dark:text-notion-darkMuted mb-2 opacity-50">Subject Name</label>
                      <input 
                        autoFocus
                        className="w-full text-xl font-serif border-b border-notion-border dark:border-notion-darkBorder py-2 focus:outline-none focus:border-notion-text dark:focus:border-notion-darkText bg-transparent"
                        placeholder="e.g. System Design, React Performance"
                        value={newRoadmapName}
                        onChange={e => setNewRoadmapName(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-[0.3em] text-notion-muted dark:text-notion-darkMuted mb-2 opacity-50">JSON Data</label>
                      <textarea
                        className={`w-full h-64 p-4 font-mono text-xs leading-relaxed bg-bone dark:bg-black/20 border rounded-2xl focus:outline-none focus:ring-1 focus:ring-notion-text/20 dark:focus:ring-notion-darkText/20 text-notion-text dark:text-notion-darkText resize-none ${error ? 'border-red-500' : 'border-notion-border dark:border-notion-darkBorder'}`}
                        value={newRoadmapJson}
                        onChange={(e) => setNewRoadmapJson(e.target.value)}
                        placeholder="Paste JSON array here..."
                      />
                      <div className="flex justify-end">
                        <button 
                          onClick={() => setNewRoadmapJson(JSON.stringify([
                            {
                              "Example Topic": [
                                {
                                  "subtopic_name": "Example Subtopic",
                                  "resource_url": "https://example.com",
                                  "completed": false
                                }
                              ]
                            }
                          ], null, 2))}
                          className="text-[10px] text-notion-muted hover:text-notion-text underline cursor-pointer bg-transparent border-none"
                        >
                          Load Example Template
                        </button>
                      </div>
                    </div>
                    {error && <p className="text-red-500 text-xs font-bold uppercase tracking-wide">{error}</p>}
                    
                    <motion.button 
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleAddRoadmap}
                      disabled={!newRoadmapName}
                      className="w-full py-4 bg-notion-text dark:bg-notion-darkText text-bone dark:text-darkbg rounded-full font-bold text-xs uppercase tracking-[0.2em] disabled:opacity-50"
                    >
                      Create Roadmap
                    </motion.button>
                </div>
              </Modal>
          </div>
      )
  }

  return (
    <div className="w-full bg-white dark:bg-[#1C1C1E]/50 border border-notion-border dark:border-notion-darkBorder rounded-[2.5rem] p-8 mt-8 shadow-sm transition-all duration-500">
      
      {/* Header Section */}
      <div className="flex flex-col gap-6 mb-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 text-notion-muted dark:text-notion-darkMuted text-[10px] font-bold tracking-[0.4em] uppercase opacity-60 mb-2">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Learning Journey</span>
            </div>
              <div className="flex items-baseline gap-4">
                <h2 className="text-3xl font-serif text-notion-text dark:text-notion-darkText italic">
                  {activeRoadmap?.title || 'Select Roadmap'}
                </h2>
                {isUpdating && <Loader2 className="w-4 h-4 text-notion-muted animate-spin" />}
                {activeRoadmap && !isUpdating && (
                   <span className="text-sm font-mono text-notion-muted dark:text-notion-darkMuted">
                      {progressStats.completed}/{progressStats.total} Completed ({progressStats.percentage}%)
                   </span>
                )}
              </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
              <div className="flex p-1 bg-notion-hover dark:bg-notion-darkHover rounded-full overflow-x-auto no-scrollbar max-w-full">
                  {roadmaps.map(rmap => (
                      <button
                          key={rmap.id}
                          onClick={() => onSelect(rmap.id)}
                          className={`flex-shrink-0 px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${activeId === rmap.id ? 'bg-white dark:bg-[#2C2C2E] text-notion-text dark:text-notion-darkText shadow-sm' : 'text-notion-muted dark:text-notion-darkMuted hover:text-notion-text dark:hover:text-notion-darkText'}`}
                      >
                          {rmap.title}
                      </button>
                  ))}
              </div>
              <div className="w-px h-8 bg-notion-border dark:bg-notion-darkBorder mx-2 hidden md:block" />
              <div className="flex gap-2">
                  <button 
                      onClick={() => setIsAddModalOpen(true)}
                      className="flex items-center gap-2 px-4 py-2.5 bg-notion-hover dark:bg-notion-darkHover hover:bg-notion-border dark:hover:bg-notion-darkBorder rounded-full text-[10px] font-bold uppercase tracking-widest text-notion-text dark:text-notion-darkText transition-colors"
                  >
                      <Plus className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Add</span>
                  </button>
                  {activeRoadmap && (
                      <>
                          <button 
                              onClick={handleEditOpen}
                              className="flex items-center gap-2 px-4 py-2.5 bg-notion-hover dark:bg-notion-darkHover hover:bg-notion-border dark:hover:bg-notion-darkBorder rounded-full text-[10px] font-bold uppercase tracking-widest text-notion-text dark:text-notion-darkText transition-colors"
                          >
                              <Edit3 className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">JSON</span>
                          </button>
                          <button 
                              onClick={() => deleteRoadmap(activeRoadmap.id)}
                              className="p-2.5 bg-notion-hover dark:bg-notion-darkHover hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full text-notion-muted dark:text-notion-darkMuted hover:text-red-600 dark:hover:text-red-400 transition-colors"
                          >
                              <Trash2 className="w-3.5 h-3.5" />
                          </button>
                      </>
                  )}
              </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-1 bg-notion-hover dark:bg-notion-darkHover rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-notion-text dark:bg-notion-darkText"
            initial={{ width: 0 }}
            animate={{ width: `${progressStats.percentage}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Content Section */}
      <div className="flex flex-col gap-6">
        {activeRoadmap && activeRoadmap.data.map((topicObj, index) => {
          const topicName = Object.keys(topicObj)[0];
          const subtopics = topicObj[topicName];
          const isExpanded = expandedTopics.has(index);
          const completedCount = subtopics.filter(s => s.completed).length;
          const isTopicComplete = completedCount === subtopics.length && subtopics.length > 0;

          return (
            <motion.div
              layout
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`group border-b border-notion-border dark:border-notion-darkBorder/50 pb-4 last:border-0 ${isExpanded ? '' : ''}`}
            >
              <button
                onClick={() => toggleTopic(index)}
                className="w-full flex items-center justify-between py-2 text-left group hover:opacity-80 transition-opacity"
              >
                <div className="flex items-center gap-4">
                  <div className={`transition-transform duration-300 ${isExpanded ? 'rotate-90' : 'rotate-0'}`}>
                    <ChevronRight className="w-4 h-4 text-notion-muted dark:text-notion-darkMuted" />
                  </div>
                  <div>
                    <h3 className={`font-serif text-xl leading-tight transition-colors ${isTopicComplete ? 'text-notion-muted dark:text-notion-darkMuted line-through decoration-notion-muted/50' : 'text-notion-text dark:text-notion-darkText'}`}>
                      {topicName}
                    </h3>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-notion-muted dark:text-notion-darkMuted opacity-50">
                       {completedCount}/{subtopics.length}
                    </span>
                   {isTopicComplete && <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 opacity-80" />}
                </div>
              </button>
              
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <div className="pl-8 pt-4 grid gap-1">
                      {subtopics.map((sub, subIndex) => (
                         <div
                           key={subIndex}
                           className="flex items-center gap-3 py-2 group/item"
                         >
                           <button
                             onClick={() => toggleSubtopic(index, subIndex)}
                             className="flex-shrink-0 transition-all text-notion-muted hover:text-notion-text dark:text-notion-darkMuted dark:hover:text-notion-darkText"
                           >
                             {sub.completed ? (
                               <CheckCircle2 className="w-5 h-5 text-notion-text dark:text-notion-darkText fill-notion-text/10 dark:fill-notion-darkText/10" />
                             ) : (
                               <Circle className="w-5 h-5 opacity-40 group-hover/item:opacity-100" />
                             )}
                           </button>
                           
                           <div className="flex-1 min-w-0 flex items-center gap-3">
                             <span className={`text-sm truncate transition-colors ${sub.completed ? 'text-notion-muted dark:text-notion-darkMuted line-through decoration-notion-border dark:decoration-notion-darkBorder' : 'text-notion-text dark:text-notion-darkText'}`}>
                               {sub.subtopic_name}
                             </span>
                             <a 
                               href={sub.resource_url}
                               target="_blank" 
                               rel="noopener noreferrer"
                               className="opacity-0 group-hover/item:opacity-100 transition-opacity p-1 hover:bg-notion-hover dark:hover:bg-notion-darkHover rounded-full"
                             >
                               <ExternalLink className="w-3.5 h-3.5 text-notion-muted" />
                             </a>
                           </div>
                         </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {/* Edit Modal */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Roadmap Config">
        <div className="space-y-4">
             <div className="p-4 bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-900/30 rounded-xl mb-4">
                <p className="text-xs text-yellow-800 dark:text-yellow-200 font-medium flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    Use strictly valid JSON format.
                </p>
             </div>
            <textarea
                className={`w-full h-[50vh] p-4 font-mono text-xs leading-relaxed bg-bone dark:bg-black/20 border rounded-2xl focus:outline-none focus:ring-1 focus:ring-notion-text/20 dark:focus:ring-notion-darkText/20 text-notion-text dark:text-notion-darkText resize-none ${error ? 'border-red-500' : 'border-notion-border dark:border-notion-darkBorder'}`}
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                placeholder="Paste JSON here..."
            />
            {error && <p className="text-red-500 text-xs font-bold uppercase tracking-wide">{error}</p>}
            
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSaveEdit}
              className="w-full py-4 bg-notion-text dark:bg-notion-darkText text-bone dark:text-darkbg rounded-full font-bold text-xs uppercase tracking-[0.2em]"
            >
              Save Changes
            </motion.button>
        </div>
      </Modal>

      {/* Add Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="New Roadmap">
        <div className="space-y-6">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-[0.3em] text-notion-muted dark:text-notion-darkMuted mb-2 opacity-50">Subject Name</label>
              <input 
                autoFocus
                className="w-full text-xl font-serif border-b border-notion-border dark:border-notion-darkBorder py-2 focus:outline-none focus:border-notion-text dark:focus:border-notion-darkText bg-transparent"
                placeholder="e.g. System Design, React Performance"
                value={newRoadmapName}
                onChange={e => setNewRoadmapName(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-[0.3em] text-notion-muted dark:text-notion-darkMuted mb-2 opacity-50">JSON Data</label>
              <textarea
                className={`w-full h-64 p-4 font-mono text-xs leading-relaxed bg-bone dark:bg-black/20 border rounded-2xl focus:outline-none focus:ring-1 focus:ring-notion-text/20 dark:focus:ring-notion-darkText/20 text-notion-text dark:text-notion-darkText resize-none ${error ? 'border-red-500' : 'border-notion-border dark:border-notion-darkBorder'}`}
                value={newRoadmapJson}
                onChange={(e) => setNewRoadmapJson(e.target.value)}
                placeholder="Paste JSON array here..."
              />
              <div className="flex justify-end">
                <button 
                  onClick={() => setNewRoadmapJson(JSON.stringify([
                    {
                      "Example Topic": [
                        {
                          "subtopic_name": "Example Subtopic",
                          "resource_url": "https://example.com",
                          "completed": false
                        }
                      ]
                    }
                  ], null, 2))}
                  className="text-[10px] text-notion-muted hover:text-notion-text underline cursor-pointer bg-transparent border-none"
                >
                  Load Example Template
                </button>
              </div>
            </div>
            {error && <p className="text-red-500 text-xs font-bold uppercase tracking-wide">{error}</p>}
            
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleAddRoadmap}
              disabled={!newRoadmapName}
              className="w-full py-4 bg-notion-text dark:bg-notion-darkText text-bone dark:text-darkbg rounded-full font-bold text-xs uppercase tracking-[0.2em] disabled:opacity-50"
            >
              Create Roadmap
            </motion.button>
        </div>
      </Modal>
    </div>
  );
};

export default Roadmap;
