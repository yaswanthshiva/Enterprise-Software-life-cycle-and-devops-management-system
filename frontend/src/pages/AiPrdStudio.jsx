import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { projectApi } from '../api/projectApi';
import { requirementApi } from '../api/requirementApi';
import { aiApi } from '../api/aiApi';
import {
  Sparkles,
  Cpu,
  BookmarkPlus,
  ShieldAlert,
  CheckCircle2,
  AlertCircle,
  FileText,
  Layers,
  ArrowRight,
  RefreshCw,
  Clock,
  History,
  Check,
  X,
  Send,
  Database,
  Server,
  ShieldCheck,
  Zap,
  Terminal
} from 'lucide-react';

export const AiPrdStudio = () => {
  const { user, canManageRequirements } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const urlProjectId = searchParams.get('projectId');
  const urlRequirementId = searchParams.get('requirementId');

  // Navigation & Scope State
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState(urlProjectId || '');
  const [requirements, setRequirements] = useState([]);
  const [selectedRequirementId, setSelectedRequirementId] = useState(urlRequirementId || '');
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [loadingReqs, setLoadingReqs] = useState(false);

  // Active AI Mode: 'STORIES', 'IMPROVE', 'ARCHITECTURE'
  const [aiMode, setAiMode] = useState('STORIES');

  // Generation Inputs
  const [targetStoryCount, setTargetStoryCount] = useState(3);
  const [additionalContext, setAdditionalContext] = useState('');
  const [focusArea, setFocusArea] = useState('Enterprise Readiness & Security');
  const [targetAudience, setTargetAudience] = useState('Engineering Team');
  const [customInstructions, setCustomInstructions] = useState('');
  const [preferredDb, setPreferredDb] = useState('PostgreSQL / JPA');
  const [deploymentTarget, setDeploymentTarget] = useState('Docker / Kubernetes');
  const [securityLevel, setSecurityLevel] = useState('High (JWT + RBAC)');

  // AI Output & History
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeSuggestion, setActiveSuggestion] = useState(null);
  const [suggestionHistory, setSuggestionHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [reviewing, setReviewing] = useState(false);
  const [actionSuccess, setActionSuccess] = useState('');
  const [error, setError] = useState('');

  // 1. Fetch Projects
  const fetchProjects = async () => {
    setLoadingProjects(true);
    try {
      const res = await projectApi.getAllProjects();
      if (res && res.data) {
        setProjects(res.data);
        if (!selectedProjectId && res.data.length > 0) {
          const defaultProjId = urlProjectId || res.data[0].projectId;
          setSelectedProjectId(String(defaultProjId));
        }
      }
    } catch (err) {
      console.error('Failed to load projects:', err);
      setError('Unable to load project portfolios.');
    } finally {
      setLoadingProjects(false);
    }
  };

  // 2. Fetch Requirements for active project
  const fetchRequirements = async (projId) => {
    if (!projId) return;
    setLoadingReqs(true);
    try {
      const res = await requirementApi.getRequirementsByProject(projId);
      if (res && res.data) {
        setRequirements(res.data);
        if (res.data.length > 0) {
          const matched = res.data.find((r) => String(r.requirementId) === String(urlRequirementId));
          const reqIdToSelect = matched ? matched.requirementId : res.data[0].requirementId;
          setSelectedRequirementId(String(reqIdToSelect));
        } else {
          setSelectedRequirementId('');
          setActiveSuggestion(null);
          setSuggestionHistory([]);
        }
      }
    } catch (err) {
      console.error('Failed to load requirements:', err);
      setError('Failed to fetch requirements for selected project.');
    } finally {
      setLoadingReqs(false);
    }
  };

  // 3. Fetch Suggestions History for active requirement
  const fetchSuggestions = async (reqId) => {
    if (!reqId) return;
    setLoadingHistory(true);
    try {
      const res = await aiApi.getSuggestionsByRequirement(reqId);
      if (res && res.data) {
        setSuggestionHistory(res.data);
        if (res.data.length > 0) {
          setActiveSuggestion(res.data[0]);
        } else {
          setActiveSuggestion(null);
        }
      }
    } catch (err) {
      console.error('Failed to load AI suggestions:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    if (selectedProjectId) {
      fetchRequirements(selectedProjectId);
    }
  }, [selectedProjectId]);

  useEffect(() => {
    if (selectedRequirementId) {
      fetchSuggestions(selectedRequirementId);
      // Sync URL search params
      setSearchParams({
        projectId: selectedProjectId,
        requirementId: selectedRequirementId,
      });
    }
  }, [selectedRequirementId]);

  // Handle Project Change
  const handleProjectChange = (projId) => {
    setSelectedProjectId(projId);
    setSelectedRequirementId('');
    setActiveSuggestion(null);
    setSuggestionHistory([]);
  };

  // Handle AI Generation Execution
  const handleExecuteAiGeneration = async () => {
    if (!selectedRequirementId) {
      setError('Please select a target requirement to analyze.');
      return;
    }
    setError('');
    setActionSuccess('');
    setIsGenerating(true);

    try {
      let res;
      if (aiMode === 'STORIES') {
        res = await aiApi.generateUserStories(selectedRequirementId, {
          targetStoryCount: Number(targetStoryCount),
          additionalContext: additionalContext.trim(),
        });
      } else if (aiMode === 'IMPROVE') {
        res = await aiApi.improveRequirement(selectedRequirementId, {
          focusArea,
          targetAudience,
          customInstructions: customInstructions.trim(),
        });
      } else if (aiMode === 'ARCHITECTURE') {
        res = await aiApi.generateArchitectureDesign(selectedRequirementId, {
          preferredDatabase: preferredDb,
          deploymentTarget,
          securityLevel,
        });
      }

      if (res && res.data) {
        setActiveSuggestion(res.data);
        setSuggestionHistory((prev) => [res.data, ...prev]);
        setActionSuccess(`AI synthesis completed successfully via ${res.data.modelName || 'Gemini 1.5 Flash'}`);
        setTimeout(() => setActionSuccess(''), 4500);
      }
    } catch (err) {
      console.error('AI synthesis failed:', err);
      let msg = err.response?.data?.message || err.message || 'AI synthesis execution failed.';
      setError(msg);
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle Review & Adopt to Backlog
  const handleReviewSuggestion = async (status, applyToBacklog = false) => {
    if (!activeSuggestion) return;
    setReviewing(true);
    setError('');
    setActionSuccess('');

    try {
      const res = await aiApi.reviewSuggestion(activeSuggestion.suggestionId, {
        status,
        applyToBacklog,
        reviewerFeedback: `Reviewed by ${user?.fullName || 'Lead'} via AI PRD Studio`,
      });

      if (res && res.data) {
        setActiveSuggestion(res.data);
        setSuggestionHistory((prev) =>
          prev.map((s) => (s.suggestionId === res.data.suggestionId ? res.data : s))
        );

        if (applyToBacklog && status === 'Accepted') {
          setActionSuccess('Success! User stories have been converted and adopted into the real Product Backlog.');
        } else {
          setActionSuccess(`Suggestion marked as "${status}"`);
        }
        setTimeout(() => setActionSuccess(''), 4500);
      }
    } catch (err) {
      console.error('Failed to review suggestion:', err);
      setError(err.response?.data?.message || 'Failed to submit review.');
    } finally {
      setReviewing(false);
    }
  };

  // Active requirement object
  const activeReq = requirements.find((r) => String(r.requirementId) === String(selectedRequirementId));

  return (
    <div>
      {/* Studio Header */}
      <div className="page-header" style={{ alignItems: 'flex-start' }}>
        <div>
          <div className="page-title">
            <Sparkles size={28} color="var(--primary)" />
            <h1>AI PRD Studio</h1>
            <span
              className="badge"
              style={{
                backgroundColor: 'rgba(255, 107, 0, 0.15)',
                color: 'var(--primary)',
                border: '1px solid var(--border-focus)',
                fontSize: '0.74rem',
              }}
            >
              Google Gemini 1.5 Flash
            </span>
          </div>
          <p className="page-subtitle">
            Autonomous requirements analysis, Agile story decomposition, and architectural blueprints
          </p>

          {/* Scope Selectors Bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginTop: '14px', flexWrap: 'wrap' }}>
            {/* Project Switcher */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Project:
              </span>
              <select
                className="form-select"
                value={selectedProjectId}
                onChange={(e) => handleProjectChange(e.target.value)}
                disabled={loadingProjects}
                style={{
                  minWidth: '200px',
                  fontSize: '0.84rem',
                  borderColor: 'var(--border-subtle)',
                  color: 'var(--primary)',
                  fontWeight: '600',
                  height: '34px',
                }}
              >
                {projects.map((p) => (
                  <option key={p.projectId} value={p.projectId}>
                    PRJ-00{p.projectId}: {p.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Requirement Picker */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Target PRD:
              </span>
              <select
                className="form-select"
                value={selectedRequirementId}
                onChange={(e) => setSelectedRequirementId(e.target.value)}
                disabled={loadingReqs || requirements.length === 0}
                style={{
                  minWidth: '260px',
                  fontSize: '0.84rem',
                  borderColor: 'var(--border-focus)',
                  color: 'var(--text-primary)',
                  height: '34px',
                }}
              >
                {requirements.length === 0 ? (
                  <option value="">No requirements in project</option>
                ) : (
                  requirements.map((r) => (
                    <option key={r.requirementId} value={r.requirementId}>
                      REQ-00{r.requirementId}: {r.title}
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>
        </div>

        {/* Top Quick Links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Link
            to={`/workspace/requirements?projectId=${selectedProjectId}`}
            className="btn btn-secondary btn-sm"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <FileText size={14} />
            Back to Specifications
          </Link>
        </div>
      </div>

      {/* Status Notifications */}
      {actionSuccess && (
        <div className="alert alert-success animate-fade-in" style={{ marginBottom: '18px' }}>
          <CheckCircle2 size={16} />
          <span>{actionSuccess}</span>
        </div>
      )}
      {error && (
        <div className="alert alert-error animate-fade-in" style={{ marginBottom: '18px' }}>
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Target PRD Summary Banner */}
      {activeReq && (
        <div className="glass-card" style={{
          padding: '16px 20px',
          marginBottom: '22px',
          backgroundColor: 'rgba(255, 107, 0, 0.04)',
          borderLeft: '3px solid var(--primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span className="badge" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--primary)' }}>
                REQ-00{activeReq.requirementId}
              </span>
              <span className="badge badge-pm" style={{ fontSize: '0.72rem' }}>
                {activeReq.priority} Priority
              </span>
              <span className="badge" style={{ fontSize: '0.72rem' }}>
                State: {activeReq.status}
              </span>
            </div>
            <h3 style={{ fontSize: '1.05rem', margin: 0 }}>
              {activeReq.title}
            </h3>
            {activeReq.description && (
              <p style={{ margin: '4px 0 0 0', fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                {activeReq.description}
              </p>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Total Suggestions: <strong>{suggestionHistory.length}</strong>
            </span>
          </div>
        </div>
      )}

      {/* Main Studio Grid Layout (Left: Controls, Right: AI Output Stream) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(320px, 380px) 1fr',
        gap: '20px',
        alignItems: 'flex-start',
      }}>
        {/* ================= LEFT COLUMN: AI CONTROLS ================= */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* Mode Selector Card */}
          <div className="glass-card" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '0.95rem', margin: '0 0 14px 0', textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-muted)' }}>
              Select AI Synthesis Engine
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {/* Mode 1: User Stories */}
              <button
                type="button"
                onClick={() => setAiMode('STORIES')}
                style={{
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-xs)',
                  background: aiMode === 'STORIES' ? 'var(--primary-subtle)' : 'rgba(255, 255, 255, 0.02)',
                  border: aiMode === 'STORIES' ? '1px solid var(--primary)' : '1px solid var(--border-subtle)',
                  color: aiMode === 'STORIES' ? 'var(--primary)' : 'var(--text-secondary)',
                  textAlign: 'left',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  transition: 'all 0.15s ease',
                }}
              >
                <BookmarkPlus size={20} color={aiMode === 'STORIES' ? 'var(--primary)' : 'var(--text-muted)'} />
                <div>
                  <div style={{ fontWeight: '700', fontSize: '0.9rem', color: aiMode === 'STORIES' ? '#ffffff' : 'inherit' }}>
                    Agile Story Generator
                  </div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    Decompose PRD into Fibonacci stories & criteria
                  </div>
                </div>
              </button>

              {/* Mode 2: Improve PRD */}
              <button
                type="button"
                onClick={() => setAiMode('IMPROVE')}
                style={{
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-xs)',
                  background: aiMode === 'IMPROVE' ? 'var(--primary-subtle)' : 'rgba(255, 255, 255, 0.02)',
                  border: aiMode === 'IMPROVE' ? '1px solid var(--primary)' : '1px solid var(--border-subtle)',
                  color: aiMode === 'IMPROVE' ? 'var(--primary)' : 'var(--text-secondary)',
                  textAlign: 'left',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  transition: 'all 0.15s ease',
                }}
              >
                <Zap size={20} color={aiMode === 'IMPROVE' ? 'var(--primary)' : 'var(--text-muted)'} />
                <div>
                  <div style={{ fontWeight: '700', fontSize: '0.9rem', color: aiMode === 'IMPROVE' ? '#ffffff' : 'inherit' }}>
                    PRD Hardening & Gap Analysis
                  </div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    Discover edge cases, SLAs & security gaps
                  </div>
                </div>
              </button>

              {/* Mode 3: Architecture Design */}
              <button
                type="button"
                onClick={() => setAiMode('ARCHITECTURE')}
                style={{
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-xs)',
                  background: aiMode === 'ARCHITECTURE' ? 'var(--primary-subtle)' : 'rgba(255, 255, 255, 0.02)',
                  border: aiMode === 'ARCHITECTURE' ? '1px solid var(--primary)' : '1px solid var(--border-subtle)',
                  color: aiMode === 'ARCHITECTURE' ? 'var(--primary)' : 'var(--text-secondary)',
                  textAlign: 'left',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  transition: 'all 0.15s ease',
                }}
              >
                <Cpu size={20} color={aiMode === 'ARCHITECTURE' ? 'var(--primary)' : 'var(--text-muted)'} />
                <div>
                  <div style={{ fontWeight: '700', fontSize: '0.9rem', color: aiMode === 'ARCHITECTURE' ? '#ffffff' : 'inherit' }}>
                    Architecture Blueprint
                  </div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    Database models, microservices & deployment
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Mode Configuration Card */}
          <div className="glass-card" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '0.95rem', margin: '0 0 14px 0', textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-muted)' }}>
              Configuration & Parameters
            </h3>

            {/* Mode 1 Config: Story Count & Additional Context */}
            {aiMode === 'STORIES' && (
              <div>
                <div className="form-group">
                  <label className="form-label">Target Story Count</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {[3, 5, 8].map((count) => {
                      const selected = targetStoryCount === count;
                      return (
                        <button
                          key={count}
                          type="button"
                          onClick={() => setTargetStoryCount(count)}
                          style={{
                            flex: 1,
                            padding: '8px',
                            borderRadius: 'var(--radius-xs)',
                            background: selected ? 'var(--primary-subtle)' : 'rgba(255, 255, 255, 0.04)',
                            border: selected ? '1px solid var(--primary)' : '1px solid var(--border-subtle)',
                            color: selected ? 'var(--primary)' : 'var(--text-secondary)',
                            fontWeight: '700',
                            cursor: 'pointer',
                            fontSize: '0.85rem',
                          }}
                        >
                          {count} Stories
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: '18px' }}>
                  <label className="form-label" htmlFor="ai-story-context">
                    Engineering Context / Constraints (Optional)
                  </label>
                  <textarea
                    id="ai-story-context"
                    className="form-input"
                    rows={3}
                    placeholder="e.g. Focus on JWT token expiration edge cases, OAuth2 Google login, and Spring Security 6."
                    value={additionalContext}
                    onChange={(e) => setAdditionalContext(e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* Mode 2 Config: Focus Area & Target Audience */}
            {aiMode === 'IMPROVE' && (
              <div>
                <div className="form-group">
                  <label className="form-label" htmlFor="ai-focus-area">Focus Area</label>
                  <select
                    id="ai-focus-area"
                    className="form-select"
                    value={focusArea}
                    onChange={(e) => setFocusArea(e.target.value)}
                  >
                    <option value="Enterprise Readiness & Security">Enterprise Readiness & Security</option>
                    <option value="Performance SLAs & Low Latency">Performance SLAs & Low Latency</option>
                    <option value="Edge Cases & Error Handling">Edge Cases & Error Handling</option>
                    <option value="Compliance & Audit Logging">Compliance & Audit Logging</option>
                  </select>
                </div>

                <div className="form-group" style={{ marginBottom: '18px' }}>
                  <label className="form-label" htmlFor="ai-target-audience">Target Stakeholder</label>
                  <select
                    id="ai-target-audience"
                    className="form-select"
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                  >
                    <option value="Engineering Team">Engineering Squad</option>
                    <option value="QA & Verification">QA & Test Automation</option>
                    <option value="Executive Stakeholders">Executive & Security Leadership</option>
                  </select>
                </div>
              </div>
            )}

            {/* Mode 3 Config: Database, Deployment & Security */}
            {aiMode === 'ARCHITECTURE' && (
              <div>
                <div className="form-group">
                  <label className="form-label" htmlFor="ai-db">Preferred Database</label>
                  <select
                    id="ai-db"
                    className="form-select"
                    value={preferredDb}
                    onChange={(e) => setPreferredDb(e.target.value)}
                  >
                    <option value="PostgreSQL / JPA">PostgreSQL / JPA (Relational)</option>
                    <option value="MySQL / InnoDB">MySQL / InnoDB</option>
                    <option value="MongoDB / NoSQL">MongoDB / Document Store</option>
                    <option value="Redis / In-Memory Cache">Redis / In-Memory State</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="ai-deploy">Deployment Target</label>
                  <select
                    id="ai-deploy"
                    className="form-select"
                    value={deploymentTarget}
                    onChange={(e) => setDeploymentTarget(e.target.value)}
                  >
                    <option value="Docker / Kubernetes">Docker / Kubernetes Cluster</option>
                    <option value="AWS ECS / Fargate">AWS ECS / Fargate</option>
                    <option value="GCP Cloud Run">Google Cloud Run</option>
                    <option value="On-Premise Linux VMs">On-Premise Bare-Metal</option>
                  </select>
                </div>

                <div className="form-group" style={{ marginBottom: '18px' }}>
                  <label className="form-label" htmlFor="ai-sec">Security Standard</label>
                  <select
                    id="ai-sec"
                    className="form-select"
                    value={securityLevel}
                    onChange={(e) => setSecurityLevel(e.target.value)}
                  >
                    <option value="High (JWT + RBAC)">High (JWT + Strict RBAC)</option>
                    <option value="Zero-Trust / mTLS">Zero-Trust Network / mTLS</option>
                    <option value="Standard OAuth2.0">Standard OAuth2.0 / OIDC</option>
                  </select>
                </div>
              </div>
            )}

            {/* Trigger Button */}
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleExecuteAiGeneration}
              disabled={isGenerating || !selectedRequirementId || requirements.length === 0}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '12px',
                fontWeight: '700',
              }}
            >
              {isGenerating ? (
                <>
                  <RefreshCw size={16} className="spin" />
                  Gemini Synthesizing...
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  {aiMode === 'STORIES' && 'Synthesize User Stories'}
                  {aiMode === 'IMPROVE' && 'Execute PRD Analysis'}
                  {aiMode === 'ARCHITECTURE' && 'Generate Architecture'}
                </>
              )}
            </button>
          </div>

          {/* Suggestion History Drawer */}
          {suggestionHistory.length > 0 && (
            <div className="glass-card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <History size={16} color="var(--primary)" />
                <h3 style={{ fontSize: '0.88rem', margin: 0, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Synthesis History ({suggestionHistory.length})
                </h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '220px', overflowY: 'auto' }}>
                {suggestionHistory.map((s) => {
                  const isSelected = activeSuggestion?.suggestionId === s.suggestionId;
                  return (
                    <div
                      key={s.suggestionId}
                      onClick={() => setActiveSuggestion(s)}
                      style={{
                        padding: '10px 12px',
                        borderRadius: 'var(--radius-xs)',
                        backgroundColor: isSelected ? 'rgba(255, 107, 0, 0.12)' : 'rgba(255, 255, 255, 0.02)',
                        border: isSelected ? '1px solid var(--border-focus)' : '1px solid var(--border-subtle)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '0.82rem', fontWeight: '700', color: isSelected ? 'var(--primary)' : 'var(--text-primary)' }}>
                          {s.suggestionType}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                          {s.generatedTime ? new Date(s.generatedTime).toLocaleTimeString() : 'Active'}
                        </div>
                      </div>
                      <span className={`badge ${s.status === 'Accepted' ? 'badge-active' : s.status === 'Rejected' ? '' : 'badge-pm'}`} style={{ fontSize: '0.68rem' }}>
                        {s.status}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* ================= RIGHT COLUMN: AI OUTPUT & WORKBENCH ================= */}
        <div>
          {isGenerating ? (
            /* Live Pulse Loader */
            <div className="glass-card" style={{
              padding: '80px 20px',
              textAlign: 'center',
              border: '1px dashed var(--border-focus)',
              backgroundColor: 'rgba(255, 107, 0, 0.02)',
            }}>
              <Sparkles size={36} color="var(--primary)" className="spin" style={{ marginBottom: '16px' }} />
              <h3 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>
                Google Gemini Analyzing Scope...
              </h3>
              <p style={{ color: 'var(--text-secondary)', maxWidth: '480px', margin: '0 auto 16px auto', fontSize: '0.88rem' }}>
                Extracting functional behavior, evaluating edge cases, calculating Fibonacci points, and building verification checklists.
              </p>
              <span className="badge" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--primary)' }}>
                Target: {activeReq?.title || 'Active Requirement'}
              </span>
            </div>
          ) : activeSuggestion ? (
            /* Active Suggestion Viewer */
            <div className="glass-card" style={{ padding: '26px' }}>
              {/* Output Header */}
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                borderBottom: '1px solid var(--border-subtle)',
                paddingBottom: '16px',
                marginBottom: '20px',
                flexWrap: 'wrap',
                gap: '12px',
              }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <span className="badge badge-pm" style={{ fontSize: '0.74rem' }}>
                      {activeSuggestion.suggestionType}
                    </span>
                    <span className="badge" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--primary)' }}>
                      {activeSuggestion.modelName || 'gemini-1.5-flash'}
                    </span>
                    <span className={`badge ${activeSuggestion.status === 'Accepted' ? 'badge-active' : activeSuggestion.status === 'Rejected' ? '' : 'badge-pm'}`} style={{ fontSize: '0.72rem' }}>
                      {activeSuggestion.status}
                    </span>
                  </div>
                  <h2 style={{ fontSize: '1.35rem', margin: 0 }}>
                    AI Synthesis Output
                  </h2>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    Context: {activeSuggestion.promptContext || 'Standard PRD scope'}
                  </span>
                </div>

                {/* Review Controls (One-Click Backlog Adoption) */}
                {canManageRequirements && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {activeSuggestion.suggestionType === 'User Story Generation' ? (
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={() => handleReviewSuggestion('Accepted', true)}
                        disabled={reviewing || activeSuggestion.status === 'Accepted'}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          fontSize: '0.85rem',
                          padding: '8px 14px',
                        }}
                        id="btn-adopt-backlog"
                      >
                        <Check size={16} />
                        {activeSuggestion.status === 'Accepted' ? 'Adopted in Backlog' : '✨ Adopt into Backlog'}
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={() => handleReviewSuggestion('Accepted', false)}
                        disabled={reviewing || activeSuggestion.status === 'Accepted'}
                        style={{ fontSize: '0.85rem', padding: '8px 14px' }}
                      >
                        <Check size={16} />
                        Accept Analysis
                      </button>
                    )}

                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => handleReviewSuggestion('Rejected', false)}
                      disabled={reviewing || activeSuggestion.status === 'Rejected'}
                      style={{
                        padding: '8px 12px',
                        borderColor: 'rgba(255, 51, 68, 0.4)',
                        color: 'var(--danger)',
                        fontSize: '0.85rem',
                      }}
                    >
                      <X size={16} />
                      Reject
                    </button>
                  </div>
                )}
              </div>

              {/* Markdown Content Terminal Viewer */}
              <div style={{
                backgroundColor: 'rgba(0, 0, 0, 0.45)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-xs)',
                padding: '24px',
                fontFamily: 'system-ui, -apple-system, sans-serif',
                fontSize: '0.92rem',
                lineHeight: '1.7',
                color: 'var(--text-primary)',
                maxHeight: '600px',
                overflowY: 'auto',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
              }}>
                {activeSuggestion.content}
              </div>

              {/* Reviewer Meta Footer */}
              {activeSuggestion.reviewedByName && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginTop: '16px',
                  paddingTop: '12px',
                  borderTop: '1px solid var(--border-subtle)',
                  fontSize: '0.78rem',
                  color: 'var(--text-muted)',
                }}>
                  <ShieldCheck size={14} color="var(--success)" />
                  <span>
                    Reviewed & approved by <strong>{activeSuggestion.reviewedByName}</strong>
                  </span>
                </div>
              )}
            </div>
          ) : (
            /* Empty State */
            <div className="glass-card" style={{ padding: '80px 20px', textAlign: 'center' }}>
              <Cpu size={48} color="var(--text-muted)" style={{ marginBottom: '16px' }} />
              <h3 style={{ marginBottom: '8px' }}>AI PRD Studio Ready</h3>
              <p style={{ color: 'var(--text-secondary)', maxWidth: '480px', margin: '0 auto 20px auto', fontSize: '0.88rem' }}>
                Select an engineering synthesis mode on the left and trigger Gemini AI to decompose requirements, harden specifications, or draft architectural blueprints.
              </p>
              <span className="badge" style={{ color: 'var(--text-muted)' }}>
                Powered by Google Gemini Generative AI
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AiPrdStudio;
