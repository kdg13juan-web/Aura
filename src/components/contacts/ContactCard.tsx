import React from 'react';
import type { AgendaContact } from '../../types/agenda';
import { useAgenda } from '../../context/AgendaContext';
import { CategoryBadge } from '../common/CategoryBadge';
import {
  Star,
  Mail,
  Phone,
  Building2,
  CalendarPlus,
  Edit2,
  Trash2,
} from 'lucide-react';
import { getTodayISO } from '../../utils/helpers';

interface ContactCardProps {
  contact: AgendaContact;
}

export const ContactCard: React.FC<ContactCardProps> = ({ contact }) => {
  const {
    toggleContactFavorite,
    deleteContact,
    openModal,
  } = useAgenda();

  // Get Initials
  const initials = contact.name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();

  const handleScheduleMeeting = (e: React.MouseEvent) => {
    e.stopPropagation();
    openModal('event', {
      title: `Reunión con ${contact.name}`,
      contactId: contact.id,
      date: getTodayISO(),
      startTime: '10:00',
      endTime: '11:00',
      category: contact.category,
      description: `Cita agendada con ${contact.name} (${contact.email})`,
    });
  };

  return (
    <div className="contact-card glass-panel">
      {/* Top row with Avatar, Info, Favorite */}
      <div className="contact-card-top">
        <div
          className="contact-avatar"
          style={{ backgroundColor: contact.avatarColor || '#6366f1' }}
        >
          {initials}
        </div>

        <div className="contact-title-box">
          <div className="contact-name-row">
            <h4 className="contact-name">{contact.name}</h4>
            <button
              className={`favorite-star-btn ${contact.favorite ? 'is-fav' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                toggleContactFavorite(contact.id);
              }}
              title={contact.favorite ? 'Quitar de favoritos' : 'Añadir a favoritos'}
            >
              <Star size={17} fill={contact.favorite ? 'currentColor' : 'none'} />
            </button>
          </div>

          {(contact.role || contact.company) && (
            <div className="contact-role-company">
              <Building2 size={13} />
              <span>
                {contact.role} {contact.role && contact.company ? '•' : ''} {contact.company}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Category */}
      <div className="contact-badge-line">
        <CategoryBadge category={contact.category} size="sm" />
      </div>

      {/* Contact Details */}
      <div className="contact-details-list">
        {contact.email && (
          <a
            href={`mailto:${contact.email}`}
            className="contact-info-item"
            title="Enviar correo"
          >
            <Mail size={14} className="info-icon" />
            <span className="info-text">{contact.email}</span>
          </a>
        )}

        {contact.phone && (
          <a
            href={`tel:${contact.phone}`}
            className="contact-info-item"
            title="Llamar por teléfono"
          >
            <Phone size={14} className="info-icon" />
            <span className="info-text">{contact.phone}</span>
          </a>
        )}

        {contact.notes && (
          <p className="contact-note-preview">
            “{contact.notes}”
          </p>
        )}
      </div>

      {/* Footer Actions */}
      <div className="contact-card-footer">
        <button
          className="schedule-contact-btn"
          onClick={handleScheduleMeeting}
        >
          <CalendarPlus size={14} />
          <span>Agendar Cita</span>
        </button>

        <div className="contact-edit-delete-btns">
          <button
            className="card-action-btn edit"
            onClick={() => openModal('contact', contact)}
            title="Editar contacto"
          >
            <Edit2 size={14} />
          </button>
          <button
            className="card-action-btn delete"
            onClick={() => deleteContact(contact.id)}
            title="Eliminar contacto"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};
