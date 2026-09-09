import React, { useState, useEffect } from 'react';
import { teamApi } from '../../api/teamApi';
import { authApi } from '../../api/authApi';
import {
  X,
  Users2,
  UserPlus,
  Trash2,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Shield,
  Briefcase,
  Lock
} from 'lucide-react';

export const TeamMembersModal = ({ isOpen, onClose, team, canManage, onMemberCountChanged }) => {
  const [members, setMembers] = useState([]);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Add Member Form
  const [selectedUserId, setSelectedUserId] = useState('');
  const [roleInTeam, setRoleInTeam] = useState('Developer');

  const teamRoles = [
    'Developer',
    'Tech Lead',
    'Tester',
    'QA Lead',
    'DevOps Engineer',
    'Business Analyst',
    'Scrum Master',
    'Architect'
  ];

  const fetchMembersAndUsers = async () => {
    if (!team) return;
    setLoading(true);
    setError('');
    try {
      // 1. Fetch team roster (accessible to all authenticated roles including Developers)
      const membersRes = await teamApi.getTeamMembers(team.teamId);
      if (membersRes && membersRes.data) {
        setMembers(membersRes.data);
        if (onMemberCountChanged) {
          onMemberCountChanged(membersRes.data.length);
        }
      }

      // 2. Fetch user directory ONLY if current user has management permissions (Admin / PM)
      if (canManage) {
        try {
          const usersRes = await authApi.getAllUsers();
          if (usersRes && usersRes.data) {
            setAvailableUsers(usersRes.data);
          }
        } catch (uErr) {
          console.warn('Could not load user directory for allocation:', uErr);
        }
      }
    } catch (err) {
      console.error('Failed to load team roster:', err);
      setError('Unable to load team members.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && team) {
      fetchMembersAndUsers();
      setSelectedUserId('');
      setRoleInTeam('Developer');
      setSuccessMsg('');
    }
  }, [isOpen, team]);

  if (!isOpen || !team) return null;

  // Filter out users who are already members
  const memberUserIds = new Set(members.map((m) => m.userId));
  const unassignedUsers = availableUsers.filter((u) => !memberUserIds.has(u.userId));

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!canManage) {
      setError('Access Restricted: Only Project Managers and Admins can allocate engineers to pods.');
      return;
    }
    if (!selectedUserId) {
      setError('Please select an engineer to allocate to this pod.');
      return;
    }
    setError('');
    setAdding(true);

    try {
      const res = await teamApi.addMemberToTeam(team.teamId, {
        userId: Number(selectedUserId),
        roleInTeam: roleInTeam.trim(),
      });

      if (res && res.data) {
        const updatedMembers = [...members, res.data];
        setMembers(updatedMembers);
        if (onMemberCountChanged) {
          onMemberCountChanged(updatedMembers.length);
        }
        setSelectedUserId('');
        setSuccessMsg(`Allocated ${res.data.userName} as "${res.data.roleInTeam}" to pod.`);
        setTimeout(() => setSuccessMsg(''), 3500);
      }
    } catch (err) {
      console.error('Failed to add member:', err);
      let msg = err.response?.data?.message || err.message || 'Failed to assign member to pod.';
      if (err.response?.data?.errors && Array.isArray(err.response.data.errors) && err.response.data.errors.length > 0) {
        msg = err.response.data.errors.join(' | ');
      }
      setError(msg);
    } finally {
      setAdding(false);
    }
  };

  const handleRemoveMember = async (userId, memberName) => {
    if (!canManage) {
      setError('Access Restricted: Only Project Managers and Admins can remove engineers from pods.');
      return;
    }
    if (!window.confirm(`Remove ${memberName} from this team pod?`)) return;
    setError('');

    try {
      await teamApi.removeMemberFromTeam(team.teamId, userId);
      const updated = members.filter((m) => m.userId !== userId);
      setMembers(updated);
      if (onMemberCountChanged) {
        onMemberCountChanged(updated.length);
      }
      setSuccessMsg(`Deallocated ${memberName} from pod.`);
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      console.error('Failed to remove member:', err);
      setError(err.response?.data?.message || 'Failed to remove member from team.');
    }
  };

  const getPlatformRoleBadge = (role) => {
    const r = (role || '').toUpperCase();
    if (r.includes('ADMIN')) return <span className="badge badge-admin">{role}</span>;
    if (r.includes('MANAGER')) return <span className="badge badge-pm">{role}</span>;
    if (r.includes('QA') || r.includes('TEST')) return <span className="badge badge-qa">{role}</span>;
    if (r.includes('DEVOPS')) return <span className="badge badge-devops">{role}</span>;
    return <span className="badge badge-dev">{role}</span>;
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
      zIndex: 100,
      padding: '20px',
    }}>
      <div className="glass-card animate-fade-in" style={{
        width: '100%',
        maxWidth: '720px',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
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
          marginBottom: '18px',
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
              <Users2 size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h2 style={{ fontSize: '1.3rem', margin: 0 }}>
                  {team.teamName} Roster
                </h2>
                {!canManage && (
                  <span
                    className="badge"
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.04)',
                      color: 'var(--text-secondary)',
                      border: '1px solid var(--border-subtle)',
                      fontSize: '0.72rem',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '2px 8px',
                    }}
                  >
                    <Lock size={11} /> Read-Only Roster
                  </span>
                )}
              </div>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Pod TM-00{team.teamId} • {members.length} Active Collaborators
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

        {/* Notifications */}
        {error && (
          <div className="alert alert-error" style={{ marginBottom: '16px' }}>
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="alert alert-success" style={{ marginBottom: '16px' }}>
            <CheckCircle2 size={16} style={{ flexShrink: 0 }} />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Add Member Form (Only if canManage) */}
        {canManage && (
          <form
            onSubmit={handleAddMember}
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)',
              padding: '16px',
              marginBottom: '20px',
              display: 'flex',
              flexWrap: 'wrap',
              gap: '12px',
              alignItems: 'flex-end',
            }}
          >
            {/* Select User */}
            <div style={{ flex: '1 1 200px' }}>
              <label className="form-label" style={{ marginBottom: '6px' }}>
                Select Engineer
              </label>
              <select
                className="form-select"
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                disabled={adding || unassignedUsers.length === 0}
              >
                <option value="">
                  {unassignedUsers.length === 0 ? 'All users assigned' : '-- Choose Engineer --'}
                </option>
                {unassignedUsers.map((u) => (
                  <option key={u.userId} value={u.userId}>
                    {u.name} ({u.role || 'Member'}) - {u.email}
                  </option>
                ))}
              </select>
            </div>

            {/* Select Role in Team */}
            <div style={{ flex: '1 1 160px' }}>
              <label className="form-label" style={{ marginBottom: '6px' }}>
                Role in Pod
              </label>
              <select
                className="form-select"
                value={roleInTeam}
                onChange={(e) => setRoleInTeam(e.target.value)}
                disabled={adding}
              >
                {teamRoles.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="btn btn-primary"
              disabled={adding || !selectedUserId}
              style={{ whiteSpace: 'nowrap', height: '40px' }}
            >
              <UserPlus size={16} />
              {adding ? 'Allocating...' : 'Allocate to Pod'}
            </button>
          </form>
        )}

        {/* Members Roster List */}
        <div style={{ flex: 1, overflowY: 'auto', paddingRight: '4px' }}>
          {loading ? (
            <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
              <RefreshCw size={20} className="spin" style={{ marginBottom: '10px', color: 'var(--primary)' }} />
              <div>Loading collaborator roster...</div>
            </div>
          ) : members.length === 0 ? (
            <div style={{
              padding: '40px 20px',
              textAlign: 'center',
              backgroundColor: 'rgba(0, 0, 0, 0.3)',
              borderRadius: 'var(--radius-sm)',
              border: '1px dashed var(--border-subtle)',
            }}>
              <Users2 size={36} color="var(--text-muted)" style={{ marginBottom: '12px' }} />
              <h4 style={{ marginBottom: '6px' }}>No Collaborators Allocated</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                {canManage
                  ? 'Use the form above to assign developers, testers, and leads to this pod.'
                  : 'No engineers have been assigned to this pod yet.'}
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {members.map((m) => (
                <div
                  key={m.userId}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    backgroundColor: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    transition: 'border-color 0.15s ease',
                  }}
                >
                  {/* Member Info */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
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
                      fontWeight: '700',
                      fontSize: '0.85rem',
                      flexShrink: 0,
                    }}>
                      {m.userName ? m.userName.charAt(0).toUpperCase() : 'U'}
                    </div>

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '0.92rem', fontWeight: '600', color: 'var(--text-primary)' }}>
                          {m.userName}
                        </span>
                        <span
                          className="badge"
                          style={{
                            backgroundColor: 'rgba(255, 107, 0, 0.15)',
                            color: 'var(--primary)',
                            border: '1px solid rgba(255, 107, 0, 0.35)',
                            fontSize: '0.72rem',
                            fontWeight: '600',
                          }}
                        >
                          {m.roleInTeam || 'Collaborator'}
                        </span>
                      </div>

                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        {m.userEmail} • Platform: {getPlatformRoleBadge(m.platformRole)}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  {canManage && (
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => handleRemoveMember(m.userId, m.userName)}
                      style={{
                        padding: '6px 10px',
                        borderColor: 'rgba(255, 51, 68, 0.35)',
                        color: 'var(--danger)',
                      }}
                      title={`Remove ${m.userName} from pod`}
                    >
                      <Trash2 size={14} />
                      Remove
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          paddingTop: '16px',
          marginTop: '16px',
          borderTop: '1px solid var(--border-subtle)',
        }}>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Close Roster
          </button>
        </div>
      </div>
    </div>
  );
};

export default TeamMembersModal;
