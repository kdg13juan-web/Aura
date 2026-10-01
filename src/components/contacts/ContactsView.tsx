import React, { useState } from 'react';
import { useAgenda } from '../../context/AgendaContext';
import { ContactCard } from './ContactCard';
import {
  Users2,
  Plus,
  Star,
  UserCheck,
} from 'lucide-react';
import { soundManager } from '../../utils/sound';

export const ContactsView: React.FC = () => {
  const {
    contacts,
    selectedCategoryFilter,
    searchQuery,
    openModal,
  } = useAgenda();

  const [favoritesOnly, setFavoritesOnly] = useState(false);

  // Filter contacts
  const filteredContacts = contacts.filter((c) => {
    if (favoritesOnly && !c.favorite) return false;
    if (selectedCategoryFilter !== 'all' && c.category !== selectedCategoryFilter) return false;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchName = c.name.toLowerCase().includes(q);
      const matchEmail = c.email.toLowerCase().includes(q);
      const matchPhone = c.phone.toLowerCase().includes(q);
      const matchCompany = c.company?.toLowerCase().includes(q);
      const matchRole = c.role?.toLowerCase().includes(q);
      if (!matchName && !matchEmail && !matchPhone && !matchCompany && !matchRole) return false;
    }

    return true;
  });

  const favoritesCount = contacts.filter((c) => c.favorite).length;

  return (
    <div className="contacts-view-container animate-fade">
      {/* Header Bar */}
      <div className="contacts-header-card glass-panel">
        <div className="contacts-header-left">
          <div className="contacts-title-badge">
            <Users2 size={20} className="text-accent" />
            <h2>Directorio de Contactos</h2>
          </div>
          <p className="contacts-subtitle">
            Administra tus clientes, colegas, profesionales de salud y contactos personales.
          </p>
        </div>

        <div className="contacts-header-right">
          <div className="contacts-stats-pill">
            <span className="count-number">{contacts.length}</span>
            <span className="count-label">contactos</span>
          </div>

          <button
            className="create-contact-main-btn"
            onClick={() => openModal('contact')}
          >
            <Plus size={17} />
            <span>Nuevo Contacto</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs Bar */}
      <div className="contacts-filters-bar glass-panel">
        <div className="status-tabs-group">
          <button
            className={`status-tab-btn ${!favoritesOnly ? 'active' : ''}`}
            onClick={() => {
              setFavoritesOnly(false);
              soundManager.playPop();
            }}
          >
            Todos ({contacts.length})
          </button>

          <button
            className={`status-tab-btn ${favoritesOnly ? 'active' : ''}`}
            onClick={() => {
              setFavoritesOnly(true);
              soundManager.playPop();
            }}
          >
            <Star size={14} className="tab-icon-star" />
            Favoritos ({favoritesCount})
          </button>
        </div>
      </div>

      {/* Grid of Contact Cards */}
      <div className="contacts-grid">
        {filteredContacts.length === 0 ? (
          <div className="empty-state-large glass-panel">
            <UserCheck size={44} className="empty-state-icon text-accent" />
            <h3>No se encontraron contactos</h3>
            <p>Añade nuevos contactos a tu agenda o modifica el filtro de búsqueda.</p>
            <button
              className="quick-add-btn"
              onClick={() => openModal('contact')}
            >
              <Plus size={16} />
              <span>Añadir Primer Contacto</span>
            </button>
          </div>
        ) : (
          filteredContacts.map((c) => <ContactCard key={c.id} contact={c} />)
        )}
      </div>
    </div>
  );
};
