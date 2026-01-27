
import React, { useState, useEffect } from 'react';
import Calendar from './components/Calendar';
import TodoList from './components/TodoList';
import ResourceList from './components/ResourceList';
import Roadmap from './components/Roadmap';
import Modal from './components/Modal';
import { Task, CalendarEvent, TaskCategory, Resource, PASTEL_COLORS, RoadmapItem } from './types';
import { Sparkles, Trash2, Calendar as CalendarIcon, MapPin, Globe, Moon, Sun, Edit3, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@supabase/supabase-js';

// Configuration: Ensure these variables are provided in the environment
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('ethereal_dark_mode');
    return saved ? JSON.parse(saved) : false;
  });

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    alert('Missing Supabase configuration');
    return;
  }
  
  const [userName, setUserName] = useState('');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [roadmaps, setRoadmaps] = useState<RoadmapItem[]>([]);
  const [activeRoadmapId, setActiveRoadmapId] = useState<string>('');
  
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [isResourceModalOpen, setIsResourceModalOpen] = useState(false);
  const [isNameModalOpen, setIsNameModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  
  const [newTask, setNewTask] = useState({ title: '', description: '', category: TaskCategory.PERSONAL });
  const [newEvent, setNewEvent] = useState({ title: '', description: '', date: '', color: PASTEL_COLORS[0].bg });
  const [newResource, setNewResource] = useState({ title: '', url: '' });
  const [tempName, setTempName] = useState('');

  // Initial Data Fetch
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch everything in parallel
        const [
          { data: tasksData },
          { data: eventsData },
          { data: resourcesData },
          { data: profileData },
          { data: roadmapsData }
        ] = await Promise.all([
          supabase.from('tasks').select('*').order('created_at', { ascending: false }),
          supabase.from('events').select('*'),
          supabase.from('resources').select('*').order('created_at', { ascending: false }),
          supabase.from('profile').select('name').eq('id', 'primary').single(),
          supabase.from('roadmap').select('*')
        ]);

        if (tasksData) setTasks(tasksData.map(t => ({...t, createdAt: t.created_at})));
        if (eventsData) setEvents(eventsData);
        if (resourcesData) setResources(resourcesData.map(r => ({...r, createdAt: r.created_at})));
        if (profileData) setUserName(profileData.name || '');
        if (roadmapsData) {
           setRoadmaps(roadmapsData.map(r => ({
             id: r.uid,
             title: r.subject_name,
             data: r.roadmap_data
           })));
        }

        if (tasksData) setTasks(tasksData.map(t => ({...t, createdAt: t.created_at})));
        if (eventsData) setEvents(eventsData);
        if (resourcesData) setResources(resourcesData.map(r => ({...r, createdAt: r.created_at})));
        if (profileData) setUserName(profileData.name || '');
        
      } catch (error) {
        console.error('Error fetching data from Supabase:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Sync Dark Mode (Stayed in localStorage as it's a device preference)
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('ethereal_dark_mode', JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  const addTask = async () => {
    if (!newTask.title) return;
    const task: Task = {
      id: crypto.randomUUID(),
      ...newTask,
      completed: false,
      createdAt: Date.now(),
    };
    
    // Optimistic Update
    setTasks([task, ...tasks]);
    setIsTaskModalOpen(false);
    setNewTask({ title: '', description: '', category: TaskCategory.PERSONAL });

    // DB Update
    await supabase.from('tasks').insert([{
      id: task.id,
      title: task.title,
      description: task.description,
      category: task.category,
      completed: task.completed,
      created_at: task.createdAt
    }]);
  };

  const addEvent = async () => {
    if (!newEvent.title || !newEvent.date) return;
    const event: CalendarEvent = {
      id: crypto.randomUUID(),
      ...newEvent,
    };
    
    // Optimistic Update
    setEvents([...events, event]);
    setIsEventModalOpen(false);
    setNewEvent({ title: '', description: '', date: '', color: PASTEL_COLORS[0].bg });

    // DB Update
    await supabase.from('events').insert([event]);
  };

  const addResource = async () => {
    if (!newResource.title || !newResource.url) return;
    let url = newResource.url;
    if (!url.startsWith('http')) url = 'https://' + url;
    
    const resource: Resource = {
      id: crypto.randomUUID(),
      title: newResource.title,
      url: url,
      createdAt: Date.now(),
    };
    
    // Optimistic Update
    setResources([resource, ...resources]);
    setIsResourceModalOpen(false);
    setNewResource({ title: '', url: '' });

    // DB Update
    await supabase.from('resources').insert([{
      id: resource.id,
      title: resource.title,
      url: resource.url,
      created_at: resource.createdAt
    }]);
  };

  const saveName = async () => {
    setUserName(tempName);
    setIsNameModalOpen(false);
    
    // Upsert Profile
    await supabase.from('profile').upsert({ id: 'primary', name: tempName });
  };

  const deleteEvent = async (id: string) => {
    setEvents(events.filter(e => e.id !== id));
    setSelectedEvent(null);
    await supabase.from('events').delete().eq('id', id);
  };

  const toggleTask = async (id: string) => {
    const taskToToggle = tasks.find(t => t.id === id);
    if (!taskToToggle) return;
    
    const newCompleted = !taskToToggle.completed;
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: newCompleted } : t));
    
    await supabase.from('tasks').update({ completed: newCompleted }).eq('id', id);
  };

  const deleteTask = async (id: string) => {
    setTasks(tasks.filter(t => t.id !== id));
    await supabase.from('tasks').delete().eq('id', id);
  };

  const deleteResource = async (id: string) => {
    setResources(resources.filter(r => r.id !== id));
    await supabase.from('resources').delete().eq('id', id);
  };

  // Roadmap CRUD
  const addRoadmap = async (title: string, data: any) => {
     // Optimistic
     const tempId = crypto.randomUUID();
     const newRoadmap: RoadmapItem = { id: tempId, title, data };
     setRoadmaps([...roadmaps, newRoadmap]);
     // Switch to new roadmap immediately
     setActiveRoadmapId(tempId);

     const { data: inserted, error } = await supabase.from('roadmap').insert([{
        subject_name: title,
        roadmap_data: data
     }]).select().single();

     if (inserted) {
         setRoadmaps(prev => prev.map(r => r.id === tempId ? { ...r, id: inserted.uid } : r));
         // Update active ID if we were on the temp one
         if (activeRoadmapId === tempId) {
             setActiveRoadmapId(inserted.uid);
         }
     } else if (error) {
         console.error('Error adding roadmap:', error);
         // Revert
         setRoadmaps(prev => prev.filter(r => r.id !== tempId));
     }
  };

  const [isRoadmapUpdating, setIsRoadmapUpdating] = useState(false);

  const updateRoadmap = async (id: string, data: any) => {
      console.log('Updating roadmap:', id);
      setIsRoadmapUpdating(true);
      // Optimistic
      setRoadmaps(prev => prev.map(r => r.id === id ? { ...r, data } : r));

      const { error } = await supabase.from('roadmap').update({
          roadmap_data: data
      }).eq('uid', id);

      if (error) {
          console.error("Error updating roadmap:", error);
          alert("Failed to save progress. Please check your connection.");
          // Optionally revert state here if critical
      }
      setIsRoadmapUpdating(false);
  };

  const deleteRoadmap = async (id: string) => {
      // Optimistic
      setRoadmaps(prev => prev.filter(r => r.id !== id));
      // Reset active ID if deleted matches active
      if (activeRoadmapId === id) {
          const remaining = roadmaps.filter(r => r.id !== id);
          setActiveRoadmapId(remaining.length > 0 ? remaining[0].id : '');
      }

      const { error } = await supabase.from('roadmap').delete().eq('uid', id);
      if (error) console.error("Error deleting roadmap:", error);
  };

  const openAddEvent = (date?: string) => {
    if (date) setNewEvent({ ...newEvent, date });
    setIsEventModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bone dark:bg-darkbg flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-notion-muted animate-spin opacity-20" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F7F5] dark:bg-[#050505] text-gray-600 dark:text-[#A1A1AA] selection:bg-emerald-500/30 selection:text-emerald-700 dark:selection:text-emerald-200 overflow-x-hidden transition-colors duration-500 font-sans">
      <header className="max-w-[95vw] mx-auto pt-8 pb-8 px-4 sm:px-6 flex justify-between items-center">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="flex items-center gap-3 mb-3 text-notion-muted dark:text-notion-darkMuted text-[10px] font-bold tracking-[0.4em] uppercase opacity-60">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Digital Atrium</span>
          </div>
          <div className="group flex items-center gap-4 cursor-pointer" onClick={() => { setTempName(userName); setIsNameModalOpen(true); }}>
            <h1 className="text-5xl font-serif text-gray-900 dark:text-white italic leading-none transition-colors">
              {userName ? `${userName}'s Page` : 'The Art of Focus'}
            </h1>
            <Edit3 className="w-6 h-6 text-notion-muted opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </motion.div>
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          transition={{ delay: 0.5, duration: 1 }}
          className="text-right hidden sm:block"
        >
          <p className="text-notion-muted dark:text-notion-darkMuted font-medium text-xs tracking-[0.2em] uppercase">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </motion.div>
      </header>

      <main className="max-w-[95vw] mx-auto px-4 sm:px-6 pb-20 space-y-4">
        {/* Top Section: Calendar and Resources */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:h-[600px] h-auto">
          {/* Calendar (9 units) */}
          <div className="lg:col-span-9 h-full min-h-[500px] lg:min-h-0 flex flex-col">
            <Calendar 
              events={events} 
              onAddEvent={openAddEvent} 
              onEventClick={(e) => setSelectedEvent(e)}
            />
          </div>

          {/* Resources (3 units) */}
          <div className="lg:col-span-3 h-full min-h-[300px] lg:min-h-0 flex flex-col">
            <ResourceList 
              resources={resources} 
              onDelete={deleteResource}
              onAddResource={() => setIsResourceModalOpen(true)}
            />
          </div>
        </div>

        {/* Task Table Section (Full Width) */}
        <div className="w-full">
            <TodoList 
              tasks={tasks} 
              onToggle={toggleTask} 
              onDelete={deleteTask}
              onAddTask={() => setIsTaskModalOpen(true)}
            />
        </div>

        {/* Roadmap Section (Full Width) */}
        <div className="w-full">
            <Roadmap 
              roadmaps={roadmaps}
              activeId={activeRoadmapId}
              onSelect={setActiveRoadmapId} 
              onAdd={addRoadmap}
              onEdit={updateRoadmap}
              onDelete={deleteRoadmap}
              isUpdating={isRoadmapUpdating}
            />
        </div>
      </main>

      {/* Floating Theme Toggle */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsDarkMode(!isDarkMode)}
        className="fixed bottom-8 right-8 w-12 h-12 bg-white dark:bg-[#121212] text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-white/5 rounded-full flex items-center justify-center shadow-2xl z-[100] transition-colors duration-500 hover:text-emerald-500 dark:hover:text-white"
      >
        {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
      </motion.button>

      {/* Name Modal */}
      <Modal isOpen={isNameModalOpen} onClose={() => setIsNameModalOpen(false)} title="Personalize">
        <div className="space-y-8">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-4">Enter your name</label>
            <input 
              autoFocus
              className="w-full text-xl font-medium border-b border-gray-200 dark:border-white/10 py-3 focus:outline-none focus:border-emerald-500/50 placeholder-gray-400 dark:placeholder-gray-700 bg-transparent text-gray-900 dark:text-gray-200 transition-all font-sans"
              placeholder="Your name..."
              value={tempName}
              onChange={e => setTempName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && saveName()}
            />
          </div>
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={saveName}
            className="w-full py-4 bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 rounded-xl font-bold text-xs uppercase tracking-widest transition-all hover:bg-emerald-200 dark:hover:bg-emerald-900/30"
          >
            Update Title
          </motion.button>
        </div>
      </Modal>

      {/* Task Creation Modal */}
      <Modal isOpen={isTaskModalOpen} onClose={() => setIsTaskModalOpen(false)} title="New Task">
        <div className="space-y-8">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-4">What needs to be done?</label>
            <input 
              autoFocus
              className="w-full text-xl font-medium border-b border-gray-200 dark:border-white/10 py-3 focus:outline-none focus:border-emerald-500/50 placeholder-gray-400 dark:placeholder-gray-700 bg-transparent text-gray-900 dark:text-gray-200 transition-all font-sans"
              placeholder="Deep work session..."
              value={newTask.title}
              onChange={e => setNewTask({...newTask, title: e.target.value})}
            />
          </div>
          <div>
            <textarea 
              className="w-full text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-white/5 rounded-xl p-6 focus:outline-none focus:border-emerald-500/20 placeholder-gray-400 dark:placeholder-gray-700 bg-gray-50 dark:bg-[#0A0A0A] transition-all text-[0.9rem] resize-none"
              rows={3}
              placeholder="Context or notes..."
              value={newTask.description}
              onChange={e => setNewTask({...newTask, description: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-4">Category</label>
            <div className="flex flex-wrap gap-2.5">
              {Object.values(TaskCategory).map(cat => (
                <motion.button
                  key={cat}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setNewTask({...newTask, category: cat})}
                  className={`px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all border ${newTask.category === cat ? 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' : 'bg-gray-50 dark:bg-[#0A0A0A] text-gray-500 border-gray-200 dark:border-white/5 hover:border-gray-300 dark:hover:border-white/10'}`}
                >
                  {cat}
                </motion.button>
              ))}
            </div>
          </div>
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={addTask}
            disabled={!newTask.title}
            className="w-full py-4 bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 rounded-xl font-bold text-xs uppercase tracking-widest transition-all hover:bg-emerald-200 dark:hover:bg-emerald-900/30 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Create Task
          </motion.button>
        </div>
      </Modal>

      {/* Event Creation Modal */}
      <Modal isOpen={isEventModalOpen} onClose={() => setIsEventModalOpen(false)} title="Schedule Event">
        <div className="space-y-8">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-4">Event Name</label>
            <input 
              autoFocus
              className="w-full text-xl font-medium border-b border-gray-200 dark:border-white/10 py-3 focus:outline-none focus:border-emerald-500/50 placeholder-gray-400 dark:placeholder-gray-700 bg-transparent text-gray-900 dark:text-gray-200 transition-all font-sans"
              placeholder="Paris Trip, Meeting, etc..."
              value={newEvent.title}
              onChange={e => setNewEvent({...newEvent, title: e.target.value})}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-4">When</label>
              <input 
                type="date"
                className="w-full p-4 border border-gray-200 dark:border-white/5 rounded-xl focus:outline-none focus:border-emerald-500/20 bg-gray-50 dark:bg-[#0A0A0A] text-gray-900 dark:text-gray-300 text-sm font-medium"
                value={newEvent.date}
                onChange={e => setNewEvent({...newEvent, date: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-4">Accent</label>
              <div className="flex flex-wrap gap-3 pt-2">
                {PASTEL_COLORS.map(color => (
                  <motion.button
                    key={color.name}
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.8 }}
                    onClick={() => setNewEvent({...newEvent, color: color.bg})}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${color.bg.replace('bg-', 'bg-opacity-50 bg-')} ${newEvent.color === color.bg ? 'border-white scale-125 z-10' : 'border-transparent opacity-50 hover:opacity-100'}`}
                  />
                ))}
              </div>
            </div>
          </div>
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={addEvent}
            disabled={!newEvent.title || !newEvent.date}
            className="w-full py-4 bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 rounded-xl font-bold text-xs uppercase tracking-widest transition-all hover:bg-emerald-200 dark:hover:bg-emerald-900/30 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Add to Calendar
          </motion.button>
        </div>
      </Modal>

      {/* Resource Creation Modal */}
      <Modal isOpen={isResourceModalOpen} onClose={() => setIsResourceModalOpen(false)} title="Add Bookmark">
        <div className="space-y-8">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-4">Title</label>
            <input 
              autoFocus
              className="w-full text-xl font-medium border-b border-gray-200 dark:border-white/10 py-3 focus:outline-none focus:border-emerald-500/50 placeholder-gray-400 dark:placeholder-gray-700 bg-transparent text-gray-900 dark:text-gray-200 transition-all font-sans"
              placeholder="Framer Motion Docs, Apple Design, etc..."
              value={newResource.title}
              onChange={e => setNewResource({...newResource, title: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-4">URL</label>
            <div className="relative">
              <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
              <input 
                className="w-full pl-12 pr-4 py-4 border border-gray-200 dark:border-white/5 rounded-xl focus:outline-none focus:border-emerald-500/20 bg-gray-50 dark:bg-[#0A0A0A] text-gray-900 dark:text-gray-300 text-sm font-medium placeholder-gray-400 dark:placeholder-gray-700"
                placeholder="google.com"
                value={newResource.url}
                onChange={e => setNewResource({...newResource, url: e.target.value})}
              />
            </div>
          </div>
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={addResource}
            disabled={!newResource.title || !newResource.url}
            className="w-full py-4 bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 rounded-xl font-bold text-xs uppercase tracking-widest transition-all hover:bg-emerald-200 dark:hover:bg-emerald-900/30 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Save Bookmark
          </motion.button>
        </div>
      </Modal>

      {/* View Event Detail Modal */}
      <Modal 
        isOpen={!!selectedEvent} 
        onClose={() => setSelectedEvent(null)} 
        title="Event View"
      >
        {selectedEvent && (
          <div className="space-y-10">
            <div>
              <div className={`inline-block px-4 py-1.5 rounded-full ${selectedEvent.color} bg-opacity-20 border border-gray-200 dark:border-white/5 text-[10px] font-bold uppercase tracking-widest mb-6 text-gray-600 dark:text-gray-300`}>
                Scheduled
              </div>
              <h3 className="text-3xl font-medium text-gray-900 dark:text-gray-100 leading-tight">{selectedEvent.title}</h3>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-center gap-6">
                <div className="p-4 bg-gray-50 dark:bg-[#0A0A0A] border border-gray-200 dark:border-white/5 rounded-xl">
                  <CalendarIcon className="w-5 h-5 text-gray-400" />
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-gray-600 mb-1">Date</div>
                  <div className="text-gray-700 dark:text-gray-300 font-medium text-lg">{new Date(selectedEvent.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
                </div>
              </div>

              {selectedEvent.description && (
                <div className="flex items-start gap-6">
                  <div className="p-4 bg-gray-50 dark:bg-[#0A0A0A] border border-gray-200 dark:border-white/5 rounded-xl">
                    <MapPin className="w-5 h-5 text-gray-400" />
                  </div>
                  <div className="flex-1">
                    <div className="text-[10px] font-bold uppercase tracking-widest text-gray-600 mb-1">Details</div>
                    <div className="text-gray-600 dark:text-gray-400 text-[0.95rem] leading-relaxed">{selectedEvent.description}</div>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-8 border-t border-gray-200 dark:border-white/5 flex justify-end">
              <motion.button 
                whileHover={{ scale: 1.05, color: '#ef4444' }}
                whileTap={{ scale: 0.95 }}
                onClick={() => deleteEvent(selectedEvent.id)}
                className="flex items-center gap-3 px-6 py-3 text-gray-500 hover:bg-red-50 dark:hover:bg-red-900/10 hover:text-red-500 dark:hover:text-red-400 rounded-lg font-bold text-[10px] uppercase tracking-widest transition-all"
              >
                <Trash2 className="w-4 h-4" />
                Discard
              </motion.button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default App;
