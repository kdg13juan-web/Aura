import React from 'react';
import type { AgendaNote } from '../../types/agenda';
import { useAgenda } from '../../context/AgendaContext';
import { CategoryBadge } from '../common/CategoryBadge';
import {
  Pin,
  Tag,
  Edit2,
  Trash2,
  Clock,
} from 'lucide-react';

interface NoteCardProps {
  note: AgendaNote;
}

export const NoteCard: React.FC<NoteCardProps> = ({ note }) => {
  const {
    toggleNotePinned,
    deleteNote,
    openModal,
  } = useAgenda();

  return (
    <div
      className={`note-card glass-panel note-theme-${note.color} ${note.pinned ? 'is-pinned' : ''}`}
      onClick={() => openModal('note', note)}
    >
      {/* Top Header */}
      <div className="note-card-top">
        <h4 className="note-card-title">{note.title}</h4>

        <button
          className={`note-pin-btn ${note.pinned ? 'pinned' : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            toggleNotePinned(note.id);
          }}
          title={note.pinned ? 'Desfijar nota' : 'Fijar nota arriba'}
        >
          <Pin size={15} />
        </button>
      </div>

      {/* Note Content */}
      <div className="note-card-body">
        <p className="note-content-text">{note.content}</p>
      </div>

      {/* Tags Chips */}
      {note.tags && note.tags.length > 0 && (
        <div className="note-tags-row">
          {note.tags.map((tag) => (
            <span key={tag} className="note-tag-chip">
              <Tag size={10} />
              <span>{tag}</span>
            </span>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="note-card-footer" onClick={(e) => e.stopPropagation()}>
        <div className="note-footer-left">
          <CategoryBadge category={note.category} size="sm" showIcon={false} />
          <span className="note-time-text">
            <Clock size={11} /> {note.updatedAt}
          </span>
        </div>

        <div className="note-actions">
          <button
            className="card-action-btn edit"
            onClick={() => openModal('note', note)}
            title="Editar nota"
          >
            <Edit2 size={13} />
          </button>
          <button
            className="card-action-btn delete"
            onClick={() => deleteNote(note.id)}
            title="Eliminar nota"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    </div>
  );
};
