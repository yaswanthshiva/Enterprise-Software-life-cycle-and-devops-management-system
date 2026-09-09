import React, { useState, useEffect } from 'react';
import { taskApi } from '../../api/taskApi';
import { requirementApi } from '../../api/requirementApi';
import { authApi } from '../../api/authApi';
import {
  X,
  CheckSquare,
  Bookmark,
  User,
  AlertCircle,
  Calendar,
  Layers,
  Flag
} from 'lucide-react';

export const CreateTaskModal = ({
  isOpen,
  onClose,
  projectId,
  currentSprintId,
  sprints = [],
  onTaskCreated
}) => {
  const [sprintId, setSprintId] = useState(currentSprintId || '');
  const [storyId, setStoryId] = useState('');
  const [assignedToUserId, setAssignedToUserId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [status, setStatus] = useState('To Do');
  const [dueDate, setDueDate] = useState('');

  // Dropdown lists
  const [stories, setStories] = useState([]);
  const [users, setUsers] = useState([]);
  const [loadingDependencies, setLoadingDependencies] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setSprintId(currentSprintId || (sprints.length > 0 ? sprints[0].sprintId : ''));
      setTitle('');
      setDescription('');
      setPriority('Medium');
      setStatus('To Do');
      setDueDate('');
      setStoryId('');
      setError('');
      loadStoriesAndUsers();
    }
  }, [isOpen, currentSprintId, projectId]);

  const loadStoriesAndUsers = async () => {
    setLoadingDependencies(true);
    try {
      const [storyRes, userRes] = await Promise.all([
        projectId ? requirementApi.getProductBacklog(projectId) : Promise.resolve({ data: [] }),
        authApi.getActiveUsers()
      ]);

      if (storyRes && storyRes.data) {
        setStories(storyRes.data);
      }
      if (userRes && userRes.data) {
        setUsers(userRes.data);
        if (!assignedToUserId && userRes.data.length > 0) {
          setAssignedToUserId(String(userRes.data[0].userId));
        }
      }
    } catch (err) {
      console.error('Failed to load stories or users for task modal:', err);
    } finally {
      setLoadingDependencies(false);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please provide a task title.');
      return;
    }
    if (!sprintId) {
      setError('A target sprint milestone must be selected.');
      return;
    }
    if (!assignedToUserId) {
      setError('Please assign this task to an active team engineer.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const payload = {
        sprintId: Number(sprintId),
        storyId: storyId ? Number(storyId) : null,
        assignedToUserId: Number(assignedToUserId),
        title: title.trim(),
        description: description.trim(),
        priority,
        status,
        dueDate: dueDate || null,
      };

      const res = await taskApi.createTask(payload);
      if (res && res.data) {
        if (onTaskCreated) {
          onTaskCreated(res.data);
        }
        onClose();
      }
    } catch (err) {
      console.error('Failed to create task:', err);
      let msg = err.response?.data?.message || err.message || 'Failed to initialize task.';
      if (err.response?.data?.errors && Array.isArray(err.response.data.errors)) {
        msg = err.response.data.errors.join(' | ');
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
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
        maxWidth: '640px',
        maxHeight: '90vh',
        overflowY: 'auto',
        padding: '28px',
        border: '1px solid var(--border-light)',
        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.9)',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingBottom: '16px',
          borderBottom: '1px solid var(--border-subtle)',
          marginBottom: '20px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--primary-subtle)',
              border: '1px solid var(--border-focus)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--primary)',
            }}>
              <CheckSquare size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Create Engineering Task</h2>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Decompose user stories into trackable Kanban items
              </span>
            </div>
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

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Sprint & User Story Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div>
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Layers size={14} color="var(--primary)" />
                Target Sprint *
              </label>
              <select
                className="form-select"
                value={sprintId}
                onChange={(e) => setSprintId(e.target.value)}
                disabled={loading}
              >
                {sprints.map((s) => (
                  <option key={s.sprintId} value={s.sprintId}>
                    {s.sprintName} ({s.status})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Bookmark size={14} color="var(--primary)" />
                Linked User Story
              </label>
              <select
                className="form-select"
                value={storyId}
                onChange={(e) => setStoryId(e.target.value)}
                disabled={loading || loadingDependencies}
              >
                <option value="">-- Standalone Task / Technical Debt --</option>
                {stories.map((st) => (
                  <option key={st.storyId} value={st.storyId}>
                    US-00{st.storyId}: {st.storyTitle} ({st.storyPoints || 0} pts)
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Task Title */}
          <div>
            <label className="form-label">Task Title *</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Implement JWT refresh token interceptor and blacklist table"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={loading}
              autoFocus
            />
          </div>

          {/* Task Description */}
          <div>
            <label className="form-label">Technical Implementation Notes / Steps</label>
            <textarea
              className="form-input"
              rows={3}
              placeholder="Specify technical details, files to touch, or pull request acceptance requirements..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={loading}
              style={{ resize: 'vertical' }}
            />
          </div>

          {/* Assignee & Priority Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div>
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <User size={14} color="var(--primary)" />
                Assignee *
              </label>
              <select
                className="form-select"
                value={assignedToUserId}
                onChange={(e) => setAssignedToUserId(e.target.value)}
                disabled={loading || loadingDependencies}
              >
                {users.map((u) => (
                  <option key={u.userId} value={u.userId}>
                    {u.name} ({u.role}) - {u.email}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Flag size={14} color="var(--primary)" />
                Priority
              </label>
              <select
                className="form-select"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                disabled={loading}
              >
                <option value="Critical">Critical (Immediate Blocker)</option>
                <option value="High">High Priority</option>
                <option value="Medium">Medium Priority</option>
                <option value="Low">Low Priority</option>
              </select>
            </div>
          </div>

          {/* Status & Due Date Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div>
              <label className="form-label">Initial Kanban Column</label>
              <select
                className="form-select"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                disabled={loading}
              >
                <option value="To Do">To Do</option>
                <option value="In Progress">In Progress</option>
                <option value="In Review">In Review</option>
                <option value="Done">Done</option>
              </select>
            </div>

            <div>
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Calendar size={14} color="var(--primary)" />
                Due Date
              </label>
              <input
                type="date"
                className="form-input"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '12px',
            marginTop: '10px',
            paddingTop: '16px',
            borderTop: '1px solid var(--border-subtle)',
          }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Creating Task...' : 'Allocate Task to Kanban'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTaskModal;
