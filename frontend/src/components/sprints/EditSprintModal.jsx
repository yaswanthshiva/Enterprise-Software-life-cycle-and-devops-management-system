import React, { useState, useEffect } from 'react';
import { sprintApi } from '../../api/sprintApi';
import {
  X,
  Edit3,
  Calendar,
  Flag,
  Target,
  AlertCircle
} from 'lucide-react';

export const EditSprintModal = ({ isOpen, onClose, sprint, onSprintUpdated }) => {
  const [sprintName, setSprintName] = useState('');
  const [goal, setGoal] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [status, setStatus] = useState('Planned');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (sprint) {
      setSprintName(sprint.sprintName || '');
      setGoal(sprint.goal || '');
      setStartDate(sprint.startDate ? sprint.startDate.split('T')[0] : '');
      setEndDate(sprint.endDate ? sprint.endDate.split('T')[0] : '');
      setStatus(sprint.status || 'Planned');
      setError('');
    }
  }, [sprint, isOpen]);

  if (!isOpen || !sprint) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!sprintName.trim()) {
      setError('Sprint name is required.');
      return;
    }
    if (!startDate || !endDate) {
      setError('Start date and end date are required.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const payload = {
        sprintName: sprintName.trim(),
        goal: goal.trim(),
        status,
        startDate,
        endDate,
      };

      const res = await sprintApi.updateSprint(sprint.sprintId, payload);
      if (res && res.data) {
        if (onSprintUpdated) {
          onSprintUpdated(res.data);
        }
        onClose();
      }
    } catch (err) {
      console.error('Failed to update sprint:', err);
      let msg = err.response?.data?.message || err.message || 'Failed to update sprint details.';
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
        maxWidth: '560px',
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
              <Edit3 size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Configure Sprint Milestone</h2>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Update milestone window & delivery status
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
          <div>
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Flag size={14} color="var(--primary)" />
              Sprint Name *
            </label>
            <input
              type="text"
              className="form-input"
              value={sprintName}
              onChange={(e) => setSprintName(e.target.value)}
              disabled={loading}
              autoFocus
            />
          </div>

          <div>
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Target size={14} color="var(--primary)" />
              Sprint Goal
            </label>
            <textarea
              className="form-input"
              rows={3}
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              disabled={loading}
              style={{ resize: 'vertical' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div>
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Calendar size={14} color="var(--primary)" />
                Start Date *
              </label>
              <input
                type="date"
                className="form-input"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                disabled={loading}
              />
            </div>

            <div>
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Calendar size={14} color="var(--primary)" />
                End Date *
              </label>
              <input
                type="date"
                className="form-input"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <label className="form-label">Lifecycle Status</label>
            <select
              className="form-select"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              disabled={loading}
            >
              <option value="Planned">Planned</option>
              <option value="Active">Active</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '12px',
            marginTop: '8px',
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
              {loading ? 'Saving...' : 'Update Sprint'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditSprintModal;
