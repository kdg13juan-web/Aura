import React from 'react';
import { useAgenda } from '../../context/AgendaContext';
import { useAuth } from '../../context/AuthContext';
import type { ActiveView } from '../../types/agenda';
import { CATEGORIES } from '../../data/initialData';
import {
  LayoutDashboard,
  CalendarDays,
  CheckSquare,
  Users2,
  StickyNote,
  Flame,
  CheckCircle2,
  Filter,
  LogOut,
} from 'lucide-react';
import { soundManager } from '../../utils/sound';

interface SidebarProps {
  isOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onCloseMobile }) => {
  const { currentUser, logout } = useAuth();
  const {
    activeView,
    setActiveView,
    selectedCategoryFilter,
    setSelectedCategoryFilter,
    stats,
  } = useAgenda();

  const navItems: { id: ActiveView; label: string; icon: React.ReactNode; badge?: number }[] = [
    {
      id: 'dashboard',
      label: 'Vista General',
      icon: <LayoutDashboard size={19} />,
    },
    {
      id: 'calendar',
      label: 'Calendario',
      icon: <CalendarDays size={19} />,
      badge: stats.todayEventsCount > 0 ? stats.todayEventsCount : undefined,
    },
    {
      id: 'tasks',
      label: 'Tareas & Hábitos',
      icon: <CheckSquare size={19} />,
      badge: stats.todayTasksCount > 0 ? stats.todayTasksCount : undefined,
    },
    {
      id: 'contacts',
      label: 'Contactos',
      icon: <Users2 size={19} />,
      badge: stats.totalContacts,
    },
    {
      id: 'notes',
      label: 'Bloc de Notas',
      icon: <StickyNote size={19} />,
      badge: stats.totalNotes,
    },
  ];

  const handleNavClick = (view: ActiveView) => {
    setActiveView(view);
    soundManager.playPop();
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && <div className="sidebar-backdrop" onClick={onCloseMobile} />}

      <aside className={`sidebar-container glass-panel ${isOpen ? 'open' : ''}`}>
        {/* Main Navigation */}
        <div className="sidebar-section">
          <span className="sidebar-section-title">MENU PRINCIPAL</span>
          <nav className="sidebar-nav">
            {navItems.map((item) => {
              const isActive = activeView === item.id;
              return (
                <button
                  key={item.id}
                  className={`nav-item-btn ${isActive ? 'active' : ''}`}
                  onClick={() => handleNavClick(item.id)}
                >
                  <span className="nav-item-icon">{item.icon}</span>
                  <span className="nav-item-label">{item.label}</span>
                  {item.badge !== undefined && (
                    <span className={`nav-item-badge ${isActive ? 'active-badge' : ''}`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Categories Filter */}
        <div className="sidebar-section">
          <div className="sidebar-section-header">
            <span className="sidebar-section-title">CATEGORÍAS</span>
            <Filter size={13} className="text-muted" />
          </div>
          <div className="category-filters-list">
            <button
              className={`category-filter-item ${selectedCategoryFilter === 'all' ? 'active' : ''}`}
              onClick={() => {
                setSelectedCategoryFilter('all');
                soundManager.playPop();
              }}
            >
              <span className="category-dot all-dot" />
              <span className="category-filter-label">Todas las áreas</span>
            </button>

            {Object.values(CATEGORIES).map((cat) => {
              const isSelected = selectedCategoryFilter === cat.id;
              return (
                <button
                  key={cat.id}
                  className={`category-filter-item ${isSelected ? 'active' : ''}`}
                  onClick={() => {
                    setSelectedCategoryFilter(isSelected ? 'all' : cat.id);
                    soundManager.playPop();
                  }}
                >
                  <span
                    className="category-dot"
                    style={{ backgroundColor: cat.color }}
                  />
                  <span className="category-filter-label">{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Productivity Streak / Stats Mini Card */}
        <div className="sidebar-footer">
          <div className="productivity-mini-card">
            <div className="prod-header">
              <div className="streak-badge">
                <Flame size={15} className="streak-icon" />
                <span>{stats.activeStreak} días racha</span>
              </div>
              <span className="prod-percentage">{stats.completionRate}%</span>
            </div>

            <div className="progress-bar-bg">
              <div
                className="progress-bar-fill"
                style={{ width: `${Math.max(5, Math.min(100, stats.completionRate))}%` }}
              />
            </div>

            <div className="prod-subtext">
              <CheckCircle2 size={13} />
              <span>{stats.completedTasksToday} de {stats.todayTasksCount} tareas hoy</span>
            </div>
          </div>

          {/* User Account Snippet */}
          {currentUser && (
            <div className="sidebar-user-card">
              <div className="sidebar-user-left">
                {currentUser.avatar ? (
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="sidebar-user-avatar"
                  />
                ) : (
                  <div className="user-avatar-placeholder" style={{ width: 32, height: 32, fontSize: '0.8rem' }}>
                    {currentUser.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="sidebar-user-meta">
                  <span className="sidebar-user-name">{currentUser.name}</span>
                  <span className="sidebar-user-role">
                    {currentUser.provider === 'google' ? 'Google Auth' : 'Usuario'}
                  </span>
                </div>
              </div>
              <button
                type="button"
                className="sidebar-logout-btn"
                onClick={() => {
                  soundManager.playPop();
                  logout();
                }}
                title="Cerrar sesión"
                aria-label="Cerrar sesión"
              >
                <LogOut size={16} />
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
