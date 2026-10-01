import React from 'react';
import { useAgenda } from '../../context/AgendaContext';
import { CATEGORIES } from '../../data/initialData';
import {
  formatDateToISO,
  getTodayISO,
  getDaysOfWeekSpanish,
} from '../../utils/helpers';
import { Clock, Plus } from 'lucide-react';
import { soundManager } from '../../utils/sound';

interface WeekTimelineProps {
  currentDate: Date;
  onSelectDate: (iso: string) => void;
}

const HOURS = [
  '07:00', '08:00', '09:00', '10:00', '11:00', '12:00',
  '13:00', '14:00', '15:00', '16:00', '17:00', '18:00',
  '19:00', '20:00', '21:00', '22:00'
];

export const WeekTimeline: React.FC<WeekTimelineProps> = ({
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

  const todayISO = getTodayISO();
  const weekDayNames = getDaysOfWeekSpanish();

  // Calculate the 7 days for current week (Monday to Sunday)
  const currentDayOfWeek = currentDate.getDay(); // 0 is Sun
  const mondayOffset = (currentDayOfWeek + 6) % 7;
  const mondayDate = new Date(currentDate);
  mondayDate.setDate(currentDate.getDate() - mondayOffset);

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(mondayDate);
    d.setDate(mondayDate.getDate() + i);
    return {
      date: d,
      iso: formatDateToISO(d),
      name: weekDayNames[i],
      dayNumber: d.getDate(),
    };
  });

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

  const getEventsForDayAndHour = (iso: string, hourStr: string) => {
    const targetHour = parseInt(hourStr.split(':')[0], 10);
    return filteredEvents.filter((e) => {
      if (e.date !== iso) return false;
      const startH = parseInt(e.startTime.split(':')[0], 10);
      return startH === targetHour;
    });
  };

  return (
    <div className="week-timeline-wrapper glass-panel">
      {/* Header with columns for Monday - Sunday */}
      <div className="week-timeline-header">
        <div className="time-col-header">
          <Clock size={15} />
          <span>Hora</span>
        </div>

        {weekDays.map((day) => {
          const isToday = day.iso === todayISO;
          const isSelected = day.iso === selectedDate;

          return (
            <div
              key={day.iso}
              className={`week-day-col-header ${isToday ? 'is-today' : ''} ${
                isSelected ? 'is-selected' : ''
              }`}
              onClick={() => {
                onSelectDate(day.iso);
                soundManager.playPop();
              }}
            >
              <span className="week-day-name">{day.name}</span>
              <span className={`week-day-num ${isToday ? 'today-pill' : ''}`}>
                {day.dayNumber}
              </span>
            </div>
          );
        })}
      </div>

      {/* Grid with Hours rows */}
      <div className="week-timeline-body">
        {HOURS.map((hour) => (
          <div key={hour} className="week-hour-row">
            <div className="time-cell-label">{hour}</div>

            {weekDays.map((day) => {
              const cellEvents = getEventsForDayAndHour(day.iso, hour);
              const isSelected = day.iso === selectedDate;

              return (
                <div
                  key={`${day.iso}-${hour}`}
                  className={`week-slot-cell ${isSelected ? 'selected-col' : ''}`}
                  onClick={() => {
                    openModal('event', {
                      date: day.iso,
                      startTime: hour,
                      endTime: `${String(parseInt(hour.split(':')[0], 10) + 1).padStart(2, '0')}:00`,
                    });
                  }}
                >
                  {cellEvents.map((ev) => {
                    const catInfo = CATEGORIES[ev.category];
                    const color = catInfo ? catInfo.color : '#6366f1';

                    return (
                      <div
                        key={ev.id}
                        className={`week-event-card ${ev.completed ? 'completed' : ''}`}
                        style={{
                          backgroundColor: `${color}25`,
                          borderColor: color,
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          openModal('event', ev);
                        }}
                      >
                        <div className="week-event-time">
                          {ev.startTime} - {ev.endTime}
                        </div>
                        <div className="week-event-title">{ev.title}</div>
                      </div>
                    );
                  })}

                  <div className="slot-add-indicator">
                    <Plus size={12} />
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
