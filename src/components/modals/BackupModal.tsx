import React, { useState, useRef } from 'react';
import { useAgenda } from '../../context/AgendaContext';
import {
  X,
  Database,
  Download,
  Upload,
  RefreshCw,
  Printer,
  AlertTriangle,
  Mail,
  LoaderCircle,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { sendTaskSummaryEmail } from '../../services/taskSummaryEmail';
import { getTodayISO } from '../../utils/helpers';

export const BackupModal: React.FC = () => {
  const {
    activeModal,
    closeModal,
    exportDataJSON,
    importDataJSON,
    resetToDemoData,
    addToast,
    tasks,
    events,
  } = useAgenda();
  const { currentUser } = useAuth();

  const [confirmReset, setConfirmReset] = useState(false);
  const [isSendingSummary, setIsSendingSummary] = useState(false);
  const [periodMode, setPeriodMode] = useState<'day' | 'range'>('day');
  const [startDate, setStartDate] = useState(getTodayISO);
  const [endDate, setEndDate] = useState(getTodayISO);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (activeModal !== 'backup') return null;

  const handleExport = () => {
    const jsonStr = exportDataJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aura-agenda-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    addToast('Copia de seguridad descargada', 'success');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const content = evt.target?.result as string;
      if (content) {
        const success = importDataJSON(content);
        if (success) {
          closeModal();
        }
      }
    };
    reader.readAsText(file);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSendTaskSummary = async () => {
    const reportEndDate = periodMode === 'day' ? startDate : endDate;
    if (startDate > reportEndDate) {
      addToast('La fecha final debe ser igual o posterior a la inicial.', 'error');
      return;
    }

    const reportTasks = tasks.filter((task) => task.dueDate >= startDate && task.dueDate <= reportEndDate);
    const reportEvents = events.filter((event) => event.date >= startDate && event.date <= reportEndDate);
    setIsSendingSummary(true);
    try {
      const recipient = await sendTaskSummaryEmail(
        reportTasks,
        reportEvents,
        currentUser?.email ?? '',
        currentUser?.name,
        startDate,
        reportEndDate,
      );
      addToast(`Resumen enviado a ${recipient}`, 'success');
    } catch (error) {
      addToast(
        error instanceof Error ? error.message : 'No se pudo enviar el resumen por correo.',
        'error'
      );
    } finally {
      setIsSendingSummary(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={closeModal}>
      <div className="modal-content glass-panel animate-pop backup-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title-row">
            <Database className="modal-icon text-accent" size={20} />
            <h3>Copia de Seguridad & Ajustes</h3>
          </div>
          <button className="modal-close-btn" onClick={closeModal}>
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="backup-modal-body">
          <p className="backup-description">
            Guarda una copia de todos tus eventos, tareas, contactos y notas en formato JSON o restaura datos anteriores.
          </p>

          <div className="backup-actions-grid">
            {/* Export */}
            <div className="backup-option-card">
              <div className="option-info">
                <Download size={24} className="text-accent" />
                <div>
                  <h4>Exportar Datos</h4>
                  <p>Descarga un archivo .json con toda tu información.</p>
                </div>
              </div>
              <button className="option-action-btn export" onClick={handleExport}>
                <Download size={14} />
                <span>Descargar Backup</span>
              </button>
            </div>

            {/* Import */}
            <div className="backup-option-card">
              <div className="option-info">
                <Upload size={24} className="text-accent" />
                <div>
                  <h4>Importar Datos</h4>
                  <p>Restaura tu agenda desde un archivo JSON previo.</p>
                </div>
              </div>
              <input
                type="file"
                ref={fileInputRef}
                accept=".json"
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />
              <button
                className="option-action-btn import"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload size={14} />
                <span>Seleccionar Archivo</span>
              </button>
            </div>

            {/* Print View */}
            <div className="backup-option-card">
              <div className="option-info">
                <Printer size={24} className="text-accent" />
                <div>
                  <h4>Imprimir Agenda</h4>
                  <p>Genera una vista optimizada para imprimir en papel o PDF.</p>
                </div>
              </div>
              <button className="option-action-btn print" onClick={handlePrint}>
                <Printer size={14} />
                <span>Imprimir / PDF</span>
              </button>
            </div>

            {/* Email agenda summary */}
            <div className="backup-option-card email-summary-card">
              <div className="option-info">
                <Mail size={24} className="text-accent" />
                <div>
                  <h4>Resumen de agenda por correo</h4>
                  <p>Envía tareas y eventos a {currentUser?.email || 'tu cuenta'}.</p>
                </div>
              </div>
              <div className="email-period-controls">
                <div className="email-period-mode" role="group" aria-label="Período del resumen">
                  <button
                    type="button"
                    className={periodMode === 'day' ? 'active' : ''}
                    aria-pressed={periodMode === 'day'}
                    onClick={() => setPeriodMode('day')}
                  >
                    Un día
                  </button>
                  <button
                    type="button"
                    className={periodMode === 'range' ? 'active' : ''}
                    aria-pressed={periodMode === 'range'}
                    onClick={() => setPeriodMode('range')}
                  >
                    Varios días
                  </button>
                </div>
                <div className="email-period-dates">
                  <label>
                    {periodMode === 'day' ? 'Día' : 'Desde'}
                    <input
                      type="date"
                      value={startDate}
                      onChange={(event) => setStartDate(event.target.value)}
                    />
                  </label>
                  {periodMode === 'range' && (
                    <label>
                      Hasta
                      <input
                        type="date"
                        min={startDate}
                        value={endDate}
                        onChange={(event) => setEndDate(event.target.value)}
                      />
                    </label>
                  )}
                </div>
              </div>
              <button
                className="option-action-btn email"
                onClick={handleSendTaskSummary}
                disabled={isSendingSummary}
              >
                {isSendingSummary ? <LoaderCircle size={14} className="animate-spin" /> : <Mail size={14} />}
                <span>{isSendingSummary ? 'Enviando...' : 'Enviar resumen'}</span>
              </button>
            </div>
          </div>

          {/* Reset section */}
          <div className="reset-section">
            {!confirmReset ? (
              <button
                className="reset-demo-btn"
                onClick={() => setConfirmReset(true)}
              >
                <RefreshCw size={14} />
                <span>Restaurar datos de demostración</span>
              </button>
            ) : (
              <div className="confirm-reset-box animate-pop">
                <div className="confirm-text">
                  <AlertTriangle size={16} className="text-warning" />
                  <span>¿Estás seguro? Se reemplazarán los datos actuales por los de demo.</span>
                </div>
                <div className="confirm-actions">
                  <button
                    className="confirm-btn danger"
                    onClick={() => {
                      resetToDemoData();
                      closeModal();
                    }}
                  >
                    Sí, restaurar
                  </button>
                  <button
                    className="confirm-btn cancel"
                    onClick={() => setConfirmReset(false)}
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="modal-actions-row">
          <button type="button" className="btn-secondary" onClick={closeModal}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
