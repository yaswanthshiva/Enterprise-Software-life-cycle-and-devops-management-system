import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShieldAlert } from 'lucide-react';

export const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, token, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{
        height: '100vh',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--bg-base)',
        color: 'var(--primary)'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '3px solid rgba(99, 102, 241, 0.2)',
          borderTopColor: 'var(--primary)',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite'
        }} />
        <p style={{ marginTop: '16px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Authenticating session...
        </p>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (!token || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const userRole = (user.role || '').toUpperCase().replace(' ', '_');
    const hasRole = allowedRoles.some((allowed) => {
      const a = (allowed || '').toUpperCase().replace(' ', '_');
      if (a === userRole) return true;
      if (a.startsWith('ROLE_') && userRole === a.replace('ROLE_', '')) return true;
      if (!a.startsWith('ROLE_') && ('ROLE_' + userRole) === a) return true;
      if (a.includes('ADMIN') && userRole.includes('ADMIN')) return true;
      if (a.includes('MANAGER') && (userRole.includes('MANAGER') || userRole.includes('PROJECT'))) return true;
      if (a.includes('QA') || a.includes('TEST')) {
        return userRole.includes('QA') || userRole.includes('TEST');
      }
      if (a.includes('DEV') && !a.includes('DEVOPS')) {
        return userRole.includes('DEV') && !userRole.includes('DEVOPS');
      }
      if (a.includes('DEVOPS')) return userRole.includes('DEVOPS');
      return false;
    });

    if (!hasRole) {
      return (
        <div style={{
          padding: '60px 20px',
          textAlign: 'center',
          maxWidth: '500px',
          margin: '80px auto',
        }} className="glass-card">
          <ShieldAlert size={48} color="var(--danger)" style={{ marginBottom: '16px' }} />
          <h2 style={{ marginBottom: '8px' }}>Access Restricted</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
            Your role (<span className="badge" style={{ color: 'var(--danger)', borderColor: 'var(--danger-border)' }}>{user.role}</span>) does not have clearance to view this enterprise module.
          </p>
          <a href="/workspace" className="btn btn-secondary">Return to Overview</a>
        </div>
      );
    }
  }

  return children;
};

export default ProtectedRoute;
