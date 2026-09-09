import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { projectApi } from '../api/projectApi';
import { requirementApi } from '../api/requirementApi';
import CreateRequirementModal from '../components/requirements/CreateRequirementModal';
import EditRequirementModal from '../components/requirements/EditRequirementModal';
import CreateUserStoryModal from '../components/requirements/CreateUserStoryModal';
import EditUserStoryModal from '../components/requirements/EditUserStoryModal';
import UserStoryDetailModal from '../components/requirements/UserStoryDetailModal';
import {
  FileText,
  Plus,
  Search,
  Filter,
  RefreshCw,
  Layers,
  ChevronDown,
  ChevronRight,
  BookmarkCheck,
  Calendar,
  Shield,
  Edit3,
  Trash2,
  AlertCircle,
  CheckCircle2,
  BookmarkPlus,
  Kanban,
  Sparkles
} from 'lucide-react';

export const Requirements = () => {
  const { user, canManageRequirements, canUpdateStoryStatus } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialProjectId = searchParams.get('projectId');

  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState(initialProjectId || '');
  const [requirements, setRequirements] = useState([]);
  const [userStories, setUserStories] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [loadingReqs, setLoadingReqs] = useState(false);
  const [loadingStories, setLoadingStories] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [activeTab, setActiveTab] = useState('PRD'); // 'PRD' or 'BACKLOG'

  // Expandable PRD cards state: set of expanded requirementIds
  const [expandedReqIds, setExpandedReqIds] = useState(new Set());

  // Modals state
  const [isCreateReqOpen, setIsCreateReqOpen] = useState(false);
  const [isEditReqOpen, setIsEditReqOpen] = useState(false);
  const [selectedReqForEdit, setSelectedReqForEdit] = useState(null);

  const [isCreateStoryOpen, setIsCreateStoryOpen] = useState(false);
  const [targetReqIdForStory, setTargetReqIdForStory] = useState(null);
  const [isEditStoryOpen, setIsEditStoryOpen] = useState(false);
  const [selectedStoryForEdit, setSelectedStoryForEdit] = useState(null);

  const [isStoryDetailOpen, setIsStoryDetailOpen] = useState(false);
  const [selectedStoryForDetail, setSelectedStoryForDetail] = useState(null);

  // Delete confirmations
  const [reqToDelete, setReqToDelete] = useState(null);
  const [storyToDelete, setStoryToDelete] = useState(null);

  // Fetch all projects for switcher
  const fetchProjects = async () => {
    setLoadingProjects(true);
    try {
      const res = await projectApi.getAllProjects();
      if (res && res.data) {
        setProjects(res.data);
        if (!selectedProjectId && res.data.length > 0) {
          const defaultId = initialProjectId || res.data[0].projectId;
          setSelectedProjectId(String(defaultId));
        }
      }
    } catch (err) {
      console.error('Failed to load projects:', err);
      setError('Unable to load project portfolios.');
    } finally {
      setLoadingProjects(false);
    }
  };

  // Fetch requirements & user stories for selected project
  const fetchProjectData = async (projId) => {
    if (!projId) return;
    setLoadingReqs(true);
    setLoadingStories(true);
    setError('');

    try {
      // Fetch Requirements & Backlog User Stories in parallel
      const [reqsRes, storiesRes] = await Promise.all([
        requirementApi.getRequirementsByProject(projId),
        requirementApi.getProductBacklog(projId),
      ]);

      if (reqsRes && reqsRes.data) {
        setRequirements(reqsRes.data);
        // Expand first requirement by default if available
        if (reqsRes.data.length > 0) {
          setExpandedReqIds(new Set([reqsRes.data[0].requirementId]));
        }
      }

      if (storiesRes && storiesRes.data) {
        setUserStories(storiesRes.data);
      }
    } catch (err) {
      console.error('Failed to load requirements data:', err);
      setError('Failed to retrieve requirements or product backlog for this project.');
    } finally {
      setLoadingReqs(false);
      setLoadingStories(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    if (selectedProjectId) {
      fetchProjectData(selectedProjectId);
    }
  }, [selectedProjectId]);

  const handleProjectChange = (projId) => {
    setSelectedProjectId(projId);
    setSearchParams(projId ? { projectId: projId } : {});
  };

  // Toggle PRD accordion expansion
  const toggleReqAccordion = (reqId) => {
    setExpandedReqIds((prev) => {
      const next = new Set(prev);
      if (next.has(reqId)) {
        next.delete(reqId);
      } else {
        next.add(reqId);
      }
      return next;
    });
  };

  // Quick requirement status update
  const handleUpdateReqStatus = async (reqId, newStatus) => {
    try {
      const res = await requirementApi.updateRequirementStatus(reqId, newStatus);
      if (res && res.data) {
        setRequirements((prev) =>
          prev.map((r) => (r.requirementId === reqId ? res.data : r))
        );
      }
    } catch (err) {
      console.error('Failed to update requirement status:', err);
      alert(err.response?.data?.message || 'Failed to update requirement status.');
    }
  };

  // Delete requirement
  const confirmDeleteRequirement = async () => {
    if (!reqToDelete) return;
    try {
      await requirementApi.deleteRequirement(reqToDelete.requirementId);
      setRequirements((prev) => prev.filter((r) => r.requirementId !== reqToDelete.requirementId));
      setUserStories((prev) => prev.filter((s) => s.requirementId !== reqToDelete.requirementId));
      setReqToDelete(null);
    } catch (err) {
      console.error('Failed to delete requirement:', err);
      alert(err.response?.data?.message || 'Failed to delete requirement.');
    }
  };

  // Delete user story
  const confirmDeleteUserStory = async () => {
    if (!storyToDelete) return;
    try {
      await requirementApi.deleteUserStory(storyToDelete.storyId);
      setUserStories((prev) => prev.filter((s) => s.storyId !== storyToDelete.storyId));
      // Update requirement user story count locally
      setRequirements((prev) =>
        prev.map((r) =>
          r.requirementId === storyToDelete.requirementId
            ? { ...r, userStoryCount: Math.max(0, (r.userStoryCount || 1) - 1) }
            : r
        )
      );
      setStoryToDelete(null);
    } catch (err) {
      console.error('Failed to delete story:', err);
      alert(err.response?.data?.message || 'Failed to delete user story.');
    }
  };

  // Active project object
  const activeProject = projects.find((p) => String(p.projectId) === String(selectedProjectId));

  // Filtered Requirements
  const filteredRequirements = requirements.filter((r) => {
    const q = searchQuery.toLowerCase();
    const titleMatch = r.title?.toLowerCase().includes(q);
    const descMatch = r.description?.toLowerCase().includes(q);
    const priorityMatch = !priorityFilter || (r.priority || '').toUpperCase() === priorityFilter.toUpperCase();
    return (titleMatch || descMatch) && priorityMatch;
  });

  // Filtered User Stories for Backlog View
  const filteredUserStories = userStories.filter((s) => {
    const q = searchQuery.toLowerCase();
    const titleMatch = s.storyTitle?.toLowerCase().includes(q);
    const criteriaMatch = s.acceptanceCriteria?.toLowerCase().includes(q);
    const reqMatch = s.requirementTitle?.toLowerCase().includes(q);
    const priorityMatch = !priorityFilter || (s.priority || '').toUpperCase() === priorityFilter.toUpperCase();
    return (titleMatch || criteriaMatch || reqMatch) && priorityMatch;
  });

  // KPI Metrics Calculations
  const totalRequirementsCount = requirements.length;
  const approvedRequirementsCount = requirements.filter((r) => (r.status || '').toUpperCase() === 'APPROVED').length;
  const totalStoriesCount = userStories.length;
  const totalStoryPoints = userStories.reduce((acc, curr) => acc + (curr.storyPoints || 0), 0);

  const getPriorityBadge = (p) => {
    switch ((p || '').toUpperCase()) {
      case 'HIGH':
      case 'CRITICAL':
        return <span className="badge" style={{ background: 'var(--danger-bg)', color: '#ff6b7d', border: '1px solid var(--danger-border)' }}>High</span>;
      case 'LOW':
        return <span className="badge" style={{ color: 'var(--text-muted)' }}>Low</span>;
      default:
        return <span className="badge badge-pm">Medium</span>;
    }
  };

  const getReqStatusBadge = (s) => {
    switch ((s || '').toUpperCase()) {
      case 'APPROVED':
        return <span className="badge badge-active">Approved</span>;
      case 'UNDER REVIEW':
      case 'UNDER_REVIEW':
        return <span className="badge" style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', border: '1px solid rgba(56, 189, 248, 0.3)' }}>Under Review</span>;
      case 'IMPLEMENTED':
        return <span className="badge" style={{ background: 'rgba(168, 85, 247, 0.15)', color: '#c084fc', border: '1px solid rgba(168, 85, 247, 0.3)' }}>Implemented</span>;
      default:
        return <span className="badge" style={{ color: 'var(--text-muted)' }}>Draft</span>;
    }
  };

  const getStoryStatusBadge = (s) => {
    switch ((s || '').toUpperCase()) {
      case 'COMPLETED':
      case 'DONE':
        return <span className="badge badge-active">Completed</span>;
      case 'IN PROGRESS':
      case 'IN_PROGRESS':
        return <span className="badge" style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', border: '1px solid rgba(56, 189, 248, 0.3)' }}>In Progress</span>;
      case 'APPROVED':
        return <span className="badge badge-pm">Approved</span>;
      default:
        return <span className="badge" style={{ color: 'var(--text-muted)' }}>Draft</span>;
    }
  };

  return (
    <div>
      {/* Header with Project Switcher */}
      <div className="page-header" style={{ alignItems: 'flex-start' }}>
        <div>
          <div className="page-title">
            <FileText size={28} color="var(--primary)" />
            <h1>Requirements & User Stories</h1>
          </div>
          <p className="page-subtitle">
            PRD specifications, acceptance criteria checklists, and agile product backlogs
          </p>

          {/* Project Switcher Bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '12px' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Project Scope:
            </span>
            <select
              className="form-select"
              value={selectedProjectId}
              onChange={(e) => handleProjectChange(e.target.value)}
              disabled={loadingProjects}
              style={{
                minWidth: '240px',
                fontSize: '0.85rem',
                borderColor: 'var(--border-focus)',
                color: 'var(--primary)',
                fontWeight: '600',
              }}
            >
              {projects.map((p) => (
                <option key={p.projectId} value={p.projectId}>
                  PRJ-00{p.projectId}: {p.name}
                </option>
              ))}
            </select>

            {activeProject && (
              <span className="badge badge-active" style={{ fontSize: '0.72rem' }}>
                {activeProject.status}
              </span>
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            className="btn btn-secondary"
            onClick={() => fetchProjectData(selectedProjectId)}
            disabled={loadingReqs || loadingStories}
            title="Refresh specifications"
          >
            <RefreshCw size={15} />
            Refresh
          </button>

          {canManageRequirements ? (
            <>
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setTargetReqIdForStory(requirements.length > 0 ? requirements[0].requirementId : null);
                  setIsCreateStoryOpen(true);
                }}
                disabled={requirements.length === 0}
                title={requirements.length === 0 ? 'Create a requirement first' : 'Add User Story'}
              >
                <BookmarkPlus size={15} />
                Add Story
              </button>

              <button
                className="btn btn-primary"
                onClick={() => setIsCreateReqOpen(true)}
                id="btn-create-requirement"
              >
                <Plus size={16} />
                New Requirement
              </button>
            </>
          ) : (
            <span
              className="badge"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '7px 12px',
                color: 'var(--text-muted)',
                borderColor: 'var(--border-subtle)',
                fontSize: '0.8rem',
              }}
              title="Requirements authoring requires Project Manager or Administrator clearance"
            >
              <Shield size={13} color="var(--text-muted)" />
              {user?.role || 'Member'} (Read-Only)
            </span>
          )}
        </div>
      </div>

      {/* KPI Stats Strip */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '14px',
        marginBottom: '24px',
      }}>
        <div className="glass-card" style={{ padding: '18px 20px' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            PRD Requirements
          </span>
          <div className="kpi-value" style={{ marginTop: '6px' }}>
            {totalRequirementsCount}
          </div>
        </div>

        <div className="glass-card" style={{ padding: '18px 20px' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Approved Specifications
          </span>
          <div className="kpi-value" style={{ marginTop: '6px', color: 'var(--success)' }}>
            {approvedRequirementsCount}
          </div>
        </div>

        <div className="glass-card" style={{ padding: '18px 20px' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Backlog User Stories
          </span>
          <div className="kpi-value" style={{ marginTop: '6px', color: '#38bdf8' }}>
            {totalStoriesCount}
          </div>
        </div>

        <div className="glass-card" style={{ padding: '18px 20px' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Total Story Points
          </span>
          <div className="kpi-value" style={{ marginTop: '6px', color: 'var(--primary)' }}>
            {totalStoryPoints} <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>pts</span>
          </div>
        </div>
      </div>

      {/* View Switcher Tabs & Filters Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '14px',
        marginBottom: '20px',
      }}>
        {/* View Tabs */}
        <div style={{
          display: 'inline-flex',
          backgroundColor: 'rgba(255, 255, 255, 0.04)',
          borderRadius: 'var(--radius-xs)',
          padding: '3px',
          border: '1px solid var(--border-subtle)',
        }}>
          <button
            onClick={() => setActiveTab('PRD')}
            style={{
              padding: '6px 16px',
              borderRadius: 'var(--radius-xs)',
              background: activeTab === 'PRD' ? 'var(--primary)' : 'transparent',
              color: activeTab === 'PRD' ? '#000000' : 'var(--text-secondary)',
              fontWeight: '700',
              fontSize: '0.84rem',
              border: 'none',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.15s ease',
            }}
          >
            <FileText size={14} />
            PRD Specifications ({requirements.length})
          </button>
          <button
            onClick={() => setActiveTab('BACKLOG')}
            style={{
              padding: '6px 16px',
              borderRadius: 'var(--radius-xs)',
              background: activeTab === 'BACKLOG' ? 'var(--primary)' : 'transparent',
              color: activeTab === 'BACKLOG' ? '#000000' : 'var(--text-secondary)',
              fontWeight: '700',
              fontSize: '0.84rem',
              border: 'none',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.15s ease',
            }}
          >
            <Kanban size={14} />
            Product Backlog ({userStories.length})
          </button>
        </div>

        {/* Search & Priority Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {/* Search Input */}
          <div style={{ position: 'relative', width: '220px' }}>
            <input
              type="text"
              className="form-input"
              placeholder="Search specifications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ paddingLeft: '32px', height: '36px', fontSize: '0.82rem' }}
            />
            <Search size={14} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
          </div>

          {/* Priority Filter */}
          <div style={{ display: 'flex', gap: '4px' }}>
            {['', 'HIGH', 'MEDIUM', 'LOW'].map((p) => {
              const selected = priorityFilter === p;
              const label = p === '' ? 'All Priority' : p.charAt(0) + p.slice(1).toLowerCase();
              return (
                <button
                  key={p}
                  onClick={() => setPriorityFilter(p)}
                  style={{
                    padding: '4px 10px',
                    borderRadius: 'var(--radius-xs)',
                    background: selected ? 'var(--primary-subtle)' : 'transparent',
                    border: selected ? '1px solid var(--primary)' : '1px solid var(--border-subtle)',
                    color: selected ? 'var(--primary)' : 'var(--text-muted)',
                    fontSize: '0.78rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                  }}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {error && (
        <div className="alert alert-error" style={{ marginBottom: '20px' }}>
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* ================= TAB 1: PRD SPECIFICATIONS VIEW ================= */}
      {activeTab === 'PRD' && (
        <div>
          {loadingReqs ? (
            <div className="glass-card" style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
              <RefreshCw size={24} className="spin" style={{ marginBottom: '12px', color: 'var(--primary)' }} />
              <div>Loading project requirements and PRDs...</div>
            </div>
          ) : filteredRequirements.length === 0 ? (
            <div className="glass-card" style={{ padding: '60px 20px', textAlign: 'center' }}>
              <FileText size={40} color="var(--text-muted)" style={{ marginBottom: '14px' }} />
              <h3 style={{ marginBottom: '6px' }}>No Requirements Found</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: '20px' }}>
                {searchQuery || priorityFilter
                  ? 'No requirements match your current search or priority filters.'
                  : 'No software requirements have been specified for this project yet.'}
              </p>
              {canManageRequirements && (
                <button
                  className="btn btn-primary"
                  onClick={() => setIsCreateReqOpen(true)}
                >
                  <Plus size={16} />
                  New Requirement
                </button>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {filteredRequirements.map((req) => {
                const isExpanded = expandedReqIds.has(req.requirementId);
                const reqStories = userStories.filter((s) => s.requirementId === req.requirementId);

                return (
                  <div
                    key={req.requirementId}
                    className="glass-card"
                    style={{
                      border: '1px solid var(--border-light)',
                      overflow: 'hidden',
                      transition: 'border-color 0.15s ease',
                    }}
                  >
                    {/* Requirement Card Header */}
                    <div
                      style={{
                        padding: '18px 22px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        userSelect: 'none',
                      }}
                      onClick={() => toggleReqAccordion(req.requirementId)}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <div style={{ color: 'var(--primary)', display: 'flex', alignItems: 'center' }}>
                          {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                        </div>

                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                            <span className="badge" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--primary)' }}>
                              REQ-00{req.requirementId}
                            </span>
                            {getPriorityBadge(req.priority)}
                            {getReqStatusBadge(req.status)}
                          </div>
                          <h3 style={{ fontSize: '1.1rem', margin: 0, fontWeight: '700' }}>
                            {req.title}
                          </h3>
                        </div>
                      </div>

                      {/* Right Meta & Actions */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }} onClick={(e) => e.stopPropagation()}>
                        <span
                          className="badge"
                          style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.75rem',
                            color: 'var(--text-secondary)',
                            backgroundColor: 'rgba(255, 255, 255, 0.03)',
                          }}
                        >
                          {reqStories.length} User Stor{reqStories.length === 1 ? 'y' : 'ies'}
                        </span>

                        {canManageRequirements ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {/* Quick Status Select */}
                            <select
                              className="form-select"
                              value={req.status || 'Draft'}
                              onChange={(e) => handleUpdateReqStatus(req.requirementId, e.target.value)}
                              style={{
                                padding: '4px 10px',
                                fontSize: '0.78rem',
                                borderColor: 'var(--border-subtle)',
                                color: 'var(--primary)',
                                height: '28px',
                              }}
                            >
                              <option value="Draft">Draft</option>
                              <option value="Under Review">Under Review</option>
                              <option value="Approved">Approved</option>
                              <option value="Implemented">Implemented</option>
                            </select>

                            <Link
                              to={`/workspace/ai/requirements?projectId=${selectedProjectId}&requirementId=${req.requirementId}`}
                              className="btn btn-secondary btn-sm"
                              title="Analyze & synthesize user stories with Gemini AI"
                              style={{
                                padding: '4px 10px',
                                height: '28px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '5px',
                                color: 'var(--primary)',
                                borderColor: 'var(--border-focus)',
                                backgroundColor: 'rgba(255, 107, 0, 0.08)',
                              }}
                            >
                              <Sparkles size={13} color="var(--primary)" />
                              <span>AI Studio</span>
                            </Link>

                            <button
                              className="btn btn-secondary btn-sm"
                              onClick={() => {
                                setSelectedReqForEdit(req);
                                setIsEditReqOpen(true);
                              }}
                              title="Edit requirement"
                              style={{ padding: '4px 8px', height: '28px' }}
                            >
                              <Edit3 size={13} />
                            </button>

                            <button
                              className="btn btn-secondary btn-sm"
                              onClick={() => setReqToDelete(req)}
                              title="Delete requirement"
                              style={{
                                padding: '4px 8px',
                                height: '28px',
                                borderColor: 'rgba(255, 51, 68, 0.4)',
                                color: 'var(--danger)',
                              }}
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        ) : null}
                      </div>
                    </div>

                    {/* Accordion Content */}
                    {isExpanded && (
                      <div style={{
                        padding: '16px 22px 22px 22px',
                        borderTop: '1px solid var(--border-subtle)',
                        backgroundColor: 'rgba(0, 0, 0, 0.25)',
                      }}>
                        {/* Requirement Narrative Description */}
                        {req.description && (
                          <div style={{
                            fontSize: '0.88rem',
                            color: 'var(--text-secondary)',
                            lineHeight: '1.6',
                            marginBottom: '18px',
                            padding: '12px 16px',
                            borderRadius: 'var(--radius-xs)',
                            backgroundColor: 'rgba(255, 255, 255, 0.02)',
                            borderLeft: '3px solid var(--primary)',
                          }}>
                            {req.description}
                          </div>
                        )}

                        {/* Nested User Stories Section */}
                        <div>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            marginBottom: '10px',
                          }}>
                            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: '700' }}>
                              Decomposed User Stories ({reqStories.length})
                            </span>

                            {canManageRequirements && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Link
                                  to={`/workspace/ai/requirements?projectId=${selectedProjectId}&requirementId=${req.requirementId}`}
                                  className="btn btn-secondary btn-sm"
                                  style={{
                                    padding: '3px 10px',
                                    fontSize: '0.75rem',
                                    gap: '4px',
                                    color: 'var(--primary)',
                                    borderColor: 'var(--border-focus)',
                                    backgroundColor: 'rgba(255, 107, 0, 0.08)',
                                  }}
                                >
                                  <Sparkles size={12} color="var(--primary)" />
                                  AI Generate Stories
                                </Link>

                                <button
                                  className="btn btn-secondary btn-sm"
                                  onClick={() => {
                                    setTargetReqIdForStory(req.requirementId);
                                    setIsCreateStoryOpen(true);
                                  }}
                                  style={{ padding: '3px 10px', fontSize: '0.75rem', gap: '4px' }}
                                >
                                  <BookmarkPlus size={12} />
                                  Manual Story
                                </button>
                              </div>
                            )}
                          </div>

                          {reqStories.length === 0 ? (
                            <div style={{
                              padding: '16px',
                              textAlign: 'center',
                              fontSize: '0.82rem',
                              color: 'var(--text-muted)',
                              backgroundColor: 'rgba(255, 255, 255, 0.015)',
                              borderRadius: 'var(--radius-xs)',
                              border: '1px dashed var(--border-subtle)',
                            }}>
                              No user stories decomposed under this requirement yet.
                            </div>
                          ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '12px' }}>
                              {reqStories.map((story) => (
                                <div
                                  key={story.storyId}
                                  className="glass-card glass-card-interactive"
                                  style={{
                                    padding: '14px',
                                    borderRadius: 'var(--radius-xs)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'space-between',
                                  }}
                                  onClick={() => {
                                    setSelectedStoryForDetail(story);
                                    setIsStoryDetailOpen(true);
                                  }}
                                >
                                  <div>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--primary)' }}>
                                        STORY-00{story.storyId}
                                      </span>
                                      <div style={{ display: 'flex', gap: '6px' }}>
                                        <span className="badge" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', padding: '1px 6px' }}>
                                          {story.storyPoints || 3} pts
                                        </span>
                                        {getStoryStatusBadge(story.status)}
                                      </div>
                                    </div>
                                    <h4 style={{ fontSize: '0.92rem', margin: '0 0 6px 0', lineHeight: 1.4 }}>
                                      {story.storyTitle}
                                    </h4>
                                  </div>

                                  <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    marginTop: '10px',
                                    paddingTop: '8px',
                                    borderTop: '1px solid var(--border-subtle)',
                                    fontSize: '0.74rem',
                                    color: 'var(--text-muted)',
                                  }}>
                                    <span>{story.priority} Priority</span>
                                    <span style={{ color: 'var(--primary)', fontWeight: '600' }}>
                                      Inspect Scope →
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 2: PRODUCT BACKLOG VIEW ================= */}
      {activeTab === 'BACKLOG' && (
        <div>
          {loadingStories ? (
            <div className="glass-card" style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
              <RefreshCw size={24} className="spin" style={{ marginBottom: '12px', color: 'var(--primary)' }} />
              <div>Loading product backlog...</div>
            </div>
          ) : filteredUserStories.length === 0 ? (
            <div className="glass-card" style={{ padding: '60px 20px', textAlign: 'center' }}>
              <Kanban size={40} color="var(--text-muted)" style={{ marginBottom: '14px' }} />
              <h3 style={{ marginBottom: '6px' }}>Product Backlog is Empty</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: '20px' }}>
                {searchQuery || priorityFilter
                  ? 'No user stories match your active search or priority filters.'
                  : 'No user stories have been created in this project backlog yet.'}
              </p>
              {canManageRequirements && requirements.length > 0 && (
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    setTargetReqIdForStory(requirements[0].requirementId);
                    setIsCreateStoryOpen(true);
                  }}
                >
                  <BookmarkPlus size={16} />
                  Add User Story
                </button>
              )}
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '16px' }}>
              {filteredUserStories.map((story) => (
                <div
                  key={story.storyId}
                  className="glass-card glass-card-interactive"
                  style={{
                    padding: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                  onClick={() => {
                    setSelectedStoryForDetail(story);
                    setIsStoryDetailOpen(true);
                  }}
                >
                  <div>
                    {/* Top Row Badges */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                      <span className="badge" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--primary)' }}>
                        STORY-00{story.storyId}
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span className="badge" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', background: 'rgba(255, 107, 0, 0.12)', color: 'var(--primary)' }}>
                          {story.storyPoints || 3} pts
                        </span>
                        {getPriorityBadge(story.priority)}
                        {getStoryStatusBadge(story.status)}
                      </div>
                    </div>

                    {/* Title */}
                    <h3 style={{ fontSize: '1.05rem', margin: '0 0 8px 0', lineHeight: 1.4 }}>
                      {story.storyTitle}
                    </h3>

                    {/* Parent PRD Tag */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.76rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
                      <FileText size={12} color="var(--primary)" />
                      <span>{story.requirementTitle || `REQ #${story.requirementId}`}</span>
                    </div>

                    {/* Acceptance Criteria Preview */}
                    {story.acceptanceCriteria && (
                      <p style={{
                        fontSize: '0.82rem',
                        color: 'var(--text-secondary)',
                        lineHeight: 1.5,
                        margin: '0 0 16px 0',
                        overflow: 'hidden',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                      }}>
                        {story.acceptanceCriteria}
                      </p>
                    )}
                  </div>

                  {/* Footer with Developer Inline Status Controls */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingTop: '12px',
                    borderTop: '1px solid var(--border-subtle)',
                  }} onClick={(e) => e.stopPropagation()}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {story.createdAt ? new Date(story.createdAt).toLocaleDateString() : 'Active'}
                    </span>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {canUpdateStoryStatus ? (
                        <select
                          className="form-select"
                          value={story.status || 'Draft'}
                          onChange={async (e) => {
                            try {
                              const res = await requirementApi.updateUserStoryStatus(story.storyId, e.target.value);
                              if (res && res.data) {
                                setUserStories((prev) =>
                                  prev.map((s) => (s.storyId === story.storyId ? res.data : s))
                                );
                              }
                            } catch (err) {
                              console.error('Status update error:', err);
                            }
                          }}
                          style={{
                            padding: '3px 8px',
                            fontSize: '0.75rem',
                            borderColor: 'var(--border-subtle)',
                            color: 'var(--primary)',
                            height: '26px',
                          }}
                        >
                          <option value="Draft">Draft</option>
                          <option value="Approved">Approved</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Completed">Completed</option>
                        </select>
                      ) : null}

                      {canManageRequirements && (
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => {
                            setSelectedStoryForEdit(story);
                            setIsEditStoryOpen(true);
                          }}
                          title="Edit user story"
                          style={{ padding: '3px 6px', height: '26px' }}
                        >
                          <Edit3 size={12} />
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

      {/* ================= MODALS ================= */}
      {/* 1. Create Requirement Modal */}
      <CreateRequirementModal
        isOpen={isCreateReqOpen}
        onClose={() => setIsCreateReqOpen(false)}
        projectId={selectedProjectId}
        projectName={activeProject?.name}
        onRequirementCreated={(newReq) => {
          setRequirements((prev) => [newReq, ...prev]);
          setExpandedReqIds((prev) => new Set([...prev, newReq.requirementId]));
        }}
      />

      {/* 2. Edit Requirement Modal */}
      <EditRequirementModal
        isOpen={isEditReqOpen}
        onClose={() => {
          setIsEditReqOpen(false);
          setSelectedReqForEdit(null);
        }}
        requirement={selectedReqForEdit}
        onRequirementUpdated={(updatedReq) => {
          setRequirements((prev) =>
            prev.map((r) => (r.requirementId === updatedReq.requirementId ? updatedReq : r))
          );
        }}
      />

      {/* 3. Create User Story Modal */}
      <CreateUserStoryModal
        isOpen={isCreateStoryOpen}
        onClose={() => {
          setIsCreateStoryOpen(false);
          setTargetReqIdForStory(null);
        }}
        requirementId={targetReqIdForStory}
        requirements={requirements}
        onStoryCreated={(newStory) => {
          setUserStories((prev) => [newStory, ...prev]);
          // Update parent requirement userStoryCount locally
          setRequirements((prev) =>
            prev.map((r) =>
              r.requirementId === newStory.requirementId
                ? { ...r, userStoryCount: (r.userStoryCount || 0) + 1 }
                : r
            )
          );
        }}
      />

      {/* 4. Edit User Story Modal */}
      <EditUserStoryModal
        isOpen={isEditStoryOpen}
        onClose={() => {
          setIsEditStoryOpen(false);
          setSelectedStoryForEdit(null);
        }}
        story={selectedStoryForEdit}
        onStoryUpdated={(updatedStory) => {
          setUserStories((prev) =>
            prev.map((s) => (s.storyId === updatedStory.storyId ? updatedStory : s))
          );
          if (selectedStoryForDetail && selectedStoryForDetail.storyId === updatedStory.storyId) {
            setSelectedStoryForDetail(updatedStory);
          }
        }}
      />

      {/* 5. User Story Detail Modal */}
      <UserStoryDetailModal
        isOpen={isStoryDetailOpen}
        onClose={() => {
          setIsStoryDetailOpen(false);
          setSelectedStoryForDetail(null);
        }}
        story={selectedStoryForDetail}
        onStatusUpdated={(updatedStory) => {
          setUserStories((prev) =>
            prev.map((s) => (s.storyId === updatedStory.storyId ? updatedStory : s))
          );
          setSelectedStoryForDetail(updatedStory);
        }}
        onEditRequested={(story) => {
          setSelectedStoryForEdit(story);
          setIsEditStoryOpen(true);
        }}
        onDeleteRequested={(story) => {
          setStoryToDelete(story);
        }}
      />

      {/* Requirement Delete Confirmation */}
      {reqToDelete && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 110,
          padding: '20px',
        }}>
          <div className="glass-card animate-fade-in" style={{
            width: '100%',
            maxWidth: '440px',
            padding: '28px',
            textAlign: 'center',
            border: '1px solid rgba(255, 51, 68, 0.4)',
          }}>
            <Trash2 size={40} color="var(--danger)" style={{ marginBottom: '14px' }} />
            <h3 style={{ marginBottom: '8px' }}>Delete Requirement?</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: '24px' }}>
              Are you sure you want to delete <strong>REQ-00{reqToDelete.requirementId}: {reqToDelete.title}</strong>? All associated user stories may be decoupled.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
              <button className="btn btn-secondary" onClick={() => setReqToDelete(null)}>
                Cancel
              </button>
              <button
                className="btn btn-primary"
                style={{ backgroundColor: 'var(--danger)', borderColor: 'var(--danger)' }}
                onClick={confirmDeleteRequirement}
              >
                Delete Specification
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Story Delete Confirmation */}
      {storyToDelete && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 110,
          padding: '20px',
        }}>
          <div className="glass-card animate-fade-in" style={{
            width: '100%',
            maxWidth: '440px',
            padding: '28px',
            textAlign: 'center',
            border: '1px solid rgba(255, 51, 68, 0.4)',
          }}>
            <Trash2 size={40} color="var(--danger)" style={{ marginBottom: '14px' }} />
            <h3 style={{ marginBottom: '8px' }}>Delete User Story?</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: '24px' }}>
              Are you sure you want to remove <strong>STORY-00{storyToDelete.storyId}: {storyToDelete.storyTitle}</strong> from the product backlog?
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
              <button className="btn btn-secondary" onClick={() => setStoryToDelete(null)}>
                Cancel
              </button>
              <button
                className="btn btn-primary"
                style={{ backgroundColor: 'var(--danger)', borderColor: 'var(--danger)' }}
                onClick={confirmDeleteUserStory}
              >
                Remove from Backlog
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Requirements;
