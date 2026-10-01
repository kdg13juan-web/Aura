import React, { type ReactNode } from 'react';
import { useAuth } from '../../context/AuthContext';
import { AuthPage } from './AuthPage';
import { Sparkles } from 'lucide-react';

interface AuthGuardProps {
  children: ReactNode;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="auth-page-wrapper">
        <div className="auth-background-mesh">
          <div className="glow-blob glow-blob-1" />
          <div className="glow-blob glow-blob-2" />
        </div>
        <div className="glass-panel" style={{ padding: '36px', textAlign: 'center', zIndex: 1 }}>
          <div className="brand-icon-wrapper large" style={{ margin: '0 auto 16px' }}>
            <Sparkles size={24} className="brand-icon" />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <div className="spinner-mini" style={{ width: '20px', height: '20px' }} />
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
              Verificando sesión segura...
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthPage />;
  }

  return <>{children}</>;
};
