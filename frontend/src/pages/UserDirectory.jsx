import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../api/authApi';
import { Users2, ShieldCheck, Filter, RefreshCw, AlertCircle, Search, ShieldAlert, Trash2, CheckCircle2 } from 'lucide-react';

export const UserDirectory = () => {
  const { user, isAdmin, canManageUsers } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Delete modal state
  const [userToDelete, setUserToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchUsers = async () => {
    if (!canManageUsers) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await authApi.getAllUsers(selectedRole);
      if (res && res.data) {
        setUsers(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch users:', err);
      setError('Unable to load user directory. Ensure you have ADMIN or PROJECT_MANAGER authority.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    setDeleting(true);
    setError('');
    setSuccessMessage('');
    try {
      await authApi.deleteUser(userToDelete.userId);
      setUsers((prev) => prev.filter((u) => u.userId !== userToDelete.userId));
      setSuccessMessage(`User "${userToDelete.name || userToDelete.fullName || userToDelete.email}" was successfully deleted.`);
      setUserToDelete(null);
    } catch (err) {
      console.error('Failed to delete user:', err);
      setError(err.response?.data?.message || 'Failed to delete user.');
    } finally {
      setDeleting(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [selectedRole]);

  const filteredUsers = users.filter((u) => {
    const q = searchQuery.toLowerCase();
    const displayName = u.name || u.fullName || '';
    const nameMatch = displayName.toLowerCase().includes(q);
    const emailMatch = u.email?.toLowerCase().includes(q);
    return nameMatch || emailMatch;
  });

  const getBadgeClass = (role) => {
    const r = (role || '').toUpperCase();
    if (r.includes('ADMIN')) return 'badge-admin';
    if (r.includes('MANAGER') || r.includes('PROJECT')) return 'badge-pm';
    if (r.includes('TEST') || r.includes('QA')) return 'badge-qa';
    if (r.includes('DEVOPS')) return 'badge-devops';
    return 'badge-dev';
  };

  if (!canManageUsers) {
    return (
      <div className="glass-card" style={{ padding: '70px 20px', textAlign: 'center' }}>
        <ShieldAlert size={48} color="var(--danger)" style={{ marginBottom: '16px' }} />
        <h2 style={{ marginBottom: '10px' }}>Access Clearance Restricted</h2>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '520px', margin: '0 auto 24px auto', fontSize: '0.9rem' }}>
          The enterprise user directory contains organizational staffing records and requires Administrator or Project Manager security credentials.
        </p>
        <div style={{ display: 'inline-block' }}>
          <span className="badge" style={{ padding: '6px 14px', fontSize: '0.82rem', borderColor: 'var(--border-subtle)' }}>
            Logged in as: <strong>{user?.fullName || user?.name || user?.email}</strong> ({user?.role || 'Member'})
          </span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">
            <ShieldCheck size={28} color="var(--primary)" />
            <h1>User Directory & Access Control</h1>
          </div>
          <p className="page-subtitle">
            Manage enterprise team members and security roles via <code>/api/users</code>
          </p>
        </div>

        <button className="btn btn-secondary" onClick={fetchUsers} disabled={loading}>
          <RefreshCw size={15} />
          Refresh Directory
        </button>
      </div>

      {error && (
        <div className="alert alert-error">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {successMessage && (
        <div className="alert" style={{
          backgroundColor: 'rgba(34, 197, 94, 0.1)',
          borderColor: 'rgba(34, 197, 94, 0.3)',
          color: '#4ade80',
          marginBottom: '16px',
        }}>
          <CheckCircle2 size={18} />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="glass-card" style={{ padding: '16px 20px', marginBottom: '20px', display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* Search */}
        <div style={{ position: 'relative', minWidth: '260px', flex: '1' }}>
          <input
            type="text"
            className="form-input"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: '36px' }}
          />
          <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
        </div>

        {/* Role Filters */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {['', 'ADMIN', 'PROJECT_MANAGER', 'DEVELOPER', 'QA_ENGINEER', 'DEVOPS', 'BUSINESS_ANALYST'].map((r) => (
            <button
              key={r}
              className={`btn btn-sm ${selectedRole === r ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setSelectedRole(r)}
            >
              {r || 'All Roles'}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      <div className="glass-card" style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{
              background: 'rgba(255, 255, 255, 0.03)',
              borderBottom: '1px solid var(--border-subtle)',
              color: 'var(--text-secondary)',
              fontSize: '0.78rem',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
            }}>
              <th style={{ padding: '14px 20px' }}>User</th>
              <th style={{ padding: '14px 20px' }}>Role</th>
              <th style={{ padding: '14px 20px' }}>Status</th>
              <th style={{ padding: '14px 20px' }}>Created</th>
              {isAdmin && <th style={{ padding: '14px 20px', textAlign: 'right' }}>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={isAdmin ? 5 : 4} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  Loading enterprise directory...
                </td>
              </tr>
            ) : filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={isAdmin ? 5 : 4} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No users found matching current filters.
                </td>
              </tr>
            ) : (
              filteredUsers.map((u) => (
                <tr
                  key={u.userId}
                  style={{
                    borderBottom: '1px solid var(--border-subtle)',
                    transition: 'background-color 0.15s ease',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.02)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <td style={{ padding: '14px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '34px',
                        height: '34px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--primary-subtle)',
                        border: '1px solid var(--border-focus)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--primary)',
                        fontWeight: '600',
                        fontSize: '0.85rem',
                      }}>
                        {(u.name || u.fullName) ? (u.name || u.fullName).charAt(0).toUpperCase() : 'U'}
                      </div>
                      <div>
                        <div style={{ fontWeight: '500', color: 'var(--text-primary)' }}>
                          {u.name || u.fullName}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          {u.email}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td style={{ padding: '14px 20px' }}>
                    <span className={`badge ${getBadgeClass(u.role)}`}>
                      {u.role}
                    </span>
                  </td>

                  <td style={{ padding: '14px 20px' }}>
                    <span className="badge badge-active">
                      {u.status || 'ACTIVE'}
                    </span>
                  </td>

                  <td style={{ padding: '14px 20px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                    {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'Active'}
                  </td>

                  {isAdmin && (
                    <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                      {Number(user?.userId) === Number(u.userId) ? (
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                          Current Admin
                        </span>
                      ) : (
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => setUserToDelete(u)}
                          title="Permanently delete user account"
                          style={{
                            padding: '4px 10px',
                            color: 'var(--danger, #ef4444)',
                            borderColor: 'rgba(239, 68, 68, 0.3)',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          <Trash2 size={13} />
                          Delete
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Delete User Confirmation Modal for Admin */}
      {userToDelete && (
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
            padding: '26px',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.85)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--danger, #ef4444)',
              }}>
                <Trash2 size={20} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-primary)' }}>
                  Delete User Account
                </h3>
                <span style={{ fontSize: '0.78rem', color: 'var(--danger, #ef4444)' }}>
                  Access Control Management
                </span>
              </div>
            </div>

            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: '1.5', marginBottom: '16px' }}>
              Are you sure you want to permanently remove <strong style={{ color: 'var(--text-primary)' }}>{userToDelete.name || userToDelete.fullName || userToDelete.email}</strong> ({userToDelete.role}) from the organization?
            </p>

            <div style={{
              backgroundColor: 'rgba(239, 68, 68, 0.08)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              borderRadius: 'var(--radius-sm)',
              padding: '12px 14px',
              fontSize: '0.82rem',
              color: 'var(--text-muted)',
              marginBottom: '22px',
              lineHeight: '1.45',
            }}>
              🛡️ <strong>Safety Reassignment:</strong> Their team memberships will be removed, and any active projects, tasks, and reported issues will be safely reassigned to you ({user?.fullName || user?.email}) to preserve system continuity.
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setUserToDelete(null)}
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn"
                onClick={handleDeleteUser}
                disabled={deleting}
                style={{
                  backgroundColor: '#dc2626',
                  color: '#fff',
                  borderColor: '#ef4444',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                {deleting ? 'Deleting...' : 'Delete User'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDirectory;
