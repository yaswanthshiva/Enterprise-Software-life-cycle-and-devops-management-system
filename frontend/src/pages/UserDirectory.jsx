import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../api/authApi';
import { Users2, ShieldCheck, Filter, RefreshCw, AlertCircle, Search, ShieldAlert } from 'lucide-react';

export const UserDirectory = () => {
  const { user, canManageUsers } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

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
          {['', 'ADMIN', 'PROJECT_MANAGER', 'DEVELOPER', 'QA_ENGINEER', 'DEVOPS'].map((r) => (
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
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="4" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  Loading enterprise directory...
                </td>
              </tr>
            ) : filteredUsers.length === 0 ? (
              <tr>
                <td colSpan="4" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
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
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserDirectory;
