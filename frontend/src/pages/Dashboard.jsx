import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { taskApi } from '../api/taskApi';
import { qaApi } from '../api/qaApi';
import { projectApi } from '../api/projectApi';
import {
  FolderKanban,
  Sparkles,
  KanbanSquare,
  Bug,
  ShieldAlert,
  ArrowUpRight,
  Activity,
  RefreshCw,
  CheckCircle2,
} from 'lucide-react';

export const Dashboard = () => {
  const { user } = useAuth();

  const [metrics, setMetrics] = useState({
    myTasks: [],
    assignedIssues: [],
    myProjects: [],
    reportedIssues: [],
  });
  const [loadingMetrics, setLoadingMetrics] = useState(true);

  const fetchMyWork = async () => {
    setLoadingMetrics(true);
    try {
      const [tasksRes, issuesRes, projectsRes, reportedRes] = await Promise.allSettled([
        taskApi.getMyTasks(),
        qaApi.getMyAssignedIssues(),
        projectApi.getMyProjects(),
        qaApi.getMyReportedIssues(),
      ]);

      setMetrics({
        myTasks: tasksRes.status === 'fulfilled' && tasksRes.value?.data ? tasksRes.value.data : [],
        assignedIssues: issuesRes.status === 'fulfilled' && issuesRes.value?.data ? issuesRes.value.data : [],
        myProjects: projectsRes.status === 'fulfilled' && projectsRes.value?.data ? projectsRes.value.data : [],
        reportedIssues: reportedRes.status === 'fulfilled' && reportedRes.value?.data ? reportedRes.value.data : [],
      });
    } catch (err) {
      console.error('Failed to load my-work metrics:', err);
    } finally {
      setLoadingMetrics(false);
    }
  };

  useEffect(() => {
    fetchMyWork();
  }, [user]);

  // Derived metrics calculations
  const inProgressTasks = metrics.myTasks.filter(
    (t) => (t.status || '').toLowerCase() === 'in progress' || (t.status || '').toLowerCase() === 'inprogress'
  ).length;
  const completedTasks = metrics.myTasks.filter(
    (t) => (t.status || '').toLowerCase() === 'done' || (t.status || '').toLowerCase() === 'completed'
  ).length;

  const openAssignedIssues = metrics.assignedIssues.filter(
    (i) => (i.status || '').toLowerCase() !== 'resolved' && (i.status || '').toLowerCase() !== 'closed'
  ).length;

  const activeProjects = metrics.myProjects.filter(
    (p) => (p.status || '').toLowerCase() === 'active'
  ).length;
  const planningProjects = metrics.myProjects.filter(
    (p) => (p.status || '').toLowerCase() === 'planning'
  ).length;

  const openReportedIssues = metrics.reportedIssues.filter(
    (i) => (i.status || '').toLowerCase() !== 'resolved' && (i.status || '').toLowerCase() !== 'closed'
  ).length;

  const getStatusPill = (status) => {
    const s = (status || '').toLowerCase();
    if (s.includes('done') || s.includes('completed') || s.includes('resolved')) {
      return <span className="badge badge-active">{status}</span>;
    }
    if (s.includes('progress')) {
      return (
        <span className="badge" style={{ backgroundColor: 'rgba(255, 107, 0, 0.15)', color: 'var(--primary)', borderColor: 'rgba(255, 107, 0, 0.35)' }}>
          {status}
        </span>
      );
    }
    if (s.includes('review')) {
      return (
        <span className="badge" style={{ backgroundColor: 'rgba(168, 85, 247, 0.15)', color: '#c084fc', borderColor: 'rgba(168, 85, 247, 0.35)' }}>
          {status}
        </span>
      );
    }
    return <span className="badge" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-secondary)' }}>{status || 'To Do'}</span>;
  };

  const getPriorityBadge = (priority) => {
    const p = (priority || '').toLowerCase();
    if (p === 'critical' || p === 'urgent') {
      return <span className="badge" style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.35)' }}>{priority}</span>;
    }
    if (p === 'high') {
      return <span className="badge" style={{ backgroundColor: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', borderColor: 'rgba(245, 158, 11, 0.35)' }}>{priority}</span>;
    }
    return <span className="badge" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-muted)' }}>{priority || 'Medium'}</span>;
  };

  const getSeverityBadge = (severity) => {
    const s = (severity || '').toLowerCase();
    if (s === 'critical') {
      return <span className="badge" style={{ backgroundColor: 'rgba(239, 68, 68, 0.18)', color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.4)' }}>Critical</span>;
    }
    if (s === 'high') {
      return <span className="badge" style={{ backgroundColor: 'rgba(245, 158, 11, 0.18)', color: '#f59e0b', borderColor: 'rgba(245, 158, 11, 0.4)' }}>High</span>;
    }
    return <span className="badge" style={{ backgroundColor: 'rgba(255, 255, 255, 0.06)', color: 'var(--text-secondary)' }}>{severity || 'Medium'}</span>;
  };

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
            Here is your live personal engineering command center tracking assigned workload, bug triage, and governance scopes.
          </p>
        </div>
      </div>

      {/* Personalized My Work Command Center Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '14px',
        flexWrap: 'wrap',
        gap: '8px'
      }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Activity size={18} color="var(--primary)" />
            My Work Command Center
          </h2>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Real-time action items and responsibilities assigned to your account
          </span>
        </div>
        <button
          className="btn btn-secondary btn-sm"
          onClick={fetchMyWork}
          disabled={loadingMetrics}
          title="Refresh metrics"
        >
          <RefreshCw size={13} className={loadingMetrics ? 'spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Personalized Metrics Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '16px',
        marginBottom: '28px',
      }}>
        {/* 1. My Assigned Tasks */}
        <Link
          to="/workspace/sprints"
          className="glass-card glass-card-interactive"
          style={{ padding: '20px', textDecoration: 'none', borderTop: '2px solid var(--primary)' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
            <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: '600' }}>
              My Assigned Tasks
            </span>
            <KanbanSquare size={18} color="var(--primary)" />
          </div>
          <div className="kpi-value" style={{ marginTop: '8px', color: 'var(--primary)' }}>
            {loadingMetrics ? '...' : metrics.myTasks.length}
          </div>
          <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', marginTop: '4px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>{loadingMetrics ? 'Loading...' : `${inProgressTasks} In Progress • ${completedTasks} Done`}</span>
            <ArrowUpRight size={13} color="var(--text-muted)" />
          </div>
        </Link>

        {/* 2. My Assigned Defects */}
        <Link
          to="/workspace/qa"
          className="glass-card glass-card-interactive"
          style={{ padding: '20px', textDecoration: 'none', borderTop: '2px solid #ef4444' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
            <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: '600' }}>
              Assigned Defects
            </span>
            <Bug size={18} color="#ef4444" />
          </div>
          <div className="kpi-value" style={{ marginTop: '8px', color: metrics.assignedIssues.length > 0 ? '#ef4444' : '#10b981' }}>
            {loadingMetrics ? '...' : metrics.assignedIssues.length}
          </div>
          <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', marginTop: '4px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>
              {loadingMetrics
                ? 'Loading...'
                : openAssignedIssues === 0
                  ? 'Zero active defect blockers'
                  : `${openAssignedIssues} pending resolution`}
            </span>
            <ArrowUpRight size={13} color="var(--text-muted)" />
          </div>
        </Link>

        {/* 3. My Projects */}
        <Link
          to="/workspace/projects"
          className="glass-card glass-card-interactive"
          style={{ padding: '20px', textDecoration: 'none', borderTop: '2px solid #06b6d4' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
            <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: '600' }}>
              My Projects
            </span>
            <FolderKanban size={18} color="#06b6d4" />
          </div>
          <div className="kpi-value" style={{ marginTop: '8px', color: '#06b6d4' }}>
            {loadingMetrics ? '...' : metrics.myProjects.length}
          </div>
          <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', marginTop: '4px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>
              {loadingMetrics
                ? 'Loading...'
                : metrics.myProjects.length === 0
                  ? 'No project ownerships'
                  : activeProjects > 0
                    ? `${activeProjects} active project scope${activeProjects > 1 ? 's' : ''}`
                    : planningProjects > 0
                      ? `${planningProjects} in planning phase`
                      : `${metrics.myProjects.length} project scope`}
            </span>
            <ArrowUpRight size={13} color="var(--text-muted)" />
          </div>
        </Link>

        {/* 4. Reported Defects */}
        <Link
          to="/workspace/qa"
          className="glass-card glass-card-interactive"
          style={{ padding: '20px', textDecoration: 'none', borderTop: '2px solid #f59e0b' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
            <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: '600' }}>
              Reported By Me
            </span>
            <ShieldAlert size={18} color="#f59e0b" />
          </div>
          <div className="kpi-value" style={{ marginTop: '8px', color: '#f59e0b' }}>
            {loadingMetrics ? '...' : metrics.reportedIssues.length}
          </div>
          <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', marginTop: '4px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>
              {loadingMetrics
                ? 'Loading...'
                : openReportedIssues === 0
                  ? 'All reported bugs resolved'
                  : `${openReportedIssues} under active triage`}
            </span>
            <ArrowUpRight size={13} color="var(--text-muted)" />
          </div>
        </Link>
      </div>

      {/* Operational Work Feed & Launchpad Section */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1.6fr) minmax(0, 1fr)',
        gap: '20px',
      }}>
        {/* Left Column: Active Tasks Feed */}
        <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: 'var(--radius-xs)',
                backgroundColor: 'var(--primary-subtle)',
                border: '1px solid var(--border-focus)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--primary)',
              }}>
                <KanbanSquare size={16} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.1rem', margin: 0 }}>My Active Sprint Tasks</h3>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Assigned engineering work breakdown
                </span>
              </div>
            </div>

            <Link
              to="/workspace/sprints"
              className="btn btn-secondary btn-sm"
              style={{ gap: '4px', fontSize: '0.75rem' }}
            >
              Open Sprints
              <ArrowUpRight size={13} />
            </Link>
          </div>

          {loadingMetrics ? (
            <div style={{ padding: '36px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              Loading assigned tasks...
            </div>
          ) : metrics.myTasks.length === 0 ? (
            <div style={{ padding: '36px 16px', textAlign: 'center', border: '1px dashed var(--border-subtle)', borderRadius: 'var(--radius-sm)' }}>
              <CheckCircle2 size={32} color="var(--success)" style={{ margin: '0 auto 10px' }} />
              <h4 style={{ fontSize: '0.95rem', margin: '0 0 4px', color: 'var(--text-primary)' }}>
                All Caught Up!
              </h4>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0 }}>
                You have no pending tasks assigned in active sprints.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {metrics.myTasks.slice(0, 5).map((task) => (
                <Link
                  key={task.taskId}
                  to="/workspace/sprints"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-xs)',
                    backgroundColor: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid var(--border-subtle)',
                    textDecoration: 'none',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                    e.currentTarget.style.borderColor = 'var(--border-light)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.02)';
                    e.currentTarget.style.borderColor = 'var(--border-subtle)';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.74rem', color: 'var(--text-muted)', flexShrink: 0 }}>
                      #{task.taskId}
                    </span>
                    <span style={{ fontSize: '0.88rem', fontWeight: '500', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {task.title}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                    {getPriorityBadge(task.priority)}
                    {getStatusPill(task.status)}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Assigned Defects & Quick Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Card 1: Assigned Defects */}
          <div className="glass-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: 'var(--radius-xs)',
                  backgroundColor: 'rgba(239, 68, 68, 0.12)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ef4444',
                }}>
                  <Bug size={16} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.05rem', margin: 0 }}>Assigned Defects</h3>
                  <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                    Bugs requiring triage / fix
                  </span>
                </div>
              </div>

              <Link
                to="/workspace/qa"
                className="btn btn-secondary btn-sm"
                style={{ gap: '4px', fontSize: '0.75rem' }}
              >
                QA & Issues
                <ArrowUpRight size={13} />
              </Link>
            </div>

            {loadingMetrics ? (
              <div style={{ padding: '20px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                Loading defects...
              </div>
            ) : metrics.assignedIssues.length === 0 ? (
              <div style={{ padding: '20px 12px', textAlign: 'center', border: '1px dashed var(--border-subtle)', borderRadius: 'var(--radius-sm)' }}>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  Zero defects assigned to your queue.
                </span>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {metrics.assignedIssues.slice(0, 3).map((iss) => (
                  <Link
                    key={iss.issueId}
                    to="/workspace/qa"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 12px',
                      borderRadius: 'var(--radius-xs)',
                      backgroundColor: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid var(--border-subtle)',
                      textDecoration: 'none',
                    }}
                  >
                    <div style={{ minWidth: 0 }}>
                      <span style={{ fontSize: '0.84rem', color: 'var(--text-primary)', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {iss.title}
                      </span>
                    </div>
                    <div style={{ flexShrink: 0, marginLeft: '8px' }}>
                      {getSeverityBadge(iss.severity)}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Card 2: Quick Action Launchpad */}
          <div className="glass-card" style={{ padding: '20px' }}>
            <div style={{ fontSize: '0.82rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-secondary)', marginBottom: '12px' }}>
              Quick Action Launchpad
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <Link
                to="/workspace/projects"
                className="btn btn-secondary btn-sm"
                style={{ justifyContent: 'flex-start', gap: '6px', padding: '8px 10px', fontSize: '0.78rem' }}
              >
                <FolderKanban size={13} color="var(--primary)" />
                Projects
              </Link>
              <Link
                to="/workspace/sprints"
                className="btn btn-secondary btn-sm"
                style={{ justifyContent: 'flex-start', gap: '6px', padding: '8px 10px', fontSize: '0.78rem' }}
              >
                <KanbanSquare size={13} color="var(--success)" />
                Sprints
              </Link>
              <Link
                to="/workspace/qa"
                className="btn btn-secondary btn-sm"
                style={{ justifyContent: 'flex-start', gap: '6px', padding: '8px 10px', fontSize: '0.78rem' }}
              >
                <Bug size={13} color="#ef4444" />
                Report Bug
              </Link>
              <Link
                to="/workspace/ai/requirements"
                className="btn btn-secondary btn-sm"
                style={{ justifyContent: 'flex-start', gap: '6px', padding: '8px 10px', fontSize: '0.78rem' }}
              >
                <Sparkles size={13} color="var(--violet)" />
                AI Studio
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
