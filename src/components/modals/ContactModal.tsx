import React, { useState } from 'react';
import { useAgenda } from '../../context/AgendaContext';
import type { CategoryType } from '../../types/agenda';
import { CATEGORIES } from '../../data/initialData';
import {
  X,
  Users2,
  Mail,
  Phone,
  Building2,
  Briefcase,
  Star,
  Check,
  AlignLeft,
} from 'lucide-react';

const AVATAR_COLORS = [
  '#6366f1', // Indigo
  '#a855f7', // Purple
  '#06b6d4', // Cyan
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#ec4899', // Pink
  '#f43f5e', // Rose
  '#3b82f6', // Blue
];

export const ContactModal: React.FC = () => {
  const {
    activeModal,
    editingItem,
    closeModal,
    addContact,
    updateContact,
  } = useAgenda();

  const isEditing = !!(editingItem && editingItem.id);

  const [name, setName] = useState(editingItem?.name || '');
  const [email, setEmail] = useState(editingItem?.email || '');
  const [phone, setPhone] = useState(editingItem?.phone || '');
  const [company, setCompany] = useState(editingItem?.company || '');
  const [role, setRole] = useState(editingItem?.role || '');
  const [category, setCategory] = useState<CategoryType>(editingItem?.category || 'trabajo');
  const [notes, setNotes] = useState(editingItem?.notes || '');
  const [favorite, setFavorite] = useState<boolean>(editingItem?.favorite || false);
  const [avatarColor, setAvatarColor] = useState(editingItem?.avatarColor || AVATAR_COLORS[0]);

  if (activeModal !== 'contact') return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const contactPayload = {
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      company: company.trim() || undefined,
      role: role.trim() || undefined,
      category,
      notes: notes.trim() || undefined,
      favorite,
      avatarColor,
    };

    if (isEditing) {
      updateContact(editingItem.id, contactPayload);
    } else {
      addContact(contactPayload);
    }

    closeModal();
  };

  return (
    <div className="modal-backdrop" onClick={closeModal}>
      <div className="modal-content glass-panel animate-pop" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title-row">
            <Users2 className="modal-icon text-accent" size={20} />
            <h3>{isEditing ? 'Editar Contacto' : 'Nuevo Contacto'}</h3>
          </div>
          <button className="modal-close-btn" onClick={closeModal}>
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="modal-form">
          {/* Name & Favorite Toggle */}
          <div className="form-group">
            <div className="form-label-with-action">
              <label>Nombre Completo *</label>
              <button
                type="button"
                className={`fav-toggle-btn ${favorite ? 'active' : ''}`}
                onClick={() => setFavorite(!favorite)}
              >
                <Star size={14} fill={favorite ? 'currentColor' : 'none'} />
                <span>{favorite ? 'Favorito' : 'Marcar como favorito'}</span>
              </button>
            </div>
            <input
              type="text"
              placeholder="Ej. Dra. Valentina Ramos, Lic. Carlos Mendoza..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoFocus
            />
          </div>

          {/* Email & Phone Grid */}
          <div className="form-row-grid">
            <div className="form-group">
              <label>
                <Mail size={13} /> Correo Electrónico
              </label>
              <input
                type="email"
                placeholder="contacto@ejemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>
                <Phone size={13} /> Teléfono / WhatsApp
              </label>
              <input
                type="tel"
                placeholder="+34 600 000 000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          </div>

          {/* Company & Role */}
          <div className="form-row-grid">
            <div className="form-group">
              <label>
                <Building2 size={13} /> Empresa / Organización
              </label>
              <input
                type="text"
                placeholder="Ej. Tech Solutions, Hospital..."
                value={company}
                onChange={(e) => setCompany(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>
                <Briefcase size={13} /> Cargo / Relación
              </label>
              <input
                type="text"
                placeholder="Ej. Director Comercial, Odontólogo..."
                value={role}
                onChange={(e) => setRole(e.target.value)}
              />
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

          {/* Avatar Color Picker */}
          <div className="form-group">
            <label>Color de Avatar</label>
            <div className="avatar-color-row">
              {AVATAR_COLORS.map((col) => (
                <button
                  key={col}
                  type="button"
                  className={`avatar-color-btn ${avatarColor === col ? 'selected' : ''}`}
                  style={{ backgroundColor: col }}
                  onClick={() => setAvatarColor(col)}
                >
                  {avatarColor === col && <Check size={14} color="#fff" />}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="form-group">
            <label>
              <AlignLeft size={13} /> Notas Personales
            </label>
            <textarea
              rows={2}
              placeholder="Detalles sobre este contacto, preferencias, cumpleaños..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {/* Actions */}
          <div className="modal-actions-row">
            <button type="button" className="btn-secondary" onClick={closeModal}>
              Cancelar
            </button>
            <button type="submit" className="btn-primary">
              <Check size={16} />
              <span>{isEditing ? 'Guardar Cambios' : 'Guardar Contacto'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
