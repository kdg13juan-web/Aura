import React, { useState } from 'react';
import { useAgenda } from '../../context/AgendaContext';
import type { CategoryType } from '../../types/agenda';
import { CATEGORIES } from '../../data/initialData';
import { getTodayISO } from '../../utils/helpers';
import {
  X,
  Calendar,
  Clock,
  MapPin,
  Video,
  User,
  Check,
  AlignLeft,
} from 'lucide-react';

export const EventModal: React.FC = () => {
  const {
    activeModal,
    editingItem,
    closeModal,
    addEvent,
    updateEvent,
    contacts,
    selectedDate,
  } = useAgenda();

  const isEditing = !!(editingItem && editingItem.id);

  const [title, setTitle] = useState(editingItem?.title || '');
  const [description, setDescription] = useState(editingItem?.description || '');
  const [date, setDate] = useState(editingItem?.date || selectedDate || getTodayISO());
  const [startTime, setStartTime] = useState(editingItem?.startTime || '09:00');
  const [endTime, setEndTime] = useState(editingItem?.endTime || '10:00');
  const [category, setCategory] = useState<CategoryType>(editingItem?.category || 'trabajo');
  const [location, setLocation] = useState(editingItem?.location || '');
  const [meetLink, setMeetLink] = useState(editingItem?.meetLink || '');
  const [contactId, setContactId] = useState(editingItem?.contactId || '');

  if (activeModal !== 'event') return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const eventPayload = {
      title: title.trim(),
      description: description.trim() || undefined,
      date,
      startTime,
      endTime,
      category,
      location: location.trim() || undefined,
      meetLink: meetLink.trim() || undefined,
      contactId: contactId || undefined,
      completed: editingItem?.completed || false,
    };

    if (isEditing) {
      updateEvent(editingItem.id, eventPayload);
    } else {
      addEvent(eventPayload);
    }

    closeModal();
  };

  return (
    <div className="modal-backdrop" onClick={closeModal}>
      <div className="modal-content glass-panel animate-pop" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title-row">
            <Calendar className="modal-icon text-accent" size={20} />
            <h3>{isEditing ? 'Editar Evento' : 'Agendar Nuevo Evento'}</h3>
          </div>
          <button className="modal-close-btn" onClick={closeModal}>
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="modal-form">
          {/* Title */}
          <div className="form-group">
            <label>Título del Evento *</label>
            <input
              type="text"
              placeholder="Ej. Reunión de proyecto, Cita con el dentista..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              autoFocus
            />
          </div>

          {/* Category Selector */}
          <div className="form-group">
            <label>Categoría</label>
            <div className="category-select-grid">
              {Object.values(CATEGORIES).map((cat) => {
                const isSelected = category === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    className={`category-pill-btn ${isSelected ? 'selected' : ''}`}
                    style={{
                      borderColor: isSelected ? cat.color : undefined,
                      backgroundColor: isSelected ? cat.bgDark : undefined,
                      color: isSelected ? cat.color : undefined,
                    }}
                    onClick={() => setCategory(cat.id)}
                  >
                    <span
                      className="category-pill-dot"
                      style={{ backgroundColor: cat.color }}
                    />
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date & Time Grid */}
          <div className="form-row-grid">
            <div className="form-group">
              <label>
                <Calendar size={13} /> Fecha
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>
                <Clock size={13} /> Hora Inicio
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>
                <Clock size={13} /> Hora Fin
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Location & Meet Link */}
          <div className="form-row-grid">
            <div className="form-group">
              <label>
                <MapPin size={13} /> Ubicación Física
              </label>
              <input
                type="text"
                placeholder="Ej. Oficina Central, Consultorio 2..."
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>
                <Video size={13} /> Enlace de Videollamada
              </label>
              <input
                type="url"
                placeholder="https://meet.google.com/..."
                value={meetLink}
                onChange={(e) => setMeetLink(e.target.value)}
              />
            </div>
          </div>

          {/* Contact Association */}
          {contacts.length > 0 && (
            <div className="form-group">
              <label>
                <User size={13} /> Asociar con un Contacto
              </label>
              <select
                value={contactId}
                onChange={(e) => setContactId(e.target.value)}
              >
                <option value="">-- Sin contacto asignado --</option>
                {contacts.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.email || c.phone})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Description */}
          <div className="form-group">
            <label>
              <AlignLeft size={13} /> Notas / Descripción
            </label>
            <textarea
              rows={3}
              placeholder="Detalles adicionales, orden del día, puntos a tratar..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Actions */}
          <div className="modal-actions-row">
            <button type="button" className="btn-secondary" onClick={closeModal}>
              Cancelar
            </button>
            <button type="submit" className="btn-primary">
              <Check size={16} />
              <span>{isEditing ? 'Guardar Cambios' : 'Crear Evento'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
