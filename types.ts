
export enum TaskCategory {
  WORK = 'Work',
  PERSONAL = 'Personal',
  URGENT = 'Urgent',
  LEARNING = 'Learning',
  HEALTH = 'Health'
}

export interface Task {
  id: string;
  title: string;
  description: string;
  category: TaskCategory;
  completed: boolean;
  createdAt: number;
}

export interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  date: string; // ISO String (YYYY-MM-DD)
  color: string; // Tailwind pastel class
}

export interface Resource {
  id: string;
  title: string;
  url: string;
  createdAt: number;
}

export const PASTEL_COLORS = [
  { name: 'Red', bg: 'bg-pastel-red', text: 'text-red-700' },
  { name: 'Orange', bg: 'bg-pastel-orange', text: 'text-orange-700' },
  { name: 'Blue', bg: 'bg-pastel-blue', text: 'text-blue-700' },
  { name: 'Green', bg: 'bg-pastel-green', text: 'text-green-700' },
  { name: 'Purple', bg: 'bg-pastel-purple', text: 'text-purple-700' },
  { name: 'Pink', bg: 'bg-pastel-pink', text: 'text-pink-700' },
];
