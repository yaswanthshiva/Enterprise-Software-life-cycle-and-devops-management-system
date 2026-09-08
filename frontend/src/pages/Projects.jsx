import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { projectApi } from '../api/projectApi';
import CreateProjectModal from '../components/projects/CreateProjectModal';
import EditProjectModal from '../components/projects/EditProjectModal';
import {
  FolderKanban,
  Plus,
  Search,
  Filter,
  RefreshCw,
  User,
  Calendar,
  Layers,
  ArrowUpRight,
  AlertCircle,
  Edit3
} from 'lucide-react';

export const Projects = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('ALL'); // 'ALL' or 'MY'

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);

  const roleStr = (user?.role || '').toUpperCase();
  const canManageProjects =
    roleStr.includes('ADMIN') ||
    roleStr.includes('MANAGER') ||
    roleStr.includes('PROJECT') ||
    true;

  const fetchProjects = async () => {
    setLoading(true);
    setError('');
    try {
      let res;
      if (viewMode === 'MY') {
        res = await projectApi.getMyProjects();
      } else {
        res = await projectApi.getAllProjects(statusFilter);
      }
      if (res && res.data) {
        setProjects(res.data);
      }
    } catch (err) {
      console.error('Failed to load projects:', err);
      setError('Unable to fetch enterprise projects. Please verify backend connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [statusFilter, viewMode]);

  const handleProjectCreated = (newProject) => {
    setProjects((prev) => [newProject, ...prev]);
  };

  const handleProjectUpdated = (updatedProject) => {
    setProjects((prev) =>
      prev.map((p) => (p.projectId === updatedProject.projectId ? updatedProject : p))
    );
  };

  // Filtered by text search
  const filteredProjects = projects.filter((p) => {
    const q = searchQuery.toLowerCase();
    const nameMatch = p.name?.toLowerCase().includes(q);
    const descMatch = p.description?.toLowerCase().includes(q);
    const ownerMatch = p.ownerName?.toLowerCase().includes(q);
    return nameMatch || descMatch || ownerMatch;
  });

  // Calculate KPIs
  const totalCount = projects.length;
  const activeCount = projects.filter((p) => p.status?.toLowerCase() === 'active').length;
  const planningCount = projects.filter((p) => p.status?.toLowerCase() === 'planning').length;
  const inProgressCount = projects.filter((p) => p.status?.toLowerCase() === 'in progress').length;

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

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <div className="page-title">
            <FolderKanban size={28} color="var(--primary)" />
            <h1>Project Portfolios & Governance</h1>
          </div>
          <p className="page-subtitle">
            Enterprise SDLC project lifecycles, deliverables, and architecture scopes
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            className="btn btn-secondary"
            onClick={fetchProjects}
            disabled={loading}
            title="Refresh list"
          >
            <RefreshCw size={15} />
            Refresh
          </button>

          <button
            className="btn btn-primary"
            onClick={() => setIsCreateOpen(true)}
            id="btn-create-project"
          >
            <Plus size={16} />
            Create Project
          </button>
        </div>
      </div>

      {/* KPI Stats Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '14px',
        marginBottom: '24px',
      }}>
        <div className="glass-card" style={{ padding: '18px 20px' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Total Portfolios
          </span>
          <div className="kpi-value" style={{ marginTop: '6px' }}>
            {totalCount}
          </div>
        </div>

        <div className="glass-card" style={{ padding: '18px 20px' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Active Execution
          </span>
          <div className="kpi-value" style={{ marginTop: '6px', color: 'var(--primary)' }}>
            {activeCount}
          </div>
        </div>

        <div className="glass-card" style={{ padding: '18px 20px' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Planning & PRD
          </span>
          <div className="kpi-value" style={{ marginTop: '6px', color: '#ff9d47' }}>
            {planningCount}
          </div>
        </div>

        <div className="glass-card" style={{ padding: '18px 20px' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            In Progress
          </span>
          <div className="kpi-value" style={{ marginTop: '6px', color: 'var(--success)' }}>
            {inProgressCount}
          </div>
        </div>
      </div>

      {/* Error alert */}
      {error && (
        <div className="alert alert-error">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="glass-card" style={{
        padding: '14px 18px',
        marginBottom: '22px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '14px',
      }}>
        {/* Search */}
        <div style={{ position: 'relative', minWidth: '280px', flex: 1 }}>
          <input
            type="text"
            className="form-input"
            placeholder="Search by project name, description, or owner..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: '36px' }}
          />
          <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
        </div>

        {/* View Mode (All vs My) */}
        <div style={{ display: 'flex', gap: '6px' }}>
          <button
            className={`btn btn-sm ${viewMode === 'ALL' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => { setViewMode('ALL'); setStatusFilter(''); }}
          >
            All Projects
          </button>
          <button
            className={`btn btn-sm ${viewMode === 'MY' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => { setViewMode('MY'); setStatusFilter(''); }}
          >
            My Projects
          </button>
        </div>

        {/* Status Pills */}
        {viewMode === 'ALL' && (
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {['', 'Active', 'Planning', 'In Progress', 'Completed'].map((st) => (
              <button
                key={st}
                className={`btn btn-sm ${statusFilter === st ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setStatusFilter(st)}
              >
                {st || 'All Statuses'}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Projects Grid */}
      {loading ? (
        <div className="glass-card" style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
          Loading enterprise projects...
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="glass-card" style={{ padding: '60px 20px', textAlign: 'center' }}>
          <FolderKanban size={40} color="var(--text-muted)" style={{ marginBottom: '14px' }} />
          <h3 style={{ marginBottom: '6px' }}>No Projects Found</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: '20px' }}>
            {searchQuery || statusFilter
              ? 'No projects match your active search or filter criteria.'
              : 'No enterprise projects have been initiated in this workspace yet.'}
          </p>
          <button className="btn btn-primary" onClick={() => setIsCreateOpen(true)} id="btn-empty-create-project">
            <Plus size={16} />
            Create Project
          </button>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
          gap: '18px',
        }}>
          {filteredProjects.map((p) => (
            <div
              key={p.projectId}
              className="glass-card glass-card-interactive"
              style={{
                padding: '22px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                {/* Top Row */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.75rem',
                    color: 'var(--text-muted)',
                  }}>
                    PRJ-00{p.projectId}
                  </span>
                  {getStatusBadge(p.status)}
                </div>

                {/* Name */}
                <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>
                  <Link
                    to={`/workspace/projects/${p.projectId}`}
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {p.name}
                  </Link>
                </h3>

                {/* Description */}
                <p style={{
                  color: 'var(--text-secondary)',
                  fontSize: '0.88rem',
                  lineHeight: '1.55',
                  marginBottom: '18px',
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  minHeight: '4.1em',
                }}>
                  {p.description || 'No detailed architecture description provided.'}
                </p>
              </div>

              {/* Card Footer */}
              <div style={{
                borderTop: '1px solid var(--border-subtle)',
                paddingTop: '14px',
                marginTop: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
                {/* Owner info */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: 'var(--radius-xs)',
                    backgroundColor: 'var(--primary-subtle)',
                    border: '1px solid var(--border-focus)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--primary)',
                    fontSize: '0.72rem',
                    fontWeight: '700',
                  }}>
                    {p.ownerName ? p.ownerName.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      {p.ownerName || 'Lead'}
                    </span>
                    {Number(user?.userId) === Number(p.ownerId) ? (
                      <span className="badge badge-active" style={{ fontSize: '0.65rem', padding: '1px 5px' }}>
                        You Own
                      </span>
                    ) : !(user?.role || '').toUpperCase().includes('ADMIN') ? (
                      <span className="badge" style={{ fontSize: '0.65rem', padding: '1px 5px', color: 'var(--text-muted)' }}>
                        Read Only
                      </span>
                    ) : null}
                  </div>
                </div>

                {/* Actions (Strict Ownership: Owner or Admin only) */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {(Number(user?.userId) === Number(p.ownerId) || (user?.role || '').toUpperCase().includes('ADMIN')) && (
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => {
                        setSelectedProject(p);
                        setIsEditOpen(true);
                      }}
                      title="Edit project details (Owner / Admin)"
                      style={{ padding: '4px 8px' }}
                    >
                      <Edit3 size={13} />
                    </button>
                  )}

                  <Link
                    to={`/workspace/projects/${p.projectId}`}
                    className="btn btn-secondary btn-sm"
                    style={{ gap: '4px' }}
                  >
                    View
                    <ArrowUpRight size={13} />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      <CreateProjectModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onProjectCreated={handleProjectCreated}
      />

      <EditProjectModal
        isOpen={isEditOpen}
        project={selectedProject}
        onClose={() => {
          setIsEditOpen(false);
          setSelectedProject(null);
        }}
        onProjectUpdated={handleProjectUpdated}
      />
    </div>
  );
};

export default Projects;
