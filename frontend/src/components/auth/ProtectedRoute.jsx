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

  if (allowedRoles && !allowedRoles.includes(user.role)) {
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
          Your role (<span className="badge badge-admin">{user.role}</span>) does not have permission to view this resource.
        </p>
        <a href="/" className="btn btn-secondary">Return to Dashboard</a>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
