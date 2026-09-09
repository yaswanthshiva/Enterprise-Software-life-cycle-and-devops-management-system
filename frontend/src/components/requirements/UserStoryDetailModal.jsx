import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { requirementApi } from '../../api/requirementApi';
import {
  X,
  BookmarkCheck,
  Calendar,
  Layers,
  CheckCircle2,
  Clock,
  Edit3,
  Trash2,
  Shield,
  AlertCircle,
  FileText
} from 'lucide-react';

export const UserStoryDetailModal = ({
  isOpen,
  onClose,
  story,
  onStatusUpdated,
  onEditRequested,
  onDeleteRequested,
}) => {
  const { canManageRequirements, canUpdateStoryStatus, user } = useAuth();
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  if (!isOpen || !story) return null;

  const handleStatusChange = async (newStatus) => {
    if (!newStatus || newStatus === story.status || statusUpdating) return;
    setStatusUpdating(true);
    setStatusMessage('');

    try {
      const res = await requirementApi.updateUserStoryStatus(story.storyId, newStatus);
      if (res && res.data) {
        setStatusMessage(`Status transitioned to "${newStatus}"`);
        onStatusUpdated(res.data);
        setTimeout(() => setStatusMessage(''), 3000);
      }
    } catch (err) {
      console.error('Failed to update status:', err);
      alert(err.response?.data?.message || 'Failed to update user story status.');
    } finally {
      setStatusUpdating(false);
    }
  };

  const getPriorityBadge = (p) => {
    switch ((p || '').toUpperCase()) {
      case 'HIGH':
      case 'CRITICAL':
        return <span className="badge" style={{ background: 'var(--danger-bg)', color: '#ff6b7d', border: '1px solid var(--danger-border)' }}>High Priority</span>;
      case 'LOW':
        return <span className="badge" style={{ color: 'var(--text-muted)' }}>Low Priority</span>;
      default:
        return <span className="badge badge-pm">Medium Priority</span>;
    }
  };

  const getStatusBadge = (s) => {
    switch ((s || '').toUpperCase()) {
      case 'COMPLETED':
      case 'DONE':
        return <span className="badge badge-active">Completed</span>;
      case 'IN PROGRESS':
      case 'IN_PROGRESS':
        return <span className="badge" style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', border: '1px solid rgba(56, 189, 248, 0.3)' }}>In Progress</span>;
      case 'APPROVED':
        return <span className="badge badge-pm">Approved</span>;
      default:
        return <span className="badge" style={{ color: 'var(--text-muted)' }}>Draft</span>;
    }
  };

  // Parse acceptance criteria bullet points
  const criteriaList = (story.acceptanceCriteria || '')
    .split('\n')
    .map((c) => c.trim().replace(/^[•\-\*]\s*/, ''))
    .filter((c) => c.length > 0);

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
        maxWidth: '640px',
        padding: '30px',
        border: '1px solid var(--border-light)',
        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.8)',
        maxHeight: '90vh',
        overflowY: 'auto',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          marginBottom: '18px',
          borderBottom: '1px solid var(--border-subtle)',
          paddingBottom: '16px',
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span className="badge" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--primary)', borderColor: 'var(--border-focus)' }}>
                STORY-00{story.storyId}
              </span>
              <span className="badge" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', background: 'rgba(255, 107, 0, 0.12)', color: 'var(--primary)' }}>
                {story.storyPoints || 3} Story Points
              </span>
              {getPriorityBadge(story.priority)}
            </div>
            <h2 style={{ fontSize: '1.4rem', margin: 0, lineHeight: 1.3 }}>
              {story.storyTitle}
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px', color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
              <FileText size={14} color="var(--primary)" />
              <span>Parent PRD: <strong>{story.requirementTitle || `REQ #${story.requirementId}`}</strong></span>
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
            <X size={20} />
          </button>
        </div>

        {/* Status notification */}
        {statusMessage && (
          <div className="alert alert-success" style={{ marginBottom: '16px' }}>
            <CheckCircle2 size={16} />
            <span>{statusMessage}</span>
          </div>
        )}

        {/* Execution Status Switcher */}
        <div className="glass-card" style={{
          padding: '14px 18px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid var(--border-subtle)',
        }}>
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Execution Lifecycle
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
              {getStatusBadge(story.status)}
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                {canUpdateStoryStatus ? '(Developer / PM clearance)' : '(Read-Only)'}
              </span>
            </div>
          </div>

          {canUpdateStoryStatus ? (
            <select
              className="form-select"
              value={story.status || 'Draft'}
              onChange={(e) => handleStatusChange(e.target.value)}
              disabled={statusUpdating}
              style={{
                width: 'auto',
                minWidth: '150px',
                fontSize: '0.85rem',
                borderColor: 'var(--border-focus)',
                color: 'var(--primary)',
                fontWeight: '600',
              }}
            >
              <option value="Draft">Draft</option>
              <option value="Approved">Approved</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          ) : (
            <span className="badge" style={{ color: 'var(--text-muted)' }}>
              <Shield size={12} style={{ marginRight: '4px' }} />
              {user?.role} (Read-Only)
            </span>
          )}
        </div>

        {/* Acceptance Criteria Breakdown */}
        <div style={{ marginBottom: '24px' }}>
          <h4 style={{
            fontSize: '0.9rem',
            color: 'var(--text-secondary)',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            marginBottom: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <BookmarkCheck size={16} color="var(--primary)" />
            Acceptance Criteria (Verification Checklist)
          </h4>

          {criteriaList.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {criteriaList.map((criterion, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '10px',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-xs)',
                    backgroundColor: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid var(--border-subtle)',
                    fontSize: '0.88rem',
                    lineHeight: '1.5',
                  }}
                >
                  <span style={{
                    color: 'var(--primary)',
                    fontFamily: 'var(--font-mono)',
                    fontWeight: '700',
                    fontSize: '0.8rem',
                    minWidth: '22px'
                  }}>
                    #{idx + 1}
                  </span>
                  <span style={{ color: 'var(--text-primary)' }}>{criterion}</span>
                </div>
              ))}
            </div>
          ) : (
            <div style={{
              padding: '20px',
              textAlign: 'center',
              color: 'var(--text-muted)',
              fontSize: '0.85rem',
              backgroundColor: 'rgba(255, 255, 255, 0.02)',
              borderRadius: 'var(--radius-xs)',
            }}>
              No acceptance criteria specified for this user story.
            </div>
          )}
        </div>

        {/* Metadata Footer & Actions */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderTop: '1px solid var(--border-subtle)',
          paddingTop: '18px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            <Calendar size={14} />
            <span>Created: {story.createdAt ? new Date(story.createdAt).toLocaleDateString() : 'Active'}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {canManageRequirements && (
              <>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => {
                    onClose();
                    onEditRequested(story);
                  }}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  <Edit3 size={14} />
                  Edit Scope
                </button>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => {
                    onClose();
                    onDeleteRequested(story);
                  }}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    borderColor: 'rgba(255, 51, 68, 0.4)',
                    color: 'var(--danger)',
                  }}
                >
                  <Trash2 size={14} />
                  Delete
                </button>
              </>
            )}
            <button className="btn btn-secondary btn-sm" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserStoryDetailModal;
