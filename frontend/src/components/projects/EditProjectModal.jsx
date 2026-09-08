import React, { useState, useEffect } from 'react';
import { projectApi } from '../../api/projectApi';
import { X, Edit3, AlertCircle } from 'lucide-react';

export const EditProjectModal = ({ isOpen, project, onClose, onProjectUpdated }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('Active');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (project) {
      setName(project.name || '');
      setDescription(project.description || '');
      setStatus(project.status || 'Active');
      setError('');
    }
  }, [project]);

  if (!isOpen || !project) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await projectApi.updateProject(project.projectId, {
        name: name.trim(),
        description: description.trim(),
        status,
      });

      if (res && res.data) {
        onProjectUpdated(res.data);
        onClose();
      }
    } catch (err) {
      console.error('Failed to update project:', err);
      let msg = err.response?.data?.message || err.message || 'Failed to update project.';
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
        maxWidth: '520px',
        padding: '28px',
        border: '1px solid var(--border-light)',
        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.8)',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: 'var(--radius-sm)',
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
              <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Edit Governance Details</h2>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Project #{project.projectId}</span>
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

        {/* Error notification */}
        {error && (
          <div className="alert alert-error">
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="editProjectName">Project Name *</label>
            <input
              id="editProjectName"
              type="text"
              className="form-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              minLength={2}
              maxLength={150}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="editProjectDesc">Description / Scope</label>
            <textarea
              id="editProjectDesc"
              className="form-textarea"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{ resize: 'vertical' }}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="editProjectStatus">Lifecycle State</label>
            <select
              id="editProjectStatus"
              className="form-select"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="Planning">Planning</option>
              <option value="Active">Active</option>
              <option value="In Progress">In Progress</option>
              <option value="On Hold">On Hold</option>
              <option value="Completed">Completed</option>
              <option value="Archived">Archived</option>
            </select>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '24px' }}>
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
              disabled={loading || !name.trim()}
            >
              {loading ? 'Saving Changes...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProjectModal;
