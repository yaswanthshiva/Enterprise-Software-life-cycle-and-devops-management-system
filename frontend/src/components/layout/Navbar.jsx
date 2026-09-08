import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authApi } from '../../api/authApi';
import { Activity, User } from 'lucide-react';

export const Navbar = () => {
  const { user } = useAuth();
  const [backendStatus, setBackendStatus] = useState('CHECKING');

  useEffect(() => {
    let isMounted = true;
    const checkApiHealth = async () => {
      try {
        const res = await authApi.checkHealth();
        if (isMounted) {
          const status = res?.data?.status || res?.status;
          const isHealthy = status === 'UP' || res?.success;
          setBackendStatus(isHealthy ? 'UP' : 'DEGRADED');
        }
      } catch (err) {
        if (isMounted) {
          setBackendStatus('DOWN');
        }
      }
    };

    checkApiHealth();
    const interval = setInterval(checkApiHealth, 30000); // check health every 30s
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const getRoleBadgeClass = (role) => {
    const r = (role || '').toUpperCase();
    if (r.includes('ADMIN')) return 'badge-admin';
    if (r.includes('MANAGER') || r.includes('PROJECT')) return 'badge-pm';
    if (r.includes('TEST') || r.includes('QA')) return 'badge-qa';
    if (r.includes('DEVOPS')) return 'badge-devops';
    return 'badge-dev';
  };

  return (
    <header style={{
      height: '64px',
      backgroundColor: 'var(--bg-navbar)',
      backdropFilter: 'var(--glass-blur)',
      WebkitBackdropFilter: 'var(--glass-blur)',
      borderBottom: '1px solid var(--border-subtle)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 28px',
      position: 'sticky',
      top: 0,
      zIndex: 30,
    }}>
      {/* Platform Sub-header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <span style={{
          fontSize: '0.85rem',
          color: 'var(--text-secondary)',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
        }}>
          Workspace: <strong style={{ color: 'var(--text-primary)' }}>Enterprise SDLC</strong>
        </span>

        {/* Backend Live Indicator */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '4px 10px',
          borderRadius: '9999px',
          fontSize: '0.72rem',
          fontWeight: '600',
          backgroundColor: backendStatus === 'UP' ? 'var(--success-bg)' : 'var(--danger-bg)',
          color: backendStatus === 'UP' ? 'var(--success)' : 'var(--danger)',
          border: `1px solid ${backendStatus === 'UP' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(244, 63, 94, 0.3)'}`,
        }}>
          <span style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            backgroundColor: backendStatus === 'UP' ? 'var(--success)' : 'var(--danger)',
            boxShadow: backendStatus === 'UP' ? '0 0 8px var(--success)' : 'none',
          }} />
          API: {backendStatus}
        </div>
      </div>

      {/* Right Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* User Pill */}
        {user && (
          <Link
            to="/workspace/profile"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              textDecoration: 'none',
              padding: '6px 10px',
              borderRadius: '8px',
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid var(--border-subtle)',
              transition: 'background-color 0.15s ease',
            }}
          >
            <div style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              backgroundColor: 'var(--primary-subtle)',
              border: '1px solid var(--border-focus)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--primary)',
            }}>
              <User size={15} />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: '500', color: 'var(--text-primary)' }}>
                {user.fullName || user.email}
              </span>
              <span className={`badge ${getRoleBadgeClass(user.role)}`}>
                {user.role}
              </span>
            </div>
          </Link>
        )}
      </div>
    </header>
  );
};

export default Navbar;
