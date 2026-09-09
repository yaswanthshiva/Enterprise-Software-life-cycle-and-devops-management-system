import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { requirementApi } from '../../api/requirementApi';
import { X, FilePlus, AlertCircle, ShieldAlert } from 'lucide-react';

export const CreateRequirementModal = ({ isOpen, onClose, projectId, projectName, onRequirementCreated }) => {
  const { canManageRequirements, user } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [status, setStatus] = useState('Draft');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  if (!canManageRequirements) {
    return (
      <div style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
        padding: '20px',
      }}>
        <div className="glass-card animate-fade-in" style={{
          width: '100%',
          maxWidth: '480px',
          padding: '28px',
          border: '1px solid rgba(255, 51, 68, 0.4)',
          textAlign: 'center',
        }}>
          <ShieldAlert size={40} color="var(--danger)" style={{ marginBottom: '14px' }} />
          <h3 style={{ marginBottom: '8px' }}>Access Restricted</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: '20px' }}>
            Only Project Managers, Business Analysts, and System Administrators hold clearance to author PRD specifications.
            Your current role ({user?.role || 'User'}) has Read-Only view access.
          </p>
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!projectId) {
      setError('A valid project must be selected to create a requirement.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const res = await requirementApi.createRequirement(projectId, {
        title: title.trim(),
        description: description.trim(),
        priority,
        status,
      });

      if (res && res.data) {
        onRequirementCreated(res.data);
        setTitle('');
        setDescription('');
        setPriority('Medium');
        setStatus('Draft');
        onClose();
      }
    } catch (err) {
      console.error('Failed to create requirement:', err);
      let msg = err.response?.data?.message || err.message || 'Failed to create requirement.';
      if (err.response?.data?.errors && Array.isArray(err.response.data.errors) && err.response.data.errors.length > 0) {
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
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
      padding: '20px',
    }}>
      <div className="glass-card animate-fade-in" style={{
        width: '100%',
        maxWidth: '560px',
        padding: '28px',
        border: '1px solid var(--border-light)',
        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.8)',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '20px',
          borderBottom: '1px solid var(--border-subtle)',
          paddingBottom: '14px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
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
            }}>
              <FilePlus size={18} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', margin: 0 }}>New Requirement / PRD</h2>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Target Project: <strong>{projectName || `Project #${projectId}`}</strong>
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
              padding: '6px',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {error && (
          <div className="alert alert-error" style={{ marginBottom: '16px' }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="req-title">
              Requirement Title <span style={{ color: 'var(--danger)' }}>*</span>
            </label>
            <input
              id="req-title"
              type="text"
              className="form-input"
              placeholder="e.g. Multi-Factor Biometric Authentication Gateway"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              minLength={2}
              maxLength={200}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="req-description">
              Specification Scope & Narrative
            </label>
            <textarea
              id="req-description"
              className="form-input"
              rows={4}
              placeholder="Detail functional behavior, security guardrails, performance SLAs, or non-functional criteria..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '22px' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" htmlFor="req-priority">Priority Matrix</label>
              <select
                id="req-priority"
                className="form-select"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
              >
                <option value="High">High Priority</option>
                <option value="Medium">Medium Priority</option>
                <option value="Low">Low Priority</option>
              </select>
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" htmlFor="req-status">Lifecycle State</label>
              <select
                id="req-status"
                className="form-select"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="Draft">Draft</option>
                <option value="Under Review">Under Review</option>
                <option value="Approved">Approved</option>
                <option value="Implemented">Implemented</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
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
              disabled={loading || !title.trim()}
              id="btn-submit-requirement"
            >
              {loading ? 'Initializing...' : 'Create Requirement'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateRequirementModal;
