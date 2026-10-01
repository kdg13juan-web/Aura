import React from 'react';
import { useAgenda } from '../../context/AgendaContext';
import { CheckCircle2, AlertTriangle, Info, XCircle, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useAgenda();

  if (toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map((toast) => {
        const renderIcon = () => {
          switch (toast.type) {
            case 'success':
              return <CheckCircle2 className="toast-icon success" size={18} />;
            case 'warning':
              return <AlertTriangle className="toast-icon warning" size={18} />;
            case 'error':
              return <XCircle className="toast-icon error" size={18} />;
            default:
              return <Info className="toast-icon info" size={18} />;
          }
        };

        return (
          <div key={toast.id} className={`toast-card toast-${toast.type} animate-pop`}>
            {renderIcon()}
            <span className="toast-text">{toast.text}</span>
            <button
              className="toast-close-btn"
              onClick={() => removeToast(toast.id)}
              aria-label="Cerrar notificación"
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
};
