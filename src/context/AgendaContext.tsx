import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  type ReactNode,
} from 'react';
import type {
  AgendaEvent,
  AgendaTask,
  AgendaContact,
  AgendaNote,
  ActiveView,
  CalendarSubView,
  AppTheme,
  AgendaStats,
} from '../types/agenda';
import {
  getInitialEvents,
  getInitialTasks,
  INITIAL_CONTACTS,
  INITIAL_NOTES,
} from '../data/initialData';
import { getTodayISO, triggerConfetti, generateId } from '../utils/helpers';
import { soundManager } from '../utils/sound';
import { useAuth } from './AuthContext';
import { isFirebaseConfigured } from '../config/firebase';
import {
  subscribeToUserTasks,
  saveTaskToFirestore,
  deleteTaskFromFirestore,
  batchSaveTasksToFirestore,
} from '../services/tasksFirestore';

export interface ToastMessage {
  id: string;
  text: string;
  type: 'success' | 'info' | 'warning' | 'error';
}

export type ModalType = 'event' | 'task' | 'contact' | 'note' | 'backup' | 'quick-add' | null;

export type FirestoreSyncStatus = 'connected' | 'syncing' | 'offline' | 'error';

interface AgendaContextType {
  // Cloud Firestore Sync
  firestoreSyncStatus: FirestoreSyncStatus;
  isFirebaseActive: boolean;
  tasksLoading: boolean;
  tasksError: string | null;

  // Data
  events: AgendaEvent[];
  tasks: AgendaTask[];
  contacts: AgendaContact[];
  notes: AgendaNote[];

  // Navigation & Filters
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
  calendarSubView: CalendarSubView;
  setCalendarSubView: (subView: CalendarSubView) => void;
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategoryFilter: string | 'all';
  setSelectedCategoryFilter: (cat: string | 'all') => void;

  // Theme & Preferences
  theme: AppTheme;
  setTheme: (theme: AppTheme) => void;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;

  // CRUD Events
  addEvent: (event: Omit<AgendaEvent, 'id'>) => void;
  updateEvent: (id: string, event: Partial<AgendaEvent>) => void;
  deleteEvent: (id: string) => void;
  toggleEventCompleted: (id: string) => void;

  // CRUD Tasks
  addTask: (task: Omit<AgendaTask, 'id'>) => void;
  updateTask: (id: string, task: Partial<AgendaTask>) => void;
  deleteTask: (id: string) => void;
  toggleTaskCompleted: (id: string) => void;
  toggleSubTask: (taskId: string, subTaskId: string) => void;

  // CRUD Contacts
  addContact: (contact: Omit<AgendaContact, 'id' | 'createdAt'>) => void;
  updateContact: (id: string, contact: Partial<AgendaContact>) => void;
  deleteContact: (id: string) => void;
  toggleContactFavorite: (id: string) => void;

  // CRUD Notes
  addNote: (note: Omit<AgendaNote, 'id' | 'updatedAt'>) => void;
  updateNote: (id: string, note: Partial<AgendaNote>) => void;
  deleteNote: (id: string) => void;
  toggleNotePinned: (id: string) => void;

  // Modals & UI State
  activeModal: ModalType;
  editingItem: any;
  openModal: (modal: ModalType, itemToEdit?: any) => void;
  closeModal: () => void;

  // Toast
  toasts: ToastMessage[];
  addToast: (text: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
  removeToast: (id: string) => void;

  // Stats & System
  stats: AgendaStats;
  exportDataJSON: () => string;
  importDataJSON: (jsonString: string) => boolean;
  resetToDemoData: () => void;
}

const AgendaContext = createContext<AgendaContextType | undefined>(undefined);

export const AgendaProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();

  // Storage key generator per user ID (Isolation)
  const userPrefix = currentUser ? `aura_${currentUser.id}` : 'aura_guest';
  const STORAGE_KEY_EVENTS = `${userPrefix}_events_v2`;
  const STORAGE_KEY_TASKS = `${userPrefix}_tasks_v2`;
  const STORAGE_KEY_CONTACTS = `${userPrefix}_contacts_v2`;
  const STORAGE_KEY_NOTES = `${userPrefix}_notes_v2`;
  const STORAGE_KEY_THEME = `${userPrefix}_theme_v2`;
  const STORAGE_KEY_SOUND = 'aura_agenda_sound_v2';

