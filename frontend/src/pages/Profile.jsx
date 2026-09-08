import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../api/authApi';
import { User, Mail, Shield, Calendar, RefreshCw, KeyRound, CheckCircle } from 'lucide-react';

export const Profile = () => {
  const { user, refreshUser } = useAuth();
  const [profileData, setProfileData] = useState(user);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const fetchLatestProfile = async () => {
    setLoading(true);
    setMessage('');
    try {
      const res = await authApi.getCurrentUser();
      if (res && res.data) {
        setProfileData(res.data);
        await refreshUser();
        setMessage('Profile synchronized with database.');
      }
    } catch (err) {
      console.error('Failed to reload profile:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLatestProfile();
  }, []);

  const getBadgeClass = (role) => {
    const r = (role || '').toUpperCase();
    if (r.includes('ADMIN')) return 'badge-admin';
    if (r.includes('MANAGER') || r.includes('PROJECT')) return 'badge-pm';
    if (r.includes('TEST') || r.includes('QA')) return 'badge-qa';
    if (r.includes('DEVOPS')) return 'badge-devops';
    return 'badge-dev';
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div className="page-header">
        <div>
          <div className="page-title">
            <User size={28} color="var(--primary)" />
            <h1>User Profile & Identity</h1>
          </div>
          <p className="page-subtitle">
            Authenticated enterprise identity mapped from <code>/api/users/me</code>
          </p>
        </div>

        <button
          className="btn btn-secondary"
          onClick={fetchLatestProfile}
          disabled={loading}
        >
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          {loading ? 'Refreshing...' : 'Sync Profile'}
        </button>
      </div>

      {message && (
        <div className="alert alert-success animate-fade-in">
          <CheckCircle size={18} />
          <span>{message}</span>
        </div>
      )}

      {/* Main Profile Card */}
      <div className="glass-card" style={{ padding: '32px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '28px' }}>
          <div style={{
            width: '68px',
            height: '68px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--primary) 0%, var(--violet) 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontSize: '1.8rem',
            fontWeight: '700',
            boxShadow: '0 0 20px var(--primary-glow)',
          }}>
            {(profileData?.name || profileData?.fullName) ? (profileData.name || profileData.fullName).charAt(0).toUpperCase() : 'U'}
          </div>

          <div>
            <h2 style={{ fontSize: '1.4rem', marginBottom: '4px' }}>
              {profileData?.name || profileData?.fullName || 'Platform User'}
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className={`badge ${getBadgeClass(profileData?.role)}`}>
                {profileData?.role}
              </span>
              <span className="badge badge-active">
                {profileData?.status || 'ACTIVE'}
              </span>
            </div>
          </div>
        </div>

        {/* Details Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '20px',
          borderTop: '1px solid var(--border-subtle)',
          paddingTop: '24px',
        }}>
          <div>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Internal User ID
            </span>
            <div style={{ fontSize: '1.05rem', fontWeight: '600', color: 'var(--text-primary)', marginTop: '4px', fontFamily: 'var(--font-mono)' }}>
              #{profileData?.userId || '1'}
            </div>
          </div>

          <div>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Email Address
            </span>
            <div style={{ fontSize: '1.05rem', fontWeight: '500', color: 'var(--text-primary)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Mail size={16} color="var(--primary)" />
              {profileData?.email}
            </div>
          </div>

          <div>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Security Authority
            </span>
            <div style={{ fontSize: '1.05rem', fontWeight: '500', color: 'var(--text-primary)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Shield size={16} color="var(--violet)" />
              ROLE_{profileData?.role}
            </div>
          </div>

          <div>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Account Created
            </span>
            <div style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Calendar size={16} color="var(--cyan)" />
              {profileData?.createdAt ? new Date(profileData.createdAt).toLocaleDateString() : 'Active Session'}
            </div>
          </div>
        </div>
      </div>

      {/* Security & Token Info */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.1rem', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <KeyRound size={18} color="var(--warning)" />
          Session Security
        </h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: '1.6' }}>
          Your requests are authenticated using HMAC-SHA256 JWT tokens. The token is attached automatically to the <code>Authorization</code> header across all SDLC lifecycle modules.
        </p>
      </div>
    </div>
  );
};

export default Profile;
