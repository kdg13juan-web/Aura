import type { AgendaEvent, AgendaTask } from '../types/agenda';

function mapPriority(priority: AgendaTask['priority']): 'low' | 'medium' | 'high' {
  if (priority === 'critica' || priority === 'alta') return 'high';
  if (priority === 'media') return 'medium';
  return 'low';
}

export async function sendTaskSummaryEmail(
  tasks: AgendaTask[],
  events: AgendaEvent[],
  email: string,
  name?: string,
  startDate?: string,
  endDate?: string,
): Promise<string> {
  if (!email) {
    throw new Error('Inicia sesión con una cuenta que tenga un correo válido.');
  }

  const response = await fetch('/api/send-email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      to: email,
      name,
      period: startDate && endDate ? { startDate, endDate } : undefined,
      tasks: tasks.map((task) => ({
        title: task.title,
        description: task.description,
        dueDate: [task.dueDate, task.dueTime].filter(Boolean).join(' ') || undefined,
        label: task.category,
        priority: mapPriority(task.priority),
        completed: task.completed,
      })),
      events: events.map((event) => ({
        title: event.title,
        description: event.description,
        date: event.date,
        startTime: event.startTime,
        endTime: event.endTime,
        location: event.location,
        completed: event.completed,
      })),
    }),
  });

  const result: { error?: string } = await response
    .json()
    .catch(() => ({}));

  if (!response.ok) {
    throw new Error(result.error || 'No se pudo enviar el resumen por correo.');
  }

  return email;
}
