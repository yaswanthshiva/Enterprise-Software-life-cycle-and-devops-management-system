import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  FolderKanban,
  Users2,
  FileText,
  Sparkles,
  KanbanSquare,
  Cpu,
  Bug,
  Rocket,
  ShieldCheck,
  ArrowUpRight,
  Activity,
  Layers,
  Database,
  Lock
} from 'lucide-react';

export const Dashboard = () => {
  const { user } = useAuth();

  const sdlcModules = [
    {
      id: 2,
      name: 'Project Governance',
      desc: 'Project portfolios, ownership, and health lifecycle tracking.',
      icon: FolderKanban,
      to: '/workspace/projects',
      color: 'var(--primary)',
    },
    {
      id: 3,
      name: 'Team Workspace',
      desc: 'Team composition, multi-project assignments, and role allocations.',
      icon: Users2,
      to: '/workspace/teams',
      color: 'var(--cyan)',
    },
    {
      id: 4,
      name: 'Requirements Engineering',
      desc: 'Functional/Non-Functional PRDs, epics, and user stories.',
      icon: FileText,
      to: '/workspace/requirements',
      color: '#38bdf8',
    },
    {
      id: 5,
      name: 'AI PRD Studio',
      desc: 'Autonomous Gemini AI requirements generator with acceptance review.',
      icon: Sparkles,
      to: '/workspace/ai/requirements',
      color: 'var(--violet)',
      isAi: true,
    },
    {
      id: 6,
      name: 'Agile Sprints & Kanban',
      desc: 'Sprint milestones and drag-and-drop Kanban task columns.',
      icon: KanbanSquare,
      to: '/workspace/sprints',
      color: '#a855f7',
    },
    {
      id: 7,
      name: 'AI Code Intelligence',
      desc: 'Autonomous code generation, syntax review, and unit test generator.',
      icon: Cpu,
      to: '/workspace/ai/code',
      color: '#f43f5e',
      isAi: true,
    },
    {
      id: 8,
      name: 'QA & Issue Tracking',
      desc: 'Test case execution runs, bug triage, and QA pass rate metrics.',
      icon: Bug,
      to: '/workspace/qa',
      color: 'var(--warning)',
    },
    {
      id: 9,
      name: 'Release Command Center',
      desc: 'Version progression, staging/production deployments, and audit logs.',
      icon: Rocket,
      to: '/workspace/releases',
      color: 'var(--success)',
    },
  ];

  return (
    <div>
      {/* Hero Welcome Banner */}
      <div className="glass-card" style={{
        padding: '28px 32px',
        marginBottom: '24px',
        background: 'linear-gradient(135deg, rgba(14, 14, 18, 0.95) 0%, rgba(30, 18, 8, 0.6) 100%)',
        border: '1px solid var(--border-subtle)',
        borderLeft: '3px solid var(--primary)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{ maxWidth: '680px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '4px 12px',
            borderRadius: '9999px',
            backgroundColor: 'var(--primary-subtle)',
            border: '1px solid var(--border-focus)',
            color: 'var(--primary)',
            fontSize: '0.78rem',
            fontWeight: '600',
            marginBottom: '14px',
          }}>
            <Activity size={14} />
            NeuroForge Enterprise SDLC 1.0.0
          </div>
          <h1 style={{ fontSize: '2rem', marginBottom: '10px' }}>
            Welcome back, {user?.fullName || 'Engineer'}
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.6' }}>
            You are authenticated with <span className="badge badge-admin">{user?.role}</span> security authority. 
            All 70 backend REST APIs and 10 SDLC lifecycle modules are connected and ready for operation.
          </p>
        </div>
      </div>

      {/* Metrics Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        marginBottom: '28px',
      }}>
        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
            <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>SDLC Modules</span>
            <Layers size={18} color="var(--primary)" />
          </div>
          <div className="kpi-value" style={{ marginTop: '8px' }}>
            10 / 10
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--success)', marginTop: '4px' }}>
            Full Lifecycle Active
          </div>
        </div>

        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
            <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Endpoints</span>
            <Database size={18} color="var(--primary)" />
          </div>
          <div className="kpi-value" style={{ marginTop: '8px' }}>
            70
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Enterprise REST APIs
          </div>
        </div>

        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
            <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Auth Protocol</span>
            <Lock size={18} color="var(--primary)" />
          </div>
          <div className="kpi-value" style={{ marginTop: '8px' }}>
            JWT
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--success)', marginTop: '4px' }}>
            Stateless RBAC Active
          </div>
        </div>

        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
            <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>AI Engine</span>
            <Sparkles size={18} color="var(--primary)" />
          </div>
          <div className="kpi-value" style={{ marginTop: '8px' }}>
            Gemini
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            PRD & Code Intelligence
          </div>
        </div>
      </div>

      {/* SDLC Module Navigation Grid */}
      <div style={{ marginBottom: '16px' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '4px' }}>SDLC Lifecycle Modules</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '16px' }}>
          Explore and manage individual phases of the enterprise software development lifecycle:
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '16px',
      }}>
        {sdlcModules.map((m) => {
          const Icon = m.icon;
          return (
            <Link
              key={m.id}
              to={m.to}
              className="glass-card glass-card-interactive"
              style={{
                padding: '22px',
                textDecoration: 'none',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    backgroundColor: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: m.color,
                  }}>
                    <Icon size={20} />
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {m.isAi && (
                      <span style={{
                        padding: '2px 7px',
                        borderRadius: '4px',
                        background: 'linear-gradient(135deg, var(--primary) 0%, var(--violet) 100%)',
                        color: '#fff',
                        fontSize: '0.65rem',
                        fontWeight: '700',
                      }}>
                        AI POWERED
                      </span>
                    )}
                    <span style={{ color: 'var(--text-muted)' }}>
                      <ArrowUpRight size={18} />
                    </span>
                  </div>
                </div>

                <h3 style={{ fontSize: '1.05rem', marginBottom: '6px', color: 'var(--text-primary)' }}>
                  {m.name}
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.84rem', lineHeight: '1.5' }}>
                  {m.desc}
                </p>
              </div>

              <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Module 0{m.id}
                </span>
                <span style={{ fontSize: '0.8rem', color: m.color, fontWeight: '500' }}>
                  Enter Module →
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default Dashboard;
