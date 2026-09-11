import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { projectApi } from '../api/projectApi';
import { sprintApi } from '../api/sprintApi';
import { taskApi } from '../api/taskApi';
import CreateSprintModal from '../components/sprints/CreateSprintModal';
import EditSprintModal from '../components/sprints/EditSprintModal';
import CreateTaskModal from '../components/sprints/CreateTaskModal';
import TaskDetailModal from '../components/sprints/TaskDetailModal';
import {
  Zap,
  Layers,
  Kanban,
  CheckSquare,
  Plus,
  Play,
  CheckCircle2,
  Calendar,
  Clock,
  Filter,
  User,
  Search,
  ArrowRight,
  ArrowLeft,
  Trash2,
  Edit3,
  AlertCircle,
  RefreshCw,
  FolderKanban,
  Target,
  ChevronDown
} from 'lucide-react';

export const Sprints = () => {
  const { user, isAdmin, isProjectManager, isBusinessAnalyst, isDeveloper } = useAuth();
  const canManageSprints = isAdmin || isProjectManager;
  const canCreateTask = isAdmin || isProjectManager || isBusinessAnalyst || isDeveloper;

  const [searchParams, setSearchParams] = useSearchParams();
  const initialProjectId = searchParams.get('projectId');
  const initialSprintId = searchParams.get('sprintId');

  // Project & Sprints State
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState(initialProjectId || '');
  const [sprints, setSprints] = useState([]);
  const [selectedSprintId, setSelectedSprintId] = useState(initialSprintId || '');
  const [activeSprintData, setActiveSprintData] = useState(null);

  // Kanban Tasks State
  const [kanbanData, setKanbanData] = useState({
    todoTasks: [],
    inProgressTasks: [],
    inReviewTasks: [],
    doneTasks: [],
  });
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [loadingSprints, setLoadingSprints] = useState(false);
  const [loadingKanban, setLoadingKanban] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Filters & Search
  const [taskFilter, setTaskFilter] = useState('ALL'); // 'ALL' or 'MY'
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('KANBAN'); // 'KANBAN' or 'MILESTONES'

  // Modals
  const [isCreateSprintOpen, setIsCreateSprintOpen] = useState(false);
  const [isEditSprintOpen, setIsEditSprintOpen] = useState(false);
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [selectedTaskForDetail, setSelectedTaskForDetail] = useState(null);
  const [isTaskDetailOpen, setIsTaskDetailOpen] = useState(false);

  // Feedback notifications
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // 1. Load Projects
  const fetchProjects = async () => {
    setLoadingProjects(true);
    try {
      const res = await projectApi.getAllProjects();
      if (res && res.data) {
        setProjects(res.data);
        if (!selectedProjectId && res.data.length > 0) {
          const defaultId = initialProjectId || String(res.data[0].projectId);
          setSelectedProjectId(defaultId);
        }
      }
    } catch (err) {
      console.error('Failed to load projects:', err);
      setError('Unable to load project portfolio list.');
    } finally {
      setLoadingProjects(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  // 2. Load Sprints for selected Project
  const fetchSprints = async (targetSprintIdToSelect = null) => {
    if (!selectedProjectId) {
      setSprints([]);
      setSelectedSprintId('');
      return;
    }

    setLoadingSprints(true);
    setError('');
    try {
      const res = await sprintApi.getSprintsByProject(selectedProjectId);
      if (res && res.data) {
        setSprints(res.data);

        // Pick active sprint or target or first sprint
        let sprintToPick = '';
        if (targetSprintIdToSelect) {
          sprintToPick = String(targetSprintIdToSelect);
        } else if (selectedSprintId && res.data.some((s) => String(s.sprintId) === String(selectedSprintId))) {
          sprintToPick = String(selectedSprintId);
        } else {
          const active = res.data.find((s) => (s.status || '').toLowerCase() === 'active');
          if (active) {
            sprintToPick = String(active.sprintId);
          } else if (res.data.length > 0) {
            sprintToPick = String(res.data[0].sprintId);
          }
        }

        setSelectedSprintId(sprintToPick);
      }
    } catch (err) {
      console.error('Failed to load sprints:', err);
      setError('Unable to retrieve sprint milestones for this project.');
    } finally {
      setLoadingSprints(false);
    }
  };

  useEffect(() => {
    if (selectedProjectId) {
      fetchSprints();
      setSearchParams({ projectId: selectedProjectId });
    }
  }, [selectedProjectId]);

  // 3. Load Kanban Board for selected Sprint
  const fetchKanbanBoard = async () => {
    if (!selectedSprintId) {
      setKanbanData({
        todoTasks: [],
        inProgressTasks: [],
        inReviewTasks: [],
        doneTasks: [],
      });
      setActiveSprintData(null);
      return;
    }

    setLoadingKanban(true);
    try {
      const [boardRes, sprintRes] = await Promise.all([
        sprintApi.getKanbanBoard(selectedSprintId),
        sprintApi.getSprintById(selectedSprintId)
      ]);

      if (boardRes && boardRes.data) {
        setKanbanData({
          todoTasks: boardRes.data.todoTasks || [],
          inProgressTasks: boardRes.data.inProgressTasks || [],
          inReviewTasks: boardRes.data.inReviewTasks || [],
          doneTasks: boardRes.data.doneTasks || [],
        });
      }

      if (sprintRes && sprintRes.data) {
        setActiveSprintData(sprintRes.data);
      }
    } catch (err) {
      console.error('Failed to load kanban data:', err);
      setError('Unable to load sprint Kanban board.');
    } finally {
      setLoadingKanban(false);
    }
  };

  useEffect(() => {
    if (selectedSprintId) {
      fetchKanbanBoard();
      setSearchParams({ projectId: selectedProjectId, sprintId: selectedSprintId });
    }
  }, [selectedSprintId]);

  // Quick Status Transition (e.g. Move to In Progress / Done)
  const handleTransitionTask = async (taskId, newStatus) => {
    try {
      await taskApi.updateTaskStatus(taskId, newStatus);
      fetchKanbanBoard();
    } catch (err) {
      console.error('Failed to update task status:', err);
      setError(err.response?.data?.message || 'Failed to update task status.');
    }
  };

  // Drag and Drop Handlers
  const handleDragStart = (e, taskId) => {
    e.dataTransfer.setData('text/plain', taskId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDropOnColumn = async (e, targetStatus) => {
    e.preventDefault();
    const taskIdStr = e.dataTransfer.getData('text/plain');
    if (!taskIdStr) return;
    const taskId = Number(taskIdStr);
    handleTransitionTask(taskId, targetStatus);
  };

  // Sprint Lifecycle Actions
  const handleStartSprint = async () => {
    if (!selectedSprintId) return;
    setActionLoading(true);
    setError('');
    try {
      const res = await sprintApi.startSprint(selectedSprintId);
      if (res && res.data) {
        setSuccessMsg(`Sprint "${res.data.sprintName}" has been started and marked Active!`);
        setTimeout(() => setSuccessMsg(''), 4000);
        fetchSprints(res.data.sprintId);
      }
    } catch (err) {
      console.error('Failed to start sprint:', err);
      setError(err.response?.data?.message || 'Failed to start sprint.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCompleteSprint = async () => {
    if (!selectedSprintId) return;
    if (!window.confirm('Are you sure you want to complete and close this active sprint?')) return;
    setActionLoading(true);
    setError('');
    try {
      const res = await sprintApi.completeSprint(selectedSprintId);
      if (res && res.data) {
        setSuccessMsg(`Sprint "${res.data.sprintName}" is marked Completed.`);
        setTimeout(() => setSuccessMsg(''), 4000);
        fetchSprints(res.data.sprintId);
      }
    } catch (err) {
      console.error('Failed to complete sprint:', err);
      setError(err.response?.data?.message || 'Failed to complete sprint.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteSprint = async () => {
    if (!selectedSprintId) return;
    if (!window.confirm('Permanently delete this sprint and its task milestone associations?')) return;
    setActionLoading(true);
    setError('');
    try {
      await sprintApi.deleteSprint(selectedSprintId);
      setSuccessMsg('Sprint deleted successfully.');
      setTimeout(() => setSuccessMsg(''), 3000);
      fetchSprints();
    } catch (err) {
      console.error('Failed to delete sprint:', err);
      setError(err.response?.data?.message || 'Failed to delete sprint.');
    } finally {
      setActionLoading(false);
    }
  };

  // Metric Computations
  const totalTasks =
    kanbanData.todoTasks.length +
    kanbanData.inProgressTasks.length +
    kanbanData.inReviewTasks.length +
    kanbanData.doneTasks.length;

  const completedCount = kanbanData.doneTasks.length;
  const completionPct = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;

  // Task Filter Helpers
  const filterTaskList = (tasks) => {
    return tasks.filter((t) => {
      // 1. My tasks filter
      if (taskFilter === 'MY' && user && t.assignedToUserId !== user.userId) {
        return false;
      }
      // 2. Text search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = (t.title || '').toLowerCase().includes(q);
        const matchesStory = (t.storyTitle || '').toLowerCase().includes(q);
        const matchesAssignee = (t.assignedToName || '').toLowerCase().includes(q);
        if (!matchesTitle && !matchesStory && !matchesAssignee) {
          return false;
        }
      }
      return true;
    });
  };

  const getPriorityStyle = (p) => {
    const pr = (p || '').toLowerCase();
    if (pr === 'critical') return { bg: 'rgba(255, 51, 68, 0.15)', color: 'var(--danger)', border: 'rgba(255, 51, 68, 0.35)' };
    if (pr === 'high') return { bg: 'rgba(255, 107, 0, 0.15)', color: 'var(--primary)', border: 'rgba(255, 107, 0, 0.35)' };
    if (pr === 'medium') return { bg: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', border: 'rgba(245, 158, 11, 0.35)' };
    return { bg: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-secondary)', border: 'var(--border-subtle)' };
  };

  const calculateDaysRemaining = (endDateStr) => {
    if (!endDateStr) return null;
    const end = new Date(endDateStr);
    const now = new Date();
    const diffTime = end - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const currentSprintObj = sprints.find((s) => String(s.sprintId) === String(selectedSprintId)) || activeSprintData;
  const daysLeft = currentSprintObj?.endDate ? calculateDaysRemaining(currentSprintObj.endDate) : null;

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '60px' }}>
      {/* Scope Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        marginBottom: '20px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'var(--primary-subtle)',
            border: '1px solid var(--border-focus)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--primary)',
          }}>
            <Kanban size={24} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.6rem', margin: 0, letterSpacing: '-0.02em' }}>
              Sprints
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', margin: '4px 0 0 0' }}>
              Sprint milestone planning, velocity telemetry, and interactive task execution
            </p>
          </div>
        </div>

        {/* Global Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {canManageSprints && (
            <button
              className="btn btn-secondary"
              onClick={() => setIsCreateSprintOpen(true)}
              disabled={!selectedProjectId || loadingProjects}
            >
              <Plus size={16} />
              New Sprint
            </button>
          )}

          {canCreateTask && (
            <button
              className="btn btn-primary"
              onClick={() => setIsCreateTaskOpen(true)}
              disabled={!selectedSprintId || sprints.length === 0}
            >
              <Plus size={16} />
              Add Task
            </button>
          )}
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <div className="alert alert-error" style={{ marginBottom: '16px' }}>
          <AlertCircle size={16} style={{ flexShrink: 0 }} />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="alert alert-success" style={{ marginBottom: '16px' }}>
          <CheckCircle2 size={16} style={{ flexShrink: 0 }} />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Project & Sprint Milestone Selector Toolbar */}
      <div className="glass-card" style={{
        padding: '16px 20px',
        marginBottom: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        border: '1px solid var(--border-light)',
      }}>
        {/* Project Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: '1 1 320px' }}>
          <label className="form-label" style={{ margin: 0, whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <FolderKanban size={15} color="var(--primary)" />
            Project Scope:
          </label>
          <select
            className="form-select"
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            disabled={loadingProjects}
            style={{ flex: 1, minWidth: '200px' }}
          >
            {projects.map((p) => (
              <option key={p.projectId} value={p.projectId}>
                {p.name} ({p.projectKey || `PRJ-${p.projectId}`})
              </option>
            ))}
          </select>
        </div>

        {/* Sprint Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: '1 1 360px' }}>
          <label className="form-label" style={{ margin: 0, whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Zap size={15} color="var(--primary)" />
            Sprint Milestone:
          </label>
          <select
            className="form-select"
            value={selectedSprintId}
            onChange={(e) => setSelectedSprintId(e.target.value)}
            disabled={loadingSprints || sprints.length === 0}
            style={{ flex: 1, minWidth: '220px' }}
          >
            {sprints.length === 0 ? (
              <option value="">No Sprints Initialized</option>
            ) : (
              sprints.map((s) => (
                <option key={s.sprintId} value={s.sprintId}>
                  {s.sprintName} — [{s.status}]
                </option>
              ))
            )}
          </select>

          {/* Quick Refresh */}
          <button
            className="btn btn-secondary btn-sm"
            onClick={fetchKanbanBoard}
            disabled={!selectedSprintId || loadingKanban}
            title="Refresh Kanban state"
          >
            <RefreshCw size={14} className={loadingKanban ? 'spin' : ''} />
          </button>
        </div>

        {/* View Mode Toggle */}
        <div style={{
          display: 'flex',
          backgroundColor: 'rgba(255, 255, 255, 0.04)',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--border-subtle)',
          padding: '2px',
        }}>
          <button
            onClick={() => setViewMode('KANBAN')}
            style={{
              padding: '6px 14px',
              border: 'none',
              borderRadius: 'var(--radius-xs)',
              fontSize: '0.82rem',
              fontWeight: '600',
              cursor: 'pointer',
              backgroundColor: viewMode === 'KANBAN' ? 'var(--primary)' : 'transparent',
              color: viewMode === 'KANBAN' ? '#000000' : 'var(--text-secondary)',
              transition: 'all 0.15s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Kanban size={14} /> Kanban Board
          </button>
          <button
            onClick={() => setViewMode('MILESTONES')}
            style={{
              padding: '6px 14px',
              border: 'none',
              borderRadius: 'var(--radius-xs)',
              fontSize: '0.82rem',
              fontWeight: '600',
              cursor: 'pointer',
              backgroundColor: viewMode === 'MILESTONES' ? 'var(--primary)' : 'transparent',
              color: viewMode === 'MILESTONES' ? '#000000' : 'var(--text-secondary)',
              transition: 'all 0.15s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Layers size={14} /> Milestones ({sprints.length})
          </button>
        </div>
      </div>

      {/* Sprint Milestone Active Telemetry Banner (When sprint selected) */}
      {currentSprintObj && (
        <div className="glass-card" style={{
          padding: '16px 20px',
          marginBottom: '20px',
          borderLeft: '4px solid var(--primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
        }}>
          {/* Sprint Goal & Dates */}
          <div style={{ flex: '1 1 400px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
              <h3 style={{ margin: 0, fontSize: '1.15rem', color: 'var(--text-primary)' }}>
                {currentSprintObj.sprintName}
              </h3>
              <span
                className="badge"
                style={{
                  backgroundColor:
                    (currentSprintObj.status || '').toLowerCase() === 'active'
                      ? 'rgba(16, 185, 129, 0.15)'
                      : (currentSprintObj.status || '').toLowerCase() === 'completed'
                      ? 'rgba(59, 130, 246, 0.15)'
                      : 'rgba(255, 107, 0, 0.15)',
                  color:
                    (currentSprintObj.status || '').toLowerCase() === 'active'
                      ? 'var(--success)'
                      : (currentSprintObj.status || '').toLowerCase() === 'completed'
                      ? '#3b82f6'
                      : 'var(--primary)',
                  border: '1px solid var(--border-subtle)',
                  fontWeight: '700',
                  fontSize: '0.75rem',
                }}
              >
                {currentSprintObj.status || 'Planned'}
              </span>

              {daysLeft !== null && (
                <span style={{
                  fontSize: '0.78rem',
                  color: daysLeft < 0 ? 'var(--danger)' : daysLeft <= 2 ? '#f59e0b' : 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}>
                  <Clock size={12} />
                  {daysLeft > 0 ? `${daysLeft} days remaining` : daysLeft === 0 ? 'Due today' : `${Math.abs(daysLeft)} days overdue`}
                </span>
              )}
            </div>

            <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: '1.5' }}>
              {currentSprintObj.goal ? `🎯 ${currentSprintObj.goal}` : 'No explicit sprint mission goal recorded.'}
            </p>
          </div>

          {/* Progress & Lifecycle Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
            {/* Completion Meter */}
            <div style={{ minWidth: '180px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '6px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Velocity Completion</span>
                <strong style={{ color: 'var(--primary)', fontFamily: 'monospace' }}>
                  {completedCount}/{totalTasks} ({completionPct}%)
                </strong>
              </div>
              <div style={{
                height: '6px',
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                borderRadius: '3px',
                overflow: 'hidden',
              }}>
                <div style={{
                  height: '100%',
                  width: `${completionPct}%`,
                  backgroundColor: completionPct === 100 ? 'var(--success)' : 'var(--primary)',
                  transition: 'width 0.3s ease',
                }} />
              </div>
            </div>

            {/* Lifecycle Buttons (Admin / PM) */}
            {canManageSprints && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {(currentSprintObj.status || '').toLowerCase() === 'planned' && (
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={handleStartSprint}
                    disabled={actionLoading}
                    style={{ fontSize: '0.8rem' }}
                  >
                    <Play size={13} /> Start Sprint
                  </button>
                )}

                {(currentSprintObj.status || '').toLowerCase() === 'active' && (
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={handleCompleteSprint}
                    disabled={actionLoading}
                    style={{
                      borderColor: 'rgba(16, 185, 129, 0.4)',
                      color: 'var(--success)',
                      fontSize: '0.8rem',
                    }}
                  >
                    <CheckCircle2 size={13} /> Complete Sprint
                  </button>
                )}

                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => setIsEditSprintOpen(true)}
                  disabled={actionLoading}
                  title="Configure Sprint"
                >
                  <Edit3 size={13} />
                </button>

                <button
                  className="btn btn-secondary btn-sm"
                  onClick={handleDeleteSprint}
                  disabled={actionLoading}
                  style={{ color: 'var(--danger)', borderColor: 'rgba(255, 51, 68, 0.35)' }}
                  title="Delete Sprint"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW 1: KANBAN BOARD */}
      {viewMode === 'KANBAN' && (
        <>
          {/* Kanban Filter Controls */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
            marginBottom: '16px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {/* Task Scope Filter */}
              <div style={{
                display: 'flex',
                backgroundColor: 'rgba(255, 255, 255, 0.04)',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-subtle)',
                padding: '2px',
              }}>
                <button
                  onClick={() => setTaskFilter('ALL')}
                  style={{
                    padding: '4px 12px',
                    border: 'none',
                    borderRadius: 'var(--radius-xs)',
                    fontSize: '0.78rem',
                    cursor: 'pointer',
                    backgroundColor: taskFilter === 'ALL' ? 'var(--primary)' : 'transparent',
                    color: taskFilter === 'ALL' ? '#000000' : 'var(--text-secondary)',
                    fontWeight: '600',
                  }}
                >
                  All Tasks ({totalTasks})
                </button>
                <button
                  onClick={() => setTaskFilter('MY')}
                  style={{
                    padding: '4px 12px',
                    border: 'none',
                    borderRadius: 'var(--radius-xs)',
                    fontSize: '0.78rem',
                    cursor: 'pointer',
                    backgroundColor: taskFilter === 'MY' ? 'var(--primary)' : 'transparent',
                    color: taskFilter === 'MY' ? '#000000' : 'var(--text-secondary)',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <User size={12} /> My Tasks
                </button>
              </div>

              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                💡 Tip: Drag & drop task cards across columns or use quick transition arrows.
              </span>
            </div>

            {/* Search Input */}
            <div style={{ position: 'relative', width: '220px' }}>
              <Search
                size={14}
                style={{
                  position: 'absolute',
                  left: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)',
                }}
              />
              <input
                type="text"
                className="form-input"
                placeholder="Search board..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  paddingLeft: '32px',
                  height: '34px',
                  fontSize: '0.82rem',
                }}
              />
            </div>
          </div>

          {/* 4-Column Interactive Kanban Board */}
          {loadingKanban ? (
            <div style={{ padding: '80px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
              <RefreshCw size={24} className="spin" style={{ color: 'var(--primary)', marginBottom: '12px' }} />
              <div>Synchronizing Kanban board telemetry...</div>
            </div>
          ) : sprints.length === 0 ? (
            <div className="glass-card" style={{ padding: '60px 20px', textAlign: 'center' }}>
              <Layers size={48} color="var(--text-muted)" style={{ marginBottom: '16px' }} />
              <h3 style={{ marginBottom: '8px' }}>No Sprints Initialized</h3>
              <p style={{ color: 'var(--text-secondary)', maxWidth: '460px', margin: '0 auto 20px auto', fontSize: '0.88rem' }}>
                Initialize your first sprint milestone for this project to start allocating user stories and tracking task completion.
              </p>
              {canManageSprints && (
                <button className="btn btn-primary" onClick={() => setIsCreateSprintOpen(true)}>
                  <Plus size={16} /> Initialize Sprint 1
                </button>
              )}
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '16px',
              alignItems: 'start',
            }}>
              {/* Column 1: TO DO */}
              <KanbanColumn
                title="To Do"
                status="To Do"
                badgeCount={filterTaskList(kanbanData.todoTasks).length}
                accentColor="var(--text-secondary)"
                tasks={filterTaskList(kanbanData.todoTasks)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDropOnColumn(e, 'To Do')}
                onCardClick={(t) => {
                  setSelectedTaskForDetail(t);
                  setIsTaskDetailOpen(true);
                }}
                onAdvance={(taskId) => handleTransitionTask(taskId, 'In Progress')}
                advanceLabel="➔ In Progress"
                getPriorityStyle={getPriorityStyle}
              />

              {/* Column 2: IN PROGRESS */}
              <KanbanColumn
                title="In Progress"
                status="In Progress"
                badgeCount={filterTaskList(kanbanData.inProgressTasks).length}
                accentColor="#3b82f6"
                tasks={filterTaskList(kanbanData.inProgressTasks)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDropOnColumn(e, 'In Progress')}
                onCardClick={(t) => {
                  setSelectedTaskForDetail(t);
                  setIsTaskDetailOpen(true);
                }}
                onAdvance={(taskId) => handleTransitionTask(taskId, 'In Review')}
                advanceLabel="➔ In Review"
                onRegress={(taskId) => handleTransitionTask(taskId, 'To Do')}
                regressLabel="← To Do"
                getPriorityStyle={getPriorityStyle}
              />

              {/* Column 3: IN REVIEW */}
              <KanbanColumn
                title="In Review"
                status="In Review"
                badgeCount={filterTaskList(kanbanData.inReviewTasks).length}
                accentColor="#a855f7"
                tasks={filterTaskList(kanbanData.inReviewTasks)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDropOnColumn(e, 'In Review')}
                onCardClick={(t) => {
                  setSelectedTaskForDetail(t);
                  setIsTaskDetailOpen(true);
                }}
                onAdvance={(taskId) => handleTransitionTask(taskId, 'Done')}
                advanceLabel="✓ Mark Done"
                onRegress={(taskId) => handleTransitionTask(taskId, 'In Progress')}
                regressLabel="← In Progress"
                getPriorityStyle={getPriorityStyle}
              />

              {/* Column 4: DONE */}
              <KanbanColumn
                title="Done"
                status="Done"
                badgeCount={filterTaskList(kanbanData.doneTasks).length}
                accentColor="var(--success)"
                tasks={filterTaskList(kanbanData.doneTasks)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDropOnColumn(e, 'Done')}
                onCardClick={(t) => {
                  setSelectedTaskForDetail(t);
                  setIsTaskDetailOpen(true);
                }}
                onRegress={(taskId) => handleTransitionTask(taskId, 'In Review')}
                regressLabel="← Reopen"
                getPriorityStyle={getPriorityStyle}
              />
            </div>
          )}
        </>
      )}

      {/* VIEW 2: MILESTONES OVERVIEW */}
      {viewMode === 'MILESTONES' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '16px' }}>
          {sprints.length === 0 ? (
            <div className="glass-card" style={{ gridColumn: '1 / -1', padding: '60px 20px', textAlign: 'center' }}>
              <Layers size={40} color="var(--text-muted)" style={{ marginBottom: '12px' }} />
              <h4>No Sprint Milestones</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
                No sprints have been created for this project portfolio yet.
              </p>
            </div>
          ) : (
            sprints.map((sp) => {
              const spDays = calculateDaysRemaining(sp.endDate);
              const isSelected = String(sp.sprintId) === String(selectedSprintId);
              return (
                <div
                  key={sp.sprintId}
                  className="glass-card"
                  style={{
                    padding: '20px',
                    border: isSelected ? '1px solid var(--primary)' : '1px solid var(--border-subtle)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    {/* Sprint Header */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                      <span
                        className="badge"
                        style={{
                          backgroundColor:
                            (sp.status || '').toLowerCase() === 'active'
                              ? 'rgba(16, 185, 129, 0.15)'
                              : (sp.status || '').toLowerCase() === 'completed'
                              ? 'rgba(59, 130, 246, 0.15)'
                              : 'rgba(255, 107, 0, 0.15)',
                          color:
                            (sp.status || '').toLowerCase() === 'active'
                              ? 'var(--success)'
                              : (sp.status || '').toLowerCase() === 'completed'
                              ? '#3b82f6'
                              : 'var(--primary)',
                          border: '1px solid var(--border-subtle)',
                          fontSize: '0.72rem',
                          fontWeight: '700',
                        }}
                      >
                        {sp.status || 'Planned'}
                      </span>

                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                        SP-00{sp.sprintId}
                      </span>
                    </div>

                    <h3 style={{ fontSize: '1.1rem', marginBottom: '8px', color: 'var(--text-primary)' }}>
                      {sp.sprintName}
                    </h3>

                    <p style={{
                      color: 'var(--text-secondary)',
                      fontSize: '0.82rem',
                      lineHeight: '1.5',
                      marginBottom: '16px',
                      minHeight: '2.5em',
                    }}>
                      {sp.goal || 'No goal statement defined for this milestone.'}
                    </p>

                    {/* Dates */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '0.78rem',
                      color: 'var(--text-muted)',
                      marginBottom: '14px',
                    }}>
                      <Calendar size={13} color="var(--primary)" />
                      <span>{sp.startDate || 'TBD'} ➔ {sp.endDate || 'TBD'}</span>
                      {spDays !== null && (
                        <span style={{ color: spDays < 0 ? 'var(--danger)' : '#f59e0b' }}>
                          ({spDays > 0 ? `${spDays}d left` : 'Closed'})
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Card Bottom */}
                  <div style={{
                    paddingTop: '14px',
                    borderTop: '1px solid var(--border-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      {sp.totalTasks || 0} Tasks • {sp.completedTasks || 0} Done
                    </span>

                    <button
                      className={`btn btn-sm ${isSelected ? 'btn-primary' : 'btn-secondary'}`}
                      onClick={() => {
                        setSelectedSprintId(String(sp.sprintId));
                        setViewMode('KANBAN');
                      }}
                      style={{ fontSize: '0.8rem' }}
                    >
                      <Kanban size={13} /> {isSelected ? 'Current Board' : 'View Board'}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Modals */}
      <CreateSprintModal
        isOpen={isCreateSprintOpen}
        onClose={() => setIsCreateSprintOpen(false)}
        projectId={selectedProjectId}
        onSprintCreated={(newSprint) => {
          setSprints((prev) => [newSprint, ...prev]);
          setSelectedSprintId(String(newSprint.sprintId));
        }}
      />

      <EditSprintModal
        isOpen={isEditSprintOpen}
        onClose={() => setIsEditSprintOpen(false)}
        sprint={currentSprintObj}
        onSprintUpdated={(updated) => {
          setSprints((prev) => prev.map((s) => (s.sprintId === updated.sprintId ? updated : s)));
          setActiveSprintData(updated);
        }}
      />

      <CreateTaskModal
        isOpen={isCreateTaskOpen}
        onClose={() => setIsCreateTaskOpen(false)}
        projectId={selectedProjectId}
        currentSprintId={selectedSprintId}
        sprints={sprints}
        onTaskCreated={() => {
          fetchKanbanBoard();
        }}
      />

      <TaskDetailModal
        isOpen={isTaskDetailOpen}
        onClose={() => {
          setIsTaskDetailOpen(false);
          setSelectedTaskForDetail(null);
        }}
        task={selectedTaskForDetail}
        onStatusChanged={() => {
          fetchKanbanBoard();
        }}
        onTaskDeleted={() => {
          fetchKanbanBoard();
        }}
      />
    </div>
  );
};

// Sub-component: Individual Kanban Column with drop target
const KanbanColumn = ({
  title,
  status,
  badgeCount,
  accentColor,
  tasks,
  onDragOver,
  onDrop,
  onCardClick,
  onAdvance,
  advanceLabel,
  onRegress,
  regressLabel,
  getPriorityStyle
}) => {
  return (
    <div
      onDragOver={onDragOver}
      onDrop={onDrop}
      style={{
        backgroundColor: 'rgba(15, 15, 15, 0.75)',
        border: '1px solid var(--border-subtle)',
        borderTop: `3px solid ${accentColor}`,
        borderRadius: 'var(--radius-sm)',
        padding: '14px',
        minHeight: '520px',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Column Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingBottom: '12px',
        borderBottom: '1px solid var(--border-subtle)',
        marginBottom: '12px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontWeight: '700', fontSize: '0.92rem', color: 'var(--text-primary)' }}>
            {title}
          </span>
          <span
            className="badge"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              color: 'var(--text-secondary)',
              fontSize: '0.72rem',
              fontWeight: '700',
              padding: '1px 7px',
            }}
          >
            {badgeCount}
          </span>
        </div>
      </div>

      {/* Cards List */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {tasks.length === 0 ? (
          <div style={{
            padding: '36px 12px',
            textAlign: 'center',
            color: 'var(--text-muted)',
            fontSize: '0.8rem',
            border: '1px dashed rgba(255, 255, 255, 0.08)',
            borderRadius: 'var(--radius-xs)',
          }}>
            Drop tasks here or add new
          </div>
        ) : (
          tasks.map((task) => {
            const pStyle = getPriorityStyle(task.priority);
            return (
              <div
                key={task.taskId}
                draggable="true"
                onDragStart={(e) => {
                  e.dataTransfer.setData('text/plain', String(task.taskId));
                }}
                onClick={() => onCardClick(task)}
                className="kanban-card"
                style={{
                  backgroundColor: 'rgba(25, 25, 25, 0.85)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-xs)',
                  padding: '12px',
                  cursor: 'pointer',
                  transition: 'transform 0.12s ease, border-color 0.12s ease',
                }}
              >
                {/* Card Top: ID & Priority */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    TASK-00{task.taskId}
                  </span>
                  <span
                    className="badge"
                    style={{
                      backgroundColor: pStyle.bg,
                      color: pStyle.color,
                      border: `1px solid ${pStyle.border}`,
                      fontSize: '0.68rem',
                      fontWeight: '700',
                      padding: '1px 6px',
                    }}
                  >
                    {task.priority || 'Medium'}
                  </span>
                </div>

                {/* Card Title */}
                <div style={{
                  fontSize: '0.88rem',
                  fontWeight: '600',
                  color: 'var(--text-primary)',
                  marginBottom: '8px',
                  lineHeight: '1.4',
                }}>
                  {task.title}
                </div>

                {/* Parent Story Badge */}
                {task.storyTitle && (
                  <div style={{
                    fontSize: '0.72rem',
                    color: 'var(--primary)',
                    backgroundColor: 'rgba(255, 107, 0, 0.08)',
                    padding: '2px 6px',
                    borderRadius: 'var(--radius-xs)',
                    marginBottom: '10px',
                    display: 'inline-block',
                    maxWidth: '100%',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}>
                    📖 {task.storyId ? `US-00${task.storyId}: ` : ''}{task.storyTitle}
                  </div>
                )}

                {/* Card Footer: Assignee & Advancement */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingTop: '8px',
                  borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                  marginTop: '4px',
                }}>
                  {/* Assignee Avatar */}
                  <div
                    title={`Assigned to ${task.assignedToName || 'Unassigned'}`}
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--primary-subtle)',
                      border: '1px solid var(--border-focus)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--primary)',
                      fontSize: '0.7rem',
                      fontWeight: '700',
                    }}
                  >
                    {task.assignedToName ? task.assignedToName.charAt(0).toUpperCase() : 'U'}
                  </div>

                  {/* Micro Advance / Regress Buttons */}
                  <div
                    onClick={(e) => e.stopPropagation()}
                    style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    {onRegress && (
                      <button
                        type="button"
                        onClick={() => onRegress(task.taskId)}
                        title={regressLabel}
                        style={{
                          background: 'none',
                          border: '1px solid var(--border-subtle)',
                          color: 'var(--text-muted)',
                          borderRadius: 'var(--radius-xs)',
                          padding: '2px 5px',
                          cursor: 'pointer',
                          fontSize: '0.68rem',
                        }}
                      >
                        ←
                      </button>
                    )}

                    {onAdvance && (
                      <button
                        type="button"
                        onClick={() => onAdvance(task.taskId)}
                        title={advanceLabel}
                        style={{
                          background: 'rgba(255, 107, 0, 0.1)',
                          border: '1px solid rgba(255, 107, 0, 0.3)',
                          color: 'var(--primary)',
                          borderRadius: 'var(--radius-xs)',
                          padding: '2px 7px',
                          cursor: 'pointer',
                          fontSize: '0.68rem',
                          fontWeight: '600',
                        }}
                      >
                        {advanceLabel}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Sprints;
