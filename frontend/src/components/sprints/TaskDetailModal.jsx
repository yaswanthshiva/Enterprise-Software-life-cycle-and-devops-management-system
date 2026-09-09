import React, { useState } from 'react';
import { taskApi } from '../../api/taskApi';
import { useAuth } from '../../context/AuthContext';
import {
  X,
  CheckSquare,
  Bookmark,
  User,
  Calendar,
  Layers,
  Flag,
  Trash2,
  AlertCircle,
  Clock,
  ArrowRight,
  ArrowLeft,
  Check
} from 'lucide-react';

export const TaskDetailModal = ({
  isOpen,
  onClose,
  task,
  onStatusChanged,
  onTaskDeleted
}) => {
  const { isAdmin, isProjectManager } = useAuth();
  const canDeleteTask = isAdmin || isProjectManager;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !task) return null;

  const handleStatusTransition = async (newStatus) => {
    setLoading(true);
    setError('');
    try {
      const res = await taskApi.updateTaskStatus(task.taskId, newStatus);
      if (res && res.data) {
        if (onStatusChanged) {
          onStatusChanged(task.taskId, newStatus);
        }
        onClose();
      }
    } catch (err) {
      console.error('Failed to transition task status:', err);
      setError(err.response?.data?.message || 'Failed to update task status.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Permanently delete task "${task.title}"?`)) return;
    setLoading(true);
    setError('');
    try {
      await taskApi.deleteTask(task.taskId);
      if (onTaskDeleted) {
        onTaskDeleted(task.taskId);
      }
      onClose();
    } catch (err) {
      console.error('Failed to delete task:', err);
      setError(err.response?.data?.message || 'Failed to delete task.');
    } finally {
      setLoading(false);
    }
  };

  const getPriorityBadge = (p) => {
    const pr = (p || '').toLowerCase();
    let bg = 'rgba(255, 255, 255, 0.05)';
    let color = 'var(--text-secondary)';
    let border = 'var(--border-subtle)';

    if (pr === 'critical') {
      bg = 'rgba(255, 51, 68, 0.15)';
      color = 'var(--danger)';
      border = 'rgba(255, 51, 68, 0.35)';
    } else if (pr === 'high') {
      bg = 'rgba(255, 107, 0, 0.15)';
      color = 'var(--primary)';
      border = 'rgba(255, 107, 0, 0.35)';
    } else if (pr === 'medium') {
      bg = 'rgba(245, 158, 11, 0.15)';
      color = '#f59e0b';
      border = 'rgba(245, 158, 11, 0.35)';
    }

    return (
      <span
        className="badge"
        style={{
          backgroundColor: bg,
          color,
          border: `1px solid ${border}`,
          fontSize: '0.75rem',
          fontWeight: '600',
        }}
      >
        {p || 'Medium'}
      </span>
    );
  };

  const getStatusBadge = (s) => {
    const st = (s || '').toLowerCase();
    let bg = 'rgba(255, 255, 255, 0.05)';
    let color = 'var(--text-secondary)';

    if (st.includes('progress')) {
      bg = 'rgba(59, 130, 246, 0.15)';
      color = '#3b82f6';
    } else if (st.includes('review')) {
      bg = 'rgba(168, 85, 247, 0.15)';
      color = '#a855f7';
    } else if (st.includes('done') || st.includes('completed')) {
      bg = 'rgba(16, 185, 129, 0.15)';
      color = 'var(--success)';
    }

    return (
      <span
        className="badge"
        style={{
          backgroundColor: bg,
          color,
          fontSize: '0.75rem',
          fontWeight: '600',
        }}
      >
        {s || 'To Do'}
      </span>
    );
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.85)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 110,
      padding: '20px',
    }}>
      <div className="glass-card animate-fade-in" style={{
        width: '100%',
        maxWidth: '680px',
        maxHeight: '90vh',
        overflowY: 'auto',
        padding: '28px',
        border: '1px solid var(--border-light)',
        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.9)',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          paddingBottom: '16px',
          borderBottom: '1px solid var(--border-subtle)',
          marginBottom: '20px',
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span style={{ fontFamily: 'monospace', fontSize: '0.85rem', color: 'var(--primary)' }}>
                TASK-00{task.taskId}
              </span>
              {getStatusBadge(task.status)}
              {getPriorityBadge(task.priority)}
            </div>
            <h2 style={{ fontSize: '1.3rem', margin: 0, color: 'var(--text-primary)' }}>
              {task.title}
            </h2>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '4px',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {error && (
          <div className="alert alert-error" style={{ marginBottom: '16px' }}>
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {/* Meta Pills Strip */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '12px',
          marginBottom: '20px',
          padding: '12px',
          backgroundColor: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-sm)',
        }}>
          {/* Sprint */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            <Layers size={14} color="var(--primary)" />
            <span>Sprint:</span>
            <strong style={{ color: 'var(--text-primary)' }}>{task.sprintName || 'Sprint Cycle'}</strong>
          </div>

          {/* User Story Link */}
          {task.storyTitle && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              <Bookmark size={14} color="var(--primary)" />
              <span>Story:</span>
              <strong style={{ color: 'var(--text-primary)' }}>
                {task.storyId ? `US-00${task.storyId}: ` : ''}{task.storyTitle}
              </strong>
            </div>
          )}

          {/* Due Date */}
          {task.dueDate && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              <Calendar size={14} color="var(--primary)" />
              <span>Due:</span>
              <strong style={{ color: 'var(--text-primary)' }}>{task.dueDate}</strong>
            </div>
          )}
        </div>

        {/* Description / Implementation Details */}
        <div style={{ marginBottom: '22px' }}>
          <label className="form-label" style={{ marginBottom: '8px' }}>
            Implementation Scope & Technical Specification
          </label>
          <div style={{
            padding: '16px',
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.9rem',
            lineHeight: '1.6',
            color: 'var(--text-primary)',
            whiteSpace: 'pre-wrap',
            minHeight: '80px',
          }}>
            {task.description || 'No technical notes recorded for this task.'}
          </div>
        </div>

        {/* Assigned Collaborator Card */}
        <div style={{
          marginBottom: '24px',
          padding: '14px 16px',
          backgroundColor: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-sm)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: 'var(--radius-xs)',
              backgroundColor: 'var(--primary-subtle)',
              border: '1px solid var(--border-focus)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--primary)',
              fontWeight: '700',
              fontSize: '0.85rem',
            }}>
              {task.assignedToName ? task.assignedToName.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <div style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-primary)' }}>
                {task.assignedToName || 'Unassigned'}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                {task.assignedToEmail || ''} {task.assignedToRole ? `• ${task.assignedToRole}` : ''}
              </div>
            </div>
          </div>

          <span className="badge" style={{ backgroundColor: 'rgba(255, 255, 255, 0.04)', color: 'var(--text-secondary)' }}>
            Allocated Engineer
          </span>
        </div>

        {/* Quick Kanban Column Progression Buttons */}
        <div style={{
          marginBottom: '20px',
          padding: '14px',
          backgroundColor: 'rgba(255, 107, 0, 0.04)',
          border: '1px solid rgba(255, 107, 0, 0.2)',
          borderRadius: 'var(--radius-sm)',
        }}>
          <label className="form-label" style={{ marginBottom: '10px', color: 'var(--primary)' }}>
            Quick Kanban State Progression
          </label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {task.status !== 'To Do' && (
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => handleStatusTransition('To Do')}
                disabled={loading}
              >
                <ArrowLeft size={13} /> Reset to To Do
              </button>
            )}

            {task.status !== 'In Progress' && (
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => handleStatusTransition('In Progress')}
                disabled={loading}
                style={{ borderColor: 'rgba(59, 130, 246, 0.4)', color: '#3b82f6' }}
              >
                <ArrowRight size={13} /> Move to In Progress
              </button>
            )}

            {task.status !== 'In Review' && (
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => handleStatusTransition('In Review')}
                disabled={loading}
                style={{ borderColor: 'rgba(168, 85, 247, 0.4)', color: '#a855f7' }}
              >
                <ArrowRight size={13} /> Request Code Review
              </button>
            )}

            {task.status !== 'Done' && (
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => handleStatusTransition('Done')}
                disabled={loading}
              >
                <Check size={13} /> Mark Task Done
              </button>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: '16px',
          borderTop: '1px solid var(--border-subtle)',
        }}>
          <div>
            {canDeleteTask && (
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={handleDelete}
                disabled={loading}
                style={{
                  color: 'var(--danger)',
                  borderColor: 'rgba(255, 51, 68, 0.35)',
                }}
              >
                <Trash2 size={14} /> Delete Task
              </button>
            )}
          </div>

          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskDetailModal;
