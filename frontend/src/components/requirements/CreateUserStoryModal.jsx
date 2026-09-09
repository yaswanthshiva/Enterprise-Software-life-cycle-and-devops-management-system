import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { requirementApi } from '../../api/requirementApi';
import { X, BookmarkPlus, AlertCircle, ShieldAlert } from 'lucide-react';

export const CreateUserStoryModal = ({
  isOpen,
  onClose,
  requirementId: initialReqId,
  requirements = [],
  onStoryCreated,
}) => {
  const { canManageRequirements, user } = useAuth();
  const [selectedReqId, setSelectedReqId] = useState(initialReqId || '');
  const [storyTitle, setStoryTitle] = useState('');
  const [acceptanceCriteria, setAcceptanceCriteria] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [storyPoints, setStoryPoints] = useState(3);
  const [status, setStatus] = useState('Draft');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fibonacciPoints = [1, 2, 3, 5, 8, 13];

  useEffect(() => {
    if (initialReqId) {
      setSelectedReqId(String(initialReqId));
    } else if (requirements.length > 0 && !selectedReqId) {
      setSelectedReqId(String(requirements[0].requirementId));
    }
  }, [initialReqId, requirements]);

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
            Only Project Managers, Business Analysts, and Administrators can create User Stories in the Product Backlog.
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
    if (!selectedReqId) {
      setError('Please select a parent Requirement for this User Story.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const res = await requirementApi.createUserStory(Number(selectedReqId), {
        storyTitle: storyTitle.trim(),
        acceptanceCriteria: acceptanceCriteria.trim(),
        priority,
        storyPoints: Number(storyPoints),
        status,
      });

      if (res && res.data) {
        onStoryCreated(res.data);
        setStoryTitle('');
        setAcceptanceCriteria('');
        setPriority('Medium');
        setStoryPoints(3);
        setStatus('Draft');
        onClose();
      }
    } catch (err) {
      console.error('Failed to create user story:', err);
      let msg = err.response?.data?.message || err.message || 'Failed to create user story.';
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
        maxWidth: '580px',
        padding: '28px',
        border: '1px solid var(--border-light)',
        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.8)',
        maxHeight: '90vh',
        overflowY: 'auto',
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
              <BookmarkPlus size={18} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Add User Story</h2>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Decompose PRD into actionable engineering backlog story
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
          {/* Parent Requirement */}
          <div className="form-group">
            <label className="form-label" htmlFor="story-parent-req">
              Parent PRD Requirement <span style={{ color: 'var(--danger)' }}>*</span>
            </label>
            <select
              id="story-parent-req"
              className="form-select"
              value={selectedReqId}
              onChange={(e) => setSelectedReqId(e.target.value)}
              required
            >
              {requirements.map((r) => (
                <option key={r.requirementId} value={r.requirementId}>
                  REQ-00{r.requirementId}: {r.title}
                </option>
              ))}
            </select>
          </div>

          {/* Story Title */}
          <div className="form-group">
            <label className="form-label" htmlFor="story-title">
              User Story Title <span style={{ color: 'var(--danger)' }}>*</span>
            </label>
            <input
              id="story-title"
              type="text"
              className="form-input"
              placeholder="e.g. As a developer, I want token refresh so my session doesn't expire"
              value={storyTitle}
              onChange={(e) => setStoryTitle(e.target.value)}
              required
              minLength={2}
              maxLength={200}
            />
          </div>

          {/* Acceptance Criteria */}
          <div className="form-group">
            <label className="form-label" htmlFor="story-acceptance">
              Acceptance Criteria (Checklist)
            </label>
            <textarea
              id="story-acceptance"
              className="form-input"
              rows={4}
              placeholder={"• Given user is authenticated, when token has 5m remaining, then silent refresh occurs\n• Response code 200 with renewed JWT\n• Edge case: Network outage triggers graceful prompt"}
              value={acceptanceCriteria}
              onChange={(e) => setAcceptanceCriteria(e.target.value)}
            />
          </div>

          {/* Fibonacci Story Points Selector */}
          <div className="form-group">
            <label className="form-label">
              Agile Story Points (Fibonacci Estimation)
            </label>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {fibonacciPoints.map((pts) => {
                const selected = Number(storyPoints) === pts;
                return (
                  <button
                    key={pts}
                    type="button"
                    onClick={() => setStoryPoints(pts)}
                    style={{
                      padding: '6px 14px',
                      borderRadius: 'var(--radius-xs)',
                      background: selected ? 'var(--primary-subtle)' : 'rgba(255, 255, 255, 0.04)',
                      border: selected ? '1px solid var(--primary)' : '1px solid var(--border-subtle)',
                      color: selected ? 'var(--primary)' : 'var(--text-secondary)',
                      fontWeight: '700',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.9rem',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {pts} pt{pts > 1 ? 's' : ''}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Priority & Status */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '22px' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" htmlFor="story-priority">Priority</label>
              <select
                id="story-priority"
                className="form-select"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
              >
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" htmlFor="story-status">Initial Status</label>
              <select
                id="story-status"
                className="form-select"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="Draft">Draft</option>
                <option value="Approved">Approved</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
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
              disabled={loading || !storyTitle.trim()}
              id="btn-submit-story"
            >
              {loading ? 'Creating...' : 'Create Story'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateUserStoryModal;
