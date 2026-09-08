import api from './client';

export const teamApi = {
  // Get all teams for a specific project
  getTeamsByProject: async (projectId) => {
    const response = await api.get(`/projects/${projectId}/teams`);
    return response.data;
  },

  // Get a single team by ID
  getTeamById: async (teamId) => {
    const response = await api.get(`/teams/${teamId}`);
    return response.data;
  },

  // Create a new team in a project (Admin / Project Manager)
  createTeam: async (projectId, teamData) => {
    const response = await api.post(`/projects/${projectId}/teams`, teamData);
    return response.data;
  },

  // Update team details (Admin / Project Manager)
  updateTeam: async (teamId, teamData) => {
    const response = await api.put(`/teams/${teamId}`, teamData);
    return response.data;
  },

  // Disband/Delete a team (Admin / Project Manager)
  deleteTeam: async (teamId) => {
    const response = await api.delete(`/teams/${teamId}`);
    return response.data;
  },

  // Get members of a specific team
  getTeamMembers: async (teamId) => {
    const response = await api.get(`/teams/${teamId}/members`);
    return response.data;
  },

  // Add an engineer/collaborator to a team
  addMemberToTeam: async (teamId, memberData) => {
    const response = await api.post(`/teams/${teamId}/members`, memberData);
    return response.data;
  },

  // Remove a member from a team
  removeMemberFromTeam: async (teamId, userId) => {
    const response = await api.delete(`/teams/${teamId}/members/${userId}`);
    return response.data;
  },
};

export default teamApi;
