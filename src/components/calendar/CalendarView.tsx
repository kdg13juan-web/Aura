import React, { useState } from 'react';
import { useAgenda } from '../../context/AgendaContext';
import { MonthGrid } from './MonthGrid';
import { WeekTimeline } from './WeekTimeline';
import { ListView } from './ListView';
import { CategoryBadge } from '../common/CategoryBadge';
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Grid3X3,
  Columns,
  ListFilter,
  Plus,
  Clock,
  MapPin,
  CheckCircle2,
  Circle,
} from 'lucide-react';
import {
  getMonthsSpanish,
  getTodayISO,
  formatDisplayDate,
} from '../../utils/helpers';
import { soundManager } from '../../utils/sound';

export const CalendarView: React.FC = () => {
  const {
    calendarSubView,
    setCalendarSubView,
    selectedDate,
    setSelectedDate,
    events,
    openModal,
    toggleEventCompleted,
  } = useAgenda();

  const [navDate, setNavDate] = useState<Date>(() => {
    const today = new Date();
    return today;
  });

  const monthNames = getMonthsSpanish();
  const currentYear = navDate.getFullYear();
  const currentMonthIdx = navDate.getMonth();

  const handlePrev = () => {
    setNavDate((prev) => {
      const next = new Date(prev);
      if (calendarSubView === 'week') {
        next.setDate(next.getDate() - 7);
      } else {
        next.setMonth(next.getMonth() - 1);
      }
      return next;
    });
    soundManager.playPop();
  };

  const handleNext = () => {
    setNavDate((prev) => {
      const next = new Date(prev);
      if (calendarSubView === 'week') {
        next.setDate(next.getDate() + 7);
      } else {
        next.setMonth(next.getMonth() + 1);
      }
      return next;
    });
    soundManager.playPop();
  };

  const handleToday = () => {
    const today = new Date();
    setNavDate(today);
    setSelectedDate(getTodayISO());
    soundManager.playPop();
  };

  // Events for selected date in month view side panel
  const selectedDateEvents = events
    .filter((e) => e.date === selectedDate)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  return (
    <div className="calendar-view-container animate-fade">
      {/* Top Controls Bar */}
      <div className="calendar-controls-bar glass-panel">
        <div className="cal-controls-left">
          <div className="month-nav-group">
            <button
              className="nav-arrow-btn"
              onClick={handlePrev}
              aria-label="Mes anterior"
            >
              <ChevronLeft size={18} />
            </button>
            <h2 className="current-month-heading">
              {monthNames[currentMonthIdx]} <span className="year-highlight">{currentYear}</span>
            </h2>
            <button
              className="nav-arrow-btn"
              onClick={handleNext}
              aria-label="Mes siguiente"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          <button className="today-jump-btn" onClick={handleToday}>
            Hoy
          </button>
        </div>

        <div className="cal-controls-right">
          {/* SubView Switcher */}
          <div className="subview-pills">
            <button
              className={`subview-btn ${calendarSubView === 'month' ? 'active' : ''}`}
              onClick={() => {
                setCalendarSubView('month');
                soundManager.playPop();
              }}
            >
              <Grid3X3 size={15} />
              <span className="subview-text">Mes</span>
            </button>
            <button
              className={`subview-btn ${calendarSubView === 'week' ? 'active' : ''}`}
              onClick={() => {
                setCalendarSubView('week');
                soundManager.playPop();
              }}
            >
              <Columns size={15} />
              <span className="subview-text">Semana</span>
            </button>
            <button
              className={`subview-btn ${calendarSubView === 'list' ? 'active' : ''}`}
              onClick={() => {
                setCalendarSubView('list');
                soundManager.playPop();
              }}
            >
              <ListFilter size={15} />
              <span className="subview-text">Lista</span>
            </button>
          </div>

          {/* Add Event Button */}
          <button
            className="cal-add-event-btn"
            onClick={() => openModal('event', { date: selectedDate })}
          >
            <Plus size={16} />
            <span>Agendar Evento</span>
          </button>
        </div>
      </div>

      {/* Main Calendar Content Area */}
      <div className="calendar-main-content">
        {calendarSubView === 'month' && (
          <div className="month-view-layout">
            <div className="month-grid-area">
              <MonthGrid
                currentDate={navDate}
                onSelectDate={(iso) => setSelectedDate(iso)}
              />
            </div>

            {/* Selected Day Details Sidebar */}
            <aside className="selected-day-sidebar glass-panel animate-fade">
              <div className="day-sidebar-header">
                <div className="day-sidebar-date">
                  <Calendar size={18} className="text-accent" />
                  <h3>{formatDisplayDate(selectedDate)}</h3>
                </div>
                <button
                  className="add-day-event-mini-btn"
                  onClick={() => openModal('event', { date: selectedDate })}
                  title="Añadir evento a este día"
                >
                  <Plus size={15} />
                </button>
              </div>

              <div className="day-sidebar-events">
                {selectedDateEvents.length === 0 ? (
                  <div className="sidebar-empty-day">
                    <p>No hay eventos agendados para este día.</p>
                    <button
                      className="create-inline-btn"
                      onClick={() => openModal('event', { date: selectedDate })}
                    >
                      <Plus size={14} />
                      <span>Agendar Evento</span>
                    </button>
                  </div>
                ) : (
                  selectedDateEvents.map((ev) => (
                    <div
                      key={ev.id}
                      className={`day-event-mini-card ${ev.completed ? 'completed' : ''}`}
                      onClick={() => openModal('event', ev)}
                    >
                      <div className="mini-card-top">
                        <button
                          className="mini-check-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleEventCompleted(ev.id);
                          }}
                        >
                          {ev.completed ? (
                            <CheckCircle2 size={16} className="checked-icon" />
                          ) : (
                            <Circle size={16} className="unchecked-icon" />
                          )}
                        </button>
                        <span className="mini-card-time">
                          <Clock size={12} /> {ev.startTime} - {ev.endTime}
                        </span>
                        <CategoryBadge category={ev.category} size="sm" showIcon={false} />
                      </div>

                      <h4 className="mini-card-title">{ev.title}</h4>
                      {ev.location && (
                        <span className="mini-card-loc">
                          <MapPin size={12} /> {ev.location}
                        </span>
                      )}
                    </div>
                  ))
                )}
              </div>
            </aside>
          </div>
        )}

        {calendarSubView === 'week' && (
          <WeekTimeline
            currentDate={navDate}
            onSelectDate={(iso) => setSelectedDate(iso)}
          />
        )}

        {calendarSubView === 'list' && <ListView />}
      </div>
    </div>
  );
};
