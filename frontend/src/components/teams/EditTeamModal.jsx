import React, { useState, useEffect } from 'react';
import { teamApi } from '../../api/teamApi';
import { X, Edit3, AlertCircle } from 'lucide-react';

export const EditTeamModal = ({ isOpen, onClose, team, onTeamUpdated }) => {
  const [teamName, setTeamName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (team) {
      setTeamName(team.teamName || '');
      setDescription(team.description || '');
      setError('');
    }
  }, [team]);

  if (!isOpen || !team) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await teamApi.updateTeam(team.teamId, {
        teamName: teamName.trim(),
        description: description.trim(),
      });

      if (res && res.data) {
        onTeamUpdated(res.data);
        onClose();
      }
    } catch (err) {
      console.error('Failed to update team:', err);
      let msg = err.response?.data?.message || err.message || 'Failed to update team details.';
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
              <Edit3 size={18} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Modify Pod Charter</h2>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Team ID: TM-00{team.teamId}
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
            <label className="form-label" htmlFor="editTeamName">Team Name *</label>
            <input
              id="editTeamName"
              type="text"
              className="form-input"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              required
              minLength={2}
              maxLength={100}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="editTeamDesc">Scope & Charter</label>
            <textarea
              id="editTeamDesc"
              className="form-textarea"
              rows={4}
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
              {loading ? 'Saving Changes...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditTeamModal;
