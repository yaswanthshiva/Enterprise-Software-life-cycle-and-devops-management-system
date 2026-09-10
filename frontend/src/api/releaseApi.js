import client from './client';

export const releaseApi = {
  // ==========================================
  // RELEASE MANAGEMENT ENDPOINTS
  // ==========================================

  // Create a new versioned release
  createRelease: async (data) => {
    const res = await client.post('/releases', data);
    return res.data;
  },

  // Get all releases for a project with optional status filter
  getReleasesByProject: async (projectId, status) => {
    const params = {};
    if (status && status !== 'ALL') params.status = status;
    const res = await client.get(`/projects/${projectId}/releases`, { params });
    return res.data;
  },

  // Get release by ID
  getReleaseById: async (releaseId) => {
    const res = await client.get(`/releases/${releaseId}`);
    return res.data;
  },

  // Update release details
  updateRelease: async (releaseId, data) => {
    const res = await client.put(`/releases/${releaseId}`, data);
    return res.data;
  },

  // Update release status (Draft, In Progress, Released, Archived)
  updateReleaseStatus: async (releaseId, status) => {
    const res = await client.patch(`/releases/${releaseId}/status?status=${encodeURIComponent(status)}`);
    return res.data;
  },

  // Delete release
  deleteRelease: async (releaseId) => {
    const res = await client.delete(`/releases/${releaseId}`);
    return res.data;
  },

  // ==========================================
  // CI/CD DEPLOYMENT PIPELINE ENDPOINTS
  // ==========================================

  // Trigger a new deployment for a release
  createDeployment: async (data) => {
    const res = await client.post('/deployments', data);
    return res.data;
  },

  // Get all deployments for a project with optional environment and status filters
  getDeploymentsByProject: async (projectId, environment, status) => {
    const params = {};
    if (environment && environment !== 'ALL') params.environment = environment;
    if (status && status !== 'ALL') params.status = status;
    const res = await client.get(`/projects/${projectId}/deployments`, { params });
    return res.data;
  },

  // Get deployments for a specific release
  getDeploymentsByRelease: async (releaseId, environment) => {
    const params = {};
    if (environment && environment !== 'ALL') params.environment = environment;
    const res = await client.get(`/releases/${releaseId}/deployments`, { params });
    return res.data;
  },

  // Get deployments triggered by the current user
  getMyDeployments: async () => {
    const res = await client.get('/deployments/my-deployments');
    return res.data;
  },

  // Get deployment by ID
  getDeploymentById: async (deploymentId) => {
    const res = await client.get(`/deployments/${deploymentId}`);
    return res.data;
  },

  // Update deployment verdict/status (In Progress, Success, Failed, Rolled Back)
  updateDeploymentStatus: async (deploymentId, data) => {
    const res = await client.patch(`/deployments/${deploymentId}/status`, data);
    return res.data;
  },

  // Delete deployment record
  deleteDeployment: async (deploymentId) => {
    const res = await client.delete(`/deployments/${deploymentId}`);
    return res.data;
  },

  // Get release pipeline health metrics for a project
  getProjectReleaseHealth: async (projectId) => {
    const res = await client.get(`/projects/${projectId}/release-health`);
    return res.data;
  },
};

export default releaseApi;
