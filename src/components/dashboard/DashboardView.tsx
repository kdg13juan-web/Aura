import React, { useState, useEffect } from 'react';
import { useAgenda } from '../../context/AgendaContext';
import { useAuth } from '../../context/AuthContext';
import { StatsCard } from './StatsCard';
import { CategoryBadge } from '../common/CategoryBadge';
import {
  CalendarDays,
  CheckSquare,
  Sparkles,
  Clock,
  MapPin,
  Video,
  Plus,
  ArrowRight,
  TrendingUp,
  Award,
  CheckCircle2,
  Circle,
  Pin,
  Calendar,
} from 'lucide-react';
import {
  getTodayISO,
  getGreeting,
  formatFullDateSpanish,
} from '../../utils/helpers';

export const DashboardView: React.FC = () => {
  const { currentUser } = useAuth();
  const {
    events,
    tasks,
    notes,
    contacts,
    stats,
    setActiveView,
    setSelectedDate,
    openModal,
    toggleTaskCompleted,
    toggleEventCompleted,
  } = useAgenda();

  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const todayISO = getTodayISO();
  const todayDateObj = new Date();

  // Filter today's events sorted by startTime
  const todayEvents = events
    .filter((e) => e.date === todayISO)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  // Find next upcoming event today
  const nextEvent = todayEvents.find((e) => !e.completed);

  // Filter pending tasks for today and high priority tasks
  const pendingTasks = tasks
    .filter((t) => !t.completed)
    .sort((a, b) => {
      const priorityOrder = { critica: 0, alta: 1, media: 2, baja: 3 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    })
    .slice(0, 4);

  // Pinned or recent notes
  const recentNotes = notes.slice(0, 3);

  return (
    <div className="dashboard-view animate-fade">
      {/* Hero Welcome Banner */}
      <section className="hero-banner glass-panel">
        <div className="hero-content">
          <div className="hero-badge">
            <Sparkles size={14} className="hero-badge-icon" />
            <span>Panel de Control Diario</span>
          </div>
          <h1 className="hero-title">
            {getGreeting()}
            {currentUser?.name ? `, ${currentUser.name.split(' ')[0]}` : ''}
          </h1>
          <p className="hero-subtitle">
            Hoy es <span className="capitalize-date">{formatFullDateSpanish(todayDateObj)}</span>
          </p>
        </div>

        <div className="hero-right">
          <div className="live-clock-card">
            <Clock size={18} className="clock-icon" />
            <span className="live-clock-digits">{currentTime || '--:--:--'}</span>
          </div>

          <div className="hero-quick-actions">
            <button
              className="quick-create-pill event"
              onClick={() => openModal('event', { date: todayISO })}
            >
              <Plus size={14} />
              <span>Evento</span>
            </button>
            <button
              className="quick-create-pill task"
              onClick={() => openModal('task', { dueDate: todayISO })}
            >
              <Plus size={14} />
              <span>Tarea</span>
            </button>
            <button
              className="quick-create-pill note"
              onClick={() => openModal('note')}
            >
              <Plus size={14} />
              <span>Nota</span>
            </button>
          </div>
        </div>
      </section>

      {/* 4 Stats Cards */}
      <section className="stats-grid">
        <StatsCard
          title="Eventos para Hoy"
          value={stats.todayEventsCount}
          subtext={`${todayEvents.filter((e) => e.completed).length} completados`}
          icon={<CalendarDays size={22} />}
          accentColor="#6366f1"
          trend="Hoy"
          onClick={() => {
            setSelectedDate(todayISO);
            setActiveView('calendar');
          }}
        />
        <StatsCard
          title="Tareas Pendientes"
          value={stats.todayTasksCount - stats.completedTasksToday > 0 ? stats.todayTasksCount - stats.completedTasksToday : 0}
          subtext={`${tasks.filter((t) => !t.completed).length} totales activas`}
          icon={<CheckSquare size={22} />}
          accentColor="#f59e0b"
          trend={`${stats.completedTasksToday} listas hoy`}
          onClick={() => setActiveView('tasks')}
        />
        <StatsCard
          title="Efectividad Global"
          value={`${stats.completionRate}%`}
          subtext={`${stats.activeStreak} días seguidos`}
          icon={<TrendingUp size={22} />}
          accentColor="#10b981"
          trend="Excelente"
        />
        <StatsCard
          title="Directorio Activo"
          value={contacts.length}
          subtext={`${contacts.filter((c) => c.favorite).length} favoritos`}
          icon={<Award size={22} />}
          accentColor="#ec4899"
          trend="Contactos"
          onClick={() => setActiveView('contacts')}
        />
      </section>

      {/* Main 2-Column Section: Left (Agenda & Next Event) / Right (Priority Tasks & Quick Notes) */}
      <div className="dashboard-columns-grid">
        {/* Left Column */}
        <div className="dashboard-col left-col">
          {/* Next Highlight Event Card */}
          {nextEvent && (
            <div className="next-event-highlight glass-panel">
              <div className="highlight-header">
                <span className="highlight-tag">PRÓXIMO COMPROMISO</span>
                <CategoryBadge category={nextEvent.category} size="sm" />
              </div>

              <div className="highlight-body">
                <h3 className="highlight-event-title">{nextEvent.title}</h3>
                {nextEvent.description && (
                  <p className="highlight-event-desc">{nextEvent.description}</p>
                )}

                <div className="highlight-meta-row">
                  <div className="meta-item">
                    <Clock size={16} className="meta-icon" />
                    <span>
                      {nextEvent.startTime} - {nextEvent.endTime}
                    </span>
                  </div>

                  {nextEvent.location && (
                    <div className="meta-item">
                      <MapPin size={16} className="meta-icon" />
                      <span>{nextEvent.location}</span>
                    </div>
                  )}

                  {nextEvent.meetLink && (
                    <a
                      href={nextEvent.meetLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="meet-link-btn"
                    >
                      <Video size={14} />
                      <span>Unirse a videollamada</span>
                    </a>
                  )}
                </div>
              </div>

              <div className="highlight-footer">
                <button
                  className="complete-event-btn"
                  onClick={() => toggleEventCompleted(nextEvent.id)}
                >
                  <CheckCircle2 size={16} />
                  <span>Marcar como asistido / realizado</span>
                </button>
              </div>
            </div>
          )}

          {/* Today's Schedule Timeline List */}
          <div className="panel-box glass-panel">
            <div className="panel-box-header">
              <div className="panel-title-with-icon">
                <CalendarDays size={18} className="panel-title-icon" />
                <h2>Cronograma de Hoy</h2>
              </div>
              <button
                className="view-all-link"
                onClick={() => {
                  setSelectedDate(todayISO);
                  setActiveView('calendar');
                }}
              >
                <span>Ver Calendario</span>
                <ArrowRight size={14} />
              </button>
            </div>

            <div className="today-events-list">
              {todayEvents.length === 0 ? (
                <div className="empty-state-box">
                  <Calendar size={32} className="empty-icon" />
                  <p>No tienes eventos programados para hoy.</p>
                  <button
                    className="create-inline-btn"
                    onClick={() => openModal('event', { date: todayISO })}
                  >
                    <Plus size={14} />
                    <span>Agendar un evento</span>
                  </button>
                </div>
              ) : (
                todayEvents.map((ev) => (
                  <div
                    key={ev.id}
                    className={`timeline-event-row ${ev.completed ? 'completed' : ''}`}
                  >
                    <button
                      className="event-check-btn"
                      onClick={() => toggleEventCompleted(ev.id)}
                      aria-label="Marcar evento"
                    >
                      {ev.completed ? (
                        <CheckCircle2 size={18} className="checked-icon" />
                      ) : (
                        <Circle size={18} className="unchecked-icon" />
                      )}
                    </button>

                    <div className="timeline-time">
                      <span className="time-start">{ev.startTime}</span>
                      <span className="time-end">{ev.endTime}</span>
                    </div>

                    <div className="timeline-info" onClick={() => openModal('event', ev)}>
                      <div className="timeline-title-row">
                        <span className="timeline-title">{ev.title}</span>
                        <CategoryBadge category={ev.category} size="sm" />
                      </div>
                      {ev.location && (
                        <span className="timeline-subtext">
                          <MapPin size={12} /> {ev.location}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="dashboard-col right-col">
          {/* Priority Tasks */}
          <div className="panel-box glass-panel">
            <div className="panel-box-header">
              <div className="panel-title-with-icon">
                <CheckSquare size={18} className="panel-title-icon" />
                <h2>Tareas Prioritarias</h2>
              </div>
              <button
                className="view-all-link"
                onClick={() => setActiveView('tasks')}
              >
                <span>Ver Todas</span>
                <ArrowRight size={14} />
              </button>
            </div>

            <div className="priority-tasks-list">
              {pendingTasks.length === 0 ? (
                <div className="empty-state-box">
                  <CheckCircle2 size={32} className="empty-icon text-success" />
                  <p>¡Estupendo! No tienes tareas pendientes urgentes.</p>
                  <button
                    className="create-inline-btn"
                    onClick={() => openModal('task', { dueDate: todayISO })}
                  >
                    <Plus size={14} />
                    <span>Añadir tarea</span>
                  </button>
                </div>
              ) : (
                pendingTasks.map((t) => {
                  const completedSubtasks = t.subtasks.filter((st) => st.completed).length;
                  return (
                    <div key={t.id} className="priority-task-item">
                      <button
                        className="task-checkbox-btn"
                        onClick={() => toggleTaskCompleted(t.id)}
                      >
                        {t.completed ? (
                          <CheckCircle2 size={18} className="checked-icon" />
                        ) : (
                          <Circle size={18} className="unchecked-icon" />
                        )}
                      </button>

                      <div
                        className="task-content"
                        onClick={() => openModal('task', t)}
                      >
                        <div className="task-top-row">
                          <span className={`task-title ${t.completed ? 'line-through' : ''}`}>
                            {t.title}
                          </span>
                          <span className={`priority-pill ${t.priority}`}>
                            {t.priority}
                          </span>
                        </div>

                        <div className="task-bottom-row">
                          <CategoryBadge category={t.category} size="sm" showIcon={false} />
                          {t.subtasks.length > 0 && (
                            <span className="subtasks-count">
                              ✓ {completedSubtasks}/{t.subtasks.length}
                            </span>
                          )}
                          {t.dueTime && (
                            <span className="due-time-tag">
                              <Clock size={11} /> {t.dueTime}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Quick Notes / Sticky Pad */}
          <div className="panel-box glass-panel">
            <div className="panel-box-header">
              <div className="panel-title-with-icon">
                <Pin size={18} className="panel-title-icon" />
                <h2>Notas Rápidas</h2>
              </div>
              <button
                className="view-all-link"
                onClick={() => setActiveView('notes')}
              >
                <span>Ver Bloc</span>
                <ArrowRight size={14} />
              </button>
            </div>

            <div className="dashboard-notes-grid">
              {recentNotes.map((n) => (
                <div
                  key={n.id}
                  className={`mini-note-card note-color-${n.color}`}
                  onClick={() => openModal('note', n)}
                >
                  <div className="mini-note-header">
                    <span className="mini-note-title">{n.title}</span>
                    {n.pinned && <Pin size={12} className="pinned-icon" />}
                  </div>
                  <p className="mini-note-snippet">{n.content}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
