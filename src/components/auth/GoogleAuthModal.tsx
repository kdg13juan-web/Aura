import React, { useState } from 'react';
import type { GoogleAccount } from '../../types/auth';
import { X, ArrowRight, UserPlus, ShieldCheck } from 'lucide-react';
import { soundManager } from '../../utils/sound';

interface GoogleAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAccount: (account: GoogleAccount) => Promise<void>;
  isLoading: boolean;
}

const PRESET_GOOGLE_ACCOUNTS: GoogleAccount[] = [
  {
    name: 'Juan Pérez',
    email: 'juan.perez@gmail.com',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
  },
  {
    name: 'Alex Rivera',
    email: 'alex.rivera@gmail.com',
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
  },
  {
    name: 'María García',
    email: 'maria.garcia.dev@gmail.com',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  },
];

export const GoogleAuthModal: React.FC<GoogleAuthModalProps> = ({
  isOpen,
  onClose,
  onSelectAccount,
  isLoading,
}) => {
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customEmail, setCustomEmail] = useState('');
  const [customError, setCustomError] = useState('');

  if (!isOpen) return null;

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCustomError('');

    if (!customName.trim()) {
      setCustomError('Por favor ingresa tu nombre de Google.');
      return;
    }

    if (!customEmail.trim() || !customEmail.includes('@')) {
      setCustomError('Por favor ingresa una dirección de correo Google válida.');
      return;
    }

    const emailToUse = customEmail.trim().toLowerCase().endsWith('@gmail.com')
      ? customEmail.trim().toLowerCase()
      : `${customEmail.trim().toLowerCase().split('@')[0]}@gmail.com`;

    const account: GoogleAccount = {
      name: customName.trim(),
      email: emailToUse,
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(customName)}&backgroundColor=4285f4,34a853,fbbc05,ea4335`,
    };

    soundManager.playSuccess();
    onSelectAccount(account);
  };

  return (
    <div className="modal-backdrop animate-fade" onClick={onClose}>
      <div
        className="google-modal-card glass-panel animate-pop"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="google-modal-header">
          <div className="google-brand">
            <svg className="google-icon-svg" viewBox="0 0 24 24" width="24" height="24">
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
            <span className="google-modal-title">Iniciar sesión con Google</span>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Cerrar modal">
            <X size={18} />
          </button>
        </div>

        <div className="google-modal-body">
          <p className="google-modal-subtitle">
            Selecciona una cuenta para continuar en <strong>Aura Agenda</strong>
          </p>

          {!isCustomMode ? (
            <div className="google-accounts-list">
              {PRESET_GOOGLE_ACCOUNTS.map((acc) => (
                <button
                  key={acc.email}
                  className="google-account-item"
                  onClick={() => {
                    soundManager.playPop();
                    onSelectAccount(acc);
                  }}
                  disabled={isLoading}
                >
                  <img src={acc.avatar} alt={acc.name} className="google-account-avatar" />
                  <div className="google-account-info">
                    <span className="google-account-name">{acc.name}</span>
                    <span className="google-account-email">{acc.email}</span>
                  </div>
                  <ArrowRight size={16} className="google-account-arrow" />
                </button>
              ))}

              {/* Option to use another custom account */}
              <button
                className="google-account-item google-use-another"
                onClick={() => {
                  soundManager.playPop();
                  setIsCustomMode(true);
                }}
                disabled={isLoading}
              >
                <div className="google-account-icon-wrap">
                  <UserPlus size={18} />
                </div>
                <div className="google-account-info">
                  <span className="google-account-name">Usar otra cuenta de Google</span>
                  <span className="google-account-email">Ingresa cualquier cuenta</span>
                </div>
              </button>
            </div>
          ) : (
            <form onSubmit={handleCustomSubmit} className="google-custom-form">
              {customError && (
                <div className="auth-error-banner animate-fade">
                  <span>{customError}</span>
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Nombre y Apellido</label>
                <input
                  type="text"
                  placeholder="Ej. Carlos Mendoza"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="form-input"
                  autoFocus
                />
              </div>

              <div className="form-group">
                <label className="form-label">Correo Gmail</label>
                <input
                  type="email"
                  placeholder="carlos.mendoza@gmail.com"
                  value={customEmail}
                  onChange={(e) => setCustomEmail(e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="google-form-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsCustomMode(false)}
                >
                  Volver
                </button>
                <button
                  type="submit"
                  className="btn btn-primary google-submit-btn"
                  disabled={isLoading}
                >
                  {isLoading ? 'Conectando...' : 'Continuar con Google'}
                </button>
              </div>
            </form>
          )}

          {/* Google privacy note */}
          <div className="google-privacy-footer">
            <ShieldCheck size={14} className="text-muted" />
            <span>
              Para continuar, Google compartirá tu nombre, correo electrónico y foto de perfil con Aura Agenda.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
