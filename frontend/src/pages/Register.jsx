import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Hexagon, Lock, Mail, User, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';

export const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('DEVELOPER');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const roles = [
    { id: 'DEVELOPER', label: 'Developer', desc: 'Code assist & tasks' },
    { id: 'PROJECT_MANAGER', label: 'Manager', desc: 'Projects & governance' },
    { id: 'BUSINESS_ANALYST', label: 'Business Analyst', desc: 'Requirements & PRDs' },
    { id: 'TESTER', label: 'QA Engineer', desc: 'Test cases & issues' },
    { id: 'DEVOPS_ENGINEER', label: 'DevOps', desc: 'Releases & deployments' },
    { id: 'ADMIN', label: 'Admin', desc: 'Full system control' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Backend expects 'name', 'email', 'password', 'role'
      await register({ name: fullName.trim(), email: email.trim(), password, role });
      navigate('/workspace', { replace: true });
    } catch (err) {
      console.error('Register error:', err);
      let msg = err.response?.data?.message || 'Registration failed. Please verify fields.';
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
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      background: 'radial-gradient(ellipse at 50% 15%, rgba(139, 92, 246, 0.15), transparent 70%), var(--bg-base)',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '520px',
        padding: '36px',
      }} className="glass-card animate-fade-in">
        {/* Logo & Heading */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, var(--violet) 0%, var(--primary) 100%)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 20px rgba(139, 92, 246, 0.4)',
            marginBottom: '14px',
          }}>
            <Hexagon size={24} color="#ffffff" />
          </div>
          <h1 style={{ fontSize: '1.65rem', marginBottom: '6px' }}>Create Your Account</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
            Join your enterprise workspace on NeuroForge
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
            <label className="form-label" htmlFor="fullName">Full Name</label>
            <div style={{ position: 'relative' }}>
              <input
                id="fullName"
                type="text"
                className="form-input"
                style={{ paddingLeft: '38px' }}
                placeholder="Alex Mercer"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
              <User
                size={16}
                color="var(--text-muted)"
                style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="email">Work Email</label>
            <div style={{ position: 'relative' }}>
              <input
                id="email"
                type="email"
                className="form-input"
                style={{ paddingLeft: '38px' }}
                placeholder="alex@neuroforge.com"
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
                placeholder="Minimum 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
              <Lock
                size={16}
                color="var(--text-muted)"
                style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
              />
            </div>
          </div>

          {/* Role Selection */}
          <div className="form-group" style={{ marginTop: '8px' }}>
            <label className="form-label">Primary Enterprise Role</label>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
              gap: '8px',
              marginTop: '4px',
            }}>
              {roles.map((r) => {
                const selected = role === r.id;
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setRole(r.id)}
                    style={{
                      padding: '10px 8px',
                      borderRadius: '8px',
                      background: selected ? 'var(--primary-subtle)' : 'var(--bg-input)',
                      border: selected ? '1px solid var(--primary)' : '1px solid var(--border-subtle)',
                      color: selected ? '#ffffff' : 'var(--text-secondary)',
                      cursor: 'pointer',
                      textAlign: 'center',
                      transition: 'all 0.15s ease',
                      outline: 'none',
                    }}
                  >
                    <div style={{ fontSize: '0.85rem', fontWeight: '600', color: selected ? 'var(--primary)' : 'var(--text-primary)' }}>
                      {r.label}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {r.desc}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '16px', padding: '12px' }}
            disabled={loading}
          >
            {loading ? 'Creating Account...' : (
              <>
                Register & Enter Workspace
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        {/* Footer link to Login */}
        <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.85rem' }}>
          <span style={{ color: 'var(--text-secondary)' }}>Already registered? </span>
          <Link to="/login" style={{ fontWeight: '500' }}>Sign in here</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
