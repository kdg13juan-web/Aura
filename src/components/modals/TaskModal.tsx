import React, { useState } from 'react';
import { useAgenda } from '../../context/AgendaContext';
import type { CategoryType, PriorityType, SubTask } from '../../types/agenda';
import { CATEGORIES } from '../../data/initialData';
import { getTodayISO, generateId } from '../../utils/helpers';
import {
  X,
  CheckSquare,
  Calendar,
  Clock,
  Check,
  Plus,
  Trash2,
  AlertTriangle,
  AlignLeft,
} from 'lucide-react';

export const TaskModal: React.FC = () => {
  const {
    activeModal,
    editingItem,
    closeModal,
    addTask,
    updateTask,
    selectedDate,
  } = useAgenda();

  const isEditing = !!(editingItem && editingItem.id);

  const [title, setTitle] = useState(editingItem?.title || '');
  const [description, setDescription] = useState(editingItem?.description || '');
  const [dueDate, setDueDate] = useState(editingItem?.dueDate || selectedDate || getTodayISO());
  const [dueTime, setDueTime] = useState(editingItem?.dueTime || '');
  const [priority, setPriority] = useState<PriorityType>(editingItem?.priority || 'media');
  const [category, setCategory] = useState<CategoryType>(editingItem?.category || 'trabajo');
  
  const [subtasks, setSubtasks] = useState<SubTask[]>(editingItem?.subtasks || []);
  const [newSubtaskInput, setNewSubtaskInput] = useState('');

  if (activeModal !== 'task') return null;

  const handleAddSubtask = () => {
    if (!newSubtaskInput.trim()) return;
    setSubtasks((prev) => [
      ...prev,
      {
        id: `sub-${generateId()}`,
        title: newSubtaskInput.trim(),
        completed: false,
      },
    ]);
    setNewSubtaskInput('');
  };

  const handleRemoveSubtask = (id: string) => {
    setSubtasks((prev) => prev.filter((s) => s.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const taskPayload = {
      title: title.trim(),
      description: description.trim() || undefined,
      dueDate,
      dueTime: dueTime || undefined,
      priority,
      category,
      completed: editingItem?.completed || false,
      subtasks,
    };

    if (isEditing) {
      updateTask(editingItem.id, taskPayload);
    } else {
      addTask(taskPayload);
    }

    closeModal();
  };

  return (
    <div className="modal-backdrop" onClick={closeModal}>
      <div className="modal-content glass-panel animate-pop" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title-row">
            <CheckSquare className="modal-icon text-accent" size={20} />
            <h3>{isEditing ? 'Editar Tarea' : 'Nueva Tarea / Objetivo'}</h3>
          </div>
          <button className="modal-close-btn" onClick={closeModal}>
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="modal-form">
          {/* Title */}
          <div className="form-group">
            <label>Título de la Tarea *</label>
            <input
              type="text"
              placeholder="Ej. Revisar informe, Enviar propuesta..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              autoFocus
            />
          </div>

          {/* Priority selector */}
          <div className="form-group">
            <label>Prioridad</label>
            <div className="priority-select-grid">
              {(['baja', 'media', 'alta', 'critica'] as PriorityType[]).map((p) => {
                const isSelected = priority === p;
                return (
                  <button
                    key={p}
                    type="button"
                    className={`priority-select-btn ${p} ${isSelected ? 'selected' : ''}`}
                    onClick={() => setPriority(p)}
                  >
                    {p === 'critica' && <AlertTriangle size={13} />}
                    <span>{p.charAt(0).toUpperCase() + p.slice(1)}</span>
                  </button>
                );
              })}
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

          {/* Due Date & Time Grid */}
          <div className="form-row-grid">
            <div className="form-group">
              <label>
                <Calendar size={13} /> Fecha Límite
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>
                <Clock size={13} /> Hora Límite (Opcional)
              </label>
              <input
                type="time"
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
              />
            </div>
          </div>

          {/* Subtasks Builder */}
          <div className="form-group">
            <label>Lista de Subtareas / Checklist</label>
            
            {subtasks.length > 0 && (
              <div className="modal-subtasks-list">
                {subtasks.map((st) => (
                  <div key={st.id} className="modal-subtask-item">
                    <span>• {st.title}</span>
                    <button
                      type="button"
                      className="remove-subtask-btn"
                      onClick={() => handleRemoveSubtask(st.id)}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="add-subtask-input-row">
              <input
                type="text"
                placeholder="Añadir paso o subtarea..."
                value={newSubtaskInput}
                onChange={(e) => setNewSubtaskInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSubtask();
                  }
                }}
              />
              <button
                type="button"
                className="add-subtask-action-btn"
                onClick={handleAddSubtask}
              >
                <Plus size={14} />
                <span>Añadir</span>
              </button>
            </div>
          </div>

          {/* Description */}
          <div className="form-group">
            <label>
              <AlignLeft size={13} /> Notas Adicionales
            </label>
            <textarea
              rows={2}
              placeholder="Instrucciones o contexto..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Actions */}
          <div className="modal-actions-row">
            <button type="button" className="btn-secondary" onClick={closeModal}>
              Cancelar
            </button>
            <button type="submit" className="btn-primary">
              <Check size={16} />
              <span>{isEditing ? 'Guardar Cambios' : 'Crear Tarea'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
