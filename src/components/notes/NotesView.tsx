import React, { useState } from 'react';
import { useAgenda } from '../../context/AgendaContext';
import { NoteCard } from './NoteCard';
import {
  StickyNote,
  Plus,
  Pin,
  FileText,
} from 'lucide-react';
import { soundManager } from '../../utils/sound';

export const NotesView: React.FC = () => {
  const {
    notes,
    selectedCategoryFilter,
    searchQuery,
    openModal,
  } = useAgenda();

  const [filterPinnedOnly, setFilterPinnedOnly] = useState(false);

  // Filter notes
  const filteredNotes = notes.filter((n) => {
    if (filterPinnedOnly && !n.pinned) return false;
    if (selectedCategoryFilter !== 'all' && n.category !== selectedCategoryFilter) return false;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchTitle = n.title.toLowerCase().includes(q);
      const matchContent = n.content.toLowerCase().includes(q);
      const matchTags = n.tags.some((t) => t.toLowerCase().includes(q));
      if (!matchTitle && !matchContent && !matchTags) return false;
    }

    return true;
  });

  const pinnedNotes = filteredNotes.filter((n) => n.pinned);
  const otherNotes = filteredNotes.filter((n) => !n.pinned);

  return (
    <div className="notes-view-container animate-fade">
      {/* Header Bar */}
      <div className="notes-header-card glass-panel">
        <div className="notes-header-left">
          <div className="notes-title-badge">
            <StickyNote size={20} className="text-accent" />
            <h2>Bloc de Notas & Recordatorios</h2>
          </div>
          <p className="notes-subtitle">
            Captura ideas rápidas, listas de verificación, enlaces y reflexiones diarias.
          </p>
        </div>

        <div className="notes-header-right">
          <div className="notes-stats-pill">
            <span className="count-number">{notes.length}</span>
            <span className="count-label">notas</span>
          </div>

          <button
            className="create-note-main-btn"
            onClick={() => openModal('note')}
          >
            <Plus size={17} />
            <span>Nueva Nota</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs Bar */}
      <div className="notes-filters-bar glass-panel">
        <div className="status-tabs-group">
          <button
            className={`status-tab-btn ${!filterPinnedOnly ? 'active' : ''}`}
            onClick={() => {
              setFilterPinnedOnly(false);
              soundManager.playPop();
            }}
          >
            Todas ({notes.length})
          </button>

          <button
            className={`status-tab-btn ${filterPinnedOnly ? 'active' : ''}`}
            onClick={() => {
              setFilterPinnedOnly(true);
              soundManager.playPop();
            }}
          >
            <Pin size={14} className="tab-icon-pin" />
            Fijadas ({notes.filter((n) => n.pinned).length})
          </button>
        </div>
      </div>

      {/* Notes Grid */}
      {filteredNotes.length === 0 ? (
        <div className="empty-state-large glass-panel">
          <FileText size={44} className="empty-state-icon text-accent" />
          <h3>No hay notas disponibles</h3>
          <p>Crea tu primera nota para organizar tus ideas e inspiración.</p>
          <button className="quick-add-btn" onClick={() => openModal('note')}>
            <Plus size={16} />
            <span>Crear Primera Nota</span>
          </button>
        </div>
      ) : (
        <div className="notes-sections-wrapper">
          {/* Pinned Notes Section */}
          {!filterPinnedOnly && pinnedNotes.length > 0 && (
            <div className="notes-subgroup">
              <div className="notes-subgroup-title">
                <Pin size={14} className="text-accent" />
                <span>NOTAS FIJADAS</span>
              </div>
              <div className="notes-grid">
                {pinnedNotes.map((note) => (
                  <NoteCard key={note.id} note={note} />
                ))}
              </div>
            </div>
          )}

          {/* Other Notes Section */}
          {(!filterPinnedOnly ? otherNotes : pinnedNotes).length > 0 && (
            <div className="notes-subgroup">
              {!filterPinnedOnly && pinnedNotes.length > 0 && (
                <div className="notes-subgroup-title">
                  <StickyNote size={14} />
                  <span>OTRAS NOTAS</span>
                </div>
              )}
              <div className="notes-grid">
                {(!filterPinnedOnly ? otherNotes : pinnedNotes).map((note) => (
                  <NoteCard key={note.id} note={note} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
