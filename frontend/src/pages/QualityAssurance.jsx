import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { projectApi } from '../api/projectApi';
import { sprintApi } from '../api/sprintApi';
import { taskApi } from '../api/taskApi';
import { teamApi } from '../api/teamApi';
import { qaApi } from '../api/qaApi';
import {
  TestTube2,
  Bug,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Plus,
  Trash2,
  Edit3,
  Play,
  Search,
  Filter,
  User,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Flame,
  Activity,
  FolderKanban,
  CheckSquare,
  ArrowRight,
  ExternalLink,
  Layers,
  X,
  Send,
  UserCheck
} from 'lucide-react';

export const QualityAssurance = () => {
  const {
    user,
    isAdmin,
    isProjectManager,
    isTester,
    isDeveloper,
    isDevOps,
    isBusinessAnalyst,
  } = useAuth();

  // Permission Flags (Admins, PMs, Testers, and Developers have authoring clearance)
  const canManageTestCases = isAdmin || isProjectManager || isTester || isDeveloper;
  const canExecuteTestCases = isAdmin || isProjectManager || isTester || isDeveloper;
  const canCreateIssues = isAdmin || isProjectManager || isTester || isDeveloper || isDevOps || isBusinessAnalyst;
  const canUpdateIssues = isAdmin || isProjectManager || isTester || isDeveloper;
  const canAssignIssues = isAdmin || isProjectManager;
  const canDeleteIssues = isAdmin || isProjectManager;

  const [searchParams, setSearchParams] = useSearchParams();
  const urlProjectId = searchParams.get('projectId');
  const urlSprintId = searchParams.get('sprintId');
  const urlTab = searchParams.get('tab');

  // Core Data State
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState(urlProjectId || '');
  const [sprints, setSprints] = useState([]);
  const [selectedSprintId, setSelectedSprintId] = useState(urlSprintId || '');
  const [projectTasks, setProjectTasks] = useState([]);
  const [podMembers, setPodMembers] = useState([]);

  // Telemetry & Workbench State
  const [qaMetrics, setQaMetrics] = useState(null);
  const [testCases, setTestCases] = useState([]);
  const [issues, setIssues] = useState([]);
  const [activeTab, setActiveTab] = useState(urlTab === 'issues' ? 'ISSUES' : 'TEST_CASES');

  // Loading & Feedback State
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [loadingData, setLoadingData] = useState(false);
  const [loadingMetrics, setLoadingMetrics] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Filters: Test Cases
  const [tcSearch, setTcSearch] = useState('');
  const [tcStatusFilter, setTcStatusFilter] = useState('ALL');
  const [tcTypeFilter, setTcTypeFilter] = useState('ALL');
  const [tcExpandedId, setTcExpandedId] = useState(null);

  // Filters: Issues
  const [issueSearch, setIssueSearch] = useState('');
  const [issueViewMode, setIssueViewMode] = useState('ALL'); // 'ALL', 'ASSIGNED_TO_ME', 'REPORTED_BY_ME'
  const [issueSeverityFilter, setIssueSeverityFilter] = useState('ALL');
  const [issueStatusFilter, setIssueStatusFilter] = useState('ALL');

  // Modals
  const [isCreateTcOpen, setIsCreateTcOpen] = useState(false);
  const [isEditTcOpen, setIsEditTcOpen] = useState(false);
  const [currentTcToEdit, setCurrentTcToEdit] = useState(null);

  const [isExecuteTcOpen, setIsExecuteTcOpen] = useState(false);
  const [currentTcToExecute, setCurrentTcToExecute] = useState(null);
  const [executionForm, setExecutionForm] = useState({ status: 'Passed', notes: '' });

  const [isCreateIssueOpen, setIsCreateIssueOpen] = useState(false);
  const [issueForm, setIssueForm] = useState({
    taskId: '',
    title: '',
    description: '',
    severity: 'Medium',
    priority: 'Medium',
    assignedToUserId: '',
  });

  const [isIssueDetailOpen, setIsIssueDetailOpen] = useState(false);
  const [selectedIssueDetail, setSelectedIssueDetail] = useState(null);

  // 1. Fetch All Projects on Mount
  useEffect(() => {
    const fetchProjects = async () => {
      setLoadingProjects(true);
      try {
        const res = await projectApi.getAllProjects();
        if (res && res.data) {
          setProjects(res.data);
          if (res.data.length > 0) {
            const defaultId = urlProjectId && res.data.some((p) => String(p.projectId) === String(urlProjectId))
              ? String(urlProjectId)
              : String(res.data[0].projectId);
            setSelectedProjectId(defaultId);
          }
        }
      } catch (err) {
        console.error('Failed to load projects:', err);
        setError('Failed to load projects. Please refresh.');
      } finally {
        setLoadingProjects(false);
      }
    };
    fetchProjects();
  }, []);

  // 2. Fetch Sprints, Tasks, Pod Members & Metrics when Project changes
  useEffect(() => {
    if (!selectedProjectId) return;

    // Update URL query params
    setSearchParams({
      projectId: selectedProjectId,
      ...(selectedSprintId ? { sprintId: selectedSprintId } : {}),
      tab: activeTab.toLowerCase(),
    });

    const loadProjectContext = async () => {
      try {
        // Fetch Sprints
        const sRes = await sprintApi.getSprintsByProject(selectedProjectId);
        if (sRes && sRes.data) {
          setSprints(sRes.data);
          if (urlSprintId && sRes.data.some((s) => String(s.sprintId) === String(urlSprintId))) {
            setSelectedSprintId(urlSprintId);
          } else {
            setSelectedSprintId('');
          }
        }

        // Fetch Pod Members from Teams
        try {
          const tRes = await teamApi.getTeamsByProject(selectedProjectId);
          if (tRes && tRes.data && tRes.data.length > 0) {
            const allMembers = [];
            for (const team of tRes.data) {
              const mRes = await teamApi.getTeamMembers(team.teamId);
              if (mRes && mRes.data) {
                mRes.data.forEach((m) => {
                  const u = m.user || m;
                  if (u && !allMembers.some((existing) => existing.userId === u.userId)) {
                    allMembers.push(u);
                  }
                });
              }
            }
            setPodMembers(allMembers);
          } else {
            setPodMembers([]);
          }
        } catch (teamErr) {
          console.warn('Could not load team members for pod assignment:', teamErr);
        }
      } catch (err) {
        console.error('Failed to load project details:', err);
      }
    };

    loadProjectContext();
    fetchQaData(selectedProjectId, selectedSprintId);
  }, [selectedProjectId]);

  // 3. Fetch Tasks when Sprints change
  useEffect(() => {
    const fetchTasks = async () => {
      if (!sprints || sprints.length === 0) {
        setProjectTasks([]);
        return;
      }
      try {
        const tasksAccumulator = [];
        for (const sp of sprints) {
          const tRes = await taskApi.getTasksBySprint(sp.sprintId);
          if (tRes && tRes.data) {
            tasksAccumulator.push(...tRes.data);
          }
        }
        setProjectTasks(tasksAccumulator);
      } catch (err) {
        console.warn('Failed to load tasks for test case linking:', err);
      }
    };

    if (selectedProjectId) {
      fetchTasks();
    }
  }, [sprints]);

  // 4. Fetch Test Cases, Issues, and Metrics
  const fetchQaData = async (projId, spId) => {
    if (!projId) return;
    setLoadingData(true);
    setLoadingMetrics(true);
    setError('');

    try {
      // 1. Fetch Metrics
      try {
        const metRes = await qaApi.getProjectQaMetrics(projId);
        if (metRes && metRes.data) {
          setQaMetrics(metRes.data);
        }
      } catch (mErr) {
        console.warn('Failed to fetch QA metrics:', mErr);
      } finally {
        setLoadingMetrics(false);
      }

      // 2. Fetch Test Cases
      if (spId) {
        const tcRes = await qaApi.getTestCasesBySprint(spId);
        if (tcRes && tcRes.data) setTestCases(tcRes.data);
      } else {
        const tcRes = await qaApi.getTestCasesByProject(projId);
        if (tcRes && tcRes.data) setTestCases(tcRes.data);
      }

      // 3. Fetch Issues
      const issueRes = await qaApi.getIssuesByProject(projId);
      if (issueRes && issueRes.data) {
        setIssues(issueRes.data);
      }
    } catch (err) {
      console.error('Error fetching QA dataset:', err);
      setError('Failed to fetch QA datasets.');
    } finally {
      setLoadingData(false);
    }
  };

  // Switch Sprint Filter
  const handleSprintChange = (newSprintId) => {
    setSelectedSprintId(newSprintId);
    setSearchParams({
      projectId: selectedProjectId,
      ...(newSprintId ? { sprintId: newSprintId } : {}),
      tab: activeTab.toLowerCase(),
    });
    fetchQaData(selectedProjectId, newSprintId);
  };

  // Switch Tab
  const handleTabSwitch = (tab) => {
    setActiveTab(tab);
    setSearchParams({
      projectId: selectedProjectId,
      ...(selectedSprintId ? { sprintId: selectedSprintId } : {}),
      tab: tab.toLowerCase(),
    });
  };

  // ----------------------------------------------------
  // TEST CASE ACTIONS & HANDLERS
  // ----------------------------------------------------
  const handleOpenCreateTc = () => {
    if (!canManageTestCases) return;
    setIsCreateTcOpen(true);
  };

  const handleCreateTestCaseSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;
    const taskId = form.taskId.value;
    const title = form.title.value.trim();
    const testType = form.testType.value;
    const steps = form.steps.value.trim();
    const expectedResult = form.expectedResult.value.trim();

    if (!taskId || !title) {
      setError('Task and Test Case Title are required.');
      return;
    }

    setActionLoading(true);
    try {
      const res = await qaApi.createTestCase({
        taskId: Number(taskId),
        title,
        testType,
        steps,
        expectedResult,
        status: 'Draft',
      });
      if (res && res.data) {
        setSuccessMsg(`Test Case "${title}" created successfully!`);
        setIsCreateTcOpen(false);
        fetchQaData(selectedProjectId, selectedSprintId);
        setTimeout(() => setSuccessMsg(''), 4000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create test case.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenEditTc = (tc) => {
    if (!canManageTestCases) return;
    setCurrentTcToEdit(tc);
    setIsEditTcOpen(true);
  };

  const handleEditTestCaseSubmit = async (e) => {
    e.preventDefault();
    if (!currentTcToEdit) return;
    const form = e.target;
    const title = form.title.value.trim();
    const testType = form.testType.value;
    const steps = form.steps.value.trim();
    const expectedResult = form.expectedResult.value.trim();

    setActionLoading(true);
    try {
      const res = await qaApi.updateTestCase(currentTcToEdit.testCaseId, {
        title,
        testType,
        steps,
        expectedResult,
      });
      if (res && res.data) {
        setSuccessMsg('Test Case updated successfully!');
        setIsEditTcOpen(false);
        setCurrentTcToEdit(null);
        fetchQaData(selectedProjectId, selectedSprintId);
        setTimeout(() => setSuccessMsg(''), 4000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update test case.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteTestCase = async (tcId) => {
    if (!canManageTestCases) return;
    if (!window.confirm(`Are you sure you want to delete Test Case TC-${tcId}?`)) return;

    setActionLoading(true);
    try {
      await qaApi.deleteTestCase(tcId);
      setSuccessMsg(`Test case TC-${tcId} deleted.`);
      fetchQaData(selectedProjectId, selectedSprintId);
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete test case.');
    } finally {
      setActionLoading(false);
    }
  };

  // Quick 1-Click Execution Verdict (Passed, Failed, Blocked, Draft/Pending)
  const handleQuickExecute = async (tc, verdict) => {
    if (!canExecuteTestCases) return;
    setActionLoading(true);
    try {
      await qaApi.executeTestCase(tc.testCaseId, {
        status: verdict,
        executionNotes: `Execution marked as ${verdict} by ${user?.fullName || 'User'} on ${new Date().toLocaleTimeString()}`,
      });
      setSuccessMsg(`TC-00${tc.testCaseId} marked as ${verdict}!`);
      fetchQaData(selectedProjectId, selectedSprintId);
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update execution verdict.');
    } finally {
      setActionLoading(false);
    }
  };

  // Open detailed execution modal with notes
  const handleOpenDetailedExecution = (tc) => {
    if (!canExecuteTestCases) return;
    setCurrentTcToExecute(tc);
    setExecutionForm({
      status: tc.status === 'Draft' ? 'Passed' : tc.status,
      notes: '',
    });
    setIsExecuteTcOpen(true);
  };

  const handleDetailedExecutionSubmit = async (e) => {
    e.preventDefault();
    if (!currentTcToExecute) return;
    setActionLoading(true);
    try {
      await qaApi.executeTestCase(currentTcToExecute.testCaseId, {
        status: executionForm.status,
        executionNotes: executionForm.notes.trim() || undefined,
      });
      setSuccessMsg(`Test Case execution recorded as ${executionForm.status}!`);
      setIsExecuteTcOpen(false);
      setCurrentTcToExecute(null);
      fetchQaData(selectedProjectId, selectedSprintId);
      setTimeout(() => setSuccessMsg(''), 3500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit execution.');
    } finally {
      setActionLoading(false);
    }
  };

  // Fast-Track Action: "Log Bug from Failed Test"
  const handleLogBugFromFailedTest = (tc) => {
    setIssueForm({
      taskId: tc.taskId ? String(tc.taskId) : '',
      title: `[Bug] Defect in TC-00${tc.testCaseId}: ${tc.title}`,
      description: `### Test Case Failure Details\n- **Test Case:** TC-00${tc.testCaseId} (${tc.title})\n- **Test Type:** ${tc.testType}\n- **Linked Task:** ${tc.taskTitle || 'N/A'}\n\n### Steps to Reproduce:\n${tc.steps || 'Follow steps defined in test case.'}\n\n### Expected Result:\n${tc.expectedResult || 'N/A'}\n\n### Actual Result:\nFailed during execution by ${user?.fullName || 'QA'}.`,
      severity: 'High',
      priority: 'High',
      assignedToUserId: '',
    });
    setIsCreateIssueOpen(true);
  };

  // ----------------------------------------------------
  // DEFECT / ISSUE ACTIONS & HANDLERS
  // ----------------------------------------------------
  const handleOpenCreateIssue = () => {
    setIssueForm({
      taskId: projectTasks.length > 0 ? String(projectTasks[0].taskId) : '',
      title: '',
      description: '',
      severity: 'Medium',
      priority: 'Medium',
      assignedToUserId: '',
    });
    setIsCreateIssueOpen(true);
  };

  const handleCreateIssueSubmit = async (e) => {
    e.preventDefault();
    if (!issueForm.taskId || !issueForm.title.trim()) {
      setError('Linked Task and Issue Title are required.');
      return;
    }

    setActionLoading(true);
    try {
      const res = await qaApi.createIssue({
        taskId: Number(issueForm.taskId),
        title: issueForm.title.trim(),
        description: issueForm.description.trim() || undefined,
        severity: issueForm.severity,
        priority: issueForm.priority,
        status: 'Open',
        assignedToUserId: issueForm.assignedToUserId ? Number(issueForm.assignedToUserId) : null,
      });

      if (res && res.data) {
        setSuccessMsg(`Issue "${issueForm.title}" filed successfully!`);
        setIsCreateIssueOpen(false);
        fetchQaData(selectedProjectId, selectedSprintId);
        setTimeout(() => setSuccessMsg(''), 4000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to file issue.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleQuickStatusChange = async (issueId, newStatus) => {
    if (!canUpdateIssues) return;
    setActionLoading(true);
    try {
      await qaApi.updateIssueStatus(issueId, { status: newStatus });
      setSuccessMsg(`Issue #${issueId} status transitioned to ${newStatus}.`);
      fetchQaData(selectedProjectId, selectedSprintId);
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update issue status.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReassignIssue = async (issueId, newUserId) => {
    if (!canAssignIssues) return;
    setActionLoading(true);
    try {
      await qaApi.assignIssue(issueId, newUserId);
      setSuccessMsg(`Issue #${issueId} reassigned successfully.`);
      fetchQaData(selectedProjectId, selectedSprintId);
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reassign issue.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteIssue = async (issueId) => {
    if (!canDeleteIssues) return;
    if (!window.confirm(`Are you sure you want to permanently delete Issue #${issueId}?`)) return;

    setActionLoading(true);
    try {
      await qaApi.deleteIssue(issueId);
      setSuccessMsg(`Issue #${issueId} deleted.`);
      fetchQaData(selectedProjectId, selectedSprintId);
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete issue.');
    } finally {
      setActionLoading(false);
    }
  };

  // ----------------------------------------------------
  // FILTERED DATASETS
  // ----------------------------------------------------
  const filteredTestCases = useMemo(() => {
    return testCases.filter((tc) => {
      // Search filter
      const q = tcSearch.toLowerCase();
      const matchSearch =
        !q ||
        tc.title?.toLowerCase().includes(q) ||
        tc.steps?.toLowerCase().includes(q) ||
        tc.taskTitle?.toLowerCase().includes(q) ||
        `tc-${tc.testCaseId}`.includes(q);

      // Status filter
      const matchStatus = tcStatusFilter === 'ALL' || tc.status?.toUpperCase() === tcStatusFilter.toUpperCase();

      // Type filter
      const matchType = tcTypeFilter === 'ALL' || tc.testType?.toUpperCase() === tcTypeFilter.toUpperCase();

      return matchSearch && matchStatus && matchType;
    });
  }, [testCases, tcSearch, tcStatusFilter, tcTypeFilter]);

  const filteredIssues = useMemo(() => {
    return issues.filter((iss) => {
      // View mode filter
      if (issueViewMode === 'ASSIGNED_TO_ME' && iss.assignedToUserId !== user?.userId) {
        return false;
      }
      if (issueViewMode === 'REPORTED_BY_ME' && iss.reportedByUserId !== user?.userId) {
        return false;
      }

      // Search filter
      const q = issueSearch.toLowerCase();
      const matchSearch =
        !q ||
        iss.title?.toLowerCase().includes(q) ||
        iss.description?.toLowerCase().includes(q) ||
        iss.assignedToName?.toLowerCase().includes(q) ||
        iss.taskTitle?.toLowerCase().includes(q) ||
        `issue-${iss.issueId}`.includes(q);

      // Severity filter
      const matchSeverity = issueSeverityFilter === 'ALL' || iss.severity?.toUpperCase() === issueSeverityFilter.toUpperCase();

      // Status filter
      const matchStatus = issueStatusFilter === 'ALL' || iss.status?.toUpperCase() === issueStatusFilter.toUpperCase();

      return matchSearch && matchSeverity && matchStatus;
    });
  }, [issues, issueSearch, issueViewMode, issueSeverityFilter, issueStatusFilter, user]);

  // Color helper functions
  const getSeverityBadge = (severity) => {
    switch ((severity || '').toUpperCase()) {
      case 'CRITICAL':
        return (
          <span className="badge" style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', border: '1px solid #ef4444', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <Flame size={12} /> Critical
          </span>
        );
      case 'HIGH':
        return (
          <span className="badge" style={{ backgroundColor: 'rgba(255, 107, 0, 0.15)', color: 'var(--primary)', border: '1px solid var(--primary)' }}>
            High
          </span>
        );
      case 'MEDIUM':
        return (
          <span className="badge" style={{ backgroundColor: 'rgba(234, 179, 8, 0.15)', color: '#eab308', border: '1px solid #eab308' }}>
            Medium
          </span>
        );
      case 'LOW':
      default:
        return (
          <span className="badge" style={{ backgroundColor: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6', border: '1px solid #3b82f6' }}>
            Low
          </span>
        );
    }
  };

  const getTestStatusBadge = (status) => {
    switch ((status || '').toUpperCase()) {
      case 'PASSED':
        return (
          <span className="badge" style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#10b981', border: '1px solid #10b981', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
            <CheckCircle2 size={13} /> Passed
          </span>
        );
      case 'FAILED':
        return (
          <span className="badge" style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', border: '1px solid #ef4444', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
            <XCircle size={13} /> Failed
          </span>
        );
      case 'BLOCKED':
        return (
          <span className="badge" style={{ backgroundColor: 'rgba(234, 179, 8, 0.15)', color: '#eab308', border: '1px solid #eab308', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
            <AlertTriangle size={13} /> Blocked
          </span>
        );
      case 'DRAFT':
      case 'PENDING':
      default:
        return (
          <span className="badge" style={{ backgroundColor: 'rgba(148, 163, 184, 0.12)', color: 'var(--text-secondary)', border: '1px solid var(--border-subtle)', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
            <Clock size={13} /> {status || 'Pending'}
          </span>
        );
    }
  };

  const getIssueStatusBadge = (status) => {
    switch ((status || '').toUpperCase()) {
      case 'OPEN':
        return <span className="badge" style={{ backgroundColor: 'rgba(239, 68, 68, 0.12)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.4)' }}>Open</span>;
      case 'IN PROGRESS':
      case 'IN_PROGRESS':
        return <span className="badge" style={{ backgroundColor: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6', border: '1px solid #3b82f6' }}>In Progress</span>;
      case 'RESOLVED':
        return <span className="badge" style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#10b981', border: '1px solid #10b981' }}>Resolved</span>;
      case 'CLOSED':
        return <span className="badge" style={{ backgroundColor: 'rgba(148, 163, 184, 0.15)', color: 'var(--text-muted)', border: '1px solid var(--border-subtle)' }}>Closed</span>;
      default:
        return <span className="badge">{status}</span>;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px', paddingBottom: '40px' }}>
      {/* 1. Header Command Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 className="text-gradient-white" style={{ fontSize: '1.75rem', fontWeight: '800', letterSpacing: '-0.02em', margin: 0 }}>
              Quality Assurance &amp; Defect Command Center
            </h1>
            <span className="badge" style={{ backgroundColor: 'rgba(255, 107, 0, 0.12)', color: 'var(--primary)', border: '1px solid var(--border-focus)', fontSize: '0.72rem' }}>
              MODULE 08
            </span>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.86rem', marginTop: '4px' }}>
            Living Test Case Suites, 1-Click Verification Workbench, Fast-Track Bug Triage &amp; Release Quality Gates.
          </p>
        </div>

        {/* Global Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => fetchQaData(selectedProjectId, selectedSprintId)}
            disabled={loadingData}
            title="Refresh dataset"
          >
            <RefreshCw size={14} className={loadingData ? 'spin' : ''} />
            <span>Sync Telemetry</span>
          </button>

          {activeTab === 'TEST_CASES' && canManageTestCases && (
            <button className="btn btn-primary btn-sm" onClick={handleOpenCreateTc}>
              <Plus size={15} />
              <span>New Test Case</span>
            </button>
          )}

          {activeTab === 'ISSUES' && canCreateIssues && (
            <button className="btn btn-primary btn-sm" onClick={handleOpenCreateIssue}>
              <Plus size={15} />
              <span>Report Defect</span>
            </button>
          )}
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <div className="alert alert-danger" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <AlertCircle size={18} color="#ef4444" />
          <span style={{ flex: 1 }}>{error}</span>
          <button onClick={() => setError('')} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}>
            <X size={16} />
          </button>
        </div>
      )}

      {successMsg && (
        <div className="alert alert-success" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <CheckCircle2 size={18} color="var(--success)" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* 2. Executive Telemetry HUD Bar */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
        gap: '14px',
      }}>
        {/* Pass Rate Metric */}
        <div className="glass-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-secondary)', letterSpacing: '0.05em' }}>
              Quality Pass Rate
            </span>
            <Activity size={16} color="var(--primary)" />
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span style={{ fontSize: '1.85rem', fontWeight: '800', fontFamily: 'monospace', color: (qaMetrics?.passRatePercentage || 0) >= 80 ? '#10b981' : '#ff6b00' }}>
              {qaMetrics?.passRatePercentage != null ? `${qaMetrics.passRatePercentage.toFixed(1)}%` : '0.0%'}
            </span>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              ({qaMetrics?.passedTestCases || 0}/{qaMetrics?.totalTestCases || 0} executed)
            </span>
          </div>
          <div style={{ width: '100%', height: '5px', backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: '3px', overflow: 'hidden' }}>
            <div style={{
              width: `${Math.min(100, qaMetrics?.passRatePercentage || 0)}%`,
              height: '100%',
              background: (qaMetrics?.passRatePercentage || 0) >= 80 ? 'linear-gradient(90deg, #10b981, #34d399)' : 'linear-gradient(90deg, #ff6b00, #ff8c26)',
              transition: 'width 0.5s ease',
            }} />
          </div>
        </div>

        {/* Test Case Suite Breakdown */}
        <div className="glass-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-secondary)', letterSpacing: '0.05em' }}>
              Test Cases Suite
            </span>
            <TestTube2 size={16} color="#3b82f6" />
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span style={{ fontSize: '1.85rem', fontWeight: '800', fontFamily: 'monospace', color: 'var(--text-primary)' }}>
              {testCases.length}
            </span>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>total test cases</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
            <span style={{ color: '#10b981', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
              ● {qaMetrics?.passedTestCases || 0} Pass
            </span>
            <span style={{ color: '#ef4444', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
              ● {qaMetrics?.failedTestCases || 0} Fail
            </span>
            <span style={{ color: 'var(--text-muted)' }}>
              ● {qaMetrics?.pendingTestCases || 0} Pending
            </span>
          </div>
        </div>

        {/* Open Defects Count */}
        <div className="glass-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-secondary)', letterSpacing: '0.05em' }}>
              Defects In Triage
            </span>
            <Bug size={16} color="#ef4444" />
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span style={{ fontSize: '1.85rem', fontWeight: '800', fontFamily: 'monospace', color: (qaMetrics?.openIssues || 0) > 0 ? '#ef4444' : '#10b981' }}>
              {qaMetrics?.openIssues || 0}
            </span>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>unresolved bugs</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.74rem' }}>
            {(qaMetrics?.criticalIssues || 0) > 0 ? (
              <span style={{ color: '#ef4444', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <Flame size={13} /> {qaMetrics.criticalIssues} Critical Blockers
              </span>
            ) : (
              <span style={{ color: '#10b981', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <CheckCircle2 size={13} /> Zero Critical Blockers
              </span>
            )}
          </div>
        </div>

        {/* Resolved Defect Count */}
        <div className="glass-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-secondary)', letterSpacing: '0.05em' }}>
              Resolved / Closed
            </span>
            <ShieldCheck size={16} color="#10b981" />
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span style={{ fontSize: '1.85rem', fontWeight: '800', fontFamily: 'monospace', color: '#10b981' }}>
              {qaMetrics?.resolvedIssues || 0}
            </span>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>bugs resolved</span>
          </div>
          <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
            Total defects tracked: {qaMetrics?.totalIssues || 0}
          </span>
        </div>
      </div>

      {/* 3. Scope & Scope Selector Bar */}
      <div className="glass-card" style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
          {/* Project Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FolderKanban size={16} color="var(--primary)" />
            <label style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--text-secondary)' }}>Project:</label>
            <select
              className="form-select"
              style={{ width: 'auto', minWidth: '180px', padding: '6px 12px', fontSize: '0.82rem' }}
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              disabled={loadingProjects}
            >
              {projects.map((p) => (
                <option key={p.projectId} value={p.projectId}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Sprint Filter Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Layers size={16} color="var(--text-muted)" />
            <label style={{ fontSize: '0.82rem', fontWeight: '600', color: 'var(--text-secondary)' }}>Sprint:</label>
            <select
              className="form-select"
              style={{ width: 'auto', minWidth: '170px', padding: '6px 12px', fontSize: '0.82rem' }}
              value={selectedSprintId}
              onChange={(e) => handleSprintChange(e.target.value)}
            >
              <option value="">All Project Sprints</option>
              {sprints.map((s) => (
                <option key={s.sprintId} value={s.sprintId}>
                  {s.sprintName} ({s.status})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Workbench Tab Switcher */}
        <div style={{
          display: 'flex',
          backgroundColor: 'rgba(0, 0, 0, 0.45)',
          borderRadius: '8px',
          padding: '3px',
          border: '1px solid var(--border-subtle)',
        }}>
          <button
            onClick={() => handleTabSwitch('TEST_CASES')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 14px',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.82rem',
              fontWeight: activeTab === 'TEST_CASES' ? '700' : '500',
              backgroundColor: activeTab === 'TEST_CASES' ? 'var(--primary)' : 'transparent',
              color: activeTab === 'TEST_CASES' ? '#000' : 'var(--text-secondary)',
              transition: 'all 0.15s ease',
            }}
          >
            <TestTube2 size={14} />
            <span>Test Cases Matrix ({testCases.length})</span>
          </button>

          <button
            onClick={() => handleTabSwitch('ISSUES')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 14px',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.82rem',
              fontWeight: activeTab === 'ISSUES' ? '700' : '500',
              backgroundColor: activeTab === 'ISSUES' ? 'var(--primary)' : 'transparent',
              color: activeTab === 'ISSUES' ? '#000' : 'var(--text-secondary)',
              transition: 'all 0.15s ease',
            }}
          >
            <Bug size={14} />
            <span>Defect Triage ({issues.length})</span>
          </button>
        </div>
      </div>

      {/* ==================================================== */}
      {/* TAB 1: TEST CASES MATRIX WORKBENCH                   */}
      {/* ==================================================== */}
      {activeTab === 'TEST_CASES' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Sub-Filter Bar */}
          <div className="glass-card" style={{ padding: '12px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: '240px' }}>
              <div style={{ position: 'relative', flex: 1, maxWidth: '300px' }}>
                <Search size={14} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '10px' }} />
                <input
                  type="text"
                  className="form-input"
                  style={{ paddingLeft: '32px', fontSize: '0.82rem', height: '34px' }}
                  placeholder="Search test case title, steps..."
                  value={tcSearch}
                  onChange={(e) => setTcSearch(e.target.value)}
                />
              </div>

              {/* Status Filter Pills */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                {['ALL', 'Passed', 'Failed', 'Blocked', 'Pending'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setTcStatusFilter(st)}
                    style={{
                      padding: '4px 10px',
                      fontSize: '0.74rem',
                      fontWeight: tcStatusFilter === st ? '700' : '500',
                      borderRadius: '6px',
                      border: tcStatusFilter === st ? '1px solid var(--border-focus)' : '1px solid var(--border-subtle)',
                      backgroundColor: tcStatusFilter === st ? 'rgba(255, 107, 0, 0.15)' : 'transparent',
                      color: tcStatusFilter === st ? 'var(--primary)' : 'var(--text-secondary)',
                      cursor: 'pointer',
                    }}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Test Type Filter & New Test Case Button */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Type:</label>
                <select
                  className="form-select"
                  style={{ width: 'auto', fontSize: '0.78rem', height: '32px', padding: '4px 10px' }}
                  value={tcTypeFilter}
                  onChange={(e) => setTcTypeFilter(e.target.value)}
                >
                  <option value="ALL">All Types</option>
                  <option value="Functional">Functional</option>
                  <option value="Regression">Regression</option>
                  <option value="Integration">Integration</option>
                  <option value="Security">Security</option>
                  <option value="Performance">Performance</option>
                </select>
              </div>

              {canManageTestCases && (
                <button
                  className="btn btn-primary btn-sm"
                  onClick={handleOpenCreateTc}
                  style={{ height: '32px', padding: '0 12px' }}
                >
                  <Plus size={14} />
                  <span>New Test Case</span>
                </button>
              )}
            </div>
          </div>

          {/* Test Case Cards List */}
          {filteredTestCases.length === 0 ? (
            <div className="glass-card" style={{ textAlign: 'center', padding: '50px 20px' }}>
              <TestTube2 size={36} color="var(--text-muted)" style={{ margin: '0 auto 12px' }} />
              <h3 style={{ fontSize: '1.05rem', fontWeight: '700', color: 'var(--text-primary)' }}>No Test Cases Found</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', maxWidth: '420px', margin: '6px auto 16px' }}>
                {testCases.length === 0
                  ? 'No test cases have been authored for this project/sprint scope yet.'
                  : 'No test cases match your active search and filter criteria.'}
              </p>
              {canManageTestCases && (
                <button className="btn btn-primary btn-sm" onClick={handleOpenCreateTc}>
                  <Plus size={14} />
                  <span>Author First Test Case</span>
                </button>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {filteredTestCases.map((tc) => {
                const isExpanded = tcExpandedId === tc.testCaseId;
                return (
                  <div
                    key={tc.testCaseId}
                    className="glass-card"
                    style={{
                      padding: 0,
                      overflow: 'hidden',
                      border: tc.status === 'Failed' ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid var(--border-subtle)',
                    }}
                  >
                    {/* Main Row */}
                    <div
                      style={{
                        padding: '14px 18px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '12px',
                        backgroundColor: isExpanded ? 'rgba(255, 255, 255, 0.02)' : 'transparent',
                        cursor: 'pointer',
                      }}
                      onClick={() => setTcExpandedId(isExpanded ? null : tc.testCaseId)}
                    >
                      {/* Left: ID & Title & Metadata */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: '280px' }}>
                        <span style={{ fontFamily: 'monospace', fontWeight: '700', fontSize: '0.82rem', color: 'var(--primary)' }}>
                          TC-00{tc.testCaseId}
                        </span>

                        {getTestStatusBadge(tc.status)}

                        <span className="badge" style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#60a5fa', fontSize: '0.7rem' }}>
                          {tc.testType || 'Functional'}
                        </span>

                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontWeight: '600', fontSize: '0.88rem', color: 'var(--text-primary)' }}>
                            {tc.title}
                          </span>
                          {tc.taskTitle && (
                            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                              Linked Task: {tc.taskTitle}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Right: Execution Actions & Trigger */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }} onClick={(e) => e.stopPropagation()}>
                        {/* 1-Click Execution Verdicts */}
                        {canExecuteTestCases && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginRight: '6px' }}>
                            <button
                              className="btn btn-secondary btn-sm"
                              style={{
                                padding: '4px 8px',
                                fontSize: '0.72rem',
                                color: tc.status === 'Passed' ? '#10b981' : 'var(--text-secondary)',
                                border: tc.status === 'Passed' ? '1px solid #10b981' : undefined,
                              }}
                              onClick={() => handleQuickExecute(tc, 'Passed')}
                              title="Mark Passed"
                            >
                              <CheckCircle2 size={13} color="#10b981" />
                              <span>Pass</span>
                            </button>

                            <button
                              className="btn btn-secondary btn-sm"
                              style={{
                                padding: '4px 8px',
                                fontSize: '0.72rem',
                                color: tc.status === 'Failed' ? '#ef4444' : 'var(--text-secondary)',
                                border: tc.status === 'Failed' ? '1px solid #ef4444' : undefined,
                              }}
                              onClick={() => handleQuickExecute(tc, 'Failed')}
                              title="Mark Failed"
                            >
                              <XCircle size={13} color="#ef4444" />
                              <span>Fail</span>
                            </button>

                            <button
                              className="btn btn-secondary btn-sm"
                              style={{
                                padding: '4px 8px',
                                fontSize: '0.72rem',
                                color: tc.status === 'Blocked' ? '#eab308' : 'var(--text-secondary)',
                                border: tc.status === 'Blocked' ? '1px solid #eab308' : undefined,
                              }}
                              onClick={() => handleQuickExecute(tc, 'Blocked')}
                              title="Mark Blocked"
                            >
                              <AlertTriangle size={13} color="#eab308" />
                              <span>Block</span>
                            </button>

                            <button
                              className="btn btn-secondary btn-sm"
                              style={{ padding: '4px 8px', fontSize: '0.72rem' }}
                              onClick={() => handleOpenDetailedExecution(tc)}
                              title="Detailed execution with notes"
                            >
                              <Play size={12} />
                            </button>
                          </div>
                        )}

                        {/* Fast-Track: Log Defect from Failed Test */}
                        {tc.status === 'Failed' && canCreateIssues && (
                          <button
                            className="btn btn-sm"
                            style={{
                              backgroundColor: 'rgba(239, 68, 68, 0.15)',
                              border: '1px solid #ef4444',
                              color: '#ef4444',
                              fontSize: '0.72rem',
                              fontWeight: '700',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                            onClick={() => handleLogBugFromFailedTest(tc)}
                            title="Open defect modal pre-filled with test details"
                          >
                            <Bug size={13} />
                            <span>Log Defect</span>
                          </button>
                        )}

                        {/* Edit & Delete for QA / PM */}
                        {canManageTestCases && (
                          <>
                            <button
                              className="btn btn-secondary btn-sm"
                              style={{ padding: '5px' }}
                              onClick={() => handleOpenEditTc(tc)}
                              title="Edit test case"
                            >
                              <Edit3 size={13} />
                            </button>
                            <button
                              className="btn btn-secondary btn-sm"
                              style={{ padding: '5px', color: '#ef4444' }}
                              onClick={() => handleDeleteTestCase(tc.testCaseId)}
                              title="Delete test case"
                            >
                              <Trash2 size={13} />
                            </button>
                          </>
                        )}

                        <button
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '4px 6px', background: 'transparent', border: 'none', color: 'var(--text-muted)' }}
                          onClick={() => setTcExpandedId(isExpanded ? null : tc.testCaseId)}
                        >
                          {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                        </button>
                      </div>
                    </div>

                    {/* Expandable Accordion Body */}
                    {isExpanded && (
                      <div style={{
                        padding: '16px 20px',
                        borderTop: '1px solid var(--border-subtle)',
                        backgroundColor: 'rgba(0, 0, 0, 0.35)',
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                        gap: '20px',
                      }}>
                        {/* Steps to Execute */}
                        <div>
                          <span style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-secondary)', letterSpacing: '0.04em' }}>
                            Test Steps / Execution Procedure
                          </span>
                          <div style={{
                            marginTop: '6px',
                            padding: '12px',
                            backgroundColor: 'rgba(0,0,0,0.5)',
                            borderRadius: '6px',
                            border: '1px solid var(--border-subtle)',
                            fontFamily: 'monospace',
                            fontSize: '0.8rem',
                            whiteSpace: 'pre-wrap',
                            lineHeight: '1.5',
                            color: 'var(--text-primary)',
                          }}>
                            {tc.steps || 'No execution steps specified.'}
                          </div>
                        </div>

                        {/* Expected Results & Audit Meta */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          <div>
                            <span style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-secondary)', letterSpacing: '0.04em' }}>
                              Expected Verification Result
                            </span>
                            <div style={{
                              marginTop: '6px',
                              padding: '12px',
                              backgroundColor: 'rgba(0,0,0,0.5)',
                              borderRadius: '6px',
                              border: '1px solid var(--border-subtle)',
                              fontSize: '0.8rem',
                              lineHeight: '1.5',
                              color: 'var(--text-primary)',
                            }}>
                              {tc.expectedResult || 'No expected result criteria defined.'}
                            </div>
                          </div>

                          {/* Execution Audit Metadata */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                            {tc.executedByName && (
                              <span>Last run by: <strong style={{ color: 'var(--text-primary)' }}>{tc.executedByName}</strong></span>
                            )}
                            {tc.executionDate && (
                              <span>Timestamp: <strong style={{ color: 'var(--text-primary)' }}>{new Date(tc.executionDate).toLocaleString()}</strong></span>
                            )}
                          </div>
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

      {/* ==================================================== */}
      {/* TAB 2: DEFECT & BUG TRIAGE TRACKER                   */}
      {/* ==================================================== */}
      {activeTab === 'ISSUES' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Sub-Filter Bar */}
          <div className="glass-card" style={{ padding: '12px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: '260px' }}>
              {/* View Mode Pills */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <button
                  onClick={() => setIssueViewMode('ALL')}
                  style={{
                    padding: '4px 10px',
                    fontSize: '0.74rem',
                    fontWeight: issueViewMode === 'ALL' ? '700' : '500',
                    borderRadius: '6px',
                    border: issueViewMode === 'ALL' ? '1px solid var(--border-focus)' : '1px solid var(--border-subtle)',
                    backgroundColor: issueViewMode === 'ALL' ? 'rgba(255, 107, 0, 0.15)' : 'transparent',
                    color: issueViewMode === 'ALL' ? 'var(--primary)' : 'var(--text-secondary)',
                    cursor: 'pointer',
                  }}
                >
                  All Bugs ({issues.length})
                </button>
                <button
                  onClick={() => setIssueViewMode('ASSIGNED_TO_ME')}
                  style={{
                    padding: '4px 10px',
                    fontSize: '0.74rem',
                    fontWeight: issueViewMode === 'ASSIGNED_TO_ME' ? '700' : '500',
                    borderRadius: '6px',
                    border: issueViewMode === 'ASSIGNED_TO_ME' ? '1px solid var(--border-focus)' : '1px solid var(--border-subtle)',
                    backgroundColor: issueViewMode === 'ASSIGNED_TO_ME' ? 'rgba(255, 107, 0, 0.15)' : 'transparent',
                    color: issueViewMode === 'ASSIGNED_TO_ME' ? 'var(--primary)' : 'var(--text-secondary)',
                    cursor: 'pointer',
                  }}
                >
                  Assigned to Me
                </button>
              </div>

              {/* Search */}
              <div style={{ position: 'relative', flex: 1, maxWidth: '280px' }}>
                <Search size={14} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '10px' }} />
                <input
                  type="text"
                  className="form-input"
                  style={{ paddingLeft: '32px', fontSize: '0.82rem', height: '34px' }}
                  placeholder="Search bug title, description..."
                  value={issueSearch}
                  onChange={(e) => setIssueSearch(e.target.value)}
                />
              </div>
            </div>

            {/* Severity & Status Dropdowns */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Severity:</label>
                <select
                  className="form-select"
                  style={{ width: 'auto', fontSize: '0.78rem', height: '32px', padding: '4px 10px' }}
                  value={issueSeverityFilter}
                  onChange={(e) => setIssueSeverityFilter(e.target.value)}
                >
                  <option value="ALL">All Severities</option>
                  <option value="Critical">Critical</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Status:</label>
                <select
                  className="form-select"
                  style={{ width: 'auto', fontSize: '0.78rem', height: '32px', padding: '4px 10px' }}
                  value={issueStatusFilter}
                  onChange={(e) => setIssueStatusFilter(e.target.value)}
                >
                  <option value="ALL">All Statuses</option>
                  <option value="Open">Open</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>
            </div>
          </div>

          {/* Issues Table */}
          {filteredIssues.length === 0 ? (
            <div className="glass-card" style={{ textAlign: 'center', padding: '50px 20px' }}>
              <ShieldCheck size={36} color="#10b981" style={{ margin: '0 auto 12px' }} />
              <h3 style={{ fontSize: '1.05rem', fontWeight: '700', color: 'var(--text-primary)' }}>Zero Bugs in this View</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', maxWidth: '420px', margin: '6px auto 16px' }}>
                {issues.length === 0
                  ? 'No defects are currently registered for this project. Quality standards verified.'
                  : 'No issues match your active search and filter criteria.'}
              </p>
              {canCreateIssues && (
                <button className="btn btn-primary btn-sm" onClick={handleOpenCreateIssue}>
                  <Plus size={14} />
                  <span>Report New Defect</span>
                </button>
              )}
            </div>
          ) : (
            <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.84rem' }}>
                  <thead>
                    <tr style={{ backgroundColor: 'rgba(0, 0, 0, 0.65)', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>
                      <th style={{ padding: '12px 16px' }}>ID &amp; Severity</th>
                      <th style={{ padding: '12px 16px' }}>Bug Title &amp; Context</th>
                      <th style={{ padding: '12px 16px' }}>Linked Task</th>
                      <th style={{ padding: '12px 16px' }}>Assignee</th>
                      <th style={{ padding: '12px 16px' }}>Lifecycle Status</th>
                      <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredIssues.map((iss) => (
                      <tr
                        key={iss.issueId}
                        style={{
                          borderBottom: '1px solid var(--border-subtle)',
                          backgroundColor: iss.severity === 'Critical' ? 'rgba(239, 68, 68, 0.04)' : 'transparent',
                        }}
                      >
                        {/* ID & Severity */}
                        <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontFamily: 'monospace', fontWeight: '700', color: 'var(--primary)', fontSize: '0.8rem' }}>
                              #{iss.issueId}
                            </span>
                            {getSeverityBadge(iss.severity)}
                          </div>
                        </td>

                        {/* Title & Description */}
                        <td style={{ padding: '12px 16px' }}>
                          <div
                            style={{ cursor: 'pointer' }}
                            onClick={() => {
                              setSelectedIssueDetail(iss);
                              setIsIssueDetailOpen(true);
                            }}
                          >
                            <span style={{ fontWeight: '600', color: 'var(--text-primary)', display: 'block' }}>
                              {iss.title}
                            </span>
                            {iss.description && (
                              <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', display: 'block', maxWidth: '380px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {iss.description.replace(/[#*`]/g, '')}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Linked Task */}
                        <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                          {iss.taskTitle ? (
                            <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                              {iss.taskTitle}
                            </span>
                          ) : (
                            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Project-level</span>
                          )}
                        </td>

                        {/* Assignee / Reassign */}
                        <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                          {canAssignIssues ? (
                            <select
                              className="form-select"
                              style={{ width: 'auto', fontSize: '0.76rem', padding: '3px 8px', height: '28px' }}
                              value={iss.assignedToUserId || ''}
                              onChange={(e) => handleReassignIssue(iss.issueId, e.target.value)}
                            >
                              <option value="">Unassigned</option>
                              {podMembers.map((m) => (
                                <option key={m.userId} value={m.userId}>
                                  {m.fullName} ({m.role})
                                </option>
                              ))}
                            </select>
                          ) : (
                            <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                              <User size={13} color="var(--text-muted)" />
                              {iss.assignedToName || 'Unassigned'}
                            </span>
                          )}
                        </td>

                        {/* Status Transition */}
                        <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                          {canUpdateIssues ? (
                            <select
                              className="form-select"
                              style={{ width: 'auto', fontSize: '0.76rem', padding: '3px 8px', height: '28px' }}
                              value={iss.status || 'Open'}
                              onChange={(e) => handleQuickStatusChange(iss.issueId, e.target.value)}
                            >
                              <option value="Open">Open</option>
                              <option value="In Progress">In Progress</option>
                              <option value="Resolved">Resolved</option>
                              <option value="Closed">Closed</option>
                            </select>
                          ) : (
                            getIssueStatusBadge(iss.status)
                          )}
                        </td>

                        {/* Actions */}
                        <td style={{ padding: '12px 16px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                          <button
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '4px 8px', fontSize: '0.74rem', marginRight: '6px' }}
                            onClick={() => {
                              setSelectedIssueDetail(iss);
                              setIsIssueDetailOpen(true);
                            }}
                          >
                            Inspect
                          </button>
                          {canDeleteIssues && (
                            <button
                              className="btn btn-secondary btn-sm"
                              style={{ padding: '4px 6px', color: '#ef4444' }}
                              onClick={() => handleDeleteIssue(iss.issueId)}
                              title="Delete issue"
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL: CREATE TEST CASE                              */}
      {/* ==================================================== */}
      {isCreateTcOpen && (
        <div className="modal-backdrop">
          <div className="modal-dialog" style={{ maxWidth: '560px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <TestTube2 size={18} color="var(--primary)" />
                <h2 className="modal-title">Author New Test Case</h2>
              </div>
              <button className="modal-close" onClick={() => setIsCreateTcOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateTestCaseSubmit} className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label className="form-label">Linked Engineering Task *</label>
                <select name="taskId" className="form-select" required defaultValue={projectTasks[0]?.taskId || ''}>
                  {projectTasks.map((t) => (
                    <option key={t.taskId} value={t.taskId}>
                      TASK-00{t.taskId}: {t.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="form-label">Test Case Title *</label>
                <input
                  name="title"
                  type="text"
                  className="form-input"
                  placeholder="e.g. Verify user session expires upon token invalidation"
                  required
                />
              </div>

              <div>
                <label className="form-label">Test Type</label>
                <select name="testType" className="form-select" defaultValue="Functional">
                  <option value="Functional">Functional Testing</option>
                  <option value="Regression">Regression Suite</option>
                  <option value="Integration">API / Integration Testing</option>
                  <option value="Security">Security &amp; Authorization</option>
                  <option value="Performance">Performance &amp; Concurrency</option>
                </select>
              </div>

              <div>
                <label className="form-label">Test Steps / Procedure</label>
                <textarea
                  name="steps"
                  rows={4}
                  className="form-input"
                  placeholder="1. Send POST /api/auth/login with valid credentials&#10;2. Extract JWT token&#10;3. Invalidate session&#10;4. Verify subsequent request returns 401 Unauthorized"
                />
              </div>

              <div>
                <label className="form-label">Expected Result</label>
                <textarea
                  name="expectedResult"
                  rows={2}
                  className="form-input"
                  placeholder="System denies request with HTTP 401 and clears security context."
                />
              </div>

              <div className="modal-footer" style={{ marginTop: '10px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsCreateTcOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={actionLoading}>
                  {actionLoading ? 'Authoring...' : 'Create Test Case'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL: EDIT TEST CASE                                */}
      {/* ==================================================== */}
      {isEditTcOpen && currentTcToEdit && (
        <div className="modal-backdrop">
          <div className="modal-dialog" style={{ maxWidth: '560px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Edit3 size={18} color="var(--primary)" />
                <h2 className="modal-title">Edit Test Case TC-00{currentTcToEdit.testCaseId}</h2>
              </div>
              <button className="modal-close" onClick={() => setIsEditTcOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleEditTestCaseSubmit} className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label className="form-label">Test Case Title *</label>
                <input
                  name="title"
                  type="text"
                  className="form-input"
                  defaultValue={currentTcToEdit.title}
                  required
                />
              </div>

              <div>
                <label className="form-label">Test Type</label>
                <select name="testType" className="form-select" defaultValue={currentTcToEdit.testType || 'Functional'}>
                  <option value="Functional">Functional Testing</option>
                  <option value="Regression">Regression Suite</option>
                  <option value="Integration">API / Integration Testing</option>
                  <option value="Security">Security &amp; Authorization</option>
                  <option value="Performance">Performance &amp; Concurrency</option>
                </select>
              </div>

              <div>
                <label className="form-label">Test Steps / Procedure</label>
                <textarea
                  name="steps"
                  rows={4}
                  className="form-input"
                  defaultValue={currentTcToEdit.steps || ''}
                />
              </div>

              <div>
                <label className="form-label">Expected Result</label>
                <textarea
                  name="expectedResult"
                  rows={2}
                  className="form-input"
                  defaultValue={currentTcToEdit.expectedResult || ''}
                />
              </div>

              <div className="modal-footer" style={{ marginTop: '10px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsEditTcOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={actionLoading}>
                  {actionLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL: DETAILED EXECUTION NOTES                      */}
      {/* ==================================================== */}
      {isExecuteTcOpen && currentTcToExecute && (
        <div className="modal-backdrop">
          <div className="modal-dialog" style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Play size={18} color="var(--primary)" />
                <h2 className="modal-title">Record Test Execution: TC-00{currentTcToExecute.testCaseId}</h2>
              </div>
              <button className="modal-close" onClick={() => setIsExecuteTcOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleDetailedExecutionSubmit} className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label className="form-label">Execution Verdict *</label>
                <select
                  className="form-select"
                  value={executionForm.status}
                  onChange={(e) => setExecutionForm({ ...executionForm, status: e.target.value })}
                  required
                >
                  <option value="Passed">🟢 Passed (Meets all acceptance criteria)</option>
                  <option value="Failed">🔴 Failed (Defect observed)</option>
                  <option value="Blocked">🟡 Blocked (Dependent blocker preventing test)</option>
                  <option value="Draft">⚪ Reset to Draft/Pending</option>
                </select>
              </div>

              <div>
                <label className="form-label">Execution Notes / Log Details</label>
                <textarea
                  rows={4}
                  className="form-input"
                  placeholder="Record reproduction steps, console errors, or validation details..."
                  value={executionForm.notes}
                  onChange={(e) => setExecutionForm({ ...executionForm, notes: e.target.value })}
                />
              </div>

              <div className="modal-footer" style={{ marginTop: '10px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsExecuteTcOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={actionLoading}>
                  {actionLoading ? 'Recording...' : 'Submit Execution'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL: CREATE DEFECT / REPORT ISSUE                  */}
      {/* ==================================================== */}
      {isCreateIssueOpen && (
        <div className="modal-backdrop">
          <div className="modal-dialog" style={{ maxWidth: '580px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Bug size={18} color="#ef4444" />
                <h2 className="modal-title">Report Engineering Defect</h2>
              </div>
              <button className="modal-close" onClick={() => setIsCreateIssueOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateIssueSubmit} className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label className="form-label">Linked Engineering Task *</label>
                <select
                  className="form-select"
                  value={issueForm.taskId}
                  onChange={(e) => setIssueForm({ ...issueForm, taskId: e.target.value })}
                  required
                >
                  <option value="">Select Task...</option>
                  {projectTasks.map((t) => (
                    <option key={t.taskId} value={t.taskId}>
                      TASK-00{t.taskId}: {t.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="form-label">Defect Title *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. NullPointerException on empty payload in payment handler"
                  value={issueForm.title}
                  onChange={(e) => setIssueForm({ ...issueForm, title: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label className="form-label">Severity</label>
                  <select
                    className="form-select"
                    value={issueForm.severity}
                    onChange={(e) => setIssueForm({ ...issueForm, severity: e.target.value })}
                  >
                    <option value="Critical">🔴 Critical (Blocker / Crash)</option>
                    <option value="High">🟠 High (Major function broken)</option>
                    <option value="Medium">🟡 Medium (Normal flaw)</option>
                    <option value="Low">🔵 Low (Minor UI / Cosmetic)</option>
                  </select>
                </div>

                <div>
                  <label className="form-label">Assign To (Pod Engineer)</label>
                  <select
                    className="form-select"
                    value={issueForm.assignedToUserId}
                    onChange={(e) => setIssueForm({ ...issueForm, assignedToUserId: e.target.value })}
                  >
                    <option value="">Unassigned</option>
                    {podMembers.map((m) => (
                      <option key={m.userId} value={m.userId}>
                        {m.fullName} ({m.role})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="form-label">Reproduction Steps &amp; Technical Behavior</label>
                <textarea
                  rows={5}
                  className="form-input"
                  placeholder="Describe step-by-step reproduction, stack traces, and observed vs. expected behavior..."
                  value={issueForm.description}
                  onChange={(e) => setIssueForm({ ...issueForm, description: e.target.value })}
                />
              </div>

              <div className="modal-footer" style={{ marginTop: '10px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsCreateIssueOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={actionLoading}>
                  {actionLoading ? 'Filing Defect...' : 'Submit Defect'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL: ISSUE DETAIL INSPECTOR                        */}
      {/* ==================================================== */}
      {isIssueDetailOpen && selectedIssueDetail && (
        <div className="modal-backdrop">
          <div className="modal-dialog" style={{ maxWidth: '640px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Bug size={18} color="#ef4444" />
                <h2 className="modal-title">Defect #{selectedIssueDetail.issueId} Details</h2>
              </div>
              <button className="modal-close" onClick={() => setIsIssueDetailOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {getSeverityBadge(selectedIssueDetail.severity)}
                  {getIssueStatusBadge(selectedIssueDetail.status)}
                </div>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Reported: {new Date(selectedIssueDetail.createdAt).toLocaleString()}
                </span>
              </div>

              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>
                  {selectedIssueDetail.title}
                </h3>
                {selectedIssueDetail.taskTitle && (
                  <span style={{ fontSize: '0.78rem', color: 'var(--primary)', marginTop: '4px', display: 'block' }}>
                    Linked Task: {selectedIssueDetail.taskTitle}
                  </span>
                )}
              </div>

              <div style={{ backgroundColor: 'rgba(0,0,0,0.5)', padding: '14px', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
                  Technical Description &amp; Reproduction:
                </span>
                <div style={{ marginTop: '6px', fontSize: '0.82rem', whiteSpace: 'pre-wrap', lineHeight: '1.55', color: 'var(--text-primary)' }}>
                  {selectedIssueDetail.description || 'No description provided.'}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '0.8rem' }}>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block' }}>Reported By:</span>
                  <span style={{ color: 'var(--text-primary)', fontWeight: '600' }}>
                    {selectedIssueDetail.reportedByName || 'Anonymous User'}
                  </span>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block' }}>Assignee:</span>
                  <span style={{ color: 'var(--text-primary)', fontWeight: '600' }}>
                    {selectedIssueDetail.assignedToName || 'Unassigned'}
                  </span>
                </div>
              </div>

              {/* Status Transition Quick Bar */}
              {canUpdateIssues && (
                <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '14px' }}>
                  <span style={{ fontSize: '0.74rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>
                    Transition Lifecycle Status:
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    {['Open', 'In Progress', 'Resolved', 'Closed'].map((st) => (
                      <button
                        key={st}
                        className="btn btn-secondary btn-sm"
                        style={{
                          fontSize: '0.74rem',
                          backgroundColor: selectedIssueDetail.status === st ? 'var(--primary)' : undefined,
                          color: selectedIssueDetail.status === st ? '#000' : undefined,
                          fontWeight: selectedIssueDetail.status === st ? '700' : undefined,
                        }}
                        onClick={async () => {
                          await handleQuickStatusChange(selectedIssueDetail.issueId, st);
                          setSelectedIssueDetail({ ...selectedIssueDetail, status: st });
                        }}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setIsIssueDetailOpen(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QualityAssurance;
