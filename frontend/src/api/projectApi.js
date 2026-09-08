import api from './client';

export const projectApi = {
  // Get all projects with optional status filter
  getAllProjects: async (status = '') => {
    const params = status ? { status } : {};
    const response = await api.get('/projects', { params });
    return response.data;
  },

  // Get projects owned by or assigned to current user
  getMyProjects: async () => {
    const response = await api.get('/projects/my-projects');
    return response.data;
  },

  // Get single project by ID
  getProjectById: async (projectId) => {
    const response = await api.get(`/projects/${projectId}`);
    return response.data;
  },

  // Create new project (Admin / Project Manager)
  createProject: async (projectData) => {
    const response = await api.post('/projects', projectData);
    return response.data;
  },

  // Update existing project details (Admin / Project Manager)
  updateProject: async (projectId, projectData) => {
    const response = await api.put(`/projects/${projectId}`, projectData);
    return response.data;
  },

  // Quick patch project status (Admin / Project Manager)
  updateProjectStatus: async (projectId, status) => {
    const response = await api.patch(`/projects/${projectId}/status`, { status });
    return response.data;
  },

  // Archive / Delete project (Admin)
  deleteProject: async (projectId) => {
    const response = await api.delete(`/projects/${projectId}`);
    return response.data;
  },
};

export default projectApi;