  // State
  const [events, setEvents] = useState<AgendaEvent[]>([]);
  const [tasks, setTasks] = useState<AgendaTask[]>([]);
  const [tasksOwnerId, setTasksOwnerId] = useState<string | null>(null);
  const [contacts, setContacts] = useState<AgendaContact[]>([]);
  const [notes, setNotes] = useState<AgendaNote[]>([]);
  const [theme, setTheme] = useState<AppTheme>('dark-cyber');
  const [soundEnabled, setSoundEnabledState] = useState<boolean>(true);

  const [activeView, setActiveView] = useState<ActiveView>('dashboard');
  const [calendarSubView, setCalendarSubView] = useState<CalendarSubView>('month');
  const [selectedDate, setSelectedDate] = useState<string>(getTodayISO());
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string | 'all'>('all');

  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [firestoreSyncStatus, setFirestoreSyncStatus] = useState<FirestoreSyncStatus>(
    isFirebaseConfigured ? 'syncing' : 'offline'
  );
  const [tasksLoading, setTasksLoading] = useState(true);
  const [tasksError, setTasksError] = useState<string | null>(null);

  // Load User Data upon authentication change & Firestore Tasks Real-Time Subscription
  useEffect(() => {
    if (!currentUser) {
      setEvents([]);
      setTasks([]);
      setTasksOwnerId(null);
      setContacts([]);
      setNotes([]);
      setFirestoreSyncStatus('offline');
      setTasksLoading(false);
      setTasksError(null);
      return;
    }

    setTasksLoading(true);
    setTasksError(null);
    setTasksOwnerId(null);

    try {
      // 1. Events (Local/Cache)
      const savedEvents = localStorage.getItem(STORAGE_KEY_EVENTS);
      if (savedEvents) {
        setEvents(JSON.parse(savedEvents));
      } else {
        const initial = currentUser.id === 'usr_demo_01' ? getInitialEvents() : [];
        setEvents(initial);
        localStorage.setItem(STORAGE_KEY_EVENTS, JSON.stringify(initial));
      }

      // 2. Contacts (Local/Cache)
      const savedContacts = localStorage.getItem(STORAGE_KEY_CONTACTS);
      if (savedContacts) {
        setContacts(JSON.parse(savedContacts));
      } else {
        const initial = currentUser.id === 'usr_demo_01' ? INITIAL_CONTACTS : [];
        setContacts(initial);
        localStorage.setItem(STORAGE_KEY_CONTACTS, JSON.stringify(initial));
      }

      // 3. Notes (Local/Cache)
      const savedNotes = localStorage.getItem(STORAGE_KEY_NOTES);
      if (savedNotes) {
        setNotes(JSON.parse(savedNotes));
      } else {
        const initial = currentUser.id === 'usr_demo_01' ? INITIAL_NOTES : [];
        setNotes(initial);
        localStorage.setItem(STORAGE_KEY_NOTES, JSON.stringify(initial));
      }

      // 4. Theme
      const savedTheme = localStorage.getItem(STORAGE_KEY_THEME) as AppTheme;
      if (savedTheme) {
        setTheme(savedTheme);
        document.documentElement.setAttribute('data-theme', savedTheme);
      } else {
        setTheme('dark-cyber');
        document.documentElement.setAttribute('data-theme', 'dark-cyber');
      }

      // 5. Sound
      const savedSound = localStorage.getItem(STORAGE_KEY_SOUND);
      if (savedSound !== null) {
        const parsed = JSON.parse(savedSound);
        setSoundEnabledState(parsed);
        soundManager.enabled = parsed;
      }
    } catch (e) {
      console.error('Error al cargar datos del usuario:', e);
    }

    // 6. Tasks with Cloud Firestore Synchronization (isolated per authenticated user: users/{userId}/tasks)
    let unsubscribeFirestoreTasks = () => {};

    if (isFirebaseConfigured && currentUser.id) {
      setFirestoreSyncStatus('syncing');
      let hasReceivedInitialSnapshot = false;

      // Instant UI response from local cache while Firestore connects
      const cachedTasks = localStorage.getItem(STORAGE_KEY_TASKS);
      if (cachedTasks) {
        try {
          setTasks(JSON.parse(cachedTasks));
          setTasksOwnerId(currentUser.id);
        } catch {
          // ignore cache parsing error
        }
      }

      // Realtime listener from Firestore subcollection: users/{userId}/tasks
      // Ensures user only ever receives their own private tasks
      unsubscribeFirestoreTasks = subscribeToUserTasks(
        currentUser.id,
        async (firestoreTasks) => {
          const isInitialSnapshot = !hasReceivedInitialSnapshot;
          hasReceivedInitialSnapshot = true;
          let seedFailed = false;

          if (firestoreTasks.length > 0) {
            setTasks(firestoreTasks);
            setTasksOwnerId(currentUser.id);
            localStorage.setItem(STORAGE_KEY_TASKS, JSON.stringify(firestoreTasks));
          } else if (isInitialSnapshot) {
            // First time login for this user: seed initial tasks into Firestore
            const cached = localStorage.getItem(STORAGE_KEY_TASKS);
            const initialList: AgendaTask[] = cached
              ? JSON.parse(cached).map((task: AgendaTask) => ({ ...task, userId: currentUser.id }))
              : currentUser.id === 'usr_demo_01'
                ? getInitialTasks().map((task) => ({ ...task, userId: currentUser.id }))
                : [];

            if (initialList.length > 0) {
              setTasks(initialList);
              setTasksOwnerId(currentUser.id);
              localStorage.setItem(STORAGE_KEY_TASKS, JSON.stringify(initialList));
              try {
                await batchSaveTasksToFirestore(currentUser.id, initialList);
              } catch (err) {
                console.warn('Error al guardar tareas iniciales en Firestore:', err);
                seedFailed = true;
                setTasksError('No se pudieron guardar las tareas iniciales en Firestore.');
                setFirestoreSyncStatus('error');
              }
            } else {
              setTasks([]);
              setTasksOwnerId(currentUser.id);
              localStorage.setItem(STORAGE_KEY_TASKS, JSON.stringify([]));
            }
          }
          setTasksLoading(false);
          if (!seedFailed) setFirestoreSyncStatus('connected');
        },
        (error) => {
          console.warn('Fallo de conexión a Firestore Tasks, usando modo local:', error);
          setFirestoreSyncStatus('error');
          setTasksLoading(false);
          setTasksError('No se pudieron sincronizar tus tareas. Se muestran los datos guardados localmente.');
          const savedTasks = localStorage.getItem(STORAGE_KEY_TASKS);
          if (savedTasks) {
            try {
              setTasks(JSON.parse(savedTasks));
              setTasksOwnerId(currentUser.id);
            } catch {
              const fallbackTasks = currentUser.id === 'usr_demo_01'
                ? getInitialTasks().map((task) => ({ ...task, userId: currentUser.id }))
                : [];
              setTasks(fallbackTasks);
              setTasksOwnerId(currentUser.id);
            }
          } else {
            setTasksOwnerId(currentUser.id);
          }
        }
      );
    } else {
      // Local fallback mode when Firebase credentials are not provided
      setFirestoreSyncStatus('offline');
      setTasksLoading(false);
      setTasksError(null);
      const savedTasks = localStorage.getItem(STORAGE_KEY_TASKS);
      if (savedTasks) {
        setTasks(JSON.parse(savedTasks));
        setTasksOwnerId(currentUser.id);
      } else {
        const initial = currentUser.id === 'usr_demo_01' ? getInitialTasks() : [];
        setTasks(initial);
        setTasksOwnerId(currentUser.id);
        localStorage.setItem(STORAGE_KEY_TASKS, JSON.stringify(initial));
      }
    }

    return () => {
      unsubscribeFirestoreTasks();
    };
  }, [currentUser?.id]);

