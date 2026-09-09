import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { requirementApi } from '../../api/requirementApi';
import { X, Edit3, AlertCircle, ShieldAlert } from 'lucide-react';

export const EditRequirementModal = ({ isOpen, onClose, requirement, onRequirementUpdated }) => {
  const { canManageRequirements, user } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [status, setStatus] = useState('Draft');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (requirement) {
      setTitle(requirement.title || '');
      setDescription(requirement.description || '');
      setPriority(requirement.priority || 'Medium');
      setStatus(requirement.status || 'Draft');
      setError('');
    }
  }, [requirement]);

  if (!isOpen || !requirement) return null;

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
            Only Project Managers, Business Analysts, and Administrators can modify PRD requirements.
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
    setError('');
    setLoading(true);

    try {
      const res = await requirementApi.updateRequirement(requirement.requirementId, {
        title: title.trim(),
        description: description.trim(),
        priority,
        status,
      });

      if (res && res.data) {
        onRequirementUpdated(res.data);
        onClose();
      }
    } catch (err) {
      console.error('Failed to update requirement:', err);
      let msg = err.response?.data?.message || err.message || 'Failed to update requirement.';
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
              <Edit3 size={18} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Edit Requirement</h2>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                REQ-00{requirement.requirementId} • {requirement.projectName}
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
            <label className="form-label" htmlFor="edit-req-title">
              Requirement Title <span style={{ color: 'var(--danger)' }}>*</span>
            </label>
            <input
              id="edit-req-title"
              type="text"
              className="form-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              minLength={2}
              maxLength={200}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="edit-req-description">
              Specification Scope & Narrative
            </label>
            <textarea
              id="edit-req-description"
              className="form-input"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '22px' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" htmlFor="edit-req-priority">Priority Matrix</label>
              <select
                id="edit-req-priority"
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
              <label className="form-label" htmlFor="edit-req-status">Lifecycle State</label>
              <select
                id="edit-req-status"
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
              id="btn-update-requirement"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditRequirementModal;
