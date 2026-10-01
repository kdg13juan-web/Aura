import React, { useState } from 'react';
import { useAgenda } from '../../context/AgendaContext';
import type { CategoryType, NoteColor } from '../../types/agenda';
import { CATEGORIES } from '../../data/initialData';
import {
  X,
  StickyNote,
  Pin,
  Tag,
  Check,
  AlignLeft,
} from 'lucide-react';

const NOTE_COLORS: { id: NoteColor; label: string; bg: string }[] = [
  { id: 'lavender', label: 'Lavanda', bg: '#8b5cf6' },
  { id: 'emerald', label: 'Esmeralda', bg: '#10b981' },
  { id: 'amber', label: 'Ámbar', bg: '#f59e0b' },
  { id: 'rose', label: 'Rosa', bg: '#f43f5e' },
  { id: 'sky', label: 'Cielo', bg: '#0ea5e9' },
  { id: 'slate', label: 'Pizarra', bg: '#64748b' },
];

export const NoteModal: React.FC = () => {
  const {
    activeModal,
    editingItem,
    closeModal,
    addNote,
    updateNote,
  } = useAgenda();

  const isEditing = !!(editingItem && editingItem.id);

  const [title, setTitle] = useState(editingItem?.title || '');
  const [content, setContent] = useState(editingItem?.content || '');
  const [color, setColor] = useState<NoteColor>(editingItem?.color || 'lavender');
  const [category, setCategory] = useState<CategoryType>(editingItem?.category || 'personal');
  const [pinned, setPinned] = useState<boolean>(editingItem?.pinned || false);
  const [tagsString, setTagsString] = useState<string>(
    editingItem?.tags ? editingItem.tags.join(', ') : ''
  );

  if (activeModal !== 'note') return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() && !content.trim()) return;

    const tags = tagsString
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const notePayload = {
      title: title.trim() || 'Nota sin título',
      content: content.trim(),
      color,
      category,
      pinned,
      tags,
    };

    if (isEditing) {
      updateNote(editingItem.id, notePayload);
    } else {
      addNote(notePayload);
    }

    closeModal();
  };

  return (
    <div className="modal-backdrop" onClick={closeModal}>
      <div className="modal-content glass-panel animate-pop" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title-row">
            <StickyNote className="modal-icon text-accent" size={20} />
            <h3>{isEditing ? 'Editar Nota' : 'Nueva Nota Rápida'}</h3>
          </div>
          <button className="modal-close-btn" onClick={closeModal}>
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="modal-form">
          {/* Title & Pin Toggle */}
          <div className="form-group">
            <div className="form-label-with-action">
              <label>Título</label>
              <button
                type="button"
                className={`pin-toggle-btn ${pinned ? 'active' : ''}`}
                onClick={() => setPinned(!pinned)}
              >
                <Pin size={14} />
                <span>{pinned ? 'Fijada en la parte superior' : 'Fijar nota'}</span>
              </button>
            </div>
            <input
              type="text"
              placeholder="Título o resumen breve..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
            />
          </div>

          {/* Color Palette Selector */}
          <div className="form-group">
            <label>Color de la Nota</label>
            <div className="note-color-picker-row">
              {NOTE_COLORS.map((nc) => (
                <button
                  key={nc.id}
                  type="button"
                  className={`note-color-choice-btn ${color === nc.id ? 'selected' : ''}`}
                  style={{ backgroundColor: nc.bg }}
                  onClick={() => setColor(nc.id)}
                  title={nc.label}
                >
                  {color === nc.id && <Check size={14} color="#fff" />}
                </button>
              ))}
            </div>
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

          {/* Content */}
          <div className="form-group">
            <label>
              <AlignLeft size={13} /> Contenido de la Nota *
            </label>
            <textarea
              rows={5}
              placeholder="Escribe tus ideas, enlaces, recordatorios..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
            />
          </div>

          {/* Tags */}
          <div className="form-group">
            <label>
              <Tag size={13} /> Etiquetas (separadas por comas)
            </label>
            <input
              type="text"
              placeholder="ej. ideas, proyecto, urgente, compras"
              value={tagsString}
              onChange={(e) => setTagsString(e.target.value)}
            />
          </div>

          {/* Actions */}
          <div className="modal-actions-row">
            <button type="button" className="btn-secondary" onClick={closeModal}>
              Cancelar
            </button>
            <button type="submit" className="btn-primary">
              <Check size={16} />
              <span>{isEditing ? 'Guardar Cambios' : 'Crear Nota'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
