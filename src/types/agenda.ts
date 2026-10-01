export type CategoryType = 
  | 'trabajo' 
  | 'personal' 
  | 'salud' 
  | 'estudio' 
  | 'finanzas' 
  | 'reunion' 
  | 'urgente';

export interface CategoryInfo {
  id: CategoryType;
  label: string;
  color: string;
  bgLight: string;
  bgDark: string;
  borderColor: string;
  iconName: string;
}

export type PriorityType = 'baja' | 'media' | 'alta' | 'critica';

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
}

export interface AgendaEvent {
  id: string;
  title: string;
  description?: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  category: CategoryType;
  location?: string;
  meetLink?: string;
  contactId?: string;
  completed?: boolean;
  reminderMinutes?: number;
  color?: string;
}

export interface AgendaTask {
  id: string;
  title: string;
  description?: string;
  dueDate: string; // YYYY-MM-DD
  dueTime?: string; // HH:MM
  priority: PriorityType;
  category: CategoryType;
  completed: boolean;
  completedAt?: string;
  subtasks: SubTask[];
  contactId?: string;
  userId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AgendaContact {
  id: string;
  name: string;
  email: string;
  phone: string;
  company?: string;
  role?: string;
  category: CategoryType;
  notes?: string;
  favorite: boolean;
  avatarColor: string;
  createdAt: string;
}

export type NoteColor = 'lavender' | 'emerald' | 'amber' | 'rose' | 'sky' | 'slate';

export interface AgendaNote {
  id: string;
  title: string;
  content: string;
  color: NoteColor;
  category: CategoryType;
  pinned: boolean;
  tags: string[];
  updatedAt: string;
}

export type ActiveView = 'dashboard' | 'calendar' | 'tasks' | 'contacts' | 'notes';
export type CalendarSubView = 'month' | 'week' | 'list';

export type AppTheme = 'dark-cyber' | 'midnight-blue' | 'emerald-forest' | 'sunset-violet' | 'clean-light';

export interface AgendaStats {
  todayEventsCount: number;
  todayTasksCount: number;
  completedTasksToday: number;
  totalContacts: number;
  totalNotes: number;
  completionRate: number;
  activeStreak: number;
}
