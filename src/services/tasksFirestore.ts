import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  getDocs,
  writeBatch,
  query,
  where,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../config/firebase';
import type { AgendaTask } from '../types/agenda';

// Sanitizer: Cloud Firestore throws an error if any object property is `undefined`.
// This helper removes undefined keys from the payload before persisting.
function sanitizeForFirestore<T extends Record<string, any>>(obj: T): Record<string, any> {
  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value === undefined) {
      continue;
    }
    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      result[key] = sanitizeForFirestore(value);
    } else if (Array.isArray(value)) {
      result[key] = value.map((item) =>
        item !== null && typeof item === 'object' ? sanitizeForFirestore(item) : item
      );
    } else {
      result[key] = value;
    }
  }
  return result;
}

/**
 * Escucha en tiempo real las tareas del usuario autenticado en Cloud Firestore.
 * Path: users/{userId}/tasks/{taskId}
 * Cada usuario solo tiene acceso a su propia subcolección de tareas.
 */
export function subscribeToUserTasks(
  userId: string,
  onTasksReceived: (tasks: AgendaTask[]) => void,
  onError?: (err: Error) => void
): () => void {
  if (!isFirebaseConfigured || !userId) {
    return () => {};
  }

  const tasksCollectionRef = collection(db, 'users', userId, 'tasks');
  const tasksQuery = query(tasksCollectionRef, where('userId', '==', userId));

  const unsubscribe = onSnapshot(
    tasksQuery,
    (snapshot) => {
      const loadedTasks: AgendaTask[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        loadedTasks.push({
          id: docSnap.id,
          title: data.title || '',
          description: data.description || undefined,
          dueDate: data.dueDate || '',
          dueTime: data.dueTime || undefined,
          priority: data.priority || 'media',
          category: data.category || 'trabajo',
          completed: !!data.completed,
          completedAt: data.completedAt || undefined,
          subtasks: Array.isArray(data.subtasks)
            ? data.subtasks.map((st: any) => ({
                id: st.id || '',
                title: st.title || '',
                completed: !!st.completed,
              }))
            : [],
          contactId: data.contactId || undefined,
          userId: userId,
          createdAt: data.createdAt || undefined,
          updatedAt: data.updatedAt || undefined,
        });
      });

      // Ordenar por fecha de vencimiento y prioridad
      loadedTasks.sort((a, b) => {
        if (a.completed !== b.completed) {
          return a.completed ? 1 : -1;
        }
        return (a.dueDate || '').localeCompare(b.dueDate || '');
      });

      onTasksReceived(loadedTasks);
    },
    (error) => {
      console.error('[Firestore Tasks] Error al sincronizar tareas:', error);
      if (onError) onError(error);
    }
  );

  return unsubscribe;
}

/**
 * Guarda o actualiza una tarea en la subcolección del usuario en Firestore.
 */
export async function saveTaskToFirestore(userId: string, task: AgendaTask): Promise<void> {
  if (!isFirebaseConfigured || !userId || !task.id) {
    return;
  }

  const taskDocRef = doc(db, 'users', userId, 'tasks', task.id);
  const payload = sanitizeForFirestore({
    ...task,
    userId,
    updatedAt: new Date().toISOString(),
  });

  await setDoc(taskDocRef, payload, { merge: true });
}

/**
 * Elimina una tarea de Firestore perteneciente al usuario autenticado.
 */
export async function deleteTaskFromFirestore(userId: string, taskId: string): Promise<void> {
  if (!isFirebaseConfigured || !userId || !taskId) {
    return;
  }

  const taskDocRef = doc(db, 'users', userId, 'tasks', taskId);
  await deleteDoc(taskDocRef);
}

/**
 * Migra o guarda un lote de tareas en Firestore (útil para inicializar tareas de bienvenida o importar).
 */
export async function batchSaveTasksToFirestore(
  userId: string,
  tasks: AgendaTask[]
): Promise<void> {
  if (!isFirebaseConfigured || !userId || tasks.length === 0) {
    return;
  }

  const batch = writeBatch(db);
  const now = new Date().toISOString();

  tasks.forEach((task) => {
    const taskDocRef = doc(db, 'users', userId, 'tasks', task.id);
    const sanitized = sanitizeForFirestore({
      ...task,
      userId,
      updatedAt: now,
    });
    batch.set(taskDocRef, sanitized, { merge: true });
  });

  await batch.commit();
}

/**
 * Comprueba si el usuario ya tiene tareas en Firestore.
 */
export async function hasUserTasksInFirestore(userId: string): Promise<boolean> {
  if (!isFirebaseConfigured || !userId) {
    return false;
  }

  const tasksCollectionRef = collection(db, 'users', userId, 'tasks');
  const snapshot = await getDocs(tasksCollectionRef);
  return !snapshot.empty;
}
