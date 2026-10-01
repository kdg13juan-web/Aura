import React from 'react';
import { useAgenda } from '../../context/AgendaContext';
import { CategoryBadge } from '../common/CategoryBadge';
import type { AgendaEvent } from '../../types/agenda';
import {
  formatDisplayDate,
  getTodayISO,
  getRelativeDateISO,
} from '../../utils/helpers';
import {
  Clock,
  MapPin,
  Video,
  CheckCircle2,
  Circle,
  Calendar,
  Plus,
  Trash2,
  Edit2,
} from 'lucide-react';

export const ListView: React.FC = () => {
  const {
    events,
    selectedCategoryFilter,
    searchQuery,
    openModal,
    toggleEventCompleted,
    deleteEvent,
  } = useAgenda();

  const todayISO = getTodayISO();
  const tomorrowISO = getRelativeDateISO(1);
  const nextWeekEndISO = getRelativeDateISO(7);

  // Filter events
  const filteredEvents = events.filter((ev) => {
    if (selectedCategoryFilter !== 'all' && ev.category !== selectedCategoryFilter) {
      return false;
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        ev.title.toLowerCase().includes(q) ||
        ev.description?.toLowerCase().includes(q) ||
        ev.location?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Group events
  const groups: { title: string; events: AgendaEvent[]; badgeColor?: string }[] = [
    {
      title: 'Hoy',
      events: filteredEvents
        .filter((e) => e.date === todayISO)
        .sort((a, b) => a.startTime.localeCompare(b.startTime)),
      badgeColor: '#6366f1',
    },
    {
      title: 'Mañana',
      events: filteredEvents
        .filter((e) => e.date === tomorrowISO)
        .sort((a, b) => a.startTime.localeCompare(b.startTime)),
      badgeColor: '#38bdf8',
    },
    {
      title: 'Próximos 7 Días',
      events: filteredEvents
        .filter((e) => e.date > tomorrowISO && e.date <= nextWeekEndISO)
        .sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime)),
      badgeColor: '#10b981',
    },
    {
      title: 'Futuros',
      events: filteredEvents
        .filter((e) => e.date > nextWeekEndISO)
        .sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime)),
      badgeColor: '#a855f7',
    },
    {
      title: 'Pasados / Anteriores',
      events: filteredEvents
        .filter((e) => e.date < todayISO)
        .sort((a, b) => b.date.localeCompare(a.date) || b.startTime.localeCompare(a.startTime)),
      badgeColor: '#64748b',
    },
  ];

  const totalEventsInView = filteredEvents.length;

  if (totalEventsInView === 0) {
    return (
      <div className="empty-state-large glass-panel">
        <Calendar size={48} className="empty-state-icon" />
        <h3>No se encontraron eventos</h3>
        <p>Intenta ajustar los filtros de búsqueda o agrega un nuevo evento a tu agenda.</p>
        <button
          className="quick-add-btn"
          onClick={() => openModal('event', { date: todayISO })}
        >
          <Plus size={16} />
          <span>Crear Primer Evento</span>
        </button>
      </div>
    );
  }

  return (
    <div className="agenda-list-view">
      {groups.map((group) => {
        if (group.events.length === 0) return null;

        return (
          <section key={group.title} className="agenda-group-section">
            <div className="group-header">
              <h3 className="group-title">{group.title}</h3>
              <span
                className="group-count-badge"
                style={{ backgroundColor: `${group.badgeColor}20`, color: group.badgeColor }}
              >
                {group.events.length}
              </span>
            </div>

            <div className="group-events-list">
              {group.events.map((ev) => (
                <div
                  key={ev.id}
                  className={`agenda-card glass-panel ${ev.completed ? 'completed' : ''}`}
                >
                  <div className="agenda-card-left">
                    <button
                      className="event-toggle-btn"
                      onClick={() => toggleEventCompleted(ev.id)}
                      title={ev.completed ? 'Marcar como pendiente' : 'Marcar como completado'}
                    >
                      {ev.completed ? (
                        <CheckCircle2 size={20} className="checked-icon" />
                      ) : (
                        <Circle size={20} className="unchecked-icon" />
                      )}
                    </button>

                    <div className="agenda-card-date-badge">
                      <span className="date-badge-day">{formatDisplayDate(ev.date)}</span>
                      <span className="date-badge-time">
                        <Clock size={12} /> {ev.startTime} - {ev.endTime}
                      </span>
                    </div>
                  </div>

                  <div className="agenda-card-content" onClick={() => openModal('event', ev)}>
                    <div className="agenda-card-title-row">
                      <h4 className="agenda-card-title">{ev.title}</h4>
                      <CategoryBadge category={ev.category} size="sm" />
                    </div>

                    {ev.description && (
                      <p className="agenda-card-desc">{ev.description}</p>
                    )}

                    <div className="agenda-card-meta">
                      {ev.location && (
                        <span className="card-meta-pill">
                          <MapPin size={12} /> {ev.location}
                        </span>
                      )}
                      {ev.meetLink && (
                        <a
                          href={ev.meetLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="meet-link-pill"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Video size={12} /> Unirse
                        </a>
                      )}
                    </div>
                  </div>

                  <div className="agenda-card-actions">
                    <button
                      className="card-action-btn edit"
                      onClick={() => openModal('event', ev)}
                      title="Editar"
                    >
                      <Edit2 size={15} />
                    </button>
                    <button
                      className="card-action-btn delete"
                      onClick={() => deleteEvent(ev.id)}
                      title="Eliminar"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
};
