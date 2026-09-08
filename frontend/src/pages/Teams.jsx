import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { projectApi } from '../api/projectApi';
import { teamApi } from '../api/teamApi';
import CreateTeamModal from '../components/teams/CreateTeamModal';
import EditTeamModal from '../components/teams/EditTeamModal';
import TeamMembersModal from '../components/teams/TeamMembersModal';
import {
  Users2,
  Plus,
  Search,
  RefreshCw,
  FolderKanban,
  UserCheck,
  Edit3,
  Trash2,
  AlertCircle,
  Briefcase,
  Layers,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';

export const Teams = () => {
  const { user, canManageTeams } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialProjectId = searchParams.get('projectId');

  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState(initialProjectId || '');
  const [teams, setTeams] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [loadingTeams, setLoadingTeams] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedTeamForEdit, setSelectedTeamForEdit] = useState(null);
  const [isMembersOpen, setIsMembersOpen] = useState(false);
  const [selectedTeamForMembers, setSelectedTeamForMembers] = useState(null);

  // Load all projects for project switcher
  const fetchProjects = async () => {
    setLoadingProjects(true);
    try {
      const res = await projectApi.getAllProjects();
      if (res && res.data) {
        setProjects(res.data);
        // Default to query param or first project
        if (!selectedProjectId && res.data.length > 0) {
          const defaultId = initialProjectId || res.data[0].projectId;
          setSelectedProjectId(String(defaultId));
        }
      }
    } catch (err) {
      console.error('Failed to load projects for teams:', err);
      setError('Unable to load project portfolio list.');
    } finally {
      setLoadingProjects(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  // Fetch teams whenever selectedProjectId changes
  const fetchTeams = async () => {
    if (!selectedProjectId) {
      setTeams([]);
      return;
    }
    setLoadingTeams(true);
    setError('');
    try {
      const res = await teamApi.getTeamsByProject(selectedProjectId);
      if (res && res.data) {
        setTeams(res.data);
      }
    } catch (err) {
      console.error('Failed to load teams:', err);
      setError('Unable to retrieve engineering pods for the selected project.');
    } finally {
      setLoadingTeams(false);
    }
  };

  useEffect(() => {
    if (selectedProjectId) {
      fetchTeams();
      // Update URL search params
      setSearchParams({ projectId: selectedProjectId });
    }
  }, [selectedProjectId]);

  const handleProjectChange = (e) => {
    setSelectedProjectId(e.target.value);
  };

  const handleTeamCreated = (newTeam) => {
    setTeams((prev) => [newTeam, ...prev]);
  };

  const handleTeamUpdated = (updatedTeam) => {
    setTeams((prev) =>
      prev.map((t) => (t.teamId === updatedTeam.teamId ? updatedTeam : t))
    );
  };

  const handleMemberCountChanged = (newCount) => {
    if (!selectedTeamForMembers) return;
    setTeams((prev) =>
      prev.map((t) =>
        t.teamId === selectedTeamForMembers.teamId
          ? { ...t, memberCount: newCount }
          : t
      )
    );
  };

  const handleDeleteTeam = async (teamId, teamName) => {
    if (!window.confirm(`Disband engineering pod "${teamName}"? All member allocations in this team will be removed.`)) {
      return;
    }
    try {
      await teamApi.deleteTeam(teamId);
      setTeams((prev) => prev.filter((t) => t.teamId !== teamId));
    } catch (err) {
      console.error('Failed to delete team:', err);
      alert(err.response?.data?.message || 'Failed to disband team.');
    }
  };

  // Find active project object
  const activeProject = projects.find((p) => String(p.projectId) === String(selectedProjectId));



  // Filter teams by search text
  const filteredTeams = teams.filter((t) => {
    const q = searchQuery.toLowerCase();
    const nameMatch = t.teamName?.toLowerCase().includes(q);
    const descMatch = t.description?.toLowerCase().includes(q);
    return nameMatch || descMatch;
  });

  // KPI Calculations
  const totalPods = teams.length;
  const totalAllocatedMembers = teams.reduce((acc, t) => acc + (t.memberCount || 0), 0);

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <div className="page-title">
            <Users2 size={28} color="var(--primary)" />
            <h1>Team Workspaces & Collaborators</h1>
          </div>
          <p className="page-subtitle">
            Assemble cross-functional engineering pods, allocate roles, and synchronize team rosters
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button
            className="btn btn-secondary"
            onClick={fetchTeams}
            disabled={loadingTeams || !selectedProjectId}
            title="Refresh teams"
          >
            <RefreshCw size={15} />
            Refresh
          </button>

          {canManageTeams && (
            <button
              className="btn btn-primary"
              onClick={() => setIsCreateOpen(true)}
              disabled={!selectedProjectId}
              id="btn-create-team"
            >
              <Plus size={16} />
              Create Team Pod
            </button>
          )}
        </div>
      </div>

      {/* Project Switcher Bar */}
      <div className="glass-card" style={{
        padding: '16px 20px',
        marginBottom: '22px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        borderColor: 'var(--border-focus)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: '1 1 320px' }}>
          <FolderKanban size={20} color="var(--primary)" style={{ flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Active SDLC Project Portfolio
            </span>
            <select
              className="form-select"
              value={selectedProjectId}
              onChange={handleProjectChange}
              disabled={loadingProjects || projects.length === 0}
              style={{
                marginTop: '4px',
                fontWeight: '600',
                color: 'var(--text-primary)',
                backgroundColor: 'var(--bg-base)',
              }}
            >
              {projects.length === 0 ? (
                <option value="">No projects available (Create a project first)</option>
              ) : (
                projects.map((p) => (
                  <option key={p.projectId} value={p.projectId}>
                    PRJ-00{p.projectId} • {p.name} ({p.status || 'Active'})
                  </option>
                ))
              )}
            </select>
          </div>
        </div>

        {/* Quick link to project detail */}
        {activeProject && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Link
              to={`/workspace/projects/${activeProject.projectId}`}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.78rem' }}
            >
              View Project Telemetry
              <ChevronRight size={14} />
            </Link>
          </div>
        )}
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
            Active Pods
          </span>
          <div className="kpi-value" style={{ marginTop: '6px' }}>
            {totalPods}
          </div>
        </div>

        <div className="glass-card" style={{ padding: '18px 20px' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Allocated Engineers
          </span>
          <div className="kpi-value" style={{ marginTop: '6px', color: 'var(--primary)' }}>
            {totalAllocatedMembers}
          </div>
        </div>

        <div className="glass-card" style={{ padding: '18px 20px' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Project Lead
          </span>
          <div style={{
            marginTop: '8px',
            fontSize: '1.05rem',
            fontWeight: '600',
            color: 'var(--text-primary)',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}>
            {activeProject?.ownerName || 'Engineering Lead'}
          </div>
        </div>
      </div>

      {/* Error notification */}
      {error && (
        <div className="alert alert-error" style={{ marginBottom: '20px' }}>
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Search Bar */}
      <div className="glass-card" style={{
        padding: '12px 18px',
        marginBottom: '22px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '14px',
      }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: '420px' }}>
          <input
            type="text"
            className="form-input"
            placeholder="Search team pods by name or charter scope..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: '36px' }}
          />
          <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
        </div>

        <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
          Showing <strong>{filteredTeams.length}</strong> of <strong>{teams.length}</strong> pods
        </div>
      </div>

      {/* Teams Grid */}
      {loadingTeams ? (
        <div className="glass-card" style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <RefreshCw size={24} className="spin" style={{ marginBottom: '12px', color: 'var(--primary)' }} />
          <div>Loading engineering pods...</div>
        </div>
      ) : projects.length === 0 ? (
        <div className="glass-card" style={{ padding: '60px 20px', textAlign: 'center' }}>
          <FolderKanban size={44} color="var(--text-muted)" style={{ marginBottom: '16px' }} />
          <h3 style={{ marginBottom: '8px' }}>No Projects Initiated</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '20px' }}>
            Engineering teams must belong to an enterprise project. Please initiate a project first.
          </p>
          <Link to="/workspace/projects" className="btn btn-primary">
            Initiate First Project
          </Link>
        </div>
      ) : filteredTeams.length === 0 ? (
        <div className="glass-card" style={{ padding: '60px 20px', textAlign: 'center' }}>
          <Users2 size={44} color="var(--text-muted)" style={{ marginBottom: '16px' }} />
          <h3 style={{ marginBottom: '8px' }}>No Engineering Pods Found</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '20px' }}>
            {searchQuery
              ? 'No pods match your active search filter.'
              : `No engineering pods have been formed under "${activeProject?.name || 'this project'}" yet.`}
          </p>
          {canManageTeams && (
            <button
              className="btn btn-primary"
              onClick={() => setIsCreateOpen(true)}
            >
              <Plus size={16} />
              Form First Engineering Pod
            </button>
          )}
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
          gap: '18px',
        }}>
          {filteredTeams.map((team) => (
            <div
              key={team.teamId}
              className="glass-card glass-card-interactive"
              style={{
                padding: '22px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                {/* Card Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.75rem',
                    color: 'var(--text-muted)',
                  }}>
                    TM-00{team.teamId}
                  </span>

                  <span
                    className="badge"
                    style={{
                      backgroundColor: team.memberCount > 0 ? 'var(--primary-subtle)' : 'rgba(255, 255, 255, 0.04)',
                      color: team.memberCount > 0 ? 'var(--primary)' : 'var(--text-muted)',
                      border: team.memberCount > 0 ? '1px solid rgba(255, 107, 0, 0.35)' : '1px solid var(--border-subtle)',
                      fontWeight: '600',
                    }}
                  >
                    {team.memberCount || 0} {team.memberCount === 1 ? 'Collaborator' : 'Collaborators'}
                  </span>
                </div>

                {/* Team Name */}
                <h3 style={{ fontSize: '1.25rem', marginBottom: '8px', color: 'var(--text-primary)' }}>
                  {team.teamName}
                </h3>

                {/* Scope Description */}
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
                  {team.description || 'No charter description defined for this engineering pod.'}
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
                flexWrap: 'wrap',
                gap: '10px',
              }}>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => {
                    setSelectedTeamForMembers(team);
                    setIsMembersOpen(true);
                  }}
                  style={{ fontSize: '0.82rem' }}
                >
                  <Users2 size={14} />
                  {canManageTeams ? 'Manage Roster' : 'View Roster'} ({team.memberCount || 0})
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {canManageTeams && (
                    <>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => {
                          setSelectedTeamForEdit(team);
                          setIsEditOpen(true);
                        }}
                        title="Edit Pod Charter"
                        style={{ padding: '6px 8px' }}
                      >
                        <Edit3 size={14} />
                      </button>

                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => handleDeleteTeam(team.teamId, team.teamName)}
                        title="Disband Pod"
                        style={{
                          padding: '6px 8px',
                          borderColor: 'rgba(255, 51, 68, 0.35)',
                          color: 'var(--danger)'
                        }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      <CreateTeamModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        projectId={selectedProjectId}
        projectName={activeProject?.name}
        onTeamCreated={handleTeamCreated}
      />

      <EditTeamModal
        isOpen={isEditOpen}
        onClose={() => {
          setIsEditOpen(false);
          setSelectedTeamForEdit(null);
        }}
        team={selectedTeamForEdit}
        onTeamUpdated={handleTeamUpdated}
      />

      <TeamMembersModal
        isOpen={isMembersOpen}
        onClose={() => {
          setIsMembersOpen(false);
          setSelectedTeamForMembers(null);
        }}
        team={selectedTeamForMembers}
        canManage={canManageTeams}
        onMemberCountChanged={handleMemberCountChanged}
      />
    </div>
  );
};

export default Teams;
