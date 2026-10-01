import React from 'react';
import { useAgenda } from '../../context/AgendaContext';
import {
  X,
  Calendar,
  CheckSquare,
  Users2,
  StickyNote,
  Sparkles,
  Plus,
} from 'lucide-react';
import { soundManager } from '../../utils/sound';

export const QuickAddModal: React.FC = () => {
  const {
    activeModal,
    closeModal,
    openModal,
  } = useAgenda();

  if (activeModal !== 'quick-add') return null;

  const handleSelect = (type: 'event' | 'task' | 'contact' | 'note') => {
    soundManager.playPop();
    openModal(type);
  };

  const options = [
    {
      id: 'event' as const,
      title: 'Nuevo Evento / Cita',
      description: 'Programa reuniones, consultas médicas, llamadas o eventos en el calendario.',
      icon: <Calendar size={24} />,
      color: '#6366f1',
      bg: 'rgba(99, 102, 241, 0.15)',
    },
    {
      id: 'task' as const,
      title: 'Nueva Tarea / To-Do',
      description: 'Crea objetivos con fecha límite, nivel de prioridad y lista de subtareas.',
      icon: <CheckSquare size={24} />,
      color: '#f59e0b',
      bg: 'rgba(245, 158, 11, 0.15)',
    },
    {
      id: 'contact' as const,
      title: 'Nuevo Contacto',
      description: 'Guarda clientes, colegas o familiares con correo, teléfono y notas.',
      icon: <Users2 size={24} />,
      color: '#10b981',
      bg: 'rgba(16, 185, 129, 0.15)',
    },
    {
      id: 'note' as const,
      title: 'Nueva Nota Rápida',
      description: 'Escribe notas adhesivas, ideas, enlaces o recordatorios con etiquetas.',
      icon: <StickyNote size={24} />,
      color: '#ec4899',
      bg: 'rgba(236, 72, 153, 0.15)',
    },
  ];

  return (
    <div className="modal-backdrop" onClick={closeModal}>
      <div className="modal-content glass-panel animate-pop quick-add-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title-row">
            <Sparkles className="modal-icon text-accent" size={20} />
            <h3>¿Qué deseas crear?</h3>
          </div>
          <button className="modal-close-btn" onClick={closeModal}>
            <X size={18} />
          </button>
        </div>

        {/* Options Grid */}
        <div className="quick-add-options-grid">
          {options.map((opt) => (
            <button
              key={opt.id}
              className="quick-option-tile"
              style={{ '--tile-color': opt.color, '--tile-bg': opt.bg } as React.CSSProperties}
              onClick={() => handleSelect(opt.id)}
            >
              <div className="tile-icon-box">{opt.icon}</div>
              <div className="tile-content">
                <h4 className="tile-title">{opt.title}</h4>
                <p className="tile-desc">{opt.description}</p>
              </div>
              <div className="tile-action-arrow">
                <Plus size={16} />
              </div>
            </button>
          ))}
        </div>

        {/* Footer */}
        <div className="modal-actions-row">
          <button type="button" className="btn-secondary" onClick={closeModal}>
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};
