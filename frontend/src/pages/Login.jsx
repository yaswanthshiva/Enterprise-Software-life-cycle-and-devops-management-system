import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Hexagon, Lock, Mail, ArrowRight, AlertCircle } from 'lucide-react';

export const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login({ email, password });
      const target = (from === '/' || !from) ? '/workspace' : from;
      navigate(target, { replace: true });
    } catch (err) {
      console.error('Login error:', err);
      const msg = err.response?.data?.message || 'Invalid email or password. Please verify credentials.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      background: 'radial-gradient(ellipse at 50% 15%, rgba(99, 102, 241, 0.15), transparent 70%), var(--bg-base)',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '440px',
        padding: '36px',
      }} className="glass-card animate-fade-in">
        {/* Logo & Heading */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, var(--primary) 0%, var(--violet) 100%)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 24px var(--primary-glow)',
            marginBottom: '16px',
          }}>
            <Hexagon size={26} color="#ffffff" />
          </div>
          <h1 style={{ fontSize: '1.65rem', marginBottom: '6px' }}>NeuroForge SDLC</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
            Enterprise AI-Assisted Lifecycle Platform
          </p>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="alert alert-error">
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="email">Work Email</label>
            <div style={{ position: 'relative' }}>
              <input
                id="email"
                type="email"
                className="form-input"
                style={{ paddingLeft: '38px' }}
                placeholder="developer@neuroforge.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Mail
                size={16}
                color="var(--text-muted)"
                style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                id="password"
                type="password"
                className="form-input"
                style={{ paddingLeft: '38px' }}
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <Lock
                size={16}
                color="var(--text-muted)"
                style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '8px', padding: '12px' }}
            disabled={loading}
          >
            {loading ? 'Authenticating...' : (
              <>
                Sign In to Platform
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        {/* Enterprise Security Notice */}
        <div style={{
          marginTop: '24px',
          paddingTop: '16px',
          borderTop: '1px solid var(--border-subtle)',
          textAlign: 'center',
        }}>
          <span style={{
            fontSize: '0.72rem',
            color: 'var(--text-muted)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
          }}>
            <Lock size={12} color="var(--primary)" />
            Enterprise SSO & RBAC Session Security Active
          </span>
        </div>

        {/* Footer link to Register */}
        <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.85rem' }}>
          <span style={{ color: 'var(--text-secondary)' }}>Don't have an account? </span>
          <Link to="/register" style={{ fontWeight: '500' }}>Register here</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