  // Sync with sound manager
  const setSoundEnabled = (enabled: boolean) => {
    setSoundEnabledState(enabled);
    soundManager.enabled = enabled;
    try {
      localStorage.setItem(STORAGE_KEY_SOUND, JSON.stringify(enabled));
    } catch {
      // Storage error ignored
    }
  };

  // Sync state to user-specific local storage
  useEffect(() => {
    if (!currentUser) return;
    try {
      localStorage.setItem(STORAGE_KEY_EVENTS, JSON.stringify(events));
    } catch (e) {
      console.error(e);
    }
  }, [events, currentUser?.id]);

  useEffect(() => {
    if (!currentUser || tasksOwnerId !== currentUser.id) return;
    try {
      localStorage.setItem(STORAGE_KEY_TASKS, JSON.stringify(tasks));
    } catch (e) {
      console.error(e);
    }
  }, [tasks, tasksOwnerId, currentUser?.id]);

  useEffect(() => {
    if (!currentUser) return;
    try {
      localStorage.setItem(STORAGE_KEY_CONTACTS, JSON.stringify(contacts));
    } catch (e) {
      console.error(e);
    }
  }, [contacts, currentUser?.id]);

  useEffect(() => {
    if (!currentUser) return;
    try {
      localStorage.setItem(STORAGE_KEY_NOTES, JSON.stringify(notes));
    } catch (e) {
      console.error(e);
    }
  }, [notes, currentUser?.id]);

