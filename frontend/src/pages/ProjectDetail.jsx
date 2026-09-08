import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { projectApi } from '../api/projectApi';
import EditProjectModal from '../components/projects/EditProjectModal';
import {
  ArrowLeft,
  FolderKanban,
  Calendar,
  User,
  Clock,
  Shield,
  Edit3,
  Trash2,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Sparkles,
  Users,
  FileText,
  Kanban,
  Code2,
  Bug,
  Rocket,
  ChevronRight,
  Activity
} from 'lucide-react';

export const ProjectDetail = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  // Edit & Delete modals/states
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const isOwner = Number(user?.userId) === Number(project?.ownerId);
  const isAdmin = (user?.role || '').toUpperCase().includes('ADMIN');
  const canModifyProject = isOwner || isAdmin;

  const fetchProjectDetails = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await projectApi.getProjectById(projectId);
      if (res && res.data) {
        setProject(res.data);
      } else {
        setError('Project details could not be retrieved.');
      }
    } catch (err) {
      console.error('Failed to fetch project:', err);
      setError(
        err.response?.data?.message ||
        'Unable to load project details. It may not exist or you lack access permissions.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) {
      fetchProjectDetails();
    }
  }, [projectId]);

  const handleStatusChange = async (newStatus) => {
    if (!newStatus || newStatus === project.status || statusUpdating) return;
    setStatusUpdating(true);
    setStatusMessage('');
    try {
      const res = await projectApi.updateProjectStatus(projectId, newStatus);
      if (res && res.data) {
        setProject(res.data);
        setStatusMessage(`Project lifecycle transitioned to "${newStatus}"`);
        setTimeout(() => setStatusMessage(''), 3500);
      }
    } catch (err) {
      console.error('Failed to update status:', err);
      alert(err.response?.data?.message || 'Failed to update project status.');
    } finally {
      setStatusUpdating(false);
    }
  };

  const handleDeleteProject = async () => {
    setIsDeleting(true);
    try {
      await projectApi.deleteProject(projectId);
      navigate('/workspace/projects');
    } catch (err) {
      console.error('Failed to delete project:', err);
      alert(err.response?.data?.message || 'Failed to delete project.');
      setIsDeleting(false);
      setDeleteConfirmOpen(false);
    }
  };

  const handleProjectUpdated = (updated) => {
    setProject(updated);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateStr;
    }
  };

  const getStatusBadge = (status) => {
    const s = status?.toLowerCase() || '';
    if (s === 'active' || s === 'completed') {
      return <span className="badge badge-active">{status}</span>;
    }
    if (s === 'planning' || s === 'in progress') {
      return (
        <span
          className="badge"
          style={{
            backgroundColor: 'var(--primary-subtle)',
            color: 'var(--primary)',
            border: '1px solid rgba(255, 107, 0, 0.35)',
          }}
        >
          {status}
        </span>
      );
    }
    if (s === 'on hold') {
      return <span className="badge badge-qa">{status}</span>;
    }
    return <span className="badge badge-dev">{status || 'Draft'}</span>;
  };

  // SDLC Downstream Modules Navigation Grid
  const downstreamModules = [
    {
      id: 'teams',
      title: '03 • Team & Collaborators',
      desc: 'Allocate engineering pods, scrum masters, and tech leads',
      path: `/workspace/teams?projectId=${projectId}`,
      icon: Users,
      accent: 'var(--text-secondary)'
    },
    {
      id: 'requirements',
      title: '04 • Requirements & Specs',
      desc: 'PRD specifications, user story maps, and acceptance criteria',
      path: `/workspace/requirements?projectId=${projectId}`,
      icon: FileText,
      accent: '#38bdf8'
    },
    {
      id: 'ai-prd',
      title: '05 • AI Requirements Studio',
      desc: 'Generate end-to-end PRDs autonomously using Gemini AI',
      path: `/workspace/ai/requirements?projectId=${projectId}`,
      icon: Sparkles,
      accent: 'var(--primary)'
    },
    {
      id: 'sprints',
      title: '06 • Agile Sprints & Kanban',
      desc: 'Sprint backlogs, burn-down metrics, and task board execution',
      path: `/workspace/sprints?projectId=${projectId}`,
      icon: Kanban,
      accent: 'var(--success)'
    },
    {
      id: 'ai-code',
      title: '07 • AI Code Studio',
      desc: 'Synthesize production code snippets, unit tests, and reviews',
      path: `/workspace/ai/code?projectId=${projectId}`,
      icon: Code2,
      accent: '#a855f7'
    },
    {
      id: 'qa',
      title: '08 • QA & Bug Triage Hub',
      desc: 'Test matrices, defect lifecycle, and automated test runs',
      path: `/workspace/qa?projectId=${projectId}`,
      icon: Bug,
      accent: 'var(--danger)'
    },
    {
      id: 'releases',
      title: '09 • Release Command Center',
      desc: 'Semantic build pipelines, artifact sign-offs, and deployment',
      path: `/workspace/releases?projectId=${projectId}`,
      icon: Rocket,
      accent: 'var(--primary)'
    }
  ];

  if (loading) {
    return (
      <div className="glass-card" style={{ padding: '80px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
        <RefreshCw size={24} className="spin" style={{ marginBottom: '12px', color: 'var(--primary)' }} />
        <div>Loading project telemetry...</div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div>
        <div style={{ marginBottom: '16px' }}>
          <Link to="/workspace/projects" className="btn btn-secondary btn-sm" style={{ display: 'inline-flex' }}>
            <ArrowLeft size={15} />
            Back to Projects
          </Link>
        </div>
        <div className="glass-card" style={{ padding: '60px 20px', textAlign: 'center' }}>
          <AlertCircle size={44} color="var(--danger)" style={{ marginBottom: '16px' }} />
          <h2 style={{ marginBottom: '10px' }}>Project Not Found</h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '500px', margin: '0 auto 24px auto', fontSize: '0.9rem' }}>
            {error || `Unable to locate project PRJ-00${projectId}. It may have been archived or removed.`}
          </p>
          <button className="btn btn-primary" onClick={() => navigate('/workspace/projects')}>
            Return to Portfolios
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Back Navigation & Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <Link
          to="/workspace/projects"
          className="btn btn-secondary btn-sm"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
        >
          <ArrowLeft size={15} />
          Back to Portfolios
        </Link>

        {/* Action Buttons (Strict Ownership: Owner or Admin only) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {!canModifyProject && (
            <span
              className="badge"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                color: 'var(--text-muted)',
                borderColor: 'var(--border-subtle)',
                fontSize: '0.8rem',
              }}
            >
              <Shield size={14} color="var(--text-muted)" />
              Managed by {project.ownerName || 'Lead'} (Read-Only)
            </span>
          )}

          {canModifyProject && (
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => setIsEditOpen(true)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <Edit3 size={15} />
              Edit Scope
            </button>
          )}

          {isAdmin && (
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => setDeleteConfirmOpen(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                borderColor: 'rgba(255, 51, 68, 0.4)',
                color: 'var(--danger)'
              }}
            >
              <Trash2 size={15} />
              Archive
            </button>
          )}
        </div>
      </div>

      {/* Success Notification */}
      {statusMessage && (
        <div className="alert alert-success" style={{ marginBottom: '18px' }}>
          <CheckCircle2 size={16} />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Hero Project Header Card */}
      <div className="glass-card" style={{ padding: '28px', marginBottom: '24px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '20px',
          borderBottom: '1px solid var(--border-subtle)',
          paddingBottom: '22px',
          marginBottom: '22px'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
              <span style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.82rem',
                color: 'var(--text-muted)',
                letterSpacing: '0.06em',
                textTransform: 'uppercase'
              }}>
                PORTFOLIO PRJ-00{project.projectId}
              </span>
              {getStatusBadge(project.status)}
            </div>

            <h1 style={{ fontSize: '1.85rem', fontWeight: '700', letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
              {project.name}
            </h1>
          </div>

          {/* Quick Lifecycle Status Switcher (Owner or Admin Only) */}
          {canModifyProject ? (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-end',
              gap: '6px'
            }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Lifecycle Transition (Owner)
              </span>
              <select
                className="form-select"
                value={project.status || 'Active'}
                onChange={(e) => handleStatusChange(e.target.value)}
                disabled={statusUpdating}
                style={{
                  padding: '8px 14px',
                  fontSize: '0.85rem',
                  minWidth: '160px',
                  borderColor: 'var(--border-focus)',
                  color: 'var(--primary)',
                  fontWeight: '600',
                  backgroundColor: 'var(--bg-card)'
                }}
              >
                <option value="Active">Active</option>
                <option value="Planning">Planning</option>
                <option value="In Progress">In Progress</option>
                <option value="On Hold">On Hold</option>
                <option value="Completed">Completed</option>
                <option value="Archived">Archived</option>
              </select>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Current State
              </span>
              {getStatusBadge(project.status)}
            </div>
          )}
        </div>

        {/* Project Metadata Row */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
        }}>
          {/* Project Owner */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: 'var(--radius-xs)',
              backgroundColor: 'var(--primary-subtle)',
              border: '1px solid var(--border-focus)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--primary)',
              fontWeight: '700',
              fontSize: '0.85rem',
            }}>
              {project.ownerName ? project.ownerName.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Project Lead
              </div>
              <div style={{ fontSize: '0.88rem', fontWeight: '600', color: 'var(--text-primary)' }}>
                {project.ownerName || 'Engineering Lead'}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {project.ownerEmail || 'lead@neuroforge.io'}
              </div>
            </div>
          </div>

          {/* Creation Date */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: 'var(--radius-xs)',
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-secondary)'
            }}>
              <Calendar size={18} />
            </div>
            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Initiated Date
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                {formatDate(project.createdDate)}
              </div>
            </div>
          </div>

          {/* Last Updated */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: 'var(--radius-xs)',
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-secondary)'
            }}>
              <Clock size={18} />
            </div>
            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Last Synchronized
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                {formatDate(project.updatedAt || project.createdDate)}
              </div>
            </div>
          </div>

          {/* Telemetry Status */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: 'var(--radius-xs)',
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--success)'
            }}>
              <Activity size={18} />
            </div>
            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                SDLC Integrity
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--success)', fontWeight: '600' }}>
                Operational • In Spec
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scope & Architecture Specifications */}
      <div className="glass-card" style={{ padding: '24px', marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileText size={18} color="var(--primary)" />
            Architecture Scope & Executive Brief
          </h3>
          {canModifyProject && (
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => setIsEditOpen(true)}
              style={{ fontSize: '0.78rem', padding: '4px 10px' }}
            >
              Modify Brief
            </button>
          )}
        </div>

        <div style={{
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-sm)',
          padding: '18px 20px',
          color: project.description ? 'var(--text-secondary)' : 'var(--text-muted)',
          fontSize: '0.92rem',
          lineHeight: '1.65',
          whiteSpace: 'pre-wrap',
          fontFamily: project.description ? 'inherit' : 'var(--font-mono)'
        }}>
          {project.description ||
            '// No scope brief defined yet. Initiate PRD synthesis in Module 05 or edit project to attach requirements.'}
        </div>
      </div>

      {/* Downstream SDLC Lifecycle Command Hub */}
      <div style={{ marginBottom: '16px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '4px' }}>
          SDLC Lifecycle Command Modules
        </h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '16px' }}>
          Navigate directly to downstream lifecycle stages linked to this project portfolio
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))',
          gap: '16px'
        }}>
          {downstreamModules.map((mod) => {
            const Icon = mod.icon;
            return (
              <Link
                key={mod.id}
                to={mod.path}
                className="glass-card glass-card-interactive"
                style={{
                  padding: '18px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  textDecoration: 'none'
                }}
              >
                <div style={{ display: 'flex', gap: '14px' }}>
                  <div style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: 'var(--radius-xs)',
                    backgroundColor: 'var(--bg-card)',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <Icon size={18} color={mod.accent} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.92rem', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '4px' }}>
                      {mod.title}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                      {mod.desc}
                    </div>
                  </div>
                </div>

                <ChevronRight size={18} color="var(--text-muted)" style={{ marginTop: '10px', flexShrink: 0 }} />
              </Link>
            );
          })}
        </div>
      </div>

      {/* Modals */}
      <EditProjectModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        project={project}
        onProjectUpdated={handleProjectUpdated}
      />

      {/* Confirmation Modal for Project Deletion */}
      {deleteConfirmOpen && (
        <div className="modal-backdrop" onClick={() => !isDeleting && setDeleteConfirmOpen(false)}>
          <div
            className="modal-content"
            style={{ maxWidth: '440px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
              <AlertCircle size={24} color="var(--danger)" />
              <h3 style={{ fontSize: '1.2rem', fontWeight: '700' }}>Confirm Project Archive</h3>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.5', marginBottom: '22px' }}>
              Are you sure you want to archive <strong>{project.name}</strong> (PRJ-00{project.projectId})?
              All downstream requirements, sprints, and release links will be deactivated.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button
                type="button"
                className="btn btn-secondary"
                disabled={isDeleting}
                onClick={() => setDeleteConfirmOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary"
                style={{ backgroundColor: 'var(--danger)', borderColor: 'var(--danger)' }}
                disabled={isDeleting}
                onClick={handleDeleteProject}
              >
                {isDeleting ? 'Archiving...' : 'Yes, Archive Project'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetail;
