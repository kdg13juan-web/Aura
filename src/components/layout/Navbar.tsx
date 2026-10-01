import React, { useState, useRef, useEffect } from 'react';
import { useAgenda } from '../../context/AgendaContext';
import type { AppTheme } from '../../types/agenda';
import {
  Search,
  Plus,
  Palette,
  Volume2,
  VolumeX,
  Database,
  Sparkles,
  Menu,
  X,
  Check,
} from 'lucide-react';
import { soundManager } from '../../utils/sound';
import { UserMenu } from '../auth/UserMenu';

interface NavbarProps {
  onToggleSidebar?: () => void;
  isSidebarOpen?: boolean;
}

const THEMES: { id: AppTheme; name: string; color: string; bg: string }[] = [
  { id: 'dark-cyber', name: 'Cyber Obsidian', color: '#6366f1', bg: '#090a10' },
  { id: 'midnight-blue', name: 'Midnight Ocean', color: '#38bdf8', bg: '#060b18' },
  { id: 'emerald-forest', name: 'Emerald Forest', color: '#10b981', bg: '#05130e' },
  { id: 'sunset-violet', name: 'Sunset Plum', color: '#ec4899', bg: '#120914' },
  { id: 'clean-light', name: 'Clean Light', color: '#4f46e5', bg: '#ffffff' },
];

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar, isSidebarOpen }) => {
  const {
    searchQuery,
    setSearchQuery,
    theme,
    setTheme,
    soundEnabled,
    setSoundEnabled,
    openModal,
  } = useAgenda();

  const [showThemePicker, setShowThemePicker] = useState(false);
  const themePickerRef = useRef<HTMLDivElement>(null);

  // Close theme picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (themePickerRef.current && !themePickerRef.current.contains(e.target as Node)) {
        setShowThemePicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSoundToggle = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    if (next) {
      soundManager.playChime();
    }
  };

  return (
    <header className="navbar-header glass-panel">
      <div className="navbar-left">
        <button
          className="mobile-sidebar-toggle"
          onClick={onToggleSidebar}
          aria-label="Abrir o cerrar menú"
        >
          {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        <div className="brand-container">
          <div className="brand-icon-wrapper">
            <Sparkles className="brand-icon" size={20} />
          </div>
          <div className="brand-text">
            <span className="brand-name">Aura</span>
            <span className="brand-badge">Agenda</span>
          </div>
        </div>
      </div>

      <div className="navbar-center">
        <div className="search-bar-wrapper">
          <Search className="search-icon" size={17} />
          <input
            type="text"
            placeholder="Buscar eventos, tareas, notas, contactos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          {searchQuery && (
            <button
              className="search-clear-btn"
              onClick={() => setSearchQuery('')}
              aria-label="Limpiar búsqueda"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      <div className="navbar-right">
        {/* Sound toggle */}
        <button
          className={`nav-action-btn ${soundEnabled ? 'active' : ''}`}
          onClick={handleSoundToggle}
          title={soundEnabled ? 'Sonido activado' : 'Sonido silenciado'}
          aria-label="Alternar efectos de sonido"
        >
          {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
        </button>

        {/* Theme Picker Dropdown */}
        <div className="theme-picker-container" ref={themePickerRef}>
          <button
            className="nav-action-btn"
            onClick={() => setShowThemePicker(!showThemePicker)}
            title="Cambiar tema visual"
            aria-label="Selector de temas"
          >
            <Palette size={18} />
          </button>

          {showThemePicker && (
            <div className="theme-dropdown-menu glass-panel animate-pop">
              <div className="theme-dropdown-header">
                <span>Temas Visuales</span>
              </div>
              <div className="theme-options-list">
                {THEMES.map((t) => (
                  <button
                    key={t.id}
                    className={`theme-option-btn ${theme === t.id ? 'selected' : ''}`}
                    onClick={() => {
                      setTheme(t.id);
                      setShowThemePicker(false);
                      soundManager.playPop();
                    }}
                  >
                    <span
                      className="theme-color-dot"
                      style={{ backgroundColor: t.color, borderColor: t.bg }}
                    />
                    <span className="theme-name">{t.name}</span>
                    {theme === t.id && <Check size={14} className="theme-check-icon" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Backup / Export / Import */}
        <button
          className="nav-action-btn"
          onClick={() => openModal('backup')}
          title="Copia de seguridad y restaurar"
          aria-label="Exportar e importar datos"
        >
          <Database size={18} />
        </button>

        {/* Quick Add Button */}
        <button
          className="quick-add-btn"
          onClick={() => openModal('quick-add')}
          aria-label="Crear nuevo ítem"
        >
          <Plus size={18} />
          <span className="quick-add-text">Crear</span>
        </button>

        {/* User Profile & Logout Menu */}
        <UserMenu />
      </div>
    </header>
  );
};
