import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Hexagon,
  ArrowRight,
  Sparkles,
  KanbanSquare,
  Cpu,
  Rocket
} from 'lucide-react';

export const LandingPage = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const handleLaunch = () => {
    if (isAuthenticated) {
      navigate('/workspace');
    } else {
      navigate('/login');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'var(--bg-base)',
      display: 'flex',
      flexDirection: 'column',
      background: 'radial-gradient(ellipse at 50% -10%, rgba(255, 107, 0, 0.12), transparent 50%), var(--bg-base)',
    }}>
      {/* Sleek Top Navigation */}
      <header style={{
        height: '70px',
        borderBottom: '1px solid var(--border-subtle)',
        backdropFilter: 'var(--glass-blur)',
        WebkitBackdropFilter: 'var(--glass-blur)',
        backgroundColor: 'rgba(6, 9, 17, 0.75)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 40px',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}>
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, var(--primary) 0%, #ff8c26 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 20px var(--primary-glow)',
          }}>
            <Hexagon size={22} color="#000000" />
          </div>
          <span className="text-gradient-white" style={{
            fontFamily: 'var(--font-heading)',
            fontWeight: '700',
            fontSize: '1.3rem',
            letterSpacing: '-0.03em',
          }}>
            NeuroForge
          </span>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          {isAuthenticated ? (
            <Link to="/workspace" className="btn btn-primary btn-sm">
              Launch Console ({user?.fullName || user?.email})
              <ArrowRight size={14} />
            </Link>
          ) : (
            <>
              <Link to="/login" className="btn btn-secondary btn-sm">
                Sign In
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Get Started
                <ArrowRight size={14} />
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Main Hero Section */}
      <main style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '60px 24px 80px',
        maxWidth: '1000px',
        margin: '0 auto',
      }}>
        {/* Highlight Pill */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 14px',
          borderRadius: '9999px',
          background: 'var(--primary-subtle)',
          border: '1px solid var(--border-focus)',
          color: 'var(--primary)',
          fontSize: '0.82rem',
          fontWeight: '600',
          marginBottom: '28px',
          boxShadow: '0 0 20px rgba(255, 107, 0, 0.15)',
        }}>
          <Sparkles size={15} color="var(--primary)" />
          Enterprise AI-Assisted SDLC Intelligence
        </div>

        {/* Big Headline */}
        <h1 style={{
          fontSize: 'clamp(2.5rem, 5vw, 4rem)',
          lineHeight: '1.15',
          marginBottom: '20px',
          fontWeight: '800',
          letterSpacing: '-0.03em',
        }}>
          The Autonomous AI-Assisted <br />
          <span className="text-gradient-orange">
            Enterprise SDLC Platform
          </span>
        </h1>

        {/* Short Subtitle (Crisp & Professional) */}
        <p style={{
          color: 'var(--text-secondary)',
          fontSize: 'clamp(1rem, 2vw, 1.2rem)',
          maxWidth: '720px',
          lineHeight: '1.65',
          marginBottom: '36px',
        }}>
          Accelerate your entire software lifecycle from AI-generated requirements and code synthesis 
          to agile sprints, automated QA triage, and release deployments — unified in one intelligent console.
        </p>

        {/* CTA Buttons */}
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '56px' }}>
          <button
            onClick={handleLaunch}
            className="btn btn-primary"
            style={{
              padding: '14px 28px',
              fontSize: '1rem',
              borderRadius: '10px',
              boxShadow: '0 4px 25px rgba(99, 102, 241, 0.45)',
            }}
          >
            {isAuthenticated ? 'Enter Workspace Console' : 'Launch Workspace Console'}
            <ArrowRight size={18} />
          </button>

          {!isAuthenticated && (
            <Link
              to="/register"
              className="btn btn-secondary"
              style={{
                padding: '14px 24px',
                fontSize: '1rem',
                borderRadius: '10px',
              }}
            >
              Get Started Free
            </Link>
          )}
        </div>

        {/* 3 Sleek Feature Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '20px',
          width: '100%',
          textAlign: 'left',
        }}>
          <div className="glass-card" style={{ padding: '26px' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              backgroundColor: 'var(--primary-subtle)',
              border: '1px solid var(--border-focus)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--primary)',
              marginBottom: '16px',
            }}>
              <Cpu size={22} />
            </div>
            <h3 style={{ fontSize: '1.15rem', marginBottom: '8px' }}>AI Requirements & Code</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: '1.55' }}>
              Autonomous Gemini AI prompts for generating user stories, code refactoring, and automated test synthesis.
            </p>
          </div>

          <div className="glass-card" style={{ padding: '26px' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              backgroundColor: 'rgba(139, 92, 246, 0.12)',
              border: '1px solid rgba(139, 92, 246, 0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--violet)',
              marginBottom: '16px',
            }}>
              <KanbanSquare size={22} />
            </div>
            <h3 style={{ fontSize: '1.15rem', marginBottom: '8px' }}>Agile Sprints & Kanban</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: '1.55' }}>
              Real-time sprint velocity boards with interactive task progression across your cross-functional engineering teams.
            </p>
          </div>

          <div className="glass-card" style={{ padding: '26px' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              backgroundColor: 'rgba(16, 185, 129, 0.12)',
              border: '1px solid rgba(16, 185, 129, 0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--success)',
              marginBottom: '16px',
            }}>
              <Rocket size={22} />
            </div>
            <h3 style={{ fontSize: '1.15rem', marginBottom: '8px' }}>QA Hub & Deployments</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: '1.55' }}>
              Unified bug tracking, test executions, and multi-environment deployment pipelines with release health rings.
            </p>
          </div>
        </div>
      </main>

      {/* Minimal Footer */}
      <footer style={{
        padding: '24px 40px',
        borderTop: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        fontSize: '0.82rem',
        color: 'var(--text-muted)',
      }}>
        <div>
          © 2026 NeuroForge Enterprise SDLC. Built with Spring Boot 3, React 18, and Google Gemini AI.
        </div>
        <div style={{ display: 'flex', gap: '20px' }}>
          <Link to="/login" style={{ color: 'var(--text-secondary)' }}>
            Console Sign In
          </Link>
          <Link to="/register" style={{ color: 'var(--text-secondary)' }}>
            Register
          </Link>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
