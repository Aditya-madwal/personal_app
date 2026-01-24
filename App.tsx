
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
    <div className="min-h-screen bg-bone dark:bg-darkbg selection:bg-notion-hover dark:selection:bg-notion-darkHover selection:text-notion-text dark:selection:text-notion-darkText overflow-x-hidden transition-colors duration-500">
      <header className="max-w-7xl mx-auto pt-10 pb-8 px-4 sm:px-10 flex justify-between items-end">
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
            <h1 className="text-5xl font-serif text-notion-text dark:text-notion-darkText italic leading-none transition-colors">
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

      <main className="max-w-7xl mx-auto px-4 sm:px-10 pb-16 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column (8 units) */}
        <div className="lg:col-span-8 space-y-8">
          <Calendar 
            events={events} 
            onAddEvent={openAddEvent} 
            onEventClick={(e) => setSelectedEvent(e)}
          />
        </div>

        {/* Right Column (4 units) */}
        <div className="lg:col-span-4 flex flex-col gap-6 sticky top-6">
          <div className="h-auto">
            <TodoList 
              tasks={tasks} 
              onToggle={toggleTask} 
              onDelete={deleteTask}
              onAddTask={() => setIsTaskModalOpen(true)}
            />
          </div>
          <div className="h-auto">
            <ResourceList 
              resources={resources} 
              onDelete={deleteResource}
              onAddResource={() => setIsResourceModalOpen(true)}
            />
          </div>
        </div>

        {/* Full Width Roadmap Section */}
        <div className="lg:col-span-12">
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
        className="fixed bottom-8 right-8 w-14 h-14 bg-notion-text dark:bg-notion-darkText text-bone dark:text-darkbg rounded-full flex items-center justify-center shadow-2xl z-[100] transition-colors duration-500"
      >
        {isDarkMode ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
      </motion.button>

      {/* Name Modal */}
      <Modal isOpen={isNameModalOpen} onClose={() => setIsNameModalOpen(false)} title="Personalize">
        <div className="space-y-8">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-[0.3em] text-notion-muted dark:text-notion-darkMuted mb-4 opacity-50">Enter your name</label>
            <input 
              autoFocus
              className="w-full text-2xl font-serif border-b border-notion-border dark:border-notion-darkBorder py-3 focus:outline-none focus:border-notion-text dark:focus:border-notion-darkText placeholder-notion-border/40 bg-transparent transition-all"
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
            className="w-full py-5 bg-notion-text dark:bg-notion-darkText text-bone dark:text-darkbg rounded-full font-bold text-xs uppercase tracking-[0.2em] transition-all mt-4"
          >
            Update Title
          </motion.button>
        </div>
      </Modal>

      {/* Task Creation Modal */}
      <Modal isOpen={isTaskModalOpen} onClose={() => setIsTaskModalOpen(false)} title="New Task">
        <div className="space-y-8">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-[0.3em] text-notion-muted dark:text-notion-darkMuted mb-4 opacity-50">What needs to be done?</label>
            <input 
              autoFocus
              className="w-full text-2xl font-serif border-b border-notion-border dark:border-notion-darkBorder py-3 focus:outline-none focus:border-notion-text dark:focus:border-notion-darkText placeholder-notion-border/40 bg-transparent transition-all"
              placeholder="Deep work session..."
              value={newTask.title}
              onChange={e => setNewTask({...newTask, title: e.target.value})}
            />
          </div>
          <div>
            <textarea 
              className="w-full text-notion-text dark:text-notion-darkText border border-notion-border dark:border-notion-darkBorder rounded-3xl p-6 focus:outline-none focus:ring-1 focus:ring-notion-text/20 dark:focus:ring-notion-darkText/20 placeholder-notion-border/40 bg-bone/30 dark:bg-notion-darkHover/30 transition-all text-[0.9rem] resize-none"
              rows={3}
              placeholder="Context or notes..."
              value={newTask.description}
              onChange={e => setNewTask({...newTask, description: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-[0.3em] text-notion-muted dark:text-notion-darkMuted mb-4 opacity-50">Category</label>
            <div className="flex flex-wrap gap-2.5">
              {Object.values(TaskCategory).map(cat => (
                <motion.button
                  key={cat}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setNewTask({...newTask, category: cat})}
                  className={`px-5 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${newTask.category === cat ? 'bg-notion-text dark:bg-notion-darkText text-bone dark:text-darkbg' : 'bg-notion-hover dark:bg-notion-darkHover text-notion-muted dark:text-notion-darkMuted hover:bg-notion-border dark:hover:bg-notion-darkBorder'}`}
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
            className="w-full py-5 bg-notion-text dark:bg-notion-darkText text-bone dark:text-darkbg rounded-full font-bold text-xs uppercase tracking-[0.2em] transition-all disabled:opacity-20 mt-4"
          >
            Create Task
          </motion.button>
        </div>
      </Modal>

      {/* Event Creation Modal */}
      <Modal isOpen={isEventModalOpen} onClose={() => setIsEventModalOpen(false)} title="Schedule Event">
        <div className="space-y-8">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-[0.3em] text-notion-muted dark:text-notion-darkMuted mb-4 opacity-50">Event Name</label>
            <input 
              autoFocus
              className="w-full text-2xl font-serif border-b border-notion-border dark:border-notion-darkBorder py-3 focus:outline-none focus:border-notion-text dark:focus:border-notion-darkText placeholder-notion-border/40 bg-transparent"
              placeholder="Paris Trip, Meeting, etc..."
              value={newEvent.title}
              onChange={e => setNewEvent({...newEvent, title: e.target.value})}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-[0.3em] text-notion-muted dark:text-notion-darkMuted mb-4 opacity-50">When</label>
              <input 
                type="date"
                className="w-full p-4 border border-notion-border dark:border-notion-darkBorder rounded-2xl focus:outline-none focus:ring-1 focus:ring-notion-text/20 dark:focus:ring-notion-darkText/20 bg-bone/30 dark:bg-notion-darkHover/30 text-notion-text dark:text-notion-darkText text-sm font-medium"
                value={newEvent.date}
                onChange={e => setNewEvent({...newEvent, date: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-[0.3em] text-notion-muted dark:text-notion-darkMuted mb-4 opacity-50">Accent</label>
              <div className="flex flex-wrap gap-3 pt-2">
                {PASTEL_COLORS.map(color => (
                  <motion.button
                    key={color.name}
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.8 }}
                    onClick={() => setNewEvent({...newEvent, color: color.bg})}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${color.bg} ${newEvent.color === color.bg ? 'border-notion-text dark:border-notion-darkText scale-125 z-10' : 'border-transparent'}`}
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
            className="w-full py-5 bg-notion-text dark:bg-notion-darkText text-bone dark:text-darkbg rounded-full font-bold text-xs uppercase tracking-[0.2em] transition-all disabled:opacity-20 mt-4"
          >
            Add to Calendar
          </motion.button>
        </div>
      </Modal>

      {/* Resource Creation Modal */}
      <Modal isOpen={isResourceModalOpen} onClose={() => setIsResourceModalOpen(false)} title="Add Bookmark">
        <div className="space-y-8">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-[0.3em] text-notion-muted dark:text-notion-darkMuted mb-4 opacity-50">Title</label>
            <input 
              autoFocus
              className="w-full text-2xl font-serif border-b border-notion-border dark:border-notion-darkBorder py-3 focus:outline-none focus:border-notion-text dark:focus:border-notion-darkText placeholder-notion-border/40 bg-transparent"
              placeholder="Framer Motion Docs, Apple Design, etc..."
              value={newResource.title}
              onChange={e => setNewResource({...newResource, title: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-[0.3em] text-notion-muted dark:text-notion-darkMuted mb-4 opacity-50">URL</label>
            <div className="relative">
              <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-notion-muted dark:text-notion-darkMuted opacity-40" />
              <input 
                className="w-full pl-12 pr-4 py-4 border border-notion-border dark:border-notion-darkBorder rounded-2xl focus:outline-none focus:ring-1 focus:ring-notion-text/20 dark:focus:ring-notion-darkText/20 bg-bone/30 dark:bg-notion-darkHover/30 text-notion-text dark:text-notion-darkText text-sm font-medium"
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
            className="w-full py-5 bg-notion-text dark:bg-notion-darkText text-bone dark:text-darkbg rounded-full font-bold text-xs uppercase tracking-[0.2em] transition-all disabled:opacity-20 mt-4"
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
              <div className={`inline-block px-4 py-1.5 rounded-full ${selectedEvent.color} border border-black/5 text-[9px] font-bold uppercase tracking-[0.2em] mb-6 transition-colors`}>
                Scheduled
              </div>
              <h3 className="text-5xl font-serif text-notion-text dark:text-notion-darkText italic leading-tight">{selectedEvent.title}</h3>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-center gap-6">
                <div className="p-4 bg-notion-hover/50 dark:bg-notion-darkHover/50 rounded-2xl">
                  <CalendarIcon className="w-6 h-6 text-notion-text dark:text-notion-darkText" />
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-40 mb-1">Date</div>
                  <div className="text-notion-text dark:text-notion-darkText font-semibold text-lg">{new Date(selectedEvent.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
                </div>
              </div>

              {selectedEvent.description && (
                <div className="flex items-start gap-6">
                  <div className="p-4 bg-notion-hover/50 dark:bg-notion-darkHover/50 rounded-2xl">
                    <MapPin className="w-6 h-6 text-notion-text dark:text-notion-darkText" />
                  </div>
                  <div className="flex-1">
                    <div className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-40 mb-1">Details</div>
                    <div className="text-notion-text dark:text-notion-darkText text-[0.95rem] leading-relaxed italic">{selectedEvent.description}</div>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-10 border-t border-notion-border dark:border-notion-darkBorder flex justify-end">
              <motion.button 
                whileHover={{ scale: 1.05, color: '#ef4444' }}
                whileTap={{ scale: 0.95 }}
                onClick={() => deleteEvent(selectedEvent.id)}
                className="flex items-center gap-3 px-8 py-4 text-notion-muted/60 dark:text-notion-darkMuted bg-notion-hover/40 dark:bg-notion-darkHover/40 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full font-bold text-[10px] uppercase tracking-[0.2em] transition-all"
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
