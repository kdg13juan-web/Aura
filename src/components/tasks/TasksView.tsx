import React, { useState } from 'react';
import { useAgenda } from '../../context/AgendaContext';
import { TaskItem } from './TaskItem';
import type { PriorityType } from '../../types/agenda';
import {
  Plus,
  Filter,
  CheckCircle2,
  ListTodo,
  LoaderCircle,
} from 'lucide-react';
import { getTodayISO } from '../../utils/helpers';
import { soundManager } from '../../utils/sound';

export const TasksView: React.FC = () => {
  const {
    tasks,
    tasksLoading,
    tasksError,
    selectedCategoryFilter,
    searchQuery,
    openModal,
  } = useAgenda();

  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed'>('pending');
  const [priorityFilter, setPriorityFilter] = useState<PriorityType | 'all'>('all');

  const todayISO = getTodayISO();

  // Filter tasks
  const filteredTasks = tasks.filter((t) => {
    // Status filter
    if (statusFilter === 'pending' && t.completed) return false;
    if (statusFilter === 'completed' && !t.completed) return false;

    // Priority filter
    if (priorityFilter !== 'all' && t.priority !== priorityFilter) return false;

    // Category filter
    if (selectedCategoryFilter !== 'all' && t.category !== selectedCategoryFilter) return false;

    // Search query
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchTitle = t.title.toLowerCase().includes(q);
      const matchDesc = t.description?.toLowerCase().includes(q);
      const matchSub = t.subtasks.some((st) => st.title.toLowerCase().includes(q));
      if (!matchTitle && !matchDesc && !matchSub) return false;
    }

    return true;
  });

  const totalCount = tasks.length;
  const completedCount = tasks.filter((t) => t.completed).length;
  const pendingCount = totalCount - completedCount;
  const progressPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="tasks-view-container animate-fade">
      {/* Header Bar */}
      <div className="tasks-header-card glass-panel">
        <div className="tasks-header-left">
          <div className="tasks-title-badge">
            <ListTodo size={20} className="text-accent" />
            <h2>Tareas & Hábitos</h2>
          </div>
          <p className="tasks-subtitle">
            Organiza tus objetivos, entregas y listas de verificación con subtareas interactivas.
          </p>
        </div>

        <div className="tasks-header-right">
          {/* Progress widget */}
          <div className="tasks-progress-widget">
            <div className="progress-info-row">
              <span className="progress-label">Progreso general</span>
              <span className="progress-value">{progressPercentage}%</span>
            </div>
            <div className="tasks-bar-bg">
              <div
                className="tasks-bar-fill"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <span className="progress-count-text">
              {completedCount} completadas / {pendingCount} pendientes
            </span>
          </div>

          <button
            className="create-task-main-btn"
            onClick={() => openModal('task', { dueDate: todayISO })}
          >
            <Plus size={17} />
            <span>Nueva Tarea</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs Bar */}
      <div className="tasks-filters-bar glass-panel">
        {/* Status Filters */}
        <div className="status-tabs-group">
          <button
            className={`status-tab-btn ${statusFilter === 'pending' ? 'active' : ''}`}
            onClick={() => {
              setStatusFilter('pending');
              soundManager.playPop();
            }}
          >
            Pendientes ({pendingCount})
          </button>
          <button
            className={`status-tab-btn ${statusFilter === 'all' ? 'active' : ''}`}
            onClick={() => {
              setStatusFilter('all');
              soundManager.playPop();
            }}
          >
            Todas ({totalCount})
          </button>
          <button
            className={`status-tab-btn ${statusFilter === 'completed' ? 'active' : ''}`}
            onClick={() => {
              setStatusFilter('completed');
              soundManager.playPop();
            }}
          >
            Completadas ({completedCount})
          </button>
        </div>

        {/* Priority Filter */}
        <div className="priority-select-wrapper">
          <Filter size={14} className="filter-icon" />
          <select
            value={priorityFilter}
            onChange={(e) => {
              setPriorityFilter(e.target.value as PriorityType | 'all');
              soundManager.playPop();
            }}
            className="priority-dropdown"
          >
            <option value="all">Todas las prioridades</option>
            <option value="critica">🔥 Crítica</option>
            <option value="alta">⚡ Alta</option>
            <option value="media">🔹 Media</option>
            <option value="baja">🌱 Baja</option>
          </select>
        </div>
      </div>

      {tasksError && (
        <div className="tasks-sync-message error" role="alert">
          {tasksError}
        </div>
      )}

      {tasksLoading ? (
        <div className="tasks-sync-message glass-panel" role="status">
          <LoaderCircle size={18} className="animate-spin" />
          Cargando tus tareas...
        </div>
      ) : (
        <div className="tasks-list-grid">
          {filteredTasks.length === 0 ? (
            <div className="empty-state-large glass-panel">
              <CheckCircle2 size={44} className="empty-state-icon text-accent" />
              <h3>No hay tareas en esta vista</h3>
              <p>Todo está al día o no hay tareas que coincidan con los filtros seleccionados.</p>
              <button
                className="quick-add-btn"
                onClick={() => openModal('task', { dueDate: todayISO })}
              >
                <Plus size={16} />
                <span>Crear Nueva Tarea</span>
              </button>
            </div>
          ) : (
            filteredTasks.map((t) => <TaskItem key={t.id} task={t} />)
          )}
        </div>
      )}
    </div>
  );
};
