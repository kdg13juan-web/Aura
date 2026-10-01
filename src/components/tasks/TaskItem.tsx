import React, { useState } from 'react';
import type { AgendaTask } from '../../types/agenda';
import { useAgenda } from '../../context/AgendaContext';
import { CategoryBadge } from '../common/CategoryBadge';
import {
  CheckCircle2,
  Circle,
  Clock,
  Calendar,
  Trash2,
  Edit2,
  ChevronDown,
  ChevronRight,
  Plus,
  X,
  AlertTriangle,
} from 'lucide-react';
import { formatDisplayDate, generateId, getTodayISO } from '../../utils/helpers';
import { soundManager } from '../../utils/sound';

interface TaskItemProps {
  task: AgendaTask;
}

export const TaskItem: React.FC<TaskItemProps> = ({ task }) => {
  const {
    toggleTaskCompleted,
    toggleSubTask,
    updateTask,
    deleteTask,
    openModal,
  } = useAgenda();

  const [isExpanded, setIsExpanded] = useState(false);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [isAddingSubtask, setIsAddingSubtask] = useState(false);

  const completedSubtasksCount = task.subtasks.filter((st) => st.completed).length;
  const totalSubtasks = task.subtasks.length;
  const subtaskProgress = totalSubtasks > 0 ? Math.round((completedSubtasksCount / totalSubtasks) * 100) : 0;

  const isOverdue = !task.completed && task.dueDate < getTodayISO();

  const handleAddSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim()) return;

    const newSubtask = {
      id: `sub-${generateId()}`,
      title: newSubtaskTitle.trim(),
      completed: false,
    };

    updateTask(task.id, {
      subtasks: [...task.subtasks, newSubtask],
    });

    setNewSubtaskTitle('');
    setIsAddingSubtask(false);
    soundManager.playPop();
  };

  const handleDeleteSubtask = (subTaskId: string) => {
    updateTask(task.id, {
      subtasks: task.subtasks.filter((st) => st.id !== subTaskId),
    });
    soundManager.playDelete();
  };

  return (
    <div className={`task-card glass-panel ${task.completed ? 'completed' : ''} ${isOverdue ? 'overdue' : ''}`}>
      <div className="task-main-row">
        {/* Checkbox */}
        <button
          className="task-check-circle-btn"
          onClick={() => toggleTaskCompleted(task.id)}
          aria-label={task.completed ? 'Marcar como pendiente' : 'Marcar como completada'}
        >
          {task.completed ? (
            <CheckCircle2 size={22} className="checked-icon text-success" />
          ) : (
            <Circle size={22} className="unchecked-icon" />
          )}
        </button>

        {/* Info & Content */}
        <div className="task-details-col" onClick={() => openModal('task', task)}>
          <div className="task-title-line">
            <h4 className={`task-name ${task.completed ? 'line-through' : ''}`}>
              {task.title}
            </h4>
            <span className={`priority-pill ${task.priority}`}>
              {task.priority === 'critica' && <AlertTriangle size={11} />}
              {task.priority.toUpperCase()}
            </span>
          </div>

          {task.description && (
            <p className="task-description-text">{task.description}</p>
          )}

          {/* Meta Badges */}
          <div className="task-meta-row" onClick={(e) => e.stopPropagation()}>
            <CategoryBadge category={task.category} size="sm" />

            <span className={`task-due-date-badge ${isOverdue ? 'overdue-text' : ''}`}>
              <Calendar size={13} />
              <span>{formatDisplayDate(task.dueDate)}</span>
              {task.dueTime && (
                <>
                  <Clock size={12} className="ml-1" />
                  <span>{task.dueTime}</span>
                </>
              )}
            </span>

            {totalSubtasks > 0 && (
              <button
                className="subtasks-toggle-btn"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                <span>
                  {completedSubtasksCount}/{totalSubtasks} subtareas ({subtaskProgress}%)
                </span>
                {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              </button>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="task-card-actions">
          <button
            className="card-action-btn edit"
            onClick={() => openModal('task', task)}
            title="Editar tarea"
          >
            <Edit2 size={15} />
          </button>
          <button
            className="card-action-btn delete"
            onClick={() => deleteTask(task.id)}
            title="Eliminar tarea"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      {/* Subtasks Section */}
      {(isExpanded || isAddingSubtask) && (
        <div className="subtasks-container animate-fade">
          {totalSubtasks > 0 && (
            <div className="subtasks-progress-bar">
              <div
                className="subtasks-progress-fill"
                style={{ width: `${subtaskProgress}%` }}
              />
            </div>
          )}

          <div className="subtasks-list">
            {task.subtasks.map((st) => (
              <div key={st.id} className="subtask-row">
                <button
                  className="subtask-check-btn"
                  onClick={() => toggleSubTask(task.id, st.id)}
                >
                  {st.completed ? (
                    <CheckCircle2 size={16} className="checked-icon text-success" />
                  ) : (
                    <Circle size={16} className="unchecked-icon" />
                  )}
                </button>
                <span className={`subtask-title ${st.completed ? 'line-through' : ''}`}>
                  {st.title}
                </span>
                <button
                  className="subtask-delete-btn"
                  onClick={() => handleDeleteSubtask(st.id)}
                  title="Eliminar subtarea"
                >
                  <X size={13} />
                </button>
              </div>
            ))}
          </div>

          {/* Add Subtask Input Form */}
          {isAddingSubtask ? (
            <form onSubmit={handleAddSubtask} className="inline-add-subtask-form">
              <input
                type="text"
                placeholder="Escribe una subtarea y presiona Enter..."
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                autoFocus
                className="subtask-input"
              />
              <button type="submit" className="subtask-submit-btn">
                Agregar
              </button>
              <button
                type="button"
                className="subtask-cancel-btn"
                onClick={() => setIsAddingSubtask(false)}
              >
                Cancelar
              </button>
            </form>
          ) : (
            <button
              className="add-subtask-trigger-btn"
              onClick={() => {
                setIsAddingSubtask(true);
                setIsExpanded(true);
              }}
            >
              <Plus size={13} />
              <span>Añadir subtarea</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
