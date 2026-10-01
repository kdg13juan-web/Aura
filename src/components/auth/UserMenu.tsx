import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useAgenda } from '../../context/AgendaContext';
import { LogOut, User as UserIcon, Shield, ChevronDown } from 'lucide-react';
import { soundManager } from '../../utils/sound';

export const UserMenu: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const { addToast } = useAgenda();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!currentUser) return null;

  const handleLogout = () => {
    soundManager.playPop();
    logout();
    addToast('Has cerrado sesión correctamente.', 'info');
  };

  const initial = currentUser.name.charAt(0).toUpperCase();

  return (
    <div className="user-profile-menu-container" ref={menuRef}>
      <button
        type="button"
        className="user-nav-btn"
        onClick={() => {
          setIsOpen(!isOpen);
          soundManager.playPop();
        }}
        aria-label="Menú de usuario"
        aria-expanded={isOpen}
      >
        {currentUser.avatar ? (
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            className="user-avatar-img"
          />
        ) : (
          <div className="user-avatar-placeholder">{initial}</div>
        )}
        <span className="user-nav-name">{currentUser.name}</span>
        <ChevronDown size={14} className="text-muted" />
      </button>

      {isOpen && (
        <div className="user-dropdown-menu glass-panel animate-pop">
          <div className="user-dropdown-header">
            <span className="user-dropdown-header-name">{currentUser.name}</span>
            <span className="user-dropdown-header-email">{currentUser.email}</span>
            <span className={`user-provider-badge ${currentUser.provider}`}>
              {currentUser.provider === 'google' ? (
                <>
                  <svg viewBox="0 0 24 24" width="12" height="12">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  Cuenta Google
                </>
              ) : (
                <>
                  <Shield size={12} />
                  Cuenta Verificada
                </>
              )}
            </span>
          </div>

          <div className="user-dropdown-actions">
            <button
              type="button"
              className="user-dropdown-action-btn"
              onClick={() => {
                setIsOpen(false);
                addToast(`Conectado como ${currentUser.email}`, 'info');
              }}
            >
              <UserIcon size={16} />
              <span>Detalles de Perfil</span>
            </button>

            <button
              type="button"
              className="user-dropdown-action-btn logout-btn"
              onClick={handleLogout}
            >
              <LogOut size={16} />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
