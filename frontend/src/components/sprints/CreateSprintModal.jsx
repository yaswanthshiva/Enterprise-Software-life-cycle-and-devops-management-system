import React, { useState } from 'react';
import { sprintApi } from '../../api/sprintApi';
import {
  X,
  Zap,
  Calendar,
  Flag,
  Target,
  AlertCircle
} from 'lucide-react';

export const CreateSprintModal = ({ isOpen, onClose, projectId, onSprintCreated }) => {
  const todayStr = new Date().toISOString().split('T')[0];
  const defaultEnd = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const [sprintName, setSprintName] = useState('');
  const [goal, setGoal] = useState('');
  const [startDate, setStartDate] = useState(todayStr);
  const [endDate, setEndDate] = useState(defaultEnd);
  const [status, setStatus] = useState('Planned');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!sprintName.trim()) {
      setError('Please provide a descriptive sprint milestone name.');
      return;
    }
    if (!startDate || !endDate) {
      setError('Start date and target completion date are required.');
      return;
    }
    if (new Date(endDate) <= new Date(startDate)) {
      setError('End date must be scheduled after the start date.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const payload = {
        sprintName: sprintName.trim(),
        goal: goal.trim(),
        startDate,
        endDate,
        status,
      };

      const res = await sprintApi.createSprint(projectId, payload);
      if (res && res.data) {
        if (onSprintCreated) {
          onSprintCreated(res.data);
        }
        handleClose();
      }
    } catch (err) {
      console.error('Failed to create sprint:', err);
      let msg = err.response?.data?.message || err.message || 'Failed to initialize sprint.';
      if (err.response?.data?.errors && Array.isArray(err.response.data.errors)) {
        msg = err.response.data.errors.join(' | ');
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSprintName('');
    setGoal('');
    setStartDate(todayStr);
    setEndDate(defaultEnd);
    setStatus('Planned');
    setError('');
    onClose();
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
              <Zap size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Initialize Sprint Milestone</h2>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Timeboxed engineering cycle & velocity window
              </span>
            </div>
          </div>

          <button
            onClick={handleClose}
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
          {/* Sprint Name */}
          <div>
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Flag size={14} color="var(--primary)" />
              Sprint Designation *
            </label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Sprint 1 - Authentication & Team Workspaces"
              value={sprintName}
              onChange={(e) => setSprintName(e.target.value)}
              disabled={loading}
              autoFocus
            />
          </div>

          {/* Sprint Goal */}
          <div>
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Target size={14} color="var(--primary)" />
              Sprint Goal / Mission Target
            </label>
            <textarea
              className="form-input"
              rows={3}
              placeholder="Primary engineering objectives and deliverables for this sprint..."
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              disabled={loading}
              style={{ resize: 'vertical' }}
            />
          </div>

          {/* Dates Row */}
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
                Target End Date *
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

          {/* Initial Status */}
          <div>
            <label className="form-label">Initial Lifecycle Status</label>
            <select
              className="form-select"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              disabled={loading}
            >
              <option value="Planned">Planned (Backlog preparation)</option>
              <option value="Active">Active (Launch immediately)</option>
            </select>
          </div>

          {/* Footer Actions */}
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
              onClick={handleClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Initializing...' : 'Create Sprint'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateSprintModal;
