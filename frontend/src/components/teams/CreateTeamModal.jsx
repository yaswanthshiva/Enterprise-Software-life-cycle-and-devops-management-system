import React, { useState } from 'react';
import { teamApi } from '../../api/teamApi';
import { X, Users2, AlertCircle } from 'lucide-react';

export const CreateTeamModal = ({ isOpen, onClose, projectId, projectName, onTeamCreated }) => {
  const [teamName, setTeamName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!projectId) {
      setError('A valid project must be selected to create a team pod.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const res = await teamApi.createTeam(projectId, {
        teamName: teamName.trim(),
        description: description.trim(),
      });

      if (res && res.data) {
        onTeamCreated(res.data);
        setTeamName('');
        setDescription('');
        onClose();
      }
    } catch (err) {
      console.error('Failed to create team:', err);
      let msg = err.response?.data?.message || err.message || 'Failed to create team pod.';
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
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
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
        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.85)',
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
              <Users2 size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Form Engineering Pod</h2>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Project: <strong style={{ color: 'var(--text-primary)' }}>{projectName || `PRJ-00${projectId}`}</strong>
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
            <label className="form-label" htmlFor="teamName">Pod / Team Name *</label>
            <input
              id="teamName"
              type="text"
              className="form-input"
              placeholder="e.g. AI Intelligence Guild, Platform Core Pod"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              required
              minLength={2}
              maxLength={100}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="teamDesc">Charter & Scope Description</label>
            <textarea
              id="teamDesc"
              className="form-textarea"
              rows={4}
              placeholder="Define functional responsibilities, architectural focus, and sprint domains..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{ resize: 'vertical' }}
            />
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
              disabled={loading || !teamName.trim()}
            >
              {loading ? 'Creating Pod...' : 'Create Team Pod'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTeamModal;
