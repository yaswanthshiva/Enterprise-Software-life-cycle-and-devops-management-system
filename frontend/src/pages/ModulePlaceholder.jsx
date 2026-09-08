import React from 'react';
import { Link } from 'react-router-dom';
import { Layers, ArrowLeft } from 'lucide-react';

export const ModulePlaceholder = ({ moduleNumber, title, description, nextStep }) => {
  return (
    <div style={{ maxWidth: '680px', margin: '60px auto', textAlign: 'center' }} className="glass-card">
      <div style={{ padding: '48px 36px' }}>
        <div style={{
          width: '56px',
          height: '56px',
          borderRadius: '16px',
          backgroundColor: 'var(--primary-subtle)',
          border: '1px solid var(--border-focus)',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--primary)',
          marginBottom: '20px',
        }}>
          <Layers size={28} />
        </div>

        <div style={{ fontSize: '0.78rem', color: 'var(--primary)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>
          Module {moduleNumber}
        </div>

        <h1 style={{ fontSize: '1.75rem', marginBottom: '12px' }}>{title}</h1>

        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '28px' }}>
          {description}
        </p>

        <div style={{
          padding: '16px 20px',
          borderRadius: '8px',
          backgroundColor: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid var(--border-subtle)',
          marginBottom: '28px',
          fontSize: '0.85rem',
          color: 'var(--text-muted)'
        }}>
          Backend REST APIs for this module are 100% operational. Ready to be built in <strong style={{ color: 'var(--text-primary)' }}>{nextStep}</strong>.
        </div>

        <Link to="/" className="btn btn-secondary">
          <ArrowLeft size={16} />
          Return to Overview
        </Link>
      </div>
    </div>
  );
};

export default ModulePlaceholder;
