
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
                className="px-6 py-3 bg-gray-900 dark:bg-notion-darkText text-white dark:text-darkbg rounded-full text-xs font-bold uppercase tracking-[0.2em] hover:bg-black dark:hover:bg-white transition-colors"
              >
                  Create First Roadmap
              </button>
              <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="New Roadmap">
                <div className="space-y-6">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-[0.3em] text-notion-muted dark:text-notion-darkMuted mb-2 opacity-50">Subject Name</label>
                      <input 
                        autoFocus
                        className="w-full text-xl font-serif border-b border-gray-200 dark:border-notion-darkBorder py-2 focus:outline-none focus:border-gray-900 dark:focus:border-notion-darkText bg-transparent text-gray-900 dark:text-gray-100"
                        placeholder="e.g. System Design, React Performance"
                        value={newRoadmapName}
                        onChange={e => setNewRoadmapName(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-[0.3em] text-notion-muted dark:text-notion-darkMuted mb-2 opacity-50">JSON Data</label>
                      <textarea
                        className={`w-full h-64 p-4 font-mono text-xs leading-relaxed bg-gray-50 dark:bg-black/20 border rounded-2xl focus:outline-none focus:ring-1 focus:ring-emerald-500/20 text-gray-700 dark:text-notion-darkText resize-none ${error ? 'border-red-500' : 'border-gray-200 dark:border-notion-darkBorder'}`}
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
                      className="w-full py-4 bg-gray-900 dark:bg-notion-darkText text-white dark:text-darkbg rounded-full font-bold text-xs uppercase tracking-[0.2em] disabled:opacity-50 hover:bg-black dark:hover:bg-white transition-colors"
                    >
                      Create Roadmap
                    </motion.button>
                </div>
              </Modal>
          </div>
      )
  }

  return (

    <div className="w-full bg-white dark:bg-[#0A0A0A] border border-gray-200 dark:border-white/5 rounded-2xl mt-4 transition-all duration-500 overflow-hidden shadow-2xl shadow-black/5 dark:shadow-black/50">
      
      {/* Header Section */}
      <div className="px-6 py-5 border-b border-gray-200 dark:border-white/5 bg-gray-50 dark:bg-white/[0.01]">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
               <div className="p-2 bg-gray-100 dark:bg-[#121212] rounded-lg shadow-sm border border-gray-200 dark:border-white/5">
                  <BookOpen className="w-4 h-4 text-emerald-500" />
               </div>
               <h2 className="text-xl font-medium text-gray-900 dark:text-gray-200">
                  {activeRoadmap?.title || 'Select Roadmap'}
               </h2>
               {activeRoadmap && !isUpdating && (
                  <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/20 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-500/20 shadow-sm">
                     {progressStats.percentage}% Done
                  </span>
               )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
              <div className="flex gap-1 overflow-x-auto no-scrollbar max-w-xs sm:max-w-md bg-gray-100 dark:bg-[#121212] p-1 rounded-lg border border-gray-200 dark:border-white/5">
                  {roadmaps.map(rmap => (
                      <button
                          key={rmap.id}
                          onClick={() => onSelect(rmap.id)}
                          className={`flex-shrink-0 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${activeId === rmap.id ? 'bg-white dark:bg-white/[0.08] text-gray-900 dark:text-gray-100 shadow-sm border border-gray-200 dark:border-white/5' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                      >
                          {rmap.title}
                      </button>
                  ))}
              </div>
              <div className="w-px h-6 bg-white/10 mx-3 hidden md:block" />
              <div className="flex gap-1">
                  <button 
                      onClick={() => setIsAddModalOpen(true)}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg text-gray-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all"
                      title="Add Roadmap"
                  >
                      <Plus className="w-5 h-5" />
                  </button>
                  {activeRoadmap && (
                      <>
                          <button 
                              onClick={handleEditOpen}
                              className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 transition-all"
                              title="Edit JSON"
                          >
                              <Edit3 className="w-4 h-4" />
                          </button>
                          <button 
                              onClick={() => deleteRoadmap(activeRoadmap.id)}
                              className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-gray-500 hover:text-red-600 dark:hover:text-red-400 transition-all"
                              title="Delete"
                          >
                              <Trash2 className="w-4 h-4" />
                          </button>
                      </>
                  )}
              </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-6 min-h-[300px]">
        {activeRoadmap && activeRoadmap.data.map((topicObj, index) => {
          const topicName = Object.keys(topicObj)[0];
          const subtopics = topicObj[topicName];
          const isExpanded = expandedTopics.has(index);
          const completedCount = subtopics.filter(s => s.completed).length;
          const isTopicComplete = completedCount === subtopics.length && subtopics.length > 0;

          return (
            <div
              key={index}
              className="group mb-2"
            >
              <button
                onClick={() => toggleTopic(index)}
                className="w-full flex items-center gap-2 py-1 text-left hover:bg-gray-50 dark:hover:bg-[#202020] rounded-sm transition-colors px-2"
              >
                 <div className={`transition-transform duration-200 text-gray-400 ${isExpanded ? 'rotate-90' : 'rotate-0'}`}>
                   <ChevronRight className="w-3.5 h-3.5" />
                 </div>
                 <h3 className={`font-medium text-sm flex-1 ${isTopicComplete ? 'text-gray-400 line-through' : 'text-notion-text dark:text-gray-200'}`}>
                   {topicName}
                 </h3>
                 <span className="text-[10px] font-mono text-gray-400">
                    {completedCount}/{subtopics.length}
                 </span>
              </button>
              
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="pl-8 py-1 grid gap-0.5">
                      {subtopics.map((sub, subIndex) => (
                         <div
                           key={subIndex}
                           className="flex items-center gap-2 py-1 group/item hover:bg-gray-50 dark:hover:bg-[#202020] rounded-sm px-2 -ml-2"
                         >
                           <button
                             onClick={() => toggleSubtopic(index, subIndex)}
                              className="flex-shrink-0 text-gray-400 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-200 transition-colors"
                           >
                             {sub.completed ? (
                               <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                             ) : (
                               <Circle className="w-4 h-4 hover:border-blue-500" />
                             )}
                           </button>
                           
                           <div className="flex-1 min-w-0 flex items-center gap-2">
                             <span className={`text-sm truncate ${sub.completed ? 'text-gray-400 line-through' : 'text-notion-text dark:text-gray-300'}`}>
                               {sub.subtopic_name}
                             </span>
                             <a 
                               href={sub.resource_url}
                               target="_blank" 
                               rel="noopener noreferrer"
                               className="opacity-0 group-hover/item:opacity-100 transition-opacity p-1 hover:text-blue-600 dark:hover:text-blue-400 text-gray-400"
                             >
                               <ExternalLink className="w-3 h-3" />
                             </a>
                           </div>
                         </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* Edit Modal */}
      {/* Edit Modal */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Roadmap Config">
        <div className="space-y-4">
             <div className="p-4 bg-amber-900/10 border border-amber-500/20 rounded-xl mb-4">
                <p className="text-xs text-amber-500 font-medium flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    Use strictly valid JSON format.
                </p>
             </div>
            <textarea
                className={`w-full h-[50vh] p-4 font-mono text-xs leading-relaxed bg-gray-50 dark:bg-[#0A0A0A] border rounded-xl focus:outline-none focus:border-emerald-500/20 text-gray-700 dark:text-gray-300 resize-none ${error ? 'border-red-500/50' : 'border-gray-200 dark:border-white/5'}`}
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                placeholder="Paste JSON here..."
            />
            {error && <p className="text-red-400 text-xs font-bold uppercase tracking-widest">{error}</p>}
            
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSaveEdit}
              className="w-full py-4 bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-emerald-200 dark:hover:bg-emerald-900/30 transition-all"
            >
              Save Changes
            </motion.button>
        </div>
      </Modal>

      {/* Add Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="New Roadmap">
        <div className="space-y-6">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">Subject Name</label>
              <input 
                autoFocus
                className="w-full text-xl font-medium border-b border-gray-200 dark:border-white/10 py-2 focus:outline-none focus:border-emerald-500/50 bg-transparent text-gray-900 dark:text-gray-200"
                placeholder="e.g. System Design, React Performance"
                value={newRoadmapName}
                onChange={e => setNewRoadmapName(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">JSON Data</label>
              <textarea
                className={`w-full h-64 p-4 font-mono text-xs leading-relaxed bg-gray-50 dark:bg-[#0A0A0A] border rounded-xl focus:outline-none focus:border-emerald-500/20 text-gray-700 dark:text-gray-300 resize-none ${error ? 'border-red-500/50' : 'border-gray-200 dark:border-white/5'}`}
                value={newRoadmapJson}
                onChange={(e) => setNewRoadmapJson(e.target.value)}
                placeholder="Paste JSON array here..."
              />
              <div className="flex justify-end mt-2">
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
                  className="text-[10px] text-gray-500 hover:text-emerald-400 underline cursor-pointer bg-transparent border-none transition-colors"
                >
                  Load Example Template
                </button>
              </div>
            </div>
            {error && <p className="text-red-400 text-xs font-bold uppercase tracking-widest">{error}</p>}
            
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleAddRoadmap}
              disabled={!newRoadmapName}
              className="w-full py-4 bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-emerald-200 dark:hover:bg-emerald-900/30 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Create Roadmap
            </motion.button>
        </div>
      </Modal>
    </div>
  );
};

export default Roadmap;
