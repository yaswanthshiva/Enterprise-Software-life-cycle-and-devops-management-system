import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { projectApi } from '../api/projectApi';
import { releaseApi } from '../api/releaseApi';
import {
  Rocket,
  GitBranch,
  Server,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RotateCcw,
  Play,
  Plus,
  Search,
  Filter,
  Clock,
  Calendar,
  Edit3,
  Trash2,
  Activity,
  Layers,
  Terminal,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  User,
  FolderKanban,
  Tag,
  X,
  ShieldCheck,
  AlertCircle,
  Flame,
} from 'lucide-react';

export const Releases = () => {
  const {
    user,
    isAdmin,
    isProjectManager,
    isDevOps,
  } = useAuth();

  // RBAC Permission Clearance
  // Admins, PMs, and DevOps Engineers have clearance to create/edit releases and trigger/update deployments
  const canManageReleases = isAdmin || isProjectManager || isDevOps;
  const canDeploy = isAdmin || isProjectManager || isDevOps;
  const canDelete = isAdmin || isProjectManager;

  const [searchParams, setSearchParams] = useSearchParams();
  const urlProjectId = searchParams.get('projectId');
  const urlTab = searchParams.get('tab');

  // Core State
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState(urlProjectId || '');
  const [releases, setReleases] = useState([]);
  const [deployments, setDeployments] = useState([]);
  const [healthMetrics, setHealthMetrics] = useState(null);
  const [activeTab, setActiveTab] = useState(urlTab === 'deployments' ? 'DEPLOYMENTS' : 'RELEASES');

  // Loading & Feedback State
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [loadingData, setLoadingData] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Release Filters & UI State
  const [releaseSearch, setReleaseSearch] = useState('');
  const [releaseStatusFilter, setReleaseStatusFilter] = useState('ALL');
  const [expandedReleaseId, setExpandedReleaseId] = useState(null);

  // Deployment Filters & UI State
  const [deploymentSearch, setDeploymentSearch] = useState('');
  const [deploymentEnvFilter, setDeploymentEnvFilter] = useState('ALL');
  const [deploymentStatusFilter, setDeploymentStatusFilter] = useState('ALL');
  const [deploymentViewMode, setDeploymentViewMode] = useState('ALL'); // 'ALL' or 'MY_DEPLOYMENTS'

  // Modals
  const [isCreateReleaseOpen, setIsCreateReleaseOpen] = useState(false);
  const [releaseForm, setReleaseForm] = useState({
    versionNumber: '',
    releaseName: '',
    releaseNotes: '',
    status: 'Draft',
    releaseDate: '',
  });

  const [isEditReleaseOpen, setIsEditReleaseOpen] = useState(false);
  const [currentReleaseToEdit, setCurrentReleaseToEdit] = useState(null);
  const [editReleaseForm, setEditReleaseForm] = useState({
    releaseName: '',
    releaseNotes: '',
    status: 'Draft',
    releaseDate: '',
  });

  const [isCreateDeploymentOpen, setIsCreateDeploymentOpen] = useState(false);
  const [deploymentForm, setDeploymentForm] = useState({
    releaseId: '',
    environment: 'Development',
    status: 'In Progress',
    notes: '',
  });

  const [isUpdateDeploymentStatusOpen, setIsUpdateDeploymentStatusOpen] = useState(false);
  const [currentDeploymentToUpdate, setCurrentDeploymentToUpdate] = useState(null);
  const [deploymentStatusForm, setDeploymentStatusForm] = useState({
    status: 'Success',
    notes: '',
  });

  // Auto-clear messages
  useEffect(() => {
    if (successMsg) {
      const timer = setTimeout(() => setSuccessMsg(''), 4000);
      return () => clearTimeout(timer);
    }
  }, [successMsg]);

  // 1. Fetch Projects on Mount
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoadingProjects(true);
        const res = await projectApi.getAllProjects();
        const projectList = res?.data || [];
        setProjects(projectList);

        if (projectList.length > 0) {
          if (urlProjectId && projectList.some((p) => String(p.projectId) === String(urlProjectId))) {
            setSelectedProjectId(urlProjectId);
          } else {
            setSelectedProjectId(String(projectList[0].projectId));
          }
        }
      } catch (err) {
        console.error('Failed to load projects:', err);
        setError('Failed to fetch project portfolio.');
      } finally {
        setLoadingProjects(false);
      }
    };
    fetchProjects();
  }, []);

  // Sync URL search params
  useEffect(() => {
    if (selectedProjectId) {
      setSearchParams({
        projectId: selectedProjectId,
        tab: activeTab === 'DEPLOYMENTS' ? 'deployments' : 'releases',
      });
    }
  }, [selectedProjectId, activeTab, setSearchParams]);

  // 2. Fetch Releases, Deployments, and Telemetry Metrics
  const loadProjectData = async (projectId) => {
    if (!projectId) return;
    try {
      setLoadingData(true);
      setError('');

      const [releasesRes, deploymentsRes, healthRes] = await Promise.allSettled([
        releaseApi.getReleasesByProject(projectId),
        releaseApi.getDeploymentsByProject(projectId),
        releaseApi.getProjectReleaseHealth(projectId),
      ]);

      if (releasesRes.status === 'fulfilled' && releasesRes.value?.data) {
        setReleases(releasesRes.value.data);
      } else {
        setReleases([]);
      }

      if (deploymentsRes.status === 'fulfilled' && deploymentsRes.value?.data) {
        setDeployments(deploymentsRes.value.data);
      } else {
        setDeployments([]);
      }

      if (healthRes.status === 'fulfilled' && healthRes.value?.data) {
        setHealthMetrics(healthRes.value.data);
      } else {
        setHealthMetrics(null);
      }
    } catch (err) {
      console.error('Failed to load project release data:', err);
      setError('Failed to retrieve release orchestration data.');
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    if (selectedProjectId) {
      loadProjectData(selectedProjectId);
    }
  }, [selectedProjectId]);

  // Selected Project Meta
  const currentProject = useMemo(() => {
    return projects.find((p) => String(p.projectId) === String(selectedProjectId));
  }, [projects, selectedProjectId]);

  // ==========================================
  // HANDLERS: RELEASES
  // ==========================================

  const handleOpenCreateRelease = () => {
    setReleaseForm({
      versionNumber: '',
      releaseName: '',
      releaseNotes: '',
      status: 'Draft',
      releaseDate: new Date().toISOString().split('T')[0],
    });
    setIsCreateReleaseOpen(true);
  };

  const handleCreateReleaseSubmit = async (e) => {
    e.preventDefault();
    if (!selectedProjectId) {
      setError('Please select a project first.');
      return;
    }
    if (!releaseForm.versionNumber.trim()) {
      setError('Version number is required (e.g. v1.0.0).');
      return;
    }

    try {
      setActionLoading(true);
      setError('');
      await releaseApi.createRelease({
        projectId: Number(selectedProjectId),
        versionNumber: releaseForm.versionNumber.trim(),
        releaseName: releaseForm.releaseName.trim(),
        releaseNotes: releaseForm.releaseNotes,
        status: releaseForm.status,
        releaseDate: releaseForm.releaseDate || null,
      });

      setSuccessMsg(`Release ${releaseForm.versionNumber.trim()} created successfully.`);
      setIsCreateReleaseOpen(false);
      await loadProjectData(selectedProjectId);
    } catch (err) {
      console.error('Error creating release:', err);
      setError(err?.response?.data?.message || 'Failed to create release version.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenEditRelease = (rel) => {
    setCurrentReleaseToEdit(rel);
    setEditReleaseForm({
      releaseName: rel.releaseName || '',
      releaseNotes: rel.releaseNotes || '',
      status: rel.status || 'Draft',
      releaseDate: rel.releaseDate || '',
    });
    setIsEditReleaseOpen(true);
  };

  const handleEditReleaseSubmit = async (e) => {
    e.preventDefault();
    if (!currentReleaseToEdit) return;

    try {
      setActionLoading(true);
      setError('');
      await releaseApi.updateRelease(currentReleaseToEdit.releaseId, {
        releaseName: editReleaseForm.releaseName.trim(),
        releaseNotes: editReleaseForm.releaseNotes,
        status: editReleaseForm.status,
        releaseDate: editReleaseForm.releaseDate || null,
      });

      setSuccessMsg(`Release ${currentReleaseToEdit.versionNumber} updated.`);
      setIsEditReleaseOpen(false);
      setCurrentReleaseToEdit(null);
      await loadProjectData(selectedProjectId);
    } catch (err) {
      console.error('Error updating release:', err);
      setError(err?.response?.data?.message || 'Failed to update release details.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleQuickStatusChange = async (releaseId, nextStatus) => {
    try {
      setActionLoading(true);
      setError('');
      await releaseApi.updateReleaseStatus(releaseId, nextStatus);
      setSuccessMsg(`Release status transitioned to ${nextStatus}.`);
      await loadProjectData(selectedProjectId);
    } catch (err) {
      console.error('Error updating status:', err);
      setError(err?.response?.data?.message || 'Failed to update release status.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteRelease = async (releaseId, versionNumber) => {
    if (!window.confirm(`Are you sure you want to delete release ${versionNumber}? All associated deployments may be affected.`)) {
      return;
    }

    try {
      setActionLoading(true);
      setError('');
      await releaseApi.deleteRelease(releaseId);
      setSuccessMsg(`Release ${versionNumber} deleted successfully.`);
      await loadProjectData(selectedProjectId);
    } catch (err) {
      console.error('Error deleting release:', err);
      setError(err?.response?.data?.message || 'Failed to delete release.');
    } finally {
      setActionLoading(false);
    }
  };

  // ==========================================
  // HANDLERS: DEPLOYMENTS
  // ==========================================

  const handleOpenCreateDeployment = (preselectedReleaseId = null) => {
    setDeploymentForm({
      releaseId: preselectedReleaseId ? String(preselectedReleaseId) : (releases[0] ? String(releases[0].releaseId) : ''),
      environment: 'Development',
      status: 'In Progress',
      notes: '',
    });
    setIsCreateDeploymentOpen(true);
  };

  const handleCreateDeploymentSubmit = async (e) => {
    e.preventDefault();
    if (!deploymentForm.releaseId) {
      setError('Please select a target release to deploy.');
      return;
    }

    try {
      setActionLoading(true);
      setError('');
      await releaseApi.createDeployment({
        releaseId: Number(deploymentForm.releaseId),
        environment: deploymentForm.environment,
        status: deploymentForm.status,
        notes: deploymentForm.notes,
      });

      setSuccessMsg(`Deployment pipeline triggered for ${deploymentForm.environment}.`);
      setIsCreateDeploymentOpen(false);
      setActiveTab('DEPLOYMENTS');
      await loadProjectData(selectedProjectId);
    } catch (err) {
      console.error('Error creating deployment:', err);
      setError(err?.response?.data?.message || 'Failed to trigger deployment.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenUpdateDeploymentStatus = (dep) => {
    setCurrentDeploymentToUpdate(dep);
    setDeploymentStatusForm({
      status: dep.status || 'Success',
      notes: dep.notes || '',
    });
    setIsUpdateDeploymentStatusOpen(true);
  };

  const handleUpdateDeploymentStatusSubmit = async (e) => {
    e.preventDefault();
    if (!currentDeploymentToUpdate) return;

    try {
      setActionLoading(true);
      setError('');
      await releaseApi.updateDeploymentStatus(currentDeploymentToUpdate.deploymentId, {
        status: deploymentStatusForm.status,
        notes: deploymentStatusForm.notes,
      });

      setSuccessMsg(`Deployment #${currentDeploymentToUpdate.deploymentId} updated to ${deploymentStatusForm.status}.`);
      setIsUpdateDeploymentStatusOpen(false);
      setCurrentDeploymentToUpdate(null);
      await loadProjectData(selectedProjectId);
    } catch (err) {
      console.error('Error updating deployment status:', err);
      setError(err?.response?.data?.message || 'Failed to update deployment verdict.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteDeployment = async (depId) => {
    if (!window.confirm(`Delete deployment record #${depId}?`)) return;

    try {
      setActionLoading(true);
      setError('');
      await releaseApi.deleteDeployment(depId);
      setSuccessMsg(`Deployment #${depId} deleted successfully.`);
      await loadProjectData(selectedProjectId);
    } catch (err) {
      console.error('Error deleting deployment:', err);
      setError(err?.response?.data?.message || 'Failed to delete deployment.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleDeploymentViewMode = async (mode) => {
    setDeploymentViewMode(mode);
    try {
      setLoadingData(true);
      if (mode === 'MY_DEPLOYMENTS') {
        const res = await releaseApi.getMyDeployments();
        setDeployments(res?.data || []);
      } else {
        const res = await releaseApi.getDeploymentsByProject(selectedProjectId);
        setDeployments(res?.data || []);
      }
    } catch (err) {
      console.error('Failed to toggle deployment view:', err);
      setError('Failed to fetch deployment records.');
    } finally {
      setLoadingData(false);
    }
  };

  // ==========================================
  // FILTERED DATA
  // ==========================================

  const filteredReleases = useMemo(() => {
    return releases.filter((rel) => {
      const matchesSearch =
        !releaseSearch ||
        rel.versionNumber?.toLowerCase().includes(releaseSearch.toLowerCase()) ||
        rel.releaseName?.toLowerCase().includes(releaseSearch.toLowerCase()) ||
        rel.releaseNotes?.toLowerCase().includes(releaseSearch.toLowerCase());

      const matchesStatus =
        releaseStatusFilter === 'ALL' ||
        rel.status?.toLowerCase() === releaseStatusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [releases, releaseSearch, releaseStatusFilter]);

  const filteredDeployments = useMemo(() => {
    return deployments.filter((dep) => {
      const matchesSearch =
        !deploymentSearch ||
        dep.releaseVersion?.toLowerCase().includes(deploymentSearch.toLowerCase()) ||
        dep.deployedByName?.toLowerCase().includes(deploymentSearch.toLowerCase()) ||
        dep.notes?.toLowerCase().includes(deploymentSearch.toLowerCase());

      const matchesEnv =
        deploymentEnvFilter === 'ALL' ||
        dep.environment?.toLowerCase() === deploymentEnvFilter.toLowerCase();

      const matchesStatus =
        deploymentStatusFilter === 'ALL' ||
        dep.status?.toLowerCase() === deploymentStatusFilter.toLowerCase();

      return matchesSearch && matchesEnv && matchesStatus;
    });
  }, [deployments, deploymentSearch, deploymentEnvFilter, deploymentStatusFilter]);

  // Color & Badge Helpers
  const renderReleaseStatusBadge = (status) => {
    switch ((status || '').toUpperCase()) {
      case 'RELEASED':
        return (
          <span className="badge" style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#10b981', border: '1px solid #10b981', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <CheckCircle2 size={12} /> Released
          </span>
        );
      case 'IN PROGRESS':
      case 'IN_PROGRESS':
        return (
          <span className="badge" style={{ backgroundColor: 'rgba(6, 182, 212, 0.15)', color: '#06b6d4', border: '1px solid #06b6d4', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <Activity size={12} /> In Progress
          </span>
        );
      case 'ARCHIVED':
        return (
          <span className="badge" style={{ backgroundColor: 'rgba(148, 163, 184, 0.15)', color: 'var(--text-muted)', border: '1px solid var(--border-subtle)' }}>
            Archived
          </span>
        );
      case 'DRAFT':
      default:
        return (
          <span className="badge" style={{ backgroundColor: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', border: '1px solid #f59e0b' }}>
            Draft
          </span>
        );
    }
  };

  const renderEnvBadge = (env) => {
    switch ((env || '').toUpperCase()) {
      case 'PRODUCTION':
      case 'PROD':
        return (
          <span className="badge" style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', border: '1px solid #ef4444', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <Flame size={12} /> Production
          </span>
        );
      case 'STAGING':
      case 'STAGE':
        return (
          <span className="badge" style={{ backgroundColor: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', border: '1px solid #f59e0b' }}>
            Staging
          </span>
        );
      case 'DEVELOPMENT':
      case 'DEV':
      default:
        return (
          <span className="badge" style={{ backgroundColor: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6', border: '1px solid #3b82f6' }}>
            Development
          </span>
        );
    }
  };

  const renderDeploymentStatusBadge = (status) => {
    switch ((status || '').toUpperCase()) {
      case 'SUCCESS':
        return (
          <span className="badge" style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#10b981', border: '1px solid #10b981', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <CheckCircle2 size={12} /> Success
          </span>
        );
      case 'FAILED':
        return (
          <span className="badge" style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', border: '1px solid #ef4444', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <XCircle size={12} /> Failed
          </span>
        );
      case 'ROLLED BACK':
      case 'ROLLED_BACK':
        return (
          <span className="badge" style={{ backgroundColor: 'rgba(255, 107, 0, 0.15)', color: 'var(--primary)', border: '1px solid var(--primary)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <RotateCcw size={12} /> Rolled Back
          </span>
        );
      case 'IN PROGRESS':
      case 'IN_PROGRESS':
      default:
        return (
          <span className="badge" style={{ backgroundColor: 'rgba(6, 182, 212, 0.15)', color: '#06b6d4', border: '1px solid #06b6d4', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <RefreshCw size={12} style={{ animation: 'spin 2s linear infinite' }} /> In Progress
          </span>
        );
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px', paddingBottom: '40px' }}>
      {/* 1. Header Command Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Rocket size={24} color="var(--primary)" />
            <h1 className="text-gradient-white" style={{ fontSize: '1.75rem', fontWeight: '800', letterSpacing: '-0.02em', margin: 0 }}>
              Release Command Center &amp; CI/CD
            </h1>
            <span className="badge" style={{ backgroundColor: 'rgba(255, 107, 0, 0.12)', color: 'var(--primary)', border: '1px solid var(--border-focus)', fontSize: '0.72rem' }}>
              MODULE 09
            </span>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.86rem', marginTop: '4px' }}>
            Semantic release versioning, multi-environment deployment orchestration, and pipeline telemetry.
          </p>
        </div>

        {/* Global Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => loadProjectData(selectedProjectId)}
            disabled={loadingData || !selectedProjectId}
            title="Refresh releases and deployments"
          >
            <RefreshCw size={14} style={loadingData ? { animation: 'spin 1s linear infinite' } : {}} />
            <span>Sync Pipelines</span>
          </button>

          {canDeploy && (
            <button
              className="btn btn-outline btn-sm"
              onClick={() => handleOpenCreateDeployment()}
              disabled={releases.length === 0}
              title="Trigger a new CI/CD deployment"
            >
              <Play size={14} />
              <span>Deploy</span>
            </button>
          )}

          {canManageReleases && (
            <button
              className="btn btn-primary btn-sm"
              onClick={handleOpenCreateRelease}
              disabled={!selectedProjectId}
            >
              <Plus size={15} />
              <span>New Release</span>
            </button>
          )}
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <div className="alert alert-danger" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', borderRadius: '6px', background: 'var(--danger-bg)', border: '1px solid var(--danger-border)', color: 'var(--danger)' }}>
          <AlertCircle size={18} color="#ef4444" />
          <span style={{ flex: 1, fontSize: '0.86rem' }}>{error}</span>
          <button onClick={() => setError('')} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}>
            <X size={16} />
          </button>
        </div>
      )}

      {successMsg && (
        <div className="alert alert-success" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', borderRadius: '6px', background: 'var(--success-bg)', border: '1px solid var(--success-border)', color: 'var(--success)' }}>
          <CheckCircle2 size={18} color="var(--success)" />
          <span style={{ flex: 1, fontSize: '0.86rem' }}>{successMsg}</span>
          <button onClick={() => setSuccessMsg('')} style={{ background: 'none', border: 'none', color: 'var(--success)', cursor: 'pointer' }}>
            <X size={16} />
          </button>
        </div>
      )}

      {/* 2. Executive Telemetry HUD Bar */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
        gap: '14px',
      }}>
        {/* Metric 1: Deployment Success Rate */}
        <div className="glass-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-secondary)', letterSpacing: '0.05em' }}>
              Deployment Success Rate
            </span>
            <Activity size={16} color="var(--primary)" />
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span style={{
              fontSize: '1.85rem',
              fontWeight: '800',
              fontFamily: 'monospace',
              color: (healthMetrics?.deploymentSuccessRatePercentage || 0) >= 80 ? '#10b981' : '#ff6b00'
            }}>
              {healthMetrics?.deploymentSuccessRatePercentage != null
                ? `${healthMetrics.deploymentSuccessRatePercentage.toFixed(1)}%`
                : '100.0%'}
            </span>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              ({healthMetrics?.successfulDeployments || 0}/{healthMetrics?.totalDeployments || 0} runs)
            </span>
          </div>
          <div style={{ width: '100%', height: '5px', backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: '3px', overflow: 'hidden' }}>
            <div style={{
              width: `${Math.min(100, healthMetrics?.deploymentSuccessRatePercentage != null ? healthMetrics.deploymentSuccessRatePercentage : 100)}%`,
              height: '100%',
              background: (healthMetrics?.deploymentSuccessRatePercentage || 0) >= 80 ? 'linear-gradient(90deg, #10b981, #34d399)' : 'linear-gradient(90deg, #ff6b00, #ff8c26)',
              transition: 'width 0.5s ease',
            }} />
          </div>
        </div>

        {/* Metric 2: Versioned Releases */}
        <div className="glass-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-secondary)', letterSpacing: '0.05em' }}>
              Versioned Releases
            </span>
            <Tag size={16} color="var(--primary)" />
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span style={{ fontSize: '1.85rem', fontWeight: '800', fontFamily: 'monospace', color: 'var(--text-primary)' }}>
              {healthMetrics?.totalReleases != null ? healthMetrics.totalReleases : releases.length}
            </span>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>total versions</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
            <span style={{ color: '#10b981', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
              ● {healthMetrics?.completedReleases || 0} Released
            </span>
            <span style={{ color: '#06b6d4', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
              ● {healthMetrics?.inProgressReleases || 0} In Progress
            </span>
            <span style={{ color: '#f59e0b' }}>
              ● {healthMetrics?.draftReleases || 0} Draft
            </span>
          </div>
        </div>

        {/* Metric 3: Pipeline Triggers */}
        <div className="glass-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-secondary)', letterSpacing: '0.05em' }}>
              Deployment Pipelines
            </span>
            <Server size={16} color="#06b6d4" />
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span style={{ fontSize: '1.85rem', fontWeight: '800', fontFamily: 'monospace', color: 'var(--text-primary)' }}>
              {healthMetrics?.totalDeployments != null ? healthMetrics.totalDeployments : deployments.length}
            </span>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>runs triggered</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.74rem' }}>
            <span style={{ color: '#10b981', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
              ● {healthMetrics?.successfulDeployments || 0} Succeeded
            </span>
            <span style={{ color: '#ef4444', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
              ● {healthMetrics?.failedDeployments || 0} Failed
            </span>
            <span style={{ color: 'var(--primary)', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
              ● {healthMetrics?.rolledBackDeployments || 0} Rolled Back
            </span>
          </div>
        </div>

        {/* Metric 4: Target Environment Fleet */}
        <div className="glass-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-secondary)', letterSpacing: '0.05em' }}>
              Target Environment Fleet
            </span>
            <GitBranch size={16} color="#a855f7" />
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span style={{ fontSize: '1.85rem', fontWeight: '800', fontFamily: 'monospace', color: 'var(--text-primary)' }}>
              3
            </span>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>active environments</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
            <span style={{ color: '#3b82f6' }}>
              DEV ({healthMetrics?.developmentDeployments || 0})
            </span>
            <span>•</span>
            <span style={{ color: '#f59e0b' }}>
              STAGE ({healthMetrics?.stagingDeployments || 0})
            </span>
            <span>•</span>
            <span style={{ color: '#ef4444' }}>
              PROD ({healthMetrics?.productionDeployments || 0})
            </span>
          </div>
        </div>
      </div>

      {/* 3. Scope & Tab Bar */}
      <div className="glass-card" style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
        {/* Project Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <FolderKanban size={16} color="var(--primary)" />
          <label style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--text-secondary)' }}>Project:</label>
          <select
            className="form-select"
            style={{ width: 'auto', minWidth: '220px', padding: '6px 12px', fontSize: '0.82rem' }}
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            disabled={loadingProjects}
          >
            {projects.map((p) => (
              <option key={p.projectId} value={p.projectId}>
                {p.name} ({p.key || p.projectKey || 'PRJ'})
              </option>
            ))}
          </select>
        </div>

        {/* Tab Switcher */}
        <div style={{
          display: 'flex',
          backgroundColor: 'rgba(0, 0, 0, 0.45)',
          borderRadius: '8px',
          padding: '3px',
          border: '1px solid var(--border-subtle)',
        }}>
          <button
            onClick={() => setActiveTab('RELEASES')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 14px',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.82rem',
              fontWeight: activeTab === 'RELEASES' ? '700' : '500',
              backgroundColor: activeTab === 'RELEASES' ? 'var(--primary)' : 'transparent',
              color: activeTab === 'RELEASES' ? '#000' : 'var(--text-secondary)',
              transition: 'all 0.15s ease',
            }}
          >
            <Tag size={14} />
            <span>Versioned Releases ({releases.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('DEPLOYMENTS')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 14px',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.82rem',
              fontWeight: activeTab === 'DEPLOYMENTS' ? '700' : '500',
              backgroundColor: activeTab === 'DEPLOYMENTS' ? 'var(--primary)' : 'transparent',
              color: activeTab === 'DEPLOYMENTS' ? '#000' : 'var(--text-secondary)',
              transition: 'all 0.15s ease',
            }}
          >
            <Server size={14} />
            <span>CI/CD Deployments ({deployments.length})</span>
          </button>
        </div>
      </div>

      {/* ==================================================== */}
      {/* TAB 1: RELEASES MANAGEMENT                           */}
      {/* ==================================================== */}
      {activeTab === 'RELEASES' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Sub-Filter Toolbar */}
          <div className="glass-card" style={{ padding: '12px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: '240px' }}>
              <Search size={15} color="var(--text-muted)" />
              <input
                type="text"
                placeholder="Search releases by version number, release title, or notes..."
                value={releaseSearch}
                onChange={(e) => setReleaseSearch(e.target.value)}
                className="form-input"
                style={{ padding: '6px 12px', fontSize: '0.82rem', border: 'none', background: 'transparent' }}
              />
              {releaseSearch && (
                <button
                  onClick={() => setReleaseSearch('')}
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Status Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Filter size={14} color="var(--text-muted)" />
              <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: '600' }}>Status:</span>
              <div style={{ display: 'flex', gap: '4px' }}>
                {['ALL', 'Draft', 'In Progress', 'Released', 'Archived'].map((status) => (
                  <button
                    key={status}
                    onClick={() => setReleaseStatusFilter(status)}
                    style={{
                      padding: '4px 10px',
                      fontSize: '0.74rem',
                      fontWeight: releaseStatusFilter === status ? '700' : '500',
                      borderRadius: '4px',
                      border: '1px solid',
                      borderColor: releaseStatusFilter === status ? 'var(--primary)' : 'var(--border-subtle)',
                      backgroundColor: releaseStatusFilter === status ? 'rgba(255, 107, 0, 0.15)' : 'transparent',
                      color: releaseStatusFilter === status ? 'var(--primary)' : 'var(--text-secondary)',
                      cursor: 'pointer',
                    }}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Releases List */}
          {loadingData ? (
            <div style={{ padding: '60px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '10px', color: 'var(--text-secondary)' }}>
              <RefreshCw size={24} style={{ animation: 'spin 1s linear infinite', color: 'var(--primary)' }} />
              <span style={{ fontSize: '0.88rem' }}>Loading versioned releases...</span>
            </div>
          ) : filteredReleases.length === 0 ? (
            <div className="glass-card" style={{ padding: '60px 20px', textAlign: 'center' }}>
              <Tag size={36} color="var(--text-muted)" style={{ margin: '0 auto 12px auto' }} />
              <h3 style={{ fontSize: '1.05rem', fontWeight: '600', color: 'var(--text-primary)' }}>No Releases Found</h3>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', maxWidth: '420px', margin: '6px auto 16px auto' }}>
                {releaseSearch || releaseStatusFilter !== 'ALL'
                  ? 'No versioned releases match the active filter. Try resetting your search.'
                  : 'No versioned releases have been cut for this project yet. Create your first release version.'}
              </p>
              {canManageReleases && (
                <button className="btn btn-primary btn-sm" onClick={handleOpenCreateRelease}>
                  <Plus size={14} />
                  <span>Create First Release</span>
                </button>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {filteredReleases.map((rel) => {
                const isExpanded = expandedReleaseId === rel.releaseId;
                return (
                  <div
                    key={rel.releaseId}
                    className="glass-card"
                    style={{
                      padding: '16px 20px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <div style={{
                          padding: '10px',
                          borderRadius: '8px',
                          backgroundColor: 'rgba(255, 107, 0, 0.1)',
                          border: '1px solid rgba(255, 107, 0, 0.25)',
                          color: 'var(--primary)',
                        }}>
                          <Tag size={18} />
                        </div>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                            <span style={{ fontSize: '1.05rem', fontWeight: '700', fontFamily: 'monospace', color: '#fff', letterSpacing: '0.02em' }}>
                              {rel.versionNumber}
                            </span>
                            {rel.releaseName && (
                              <span style={{ fontSize: '0.88rem', fontWeight: '500', color: 'var(--text-secondary)' }}>
                                — {rel.releaseName}
                              </span>
                            )}
                            {renderReleaseStatusBadge(rel.status)}
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '6px', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                            {rel.releaseDate && (
                              <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                <Calendar size={13} color="var(--text-muted)" />
                                Target Cutover: <strong style={{ color: 'var(--text-primary)' }}>{rel.releaseDate}</strong>
                              </span>
                            )}
                            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                              <User size={13} color="var(--text-muted)" />
                              Author: <strong style={{ color: 'var(--text-primary)' }}>{rel.createdByName || 'DevOps Engineer'}</strong>
                            </span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontFamily: 'monospace' }}>
                              <Clock size={13} color="var(--text-muted)" />
                              {rel.createdAt ? new Date(rel.createdAt).toLocaleDateString() : ''}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {canDeploy && (
                          <button
                            className="btn btn-outline btn-sm"
                            onClick={() => handleOpenCreateDeployment(rel.releaseId)}
                            title="Deploy this version to an environment"
                          >
                            <Play size={13} />
                            <span>Deploy</span>
                          </button>
                        )}

                        {canManageReleases && (
                          <div style={{ position: 'relative' }}>
                            <select
                              value={rel.status}
                              onChange={(e) => handleQuickStatusChange(rel.releaseId, e.target.value)}
                              className="form-select"
                              style={{ padding: '4px 8px', fontSize: '0.76rem', width: 'auto' }}
                            >
                              <option value="Draft">Draft</option>
                              <option value="In Progress">In Progress</option>
                              <option value="Released">Released</option>
                              <option value="Archived">Archived</option>
                            </select>
                          </div>
                        )}

                        {canManageReleases && (
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => handleOpenEditRelease(rel)}
                            title="Edit release details"
                          >
                            <Edit3 size={13} />
                          </button>
                        )}

                        {canDelete && (
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleDeleteRelease(rel.releaseId, rel.versionNumber)}
                            title="Delete release"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}

                        {rel.releaseNotes && (
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => setExpandedReleaseId(isExpanded ? null : rel.releaseId)}
                            title={isExpanded ? 'Collapse notes' : 'View changelog notes'}
                          >
                            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Expandable Changelog Notes */}
                    {isExpanded && rel.releaseNotes && (
                      <div style={{
                        marginTop: '6px',
                        paddingTop: '10px',
                        borderTop: '1px solid var(--border-subtle)',
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '6px' }}>
                          <Terminal size={13} color="var(--primary)" />
                          <span>Release Notes &amp; Changelog:</span>
                        </div>
                        <pre style={{
                          padding: '12px',
                          backgroundColor: 'rgba(0, 0, 0, 0.5)',
                          borderRadius: '6px',
                          border: '1px solid var(--border-subtle)',
                          fontSize: '0.8rem',
                          fontFamily: 'monospace',
                          color: 'var(--text-primary)',
                          whiteSpace: 'pre-wrap',
                          margin: 0,
                        }}>
                          {rel.releaseNotes}
                        </pre>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ==================================================== */}
      {/* TAB 2: CI/CD DEPLOYMENT PIPELINES                    */}
      {/* ==================================================== */}
      {activeTab === 'DEPLOYMENTS' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Sub-Filter Toolbar */}
          <div className="glass-card" style={{ padding: '12px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            {/* View Mode Toggle: All vs My Deployments */}
            <div style={{
              display: 'flex',
              backgroundColor: 'rgba(0, 0, 0, 0.45)',
              borderRadius: '6px',
              padding: '2px',
              border: '1px solid var(--border-subtle)',
            }}>
              <button
                onClick={() => handleToggleDeploymentViewMode('ALL')}
                style={{
                  padding: '5px 12px',
                  fontSize: '0.78rem',
                  fontWeight: deploymentViewMode === 'ALL' ? '700' : '500',
                  borderRadius: '4px',
                  border: 'none',
                  cursor: 'pointer',
                  backgroundColor: deploymentViewMode === 'ALL' ? '#222' : 'transparent',
                  color: deploymentViewMode === 'ALL' ? '#fff' : 'var(--text-secondary)',
                }}
              >
                Project Pipeline
              </button>
              <button
                onClick={() => handleToggleDeploymentViewMode('MY_DEPLOYMENTS')}
                style={{
                  padding: '5px 12px',
                  fontSize: '0.78rem',
                  fontWeight: deploymentViewMode === 'MY_DEPLOYMENTS' ? '700' : '500',
                  borderRadius: '4px',
                  border: 'none',
                  cursor: 'pointer',
                  backgroundColor: deploymentViewMode === 'MY_DEPLOYMENTS' ? '#222' : 'transparent',
                  color: deploymentViewMode === 'MY_DEPLOYMENTS' ? '#fff' : 'var(--text-secondary)',
                }}
              >
                My Deployments
              </button>
            </div>

            {/* Search Input */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: '220px' }}>
              <Search size={15} color="var(--text-muted)" />
              <input
                type="text"
                placeholder="Search by version, deployer, notes..."
                value={deploymentSearch}
                onChange={(e) => setDeploymentSearch(e.target.value)}
                className="form-input"
                style={{ padding: '6px 12px', fontSize: '0.82rem', border: 'none', background: 'transparent' }}
              />
              {deploymentSearch && (
                <button
                  onClick={() => setDeploymentSearch('')}
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Filters: Environment & Status */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Env:</span>
                <select
                  value={deploymentEnvFilter}
                  onChange={(e) => setDeploymentEnvFilter(e.target.value)}
                  className="form-select"
                  style={{ width: 'auto', padding: '5px 10px', fontSize: '0.78rem' }}
                >
                  <option value="ALL">All Environments</option>
                  <option value="Development">Development</option>
                  <option value="Staging">Staging</option>
                  <option value="Production">Production</option>
                </select>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Status:</span>
                <select
                  value={deploymentStatusFilter}
                  onChange={(e) => setDeploymentStatusFilter(e.target.value)}
                  className="form-select"
                  style={{ width: 'auto', padding: '5px 10px', fontSize: '0.78rem' }}
                >
                  <option value="ALL">All Statuses</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Success">Success</option>
                  <option value="Failed">Failed</option>
                  <option value="Rolled Back">Rolled Back</option>
                </select>
              </div>
            </div>
          </div>

          {/* Deployments List */}
          {loadingData ? (
            <div style={{ padding: '60px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '10px', color: 'var(--text-secondary)' }}>
              <RefreshCw size={24} style={{ animation: 'spin 1s linear infinite', color: '#06b6d4' }} />
              <span style={{ fontSize: '0.88rem' }}>Loading deployment history...</span>
            </div>
          ) : filteredDeployments.length === 0 ? (
            <div className="glass-card" style={{ padding: '60px 20px', textAlign: 'center' }}>
              <Server size={36} color="var(--text-muted)" style={{ margin: '0 auto 12px auto' }} />
              <h3 style={{ fontSize: '1.05rem', fontWeight: '600', color: 'var(--text-primary)' }}>No Deployments Recorded</h3>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', maxWidth: '420px', margin: '6px auto 16px auto' }}>
                {deploymentSearch || deploymentEnvFilter !== 'ALL' || deploymentStatusFilter !== 'ALL'
                  ? 'No deployments match your active filter criteria.'
                  : 'No deployments have been executed for this project yet. Trigger your first CI/CD deployment cutover.'}
              </p>
              {canDeploy && (
                <button
                  className="btn btn-outline btn-sm"
                  onClick={() => handleOpenCreateDeployment()}
                  disabled={releases.length === 0}
                >
                  <Play size={14} />
                  <span>Trigger Deployment</span>
                </button>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {filteredDeployments.map((dep) => (
                <div
                  key={dep.deploymentId}
                  className="glass-card"
                  style={{
                    padding: '16px 20px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <div style={{
                        padding: '10px',
                        borderRadius: '8px',
                        backgroundColor: dep.status === 'Success' ? 'rgba(16, 185, 129, 0.1)' : dep.status === 'Failed' ? 'rgba(239, 68, 68, 0.1)' : dep.status === 'Rolled Back' ? 'rgba(255, 107, 0, 0.1)' : 'rgba(6, 182, 212, 0.1)',
                        border: '1px solid',
                        borderColor: dep.status === 'Success' ? '#10b981' : dep.status === 'Failed' ? '#ef4444' : dep.status === 'Rolled Back' ? 'var(--primary)' : '#06b6d4',
                      }}>
                        <Server size={18} color={dep.status === 'Success' ? '#10b981' : dep.status === 'Failed' ? '#ef4444' : dep.status === 'Rolled Back' ? 'var(--primary)' : '#06b6d4'} />
                      </div>

                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                          <span className="badge" style={{ backgroundColor: 'rgba(255,255,255,0.06)', color: 'var(--text-secondary)', border: '1px solid var(--border-subtle)' }}>
                            DEPLOY #{dep.deploymentId}
                          </span>
                          <span style={{ fontSize: '1.05rem', fontWeight: '700', fontFamily: 'monospace', color: '#fff' }}>
                            {dep.releaseVersion || 'v1.0.0'}
                          </span>
                          {dep.releaseName && (
                            <span style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                              ({dep.releaseName})
                            </span>
                          )}
                          {renderEnvBadge(dep.environment)}
                          {renderDeploymentStatusBadge(dep.status)}
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '6px', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <User size={13} color="var(--text-muted)" />
                            Deployed by: <strong style={{ color: 'var(--text-primary)' }}>{dep.deployedByName || 'DevOps Engineer'}</strong>
                          </span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontFamily: 'monospace' }}>
                            <Clock size={13} color="var(--text-muted)" />
                            {dep.deploymentDate
                              ? new Date(dep.deploymentDate).toLocaleString()
                              : dep.createdAt
                              ? new Date(dep.createdAt).toLocaleString()
                              : 'Pending'}
                          </span>
                        </div>

                        {dep.notes && (
                          <div style={{
                            marginTop: '8px',
                            padding: '8px 12px',
                            backgroundColor: 'rgba(0, 0, 0, 0.4)',
                            borderRadius: '4px',
                            border: '1px solid var(--border-subtle)',
                            fontSize: '0.78rem',
                            fontFamily: 'monospace',
                            color: 'var(--text-secondary)',
                          }}>
                            <span style={{ color: 'var(--text-muted)' }}>Execution Log: </span>
                            {dep.notes}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {canDeploy && (
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleOpenUpdateDeploymentStatus(dep)}
                          title="Update deployment verdict state"
                        >
                          <ShieldCheck size={13} color="#06b6d4" />
                          <span>Verdict</span>
                        </button>
                      )}

                      {canDelete && (
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDeleteDeployment(dep.deploymentId)}
                          title="Delete deployment record"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ==================================================== */}
      {/* 4. MODAL: CREATE RELEASE                             */}
      {/* ==================================================== */}
      {isCreateReleaseOpen && (
        <div className="modal-backdrop">
          <div className="modal-dialog" style={{ maxWidth: '540px', maxHeight: '88vh', display: 'flex', flexDirection: 'column' }}>
            <div className="modal-header" style={{ flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Tag size={18} color="var(--primary)" />
                <h3 className="modal-title">Create Versioned Release</h3>
              </div>
              <button
                onClick={() => setIsCreateReleaseOpen(false)}
                className="modal-close"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateReleaseSubmit} style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', flex: 1, margin: 0 }}>
              <div className="modal-body" style={{ overflowY: 'auto', flex: 1, padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div className="form-group">
                  <label className="form-label">Project Scope</label>
                  <input
                    type="text"
                    disabled
                    value={currentProject?.name || 'Current Project'}
                    className="form-input"
                    style={{ opacity: 0.7 }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">Version Number *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. v1.0.0, v2.1.0"
                      value={releaseForm.versionNumber}
                      onChange={(e) => setReleaseForm({ ...releaseForm, versionNumber: e.target.value })}
                      className="form-input"
                      style={{ fontFamily: 'monospace' }}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Target Release Date</label>
                    <input
                      type="date"
                      value={releaseForm.releaseDate}
                      onChange={(e) => setReleaseForm({ ...releaseForm, releaseDate: e.target.value })}
                      className="form-input"
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">Release Codename</label>
                    <input
                      type="text"
                      placeholder="e.g. Orion Core Protocol"
                      value={releaseForm.releaseName}
                      onChange={(e) => setReleaseForm({ ...releaseForm, releaseName: e.target.value })}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Initial Status</label>
                    <select
                      value={releaseForm.status}
                      onChange={(e) => setReleaseForm({ ...releaseForm, status: e.target.value })}
                      className="form-select"
                    >
                      <option value="Draft">Draft</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Released">Released</option>
                      <option value="Archived">Archived</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Release Notes &amp; Changelog</label>
                  <textarea
                    rows={4}
                    placeholder="Document release features, bug fixes, breaking changes, migration instructions..."
                    value={releaseForm.releaseNotes}
                    onChange={(e) => setReleaseForm({ ...releaseForm, releaseNotes: e.target.value })}
                    className="form-textarea"
                    style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}
                  />
                </div>
              </div>

              <div className="modal-footer" style={{ padding: '16px 24px 20px 24px', flexShrink: 0 }}>
                <button
                  type="button"
                  onClick={() => setIsCreateReleaseOpen(false)}
                  className="btn btn-secondary btn-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="btn btn-primary btn-sm"
                >
                  {actionLoading ? <RefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Plus size={14} />}
                  <span>Create Release</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* 5. MODAL: EDIT RELEASE                               */}
      {/* ==================================================== */}
      {isEditReleaseOpen && currentReleaseToEdit && (
        <div className="modal-backdrop">
          <div className="modal-dialog" style={{ maxWidth: '540px', maxHeight: '88vh', display: 'flex', flexDirection: 'column' }}>
            <div className="modal-header" style={{ flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Edit3 size={18} color="var(--primary)" />
                <h3 className="modal-title">
                  Edit Release {currentReleaseToEdit.versionNumber}
                </h3>
              </div>
              <button
                onClick={() => setIsEditReleaseOpen(false)}
                className="modal-close"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleEditReleaseSubmit} style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', flex: 1, margin: 0 }}>
              <div className="modal-body" style={{ overflowY: 'auto', flex: 1, padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">Release Codename</label>
                    <input
                      type="text"
                      value={editReleaseForm.releaseName}
                      onChange={(e) => setEditReleaseForm({ ...editReleaseForm, releaseName: e.target.value })}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Release Status</label>
                    <select
                      value={editReleaseForm.status}
                      onChange={(e) => setEditReleaseForm({ ...editReleaseForm, status: e.target.value })}
                      className="form-select"
                    >
                      <option value="Draft">Draft</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Released">Released</option>
                      <option value="Archived">Archived</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Target Release Date</label>
                  <input
                    type="date"
                    value={editReleaseForm.releaseDate}
                    onChange={(e) => setEditReleaseForm({ ...editReleaseForm, releaseDate: e.target.value })}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Release Notes &amp; Changelog</label>
                  <textarea
                    rows={4}
                    value={editReleaseForm.releaseNotes}
                    onChange={(e) => setEditReleaseForm({ ...editReleaseForm, releaseNotes: e.target.value })}
                    className="form-textarea"
                    style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}
                  />
                </div>
              </div>

              <div className="modal-footer" style={{ padding: '16px 24px 20px 24px', flexShrink: 0 }}>
                <button
                  type="button"
                  onClick={() => setIsEditReleaseOpen(false)}
                  className="btn btn-secondary btn-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="btn btn-primary btn-sm"
                >
                  {actionLoading ? <RefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <CheckCircle2 size={14} />}
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* 6. MODAL: TRIGGER DEPLOYMENT                         */}
      {/* ==================================================== */}
      {isCreateDeploymentOpen && (
        <div className="modal-backdrop">
          <div className="modal-dialog" style={{ maxWidth: '540px', maxHeight: '88vh', display: 'flex', flexDirection: 'column' }}>
            <div className="modal-header" style={{ flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Server size={18} color="#06b6d4" />
                <h3 className="modal-title">Trigger CI/CD Deployment</h3>
              </div>
              <button
                onClick={() => setIsCreateDeploymentOpen(false)}
                className="modal-close"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateDeploymentSubmit} style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', flex: 1, margin: 0 }}>
              <div className="modal-body" style={{ overflowY: 'auto', flex: 1, padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div className="form-group">
                  <label className="form-label">Target Release Version *</label>
                  <select
                    required
                    value={deploymentForm.releaseId}
                    onChange={(e) => setDeploymentForm({ ...deploymentForm, releaseId: e.target.value })}
                    className="form-select"
                    style={{ fontFamily: 'monospace' }}
                  >
                    {releases.length === 0 && <option value="">No releases available</option>}
                    {releases.map((r) => (
                      <option key={r.releaseId} value={r.releaseId}>
                        {r.versionNumber} {r.releaseName ? `(${r.releaseName})` : ''} — [{r.status}]
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">Target Environment *</label>
                    <select
                      value={deploymentForm.environment}
                      onChange={(e) => setDeploymentForm({ ...deploymentForm, environment: e.target.value })}
                      className="form-select"
                    >
                      <option value="Development">Development</option>
                      <option value="Staging">Staging</option>
                      <option value="Production">Production</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Initial Status</label>
                    <select
                      value={deploymentForm.status}
                      onChange={(e) => setDeploymentForm({ ...deploymentForm, status: e.target.value })}
                      className="form-select"
                    >
                      <option value="In Progress">In Progress</option>
                      <option value="Success">Success (Direct Cutover)</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Deployment Notes / Build Metadata</label>
                  <textarea
                    rows={3}
                    placeholder="Enter commit SHA, container image tag, release artifacts, or deployment verification notes..."
                    value={deploymentForm.notes}
                    onChange={(e) => setDeploymentForm({ ...deploymentForm, notes: e.target.value })}
                    className="form-textarea"
                    style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}
                  />
                </div>
              </div>

              <div className="modal-footer" style={{ padding: '16px 24px 20px 24px', flexShrink: 0 }}>
                <button
                  type="button"
                  onClick={() => setIsCreateDeploymentOpen(false)}
                  className="btn btn-secondary btn-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading || !deploymentForm.releaseId}
                  className="btn btn-primary btn-sm"
                  style={{ backgroundColor: '#06b6d4', borderColor: '#06b6d4' }}
                >
                  {actionLoading ? <RefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Play size={14} />}
                  <span>Execute Deployment</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* 7. MODAL: UPDATE DEPLOYMENT VERDICT                  */}
      {/* ==================================================== */}
      {isUpdateDeploymentStatusOpen && currentDeploymentToUpdate && (
        <div className="modal-backdrop">
          <div className="modal-dialog" style={{ maxWidth: '480px', maxHeight: '88vh', display: 'flex', flexDirection: 'column' }}>
            <div className="modal-header" style={{ flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldCheck size={18} color="#06b6d4" />
                <h3 className="modal-title">
                  Record Verdict — Deploy #{currentDeploymentToUpdate.deploymentId}
                </h3>
              </div>
              <button
                onClick={() => setIsUpdateDeploymentStatusOpen(false)}
                className="modal-close"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleUpdateDeploymentStatusSubmit} style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', flex: 1, margin: 0 }}>
              <div className="modal-body" style={{ overflowY: 'auto', flex: 1, padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div className="form-group">
                  <label className="form-label">Target Release &amp; Environment</label>
                  <div style={{
                    padding: '8px 12px',
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    borderRadius: '4px',
                    border: '1px solid var(--border-subtle)',
                    fontSize: '0.82rem',
                    fontFamily: 'monospace',
                    color: 'var(--text-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}>
                    <span>{currentDeploymentToUpdate.releaseVersion}</span>
                    <span style={{ color: '#06b6d4', fontWeight: '700', textTransform: 'uppercase' }}>
                      {currentDeploymentToUpdate.environment}
                    </span>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Deployment Verdict Status *</label>
                  <select
                    value={deploymentStatusForm.status}
                    onChange={(e) => setDeploymentStatusForm({ ...deploymentStatusForm, status: e.target.value })}
                    className="form-select"
                  >
                    <option value="In Progress">In Progress</option>
                    <option value="Success">Success</option>
                    <option value="Failed">Failed</option>
                    <option value="Rolled Back">Rolled Back</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Audit Notes &amp; Verification Checks</label>
                  <textarea
                    rows={3}
                    placeholder="Smoke test logs, health check results, failure diagnostics, or rollback reasoning..."
                    value={deploymentStatusForm.notes}
                    onChange={(e) => setDeploymentStatusForm({ ...deploymentStatusForm, notes: e.target.value })}
                    className="form-textarea"
                    style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}
                  />
                </div>
              </div>

              <div className="modal-footer" style={{ padding: '16px 24px 20px 24px', flexShrink: 0 }}>
                <button
                  type="button"
                  onClick={() => setIsUpdateDeploymentStatusOpen(false)}
                  className="btn btn-secondary btn-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="btn btn-primary btn-sm"
                  style={{ backgroundColor: '#06b6d4', borderColor: '#06b6d4' }}
                >
                  {actionLoading ? <RefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <CheckCircle2 size={14} />}
                  <span>Record Verdict</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Releases;
