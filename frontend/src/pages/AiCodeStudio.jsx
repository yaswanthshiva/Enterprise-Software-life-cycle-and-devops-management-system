import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { projectApi } from '../api/projectApi';
import { sprintApi } from '../api/sprintApi';
import { taskApi } from '../api/taskApi';
import { aiCodeApi } from '../api/aiCodeApi';
import {
  Code2,
  Cpu,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Clock,
  Copy,
  Check,
  Download,
  Terminal,
  Layers,
  Zap,
  Kanban,
  FileCode2,
  History,
  RefreshCw,
  Search,
  ArrowRight,
  ShieldAlert,
  TestTube2,
  Wrench,
  ChevronRight,
  FolderKanban,
  Bookmark
} from 'lucide-react';

export const AiCodeStudio = () => {
  const { user, isAdmin, isProjectManager, isDeveloper, isTester, isDevOps, isBusinessAnalyst } = useAuth();

  // Role permissions per mode
  const canGenerate = isAdmin || isProjectManager || isDeveloper;
  const canReview = isAdmin || isProjectManager || isDeveloper || isTester || isDevOps;
  const canUnitTests = isAdmin || isProjectManager || isDeveloper || isTester;
  const canRefactor = isAdmin || isProjectManager || isDeveloper;

  const [searchParams, setSearchParams] = useSearchParams();
  const urlProjectId = searchParams.get('projectId');
  const urlSprintId = searchParams.get('sprintId');
  const urlTaskId = searchParams.get('taskId');

  // Scope State
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState(urlProjectId || '');
  const [sprints, setSprints] = useState([]);
  const [selectedSprintId, setSelectedSprintId] = useState(urlSprintId || '');
  const [tasks, setTasks] = useState([]);
  const [selectedTaskId, setSelectedTaskId] = useState(urlTaskId || '');
  const [selectedTaskData, setSelectedTaskData] = useState(null);

  // Loaders
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [loadingSprints, setLoadingSprints] = useState(false);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Active AI Engine Mode: 'GENERATE', 'REVIEW', 'UNIT_TESTS', 'REFACTOR'
  const [aiMode, setAiMode] = useState('GENERATE');

  // 1. Generation Parameters
  const [genLanguage, setGenLanguage] = useState('Java');
  const [genFramework, setGenFramework] = useState('Spring Boot 3.3 / JPA');
  const [genRequirements, setGenRequirements] = useState('');
  const [genIncludeComments, setGenIncludeComments] = useState(true);

  // 2. Review Parameters
  const [reviewCodeSnippet, setReviewCodeSnippet] = useState('');
  const [reviewLanguage, setReviewLanguage] = useState('Java');
  const [reviewFocus, setReviewFocus] = useState('OWASP Security & Vulnerabilities');

  // 3. Unit Test Parameters
  const [testFramework, setTestFramework] = useState('JUnit 5 + Mockito');
  const [testSourceCode, setTestSourceCode] = useState('');
  const [testIncludeEdgeCases, setTestIncludeEdgeCases] = useState(true);

  // 4. Refactoring Parameters
  const [refactorCodeSnippet, setRefactorCodeSnippet] = useState('');
  const [refactorLanguage, setRefactorLanguage] = useState('Java');
  const [refactorGoal, setRefactorGoal] = useState('SOLID Principles & Clean Code');

  // Output and History State
  const [activeSuggestion, setActiveSuggestion] = useState(null);
  const [historySuggestions, setHistorySuggestions] = useState([]);
  const [isHistoryDrawerOpen, setIsHistoryDrawerOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // 1. Fetch Projects
  useEffect(() => {
    const fetchProjects = async () => {
      setLoadingProjects(true);
      try {
        const res = await projectApi.getAllProjects();
        if (res && res.data) {
          setProjects(res.data);
          if (!selectedProjectId && res.data.length > 0) {
            const defaultProj = urlProjectId || String(res.data[0].projectId);
            setSelectedProjectId(defaultProj);
          }
        }
      } catch (err) {
        console.error('Failed to load projects:', err);
        setError('Unable to load project portfolio list.');
      } finally {
        setLoadingProjects(false);
      }
    };
    fetchProjects();
  }, []);

  // 2. Fetch Sprints when Project changes
  useEffect(() => {
    const fetchSprints = async () => {
      if (!selectedProjectId) {
        setSprints([]);
        setSelectedSprintId('');
        return;
      }
      setLoadingSprints(true);
      try {
        const res = await sprintApi.getSprintsByProject(selectedProjectId);
        if (res && res.data) {
          setSprints(res.data);
          let sprintToPick = '';
          if (urlSprintId && res.data.some((s) => String(s.sprintId) === String(urlSprintId))) {
            sprintToPick = String(urlSprintId);
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
        console.error('Failed to load sprints for project:', err);
      } finally {
        setLoadingSprints(false);
      }
    };
    fetchSprints();
  }, [selectedProjectId]);

  // 3. Fetch Tasks when Sprint changes
  useEffect(() => {
    const fetchTasks = async () => {
      if (!selectedSprintId) {
        setTasks([]);
        setSelectedTaskId('');
        setSelectedTaskData(null);
        return;
      }
      setLoadingTasks(true);
      try {
        const res = await taskApi.getTasksBySprint(selectedSprintId);
        if (res && res.data) {
          setTasks(res.data);
          let taskToPick = '';
          if (urlTaskId && res.data.some((t) => String(t.taskId) === String(urlTaskId))) {
            taskToPick = String(urlTaskId);
          } else if (res.data.length > 0) {
            taskToPick = String(res.data[0].taskId);
          }
          setSelectedTaskId(taskToPick);
        }
      } catch (err) {
        console.error('Failed to load sprint tasks:', err);
      } finally {
        setLoadingTasks(false);
      }
    };
    fetchTasks();
  }, [selectedSprintId]);

  // 4. Fetch Task Detail & Suggestions History when Task changes
  useEffect(() => {
    const fetchTaskDetailAndHistory = async () => {
      if (!selectedTaskId) {
        setSelectedTaskData(null);
        setHistorySuggestions([]);
        setActiveSuggestion(null);
        return;
      }

      // Update URL params
      setSearchParams({
        projectId: selectedProjectId,
        sprintId: selectedSprintId,
        taskId: selectedTaskId,
      });

      // Set task data from list or fetch
      const found = tasks.find((t) => String(t.taskId) === String(selectedTaskId));
      if (found) {
        setSelectedTaskData(found);
      } else {
        try {
          const tRes = await taskApi.getTaskById(selectedTaskId);
          if (tRes && tRes.data) {
            setSelectedTaskData(tRes.data);
          }
        } catch (err) {
          console.error('Failed to fetch task detail:', err);
        }
      }

      // Fetch suggestion history
      setLoadingHistory(true);
      try {
        const histRes = await aiCodeApi.getSuggestionsByTask(selectedTaskId);
        if (histRes && histRes.data) {
          setHistorySuggestions(histRes.data);
          if (histRes.data.length > 0) {
            setActiveSuggestion(histRes.data[0]);
          } else {
            setActiveSuggestion(null);
          }
        }
      } catch (err) {
        console.error('Failed to load task AI history:', err);
      } finally {
        setLoadingHistory(false);
      }
    };

    if (selectedTaskId) {
      fetchTaskDetailAndHistory();
    }
  }, [selectedTaskId]);

  // Adjust default AI mode if user lacks clearance
  useEffect(() => {
    if (aiMode === 'GENERATE' && !canGenerate) {
      if (canReview) setAiMode('REVIEW');
      else if (canUnitTests) setAiMode('UNIT_TESTS');
    }
  }, [canGenerate, canReview, canUnitTests]);

  // Execution Handlers for Quad Engines
  const handleExecuteEngine = async (e) => {
    e.preventDefault();
    if (!selectedTaskId) {
      setError('Please select a target engineering task from the scope selector above.');
      return;
    }

    setError('');
    setIsGenerating(true);

    try {
      let res;
      if (aiMode === 'GENERATE') {
        res = await aiCodeApi.generateTaskCode(selectedTaskId, {
          language: genLanguage,
          framework: genFramework,
          specificRequirements: genRequirements.trim() || undefined,
          includeComments: genIncludeComments,
        });
      } else if (aiMode === 'REVIEW') {
        if (!reviewCodeSnippet.trim()) {
          setError('Please provide or paste source code to audit.');
          setIsGenerating(false);
          return;
        }
        res = await aiCodeApi.reviewCode(selectedTaskId, {
          sourceCode: reviewCodeSnippet.trim(),
          language: reviewLanguage,
          reviewFocus,
        });
      } else if (aiMode === 'UNIT_TESTS') {
        res = await aiCodeApi.generateUnitTests(selectedTaskId, {
          testingFramework: testFramework,
          sourceCode: testSourceCode.trim() || undefined,
          includeEdgeCases: testIncludeEdgeCases,
        });
      } else if (aiMode === 'REFACTOR') {
        if (!refactorCodeSnippet.trim()) {
          setError('Please provide source code to refactor.');
          setIsGenerating(false);
          return;
        }
        res = await aiCodeApi.refactorCode(selectedTaskId, {
          sourceCode: refactorCodeSnippet.trim(),
          language: refactorLanguage,
          refactorGoal,
        });
      }

      if (res && res.data) {
        setActiveSuggestion(res.data);
        setHistorySuggestions((prev) => [res.data, ...prev]);
        setSuccessMsg(`AI ${aiMode.replace('_', ' ')} synthesis completed successfully!`);
        setTimeout(() => setSuccessMsg(''), 4000);
      }
    } catch (err) {
      console.error(`AI ${aiMode} execution failed:`, err);
      let msg = err.response?.data?.message || err.message || 'AI synthesis execution failed.';
      if (err.response?.data?.errors && Array.isArray(err.response.data.errors)) {
        msg = err.response.data.errors.join(' | ');
      }
      setError(msg);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyCode = () => {
    if (!activeSuggestion?.content) return;
    navigator.clipboard.writeText(activeSuggestion.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadCode = () => {
    if (!activeSuggestion?.content) return;
    const lang = (activeSuggestion.promptContext || '').toLowerCase();
    let ext = 'txt';
    if (lang.includes('java')) ext = 'java';
    else if (lang.includes('typescript') || lang.includes('react')) ext = 'tsx';
    else if (lang.includes('python')) ext = 'py';
    else if (lang.includes('sql')) ext = 'sql';
    else if (lang.includes('go')) ext = 'go';

    const blob = new Blob([activeSuggestion.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `TASK-00${selectedTaskId}-${activeSuggestion.suggestionType?.replace(/\s+/g, '_') || 'code'}.${ext}`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '60px' }}>
      {/* Studio Header */}
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
            <Code2 size={24} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{ fontSize: '1.6rem', margin: 0, letterSpacing: '-0.02em' }}>
                AI Code Intelligence Studio
              </h1>
              <span className="badge badge-primary">Module 07</span>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', margin: '4px 0 0 0' }}>
              Autonomous Gemini AI production code synthesis, security auditing, JUnit test suites, and refactoring
            </p>
          </div>
        </div>

        {/* Header Right Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            className="btn btn-secondary"
            onClick={() => setIsHistoryDrawerOpen(!isHistoryDrawerOpen)}
            disabled={!selectedTaskId}
          >
            <History size={16} />
            AI Audit Log ({historySuggestions.length})
          </button>

          {selectedTaskId && (
            <Link
              to={`/workspace/sprints?projectId=${selectedProjectId}&sprintId=${selectedSprintId}`}
              className="btn btn-secondary"
            >
              <Kanban size={15} />
              Sprint Kanban
            </Link>
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

      {/* Tri-Scope Hierarchy Selector (Project -> Sprint -> Task) */}
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: '1 1 240px' }}>
          <label className="form-label" style={{ margin: 0, whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <FolderKanban size={15} color="var(--primary)" />
            Project:
          </label>
          <select
            className="form-select"
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            disabled={loadingProjects}
            style={{ flex: 1 }}
          >
            {projects.map((p) => (
              <option key={p.projectId} value={p.projectId}>
                {p.name} ({p.projectKey || `PRJ-${p.projectId}`})
              </option>
            ))}
          </select>
        </div>

        {/* Sprint Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: '1 1 240px' }}>
          <label className="form-label" style={{ margin: 0, whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Layers size={15} color="var(--primary)" />
            Sprint:
          </label>
          <select
            className="form-select"
            value={selectedSprintId}
            onChange={(e) => setSelectedSprintId(e.target.value)}
            disabled={loadingSprints || sprints.length === 0}
            style={{ flex: 1 }}
          >
            {sprints.length === 0 ? (
              <option value="">No Sprints Available</option>
            ) : (
              sprints.map((s) => (
                <option key={s.sprintId} value={s.sprintId}>
                  {s.sprintName} ({s.status})
                </option>
              ))
            )}
          </select>
        </div>

        {/* Task Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: '1 1 320px' }}>
          <label className="form-label" style={{ margin: 0, whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Zap size={15} color="var(--primary)" />
            Target Task:
          </label>
          <select
            className="form-select"
            value={selectedTaskId}
            onChange={(e) => setSelectedTaskId(e.target.value)}
            disabled={loadingTasks || tasks.length === 0}
            style={{ flex: 1 }}
          >
            {tasks.length === 0 ? (
              <option value="">No Tasks in this Sprint</option>
            ) : (
              tasks.map((t) => (
                <option key={t.taskId} value={t.taskId}>
                  TASK-00{t.taskId}: {t.title} [{t.status}]
                </option>
              ))
            )}
          </select>
        </div>
      </div>

      {/* Target Task Specification Banner */}
      {selectedTaskData && (
        <div className="glass-card" style={{
          padding: '16px 20px',
          marginBottom: '20px',
          borderLeft: '4px solid var(--primary)',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
              <span style={{ fontFamily: 'monospace', fontSize: '0.85rem', color: 'var(--primary)', fontWeight: '700' }}>
                TASK-00{selectedTaskData.taskId}
              </span>
              <span className="badge" style={{ backgroundColor: 'rgba(255, 107, 0, 0.15)', color: 'var(--primary)', border: '1px solid rgba(255, 107, 0, 0.3)' }}>
                {selectedTaskData.priority || 'Medium'} Priority
              </span>
              <span className="badge" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-secondary)' }}>
                Column: {selectedTaskData.status || 'To Do'}
              </span>
              {selectedTaskData.assignedToName && (
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  👤 Assigned: <strong>{selectedTaskData.assignedToName}</strong>
                </span>
              )}
            </div>

            <h3 style={{ margin: '0 0 6px 0', fontSize: '1.2rem', color: 'var(--text-primary)' }}>
              {selectedTaskData.title}
            </h3>

            {selectedTaskData.description && (
              <p style={{ margin: '0 0 8px 0', color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: '1.5' }}>
                {selectedTaskData.description}
              </p>
            )}

            {selectedTaskData.storyTitle && (
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: 'var(--primary)', backgroundColor: 'rgba(255, 107, 0, 0.08)', padding: '3px 8px', borderRadius: 'var(--radius-xs)' }}>
                <Bookmark size={13} />
                <span>Parent Story: {selectedTaskData.storyId ? `US-00${selectedTaskData.storyId}: ` : ''}{selectedTaskData.storyTitle}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Studio Grid: Left Control Panel + Right Code Console */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(340px, 420px) 1fr',
        gap: '20px',
        alignItems: 'start',
      }}>
        {/* LEFT PANE: Quad Engine Configuration */}
        <div className="glass-card" style={{ padding: '22px' }}>
          {/* Mode Switcher Tabs */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '8px',
            marginBottom: '20px',
          }}>
            {/* Mode 1: Code Generation */}
            <button
              type="button"
              onClick={() => setAiMode('GENERATE')}
              disabled={!canGenerate}
              style={{
                padding: '10px 8px',
                borderRadius: 'var(--radius-xs)',
                border: aiMode === 'GENERATE' ? '1px solid var(--primary)' : '1px solid var(--border-subtle)',
                backgroundColor: aiMode === 'GENERATE' ? 'rgba(255, 107, 0, 0.12)' : 'rgba(255, 255, 255, 0.02)',
                color: aiMode === 'GENERATE' ? 'var(--primary)' : canGenerate ? 'var(--text-secondary)' : 'var(--text-muted)',
                cursor: canGenerate ? 'pointer' : 'not-allowed',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px',
                fontSize: '0.78rem',
                fontWeight: '600',
                transition: 'all 0.15s ease',
              }}
            >
              <FileCode2 size={18} />
              <span>Synthesize Code</span>
            </button>

            {/* Mode 2: Code Review */}
            <button
              type="button"
              onClick={() => setAiMode('REVIEW')}
              disabled={!canReview}
              style={{
                padding: '10px 8px',
                borderRadius: 'var(--radius-xs)',
                border: aiMode === 'REVIEW' ? '1px solid var(--primary)' : '1px solid var(--border-subtle)',
                backgroundColor: aiMode === 'REVIEW' ? 'rgba(255, 107, 0, 0.12)' : 'rgba(255, 255, 255, 0.02)',
                color: aiMode === 'REVIEW' ? 'var(--primary)' : canReview ? 'var(--text-secondary)' : 'var(--text-muted)',
                cursor: canReview ? 'pointer' : 'not-allowed',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px',
                fontSize: '0.78rem',
                fontWeight: '600',
                transition: 'all 0.15s ease',
              }}
            >
              <ShieldCheck size={18} />
              <span>AI Code Review</span>
            </button>

            {/* Mode 3: Unit Tests */}
            <button
              type="button"
              onClick={() => setAiMode('UNIT_TESTS')}
              disabled={!canUnitTests}
              style={{
                padding: '10px 8px',
                borderRadius: 'var(--radius-xs)',
                border: aiMode === 'UNIT_TESTS' ? '1px solid var(--primary)' : '1px solid var(--border-subtle)',
                backgroundColor: aiMode === 'UNIT_TESTS' ? 'rgba(255, 107, 0, 0.12)' : 'rgba(255, 255, 255, 0.02)',
                color: aiMode === 'UNIT_TESTS' ? 'var(--primary)' : canUnitTests ? 'var(--text-secondary)' : 'var(--text-muted)',
                cursor: canUnitTests ? 'pointer' : 'not-allowed',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px',
                fontSize: '0.78rem',
                fontWeight: '600',
                transition: 'all 0.15s ease',
              }}
            >
              <TestTube2 size={18} />
              <span>Unit Tests</span>
            </button>

            {/* Mode 4: Refactor */}
            <button
              type="button"
              onClick={() => setAiMode('REFACTOR')}
              disabled={!canRefactor}
              style={{
                padding: '10px 8px',
                borderRadius: 'var(--radius-xs)',
                border: aiMode === 'REFACTOR' ? '1px solid var(--primary)' : '1px solid var(--border-subtle)',
                backgroundColor: aiMode === 'REFACTOR' ? 'rgba(255, 107, 0, 0.12)' : 'rgba(255, 255, 255, 0.02)',
                color: aiMode === 'REFACTOR' ? 'var(--primary)' : canRefactor ? 'var(--text-secondary)' : 'var(--text-muted)',
                cursor: canRefactor ? 'pointer' : 'not-allowed',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px',
                fontSize: '0.78rem',
                fontWeight: '600',
                transition: 'all 0.15s ease',
              }}
            >
              <Wrench size={18} />
              <span>Refactor Code</span>
            </button>
          </div>

          {/* ENGINE FORM 1: SYNTHESIZE CODE */}
          {aiMode === 'GENERATE' && (
            <form onSubmit={handleExecuteEngine} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label className="form-label">Programming Language</label>
                <select
                  className="form-select"
                  value={genLanguage}
                  onChange={(e) => setGenLanguage(e.target.value)}
                  disabled={isGenerating}
                >
                  <option value="Java">Java (JDK 17 / 21)</option>
                  <option value="TypeScript">TypeScript (Node / React)</option>
                  <option value="Python">Python 3.11+</option>
                  <option value="Go">Go (Golang)</option>
                  <option value="SQL">PostgreSQL / SQL</option>
                </select>
              </div>

              <div>
                <label className="form-label">Architecture Framework / Library</label>
                <select
                  className="form-select"
                  value={genFramework}
                  onChange={(e) => setGenFramework(e.target.value)}
                  disabled={isGenerating}
                >
                  <option value="Spring Boot 3.3 / JPA">Spring Boot 3.3 / JPA & Hibernate</option>
                  <option value="React 19 / Vite">React 19 / Vite & Vanilla CSS</option>
                  <option value="Node.js / Express">Node.js / Express REST API</option>
                  <option value="FastAPI / Pydantic">FastAPI / Pydantic</option>
                  <option value="Next.js App Router">Next.js App Router</option>
                </select>
              </div>

              <div>
                <label className="form-label">Specific Technical Constraints / Classes</label>
                <textarea
                  className="form-input"
                  rows={3}
                  placeholder="e.g. Include validation annotations, handle resource not found exceptions, use builder pattern..."
                  value={genRequirements}
                  onChange={(e) => setGenRequirements(e.target.value)}
                  disabled={isGenerating}
                  style={{ resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  id="includeComments"
                  checked={genIncludeComments}
                  onChange={(e) => setGenIncludeComments(e.target.checked)}
                  disabled={isGenerating}
                />
                <label htmlFor="includeComments" style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                  Include structured Javadoc / inline explanatory comments
                </label>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={isGenerating || !selectedTaskId}
                style={{ marginTop: '10px' }}
              >
                <Sparkles size={16} />
                {isGenerating ? 'Synthesizing with Gemini...' : 'Synthesize Production Code'}
              </button>
            </form>
          )}

          {/* ENGINE FORM 2: AI CODE REVIEW */}
          {aiMode === 'REVIEW' && (
            <form onSubmit={handleExecuteEngine} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label className="form-label">Review Focus & Audit Scope</label>
                <select
                  className="form-select"
                  value={reviewFocus}
                  onChange={(e) => setReviewFocus(e.target.value)}
                  disabled={isGenerating}
                >
                  <option value="OWASP Security & Vulnerabilities">OWASP Security & Vulnerabilities (SQLi, Auth, Secrets)</option>
                  <option value="Performance & Time Complexity">Performance & Time Complexity (O(N) Optimization)</option>
                  <option value="Clean Code & SOLID Principles">Clean Code & SOLID Principles (Maintainability)</option>
                  <option value="Memory Leaks & Resource Cleanup">Memory Leaks & Resource Cleanup (Streams, DB Pools)</option>
                </select>
              </div>

              <div>
                <label className="form-label">Language</label>
                <select
                  className="form-select"
                  value={reviewLanguage}
                  onChange={(e) => setReviewLanguage(e.target.value)}
                  disabled={isGenerating}
                >
                  <option value="Java">Java</option>
                  <option value="JavaScript / TypeScript">JavaScript / TypeScript</option>
                  <option value="Python">Python</option>
                  <option value="Go">Go</option>
                  <option value="SQL">SQL</option>
                </select>
              </div>

              <div>
                <label className="form-label">Source Code to Audit *</label>
                <textarea
                  className="form-input"
                  rows={8}
                  placeholder="Paste class, controller, function, or pull request diff here..."
                  value={reviewCodeSnippet}
                  onChange={(e) => setReviewCodeSnippet(e.target.value)}
                  disabled={isGenerating}
                  style={{
                    fontFamily: 'monospace',
                    fontSize: '0.82rem',
                    lineHeight: '1.45',
                    resize: 'vertical',
                  }}
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={isGenerating || !selectedTaskId || !reviewCodeSnippet.trim()}
                style={{ marginTop: '10px' }}
              >
                <ShieldCheck size={16} />
                {isGenerating ? 'Auditing Codebase...' : 'Execute Security & Quality Audit'}
              </button>
            </form>
          )}

          {/* ENGINE FORM 3: UNIT TEST GENERATOR */}
          {aiMode === 'UNIT_TESTS' && (
            <form onSubmit={handleExecuteEngine} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label className="form-label">Testing Framework & Assertion Library</label>
                <select
                  className="form-select"
                  value={testFramework}
                  onChange={(e) => setTestFramework(e.target.value)}
                  disabled={isGenerating}
                >
                  <option value="JUnit 5 + Mockito">JUnit 5 + Mockito & AssertJ</option>
                  <option value="Jest + React Testing Library">Jest + React Testing Library</option>
                  <option value="PyTest">PyTest & unittest.mock</option>
                  <option value="Go Test">Go standard testing & testify</option>
                </select>
              </div>

              <div>
                <label className="form-label">Reference Implementation Code (Optional)</label>
                <textarea
                  className="form-input"
                  rows={6}
                  placeholder="Paste class or method to test (or leave empty to generate tests based on task requirements)..."
                  value={testSourceCode}
                  onChange={(e) => setTestSourceCode(e.target.value)}
                  disabled={isGenerating}
                  style={{
                    fontFamily: 'monospace',
                    fontSize: '0.82rem',
                    lineHeight: '1.45',
                    resize: 'vertical',
                  }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  id="includeEdgeCases"
                  checked={testIncludeEdgeCases}
                  onChange={(e) => setTestIncludeEdgeCases(e.target.checked)}
                  disabled={isGenerating}
                />
                <label htmlFor="includeEdgeCases" style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                  Include boundary checks, null pointer tests, and negative exception cases
                </label>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={isGenerating || !selectedTaskId}
                style={{ marginTop: '10px' }}
              >
                <TestTube2 size={16} />
                {isGenerating ? 'Generating Unit Tests...' : 'Synthesize Unit Test Suite'}
              </button>
            </form>
          )}

          {/* ENGINE FORM 4: INTELLIGENT REFACTORING */}
          {aiMode === 'REFACTOR' && (
            <form onSubmit={handleExecuteEngine} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label className="form-label">Target Refactoring Objective</label>
                <select
                  className="form-select"
                  value={refactorGoal}
                  onChange={(e) => setRefactorGoal(e.target.value)}
                  disabled={isGenerating}
                >
                  <option value="SOLID Principles & Clean Code">SOLID Principles &amp; Clean Architecture</option>
                  <option value="Performance & Complexity Optimization">Performance Optimization (O(N&sup2;) to O(N))</option>
                  <option value="Async & Reactive Concurrency">Async & Non-blocking Concurrency</option>
                  <option value="Modern Design Patterns">Design Pattern Modernization (Factory, Strategy)</option>
                </select>
              </div>

              <div>
                <label className="form-label">Language</label>
                <select
                  className="form-select"
                  value={refactorLanguage}
                  onChange={(e) => setRefactorLanguage(e.target.value)}
                  disabled={isGenerating}
                >
                  <option value="Java">Java</option>
                  <option value="TypeScript">TypeScript</option>
                  <option value="Python">Python</option>
                  <option value="Go">Go</option>
                </select>
              </div>

              <div>
                <label className="form-label">Source Code to Refactor *</label>
                <textarea
                  className="form-input"
                  rows={8}
                  placeholder="Paste messy, legacy, or monolithic method to refactor..."
                  value={refactorCodeSnippet}
                  onChange={(e) => setRefactorCodeSnippet(e.target.value)}
                  disabled={isGenerating}
                  style={{
                    fontFamily: 'monospace',
                    fontSize: '0.82rem',
                    lineHeight: '1.45',
                    resize: 'vertical',
                  }}
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={isGenerating || !selectedTaskId || !refactorCodeSnippet.trim()}
                style={{ marginTop: '10px' }}
              >
                <Wrench size={16} />
                {isGenerating ? 'Refactoring Codebase...' : 'Execute Intelligent Refactoring'}
              </button>
            </form>
          )}
        </div>

        {/* RIGHT PANE: Interactive Code Console Workstation */}
        <div className="glass-card" style={{
          padding: 0,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          minHeight: '620px',
        }}>
          {/* Workstation Console Bar */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 18px',
            backgroundColor: 'rgba(0, 0, 0, 0.65)',
            borderBottom: '1px solid var(--border-subtle)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Terminal size={16} color="var(--primary)" />
              <span style={{ fontSize: '0.85rem', fontWeight: '700', letterSpacing: '0.02em', color: 'var(--text-primary)' }}>
                {activeSuggestion ? `${activeSuggestion.suggestionType || 'AI Output'} Console` : 'AI Output Console'}
              </span>
              {activeSuggestion?.modelName && (
                <span className="badge" style={{ fontSize: '0.68rem', backgroundColor: 'rgba(255, 107, 0, 0.1)', color: 'var(--primary)' }}>
                  {activeSuggestion.modelName}
                </span>
              )}
            </div>

            {/* Console Toolbar Actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {activeSuggestion?.content && (
                <>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={handleCopyCode}
                    style={{ fontSize: '0.78rem' }}
                  >
                    {copied ? <Check size={13} color="var(--success)" /> : <Copy size={13} />}
                    {copied ? 'Copied!' : 'Copy'}
                  </button>

                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={handleDownloadCode}
                    style={{ fontSize: '0.78rem' }}
                    title="Download snippet"
                  >
                    <Download size={13} />
                    Download
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Console Body */}
          <div style={{ flex: 1, padding: '20px', display: 'flex', flexDirection: 'column' }}>
            {isGenerating ? (
              /* Autonomous Radar Terminal Loader */
              <div style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '60px 20px',
                textAlign: 'center',
              }}>
                <div style={{
                  position: 'relative',
                  width: '84px',
                  height: '84px',
                  borderRadius: '50%',
                  border: '2px solid rgba(255, 107, 0, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '24px',
                }}>
                  <div style={{
                    position: 'absolute',
                    inset: '-8px',
                    borderRadius: '50%',
                    border: '2px solid var(--primary)',
                    animation: 'pulse 1.8s infinite',
                    opacity: 0.7,
                  }} />
                  <Cpu size={36} color="var(--primary)" className="spin" />
                </div>

                <h3 style={{ margin: '0 0 8px 0', fontSize: '1.2rem', color: 'var(--text-primary)' }}>
                  Gemini AI Code Intelligence Active
                </h3>
                <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.85rem', maxWidth: '440px' }}>
                  Decomposing technical requirements, scanning security vectors, and synthesizing production-ready code...
                </p>
                <div style={{ marginTop: '16px', fontFamily: 'monospace', fontSize: '0.78rem', color: 'var(--primary)' }}>
                  $ executing neuroforge-ai-core --mode={aiMode.toLowerCase()}
                </div>
              </div>
            ) : activeSuggestion?.content ? (
              /* Code / Review Output Display */
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <pre style={{
                  flex: 1,
                  margin: 0,
                  padding: '16px',
                  backgroundColor: 'rgba(0, 0, 0, 0.45)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-xs)',
                  color: '#e2e8f0',
                  fontFamily: '"JetBrains Mono", Menlo, Monaco, Consolas, monospace',
                  fontSize: '0.82rem',
                  lineHeight: '1.55',
                  overflowX: 'auto',
                  whiteSpace: 'pre-wrap',
                }}>
                  {activeSuggestion.content}
                </pre>
              </div>
            ) : (
              /* Empty Standby State */
              <div style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '60px 20px',
                textAlign: 'center',
                color: 'var(--text-muted)',
              }}>
                <Code2 size={48} style={{ marginBottom: '16px', color: 'var(--text-muted)' }} />
                <h3 style={{ margin: '0 0 8px 0', color: 'var(--text-primary)' }}>
                  Code Intelligence Console Standby
                </h3>
                <p style={{ margin: '0 auto 16px auto', maxWidth: '460px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Select a synthesis mode on the left to write production code, audit for OWASP vulnerabilities, generate automated JUnit 5 test suites, or refactor legacy snippets.
                </p>
                <span className="badge" style={{ backgroundColor: 'rgba(255, 255, 255, 0.04)', color: 'var(--text-muted)' }}>
                  Powered by Google Gemini Generative AI
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Slide-out Suggestion History Drawer */}
      {isHistoryDrawerOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(4px)',
          zIndex: 120,
          display: 'flex',
          justifyContent: 'flex-end',
        }}>
          <div className="glass-card animate-fade-in" style={{
            width: '100%',
            maxWidth: '520px',
            height: '100%',
            borderRadius: 0,
            borderLeft: '1px solid var(--border-light)',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
          }}>
            {/* Drawer Header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingBottom: '16px',
              borderBottom: '1px solid var(--border-subtle)',
              marginBottom: '16px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <History size={18} color="var(--primary)" />
                <h3 style={{ margin: 0, fontSize: '1.15rem' }}>AI Code Suggestions Log</h3>
              </div>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setIsHistoryDrawerOpen(false)}
              >
                Close
              </button>
            </div>

            {/* Drawer List */}
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {loadingHistory ? (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
                  <RefreshCw size={20} className="spin" style={{ color: 'var(--primary)', marginBottom: '8px' }} />
                  <div>Loading audit history...</div>
                </div>
              ) : historySuggestions.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  No previous AI code suggestions found for TASK-00{selectedTaskId}.
                </div>
              ) : (
                historySuggestions.map((sug) => {
                  const isSelected = activeSuggestion?.suggestionId === sug.suggestionId;
                  return (
                    <div
                      key={sug.suggestionId}
                      onClick={() => {
                        setActiveSuggestion(sug);
                        setIsHistoryDrawerOpen(false);
                      }}
                      style={{
                        padding: '12px 14px',
                        borderRadius: 'var(--radius-xs)',
                        backgroundColor: isSelected ? 'rgba(255, 107, 0, 0.08)' : 'rgba(255, 255, 255, 0.02)',
                        border: isSelected ? '1px solid var(--primary)' : '1px solid var(--border-subtle)',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <span style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--primary)' }}>
                          {sug.suggestionType}
                        </span>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                          {sug.generatedTime ? new Date(sug.generatedTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recent'}
                        </span>
                      </div>

                      <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '6px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {sug.promptContext || 'Context parameters'}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span className="badge" style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                          {sug.modelName || 'Gemini'}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                          Load Console <ChevronRight size={12} />
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AiCodeStudio;
