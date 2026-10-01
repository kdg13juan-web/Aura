import React from 'react';
import { useAgenda } from '../../context/AgendaContext';
import type { AgendaEvent } from '../../types/agenda';
import { CATEGORIES } from '../../data/initialData';
import {
  getMonthMatrix,
  getDaysOfWeekSpanish,
  getTodayISO,
} from '../../utils/helpers';
import { Plus } from 'lucide-react';
import { soundManager } from '../../utils/sound';

interface MonthGridProps {
  currentDate: Date;
  onSelectDate: (iso: string) => void;
}

export const MonthGrid: React.FC<MonthGridProps> = ({
  currentDate,
  onSelectDate,
}) => {
  const {
    events,
    selectedDate,
    selectedCategoryFilter,
    searchQuery,
    openModal,
  } = useAgenda();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const matrix = getMonthMatrix(year, month);
  const weekDays = getDaysOfWeekSpanish();
  const todayISO = getTodayISO();

  // Filter events based on global category and search
  const filteredEvents = events.filter((ev) => {
    if (selectedCategoryFilter !== 'all' && ev.category !== selectedCategoryFilter) {
      return false;
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchTitle = ev.title.toLowerCase().includes(q);
      const matchDesc = ev.description?.toLowerCase().includes(q);
      const matchLoc = ev.location?.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchLoc) return false;
    }
    return true;
  });

  const getEventsForDay = (iso: string): AgendaEvent[] => {
    return filteredEvents
      .filter((e) => e.date === iso)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  };

  return (
    <div className="month-grid-wrapper glass-panel">
      {/* Weekday headers (Lun, Mar, Mié, ...) */}
      <div className="weekday-header-row">
        {weekDays.map((dayName, idx) => (
          <div
            key={dayName}
            className={`weekday-col-header ${idx >= 5 ? 'weekend' : ''}`}
          >
            {dayName}
          </div>
        ))}
      </div>

      {/* Days Matrix */}
      <div className="month-matrix-grid">
        {matrix.map((week, wIdx) => (
          <div key={`week-${wIdx}`} className="month-grid-row">
            {week.map((cell) => {
              const isToday = cell.iso === todayISO;
              const isSelected = cell.iso === selectedDate;
              const dayEvents = getEventsForDay(cell.iso);

              return (
                <div
                  key={cell.iso}
                  className={`day-cell ${cell.isCurrentMonth ? 'current-month' : 'other-month'} ${
                    isToday ? 'is-today' : ''
                  } ${isSelected ? 'is-selected' : ''}`}
                  onClick={() => {
                    onSelectDate(cell.iso);
                    soundManager.playPop();
                  }}
                >
                  <div className="day-cell-top">
                    <span className={`day-number ${isToday ? 'today-pill' : ''}`}>
                      {cell.date.getDate()}
                    </span>

                    <button
                      className="add-event-day-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        openModal('event', { date: cell.iso });
                      }}
                      title="Agregar evento en este día"
                    >
                      <Plus size={12} />
                    </button>
                  </div>

                  {/* Event pills on day cell */}
                  <div className="day-events-pills">
                    {dayEvents.slice(0, 3).map((ev) => {
                      const catInfo = CATEGORIES[ev.category];
                      const color = catInfo ? catInfo.color : '#6366f1';
                      return (
                        <div
                          key={ev.id}
                          className={`month-event-pill ${ev.completed ? 'completed' : ''}`}
                          style={{
                            borderLeftColor: color,
                            backgroundColor: `${color}20`,
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            openModal('event', ev);
                          }}
                          title={`${ev.startTime} - ${ev.title}`}
                        >
                          <span className="pill-time">{ev.startTime}</span>
                          <span className="pill-title">{ev.title}</span>
                        </div>
                      );
                    })}

                    {dayEvents.length > 3 && (
                      <span className="more-events-tag">
                        +{dayEvents.length - 3} más
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};