  useEffect(() => {
    if (!currentUser) return;
    try {
      localStorage.setItem(STORAGE_KEY_THEME, theme);
      document.documentElement.setAttribute('data-theme', theme);
    } catch (e) {
      console.error(e);
    }
  }, [theme, currentUser?.id]);

  // Toast helper
  const addToast = (text: string, type: 'success' | 'info' | 'warning' | 'error' = 'info') => {
    const id = generateId();
    setToasts((prev) => [...prev, { id, text, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const syncTaskWrite = async (write: () => Promise<void>) => {
    if (!currentUser || !isFirebaseConfigured) return;
    setFirestoreSyncStatus('syncing');
    setTasksError(null);
    try {
      await write();
      setFirestoreSyncStatus('connected');
    } catch (err) {
      console.error('Error sincronizando tareas en Firestore:', err);
      setFirestoreSyncStatus('error');
      setTasksError('No se pudo sincronizar el cambio de tarea. Se conserva en este dispositivo.');
      addToast('No se pudo sincronizar el cambio de tarea en la nube', 'warning');
    }
  };

  // Modals
  const openModal = (modal: ModalType, itemToEdit: any = null) => {
    setEditingItem(itemToEdit);
    setActiveModal(modal);
    soundManager.playPop();
  };

  const closeModal = () => {
    setActiveModal(null);
    setEditingItem(null);
  };

  // Events CRUD
  const addEvent = (eventData: Omit<AgendaEvent, 'id'>) => {
    const newEvent: AgendaEvent = {
      ...eventData,
      id: `ev-${generateId()}`,
    };
    setEvents((prev) => [newEvent, ...prev]);
    soundManager.playChime();
    addToast(`Evento "${newEvent.title}" creado con éxito`, 'success');
  };

  const updateEvent = (id: string, updatedFields: Partial<AgendaEvent>) => {
    setEvents((prev) =>
      prev.map((ev) => (ev.id === id ? { ...ev, ...updatedFields } : ev))
    );
    soundManager.playPop();
    addToast('Evento actualizado', 'success');
  };

  const deleteEvent = (id: string) => {
    setEvents((prev) => prev.filter((ev) => ev.id !== id));
    soundManager.playDelete();
    addToast('Evento eliminado', 'info');
  };

  const toggleEventCompleted = (id: string) => {
    setEvents((prev) =>
      prev.map((ev) => {
        if (ev.id === id) {
          const next = !ev.completed;
          if (next) {
            soundManager.playSuccess();
            triggerConfetti();
          }
          return { ...ev, completed: next };
        }
        return ev;
      })
    );
  };

  // Tasks CRUD (Synchronized with Cloud Firestore per authenticated user)
  const addTask = async (taskData: Omit<AgendaTask, 'id'>) => {
    const newTask: AgendaTask = {
      ...taskData,
      id: `task-${generateId()}`,
      userId: currentUser?.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setTasks((prev) => [newTask, ...prev]);
    soundManager.playChime();
    addToast(`Tarea "${newTask.title}" añadida`, 'success');

    await syncTaskWrite(() => saveTaskToFirestore(currentUser!.id, newTask));
  };

  const updateTask = async (id: string, updatedFields: Partial<AgendaTask>) => {
    let taskToPersist: AgendaTask | null = null;

    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const updated = {
            ...t,
            ...updatedFields,
            updatedAt: new Date().toISOString(),
          };
          taskToPersist = updated;
          return updated;
        }
        return t;
      })
    );
    soundManager.playPop();
    addToast('Tarea actualizada', 'success');

    if (taskToPersist) {
      await syncTaskWrite(() => saveTaskToFirestore(currentUser!.id, taskToPersist!));
    }
  };

  const deleteTask = async (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    soundManager.playDelete();
    addToast('Tarea eliminada', 'info');

    await syncTaskWrite(() => deleteTaskFromFirestore(currentUser!.id, id));
  };

  const toggleTaskCompleted = async (id: string) => {
    let taskToPersist: AgendaTask | null = null;

    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const next = !t.completed;
          if (next) {
            soundManager.playSuccess();
            triggerConfetti();
          } else {
            soundManager.playPop();
          }
          const updated = {
            ...t,
            completed: next,
            completedAt: next ? getTodayISO() : undefined,
            updatedAt: new Date().toISOString(),
          };
          taskToPersist = updated;
          return updated;
        }
        return t;
      })
    );

    if (taskToPersist) {
      await syncTaskWrite(() => saveTaskToFirestore(currentUser!.id, taskToPersist!));
    }
  };

  const toggleSubTask = async (taskId: string, subTaskId: string) => {
    let taskToPersist: AgendaTask | null = null;

    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const updatedSubtasks = t.subtasks.map((st) =>
            st.id === subTaskId ? { ...st, completed: !st.completed } : st
          );
          const allCompleted =
            updatedSubtasks.length > 0 && updatedSubtasks.every((st) => st.completed);
          if (allCompleted && !t.completed) {
            triggerConfetti();
            soundManager.playSuccess();
          } else {
            soundManager.playPop();
          }
          const updated = {
            ...t,
            subtasks: updatedSubtasks,
            completed: allCompleted ? true : t.completed,
            updatedAt: new Date().toISOString(),
          };
          taskToPersist = updated;
          return updated;
        }
        return t;
      })
    );

    if (taskToPersist) {
      await syncTaskWrite(() => saveTaskToFirestore(currentUser!.id, taskToPersist!));
    }
  };

  // Contacts CRUD
  const addContact = (contactData: Omit<AgendaContact, 'id' | 'createdAt'>) => {
    const newContact: AgendaContact = {
      ...contactData,
      id: `cont-${generateId()}`,
      createdAt: getTodayISO(),
    };
    setContacts((prev) => [newContact, ...prev]);
    soundManager.playChime();
    addToast(`Contacto "${newContact.name}" guardado`, 'success');
  };

  const updateContact = (id: string, updatedFields: Partial<AgendaContact>) => {
    setContacts((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updatedFields } : c))
    );
    soundManager.playPop();
    addToast('Contacto actualizado', 'success');
  };

  const deleteContact = (id: string) => {
    setContacts((prev) => prev.filter((c) => c.id !== id));
    soundManager.playDelete();
    addToast('Contacto eliminado', 'info');
  };

  const toggleContactFavorite = (id: string) => {
    setContacts((prev) =>
      prev.map((c) => (c.id === id ? { ...c, favorite: !c.favorite } : c))
    );
    soundManager.playPop();
  };

  // Notes CRUD
  const addNote = (noteData: Omit<AgendaNote, 'id' | 'updatedAt'>) => {
    const newNote: AgendaNote = {
      ...noteData,
      id: `note-${generateId()}`,
      updatedAt: 'Justo ahora',
    };
    setNotes((prev) => [newNote, ...prev]);
    soundManager.playChime();
    addToast('Nota guardada', 'success');
  };

  const updateNote = (id: string, updatedFields: Partial<AgendaNote>) => {
    setNotes((prev) =>
      prev.map((n) =>
        n.id === id ? { ...n, ...updatedFields, updatedAt: 'Justo ahora' } : n
      )
    );
    soundManager.playPop();
    addToast('Nota actualizada', 'success');
  };

  const deleteNote = (id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
    soundManager.playDelete();
    addToast('Nota eliminada', 'info');
  };

  const toggleNotePinned = (id: string) => {
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, pinned: !n.pinned } : n))
    );
    soundManager.playPop();
  };

  // Live Stats
  const stats: AgendaStats = useMemo(() => {
    const today = getTodayISO();
    const todayEvents = events.filter((e) => e.date === today);
    const todayTasks = tasks.filter((t) => t.dueDate === today);
    const completedTasksToday = tasks.filter(
      (t) => t.completed && (t.completedAt === today || t.dueDate === today)
    ).length;

    const totalTasks = tasks.length;
    const completedTasksTotal = tasks.filter((t) => t.completed).length;
    const completionRate =
      totalTasks > 0 ? Math.round((completedTasksTotal / totalTasks) * 100) : 100;

    return {
      todayEventsCount: todayEvents.length,
      todayTasksCount: todayTasks.length,
      completedTasksToday,
      totalContacts: contacts.length,
      totalNotes: notes.length,
      completionRate,
      activeStreak: totalTasks > 0 ? 5 : 0,
    };
  }, [events, tasks, contacts, notes]);

  // Export / Import
  const exportDataJSON = () => {
    const data = {
      user: currentUser?.email,
      events,
      tasks,
      contacts,
      notes,
      exportedAt: new Date().toISOString(),
      version: '2.0',
    };
    return JSON.stringify(data, null, 2);
  };

  const importDataJSON = (jsonString: string): boolean => {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed.events) setEvents(parsed.events);
        if (parsed.tasks && Array.isArray(parsed.tasks)) {
          const importedTasks = parsed.tasks.map((task: AgendaTask) => ({
            ...task,
            userId: currentUser?.id,
          }));
          setTasks(importedTasks);
          void syncTaskWrite(() => batchSaveTasksToFirestore(currentUser!.id, importedTasks));
      }
      if (parsed.contacts) setContacts(parsed.contacts);
      if (parsed.notes) setNotes(parsed.notes);
      soundManager.playSuccess();
      addToast('Datos importados con éxito', 'success');
      return true;
    } catch {
      addToast('Error al importar archivo JSON. Formato inválido.', 'error');
      return false;
    }
  };

  const resetToDemoData = () => {
    const demoTasks = getInitialTasks();
    setEvents(getInitialEvents());
    setTasks(demoTasks);
    setContacts(INITIAL_CONTACTS);
    setNotes(INITIAL_NOTES);
    soundManager.playSuccess();
    addToast('Datos restaurados a la versión de demostración', 'info');

    const userTasks = demoTasks.map((task) => ({ ...task, userId: currentUser?.id }));
    setTasks(userTasks);
    void syncTaskWrite(() => batchSaveTasksToFirestore(currentUser!.id, userTasks));
  };

  return (
    <AgendaContext.Provider
      value={{
        firestoreSyncStatus,
        isFirebaseActive: isFirebaseConfigured,
        tasksLoading,
        tasksError,
        events,
        tasks,
        contacts,
        notes,
        activeView,
        setActiveView,
        calendarSubView,
        setCalendarSubView,
        selectedDate,
        setSelectedDate,
        searchQuery,
        setSearchQuery,
        selectedCategoryFilter,
        setSelectedCategoryFilter,
        theme,
        setTheme,
        soundEnabled,
        setSoundEnabled,
        addEvent,
        updateEvent,
        deleteEvent,
        toggleEventCompleted,
        addTask,
        updateTask,
        deleteTask,
        toggleTaskCompleted,
        toggleSubTask,
        addContact,
        updateContact,
        deleteContact,
        toggleContactFavorite,
        addNote,
        updateNote,
        deleteNote,
        toggleNotePinned,
        activeModal,
        editingItem,
        openModal,
        closeModal,
        toasts,
        addToast,
        removeToast,
        stats,
        exportDataJSON,
        importDataJSON,
        resetToDemoData,
      }}
    >
      {children}
    </AgendaContext.Provider>
  );
};

export const useAgenda = (): AgendaContextType => {
  const context = useContext(AgendaContext);
  if (!context) {
    throw new Error('useAgenda debe ser utilizado dentro de AgendaProvider');
  }
  return context;
};
