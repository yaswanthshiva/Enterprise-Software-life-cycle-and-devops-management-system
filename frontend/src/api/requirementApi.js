import apiClient from './client';

export const requirementApi = {
  // ==================== REQUIREMENTS ====================
  createRequirement: async (projectId, data) => {
    const res = await apiClient.post(`/api/projects/${projectId}/requirements`, data);
    return res.data;
  },

  getRequirementsByProject: async (projectId, status) => {
    const config = status ? { params: { status } } : {};
    const res = await apiClient.get(`/api/projects/${projectId}/requirements`, config);
    return res.data;
  },

  getRequirementById: async (requirementId) => {
    const res = await apiClient.get(`/api/requirements/${requirementId}`);
    return res.data;
  },

  updateRequirement: async (requirementId, data) => {
    const res = await apiClient.put(`/api/requirements/${requirementId}`, data);
    return res.data;
  },

  updateRequirementStatus: async (requirementId, status) => {
    const res = await apiClient.patch(`/api/requirements/${requirementId}/status`, { status });
    return res.data;
  },

  deleteRequirement: async (requirementId) => {
    const res = await apiClient.delete(`/api/requirements/${requirementId}`);
    return res.data;
  },

  // ==================== USER STORIES ====================
  createUserStory: async (requirementId, data) => {
    const res = await apiClient.post(`/api/requirements/${requirementId}/user-stories`, data);
    return res.data;
  },

  getUserStoriesByRequirement: async (requirementId) => {
    const res = await apiClient.get(`/api/requirements/${requirementId}/user-stories`);
    return res.data;
  },

  getProductBacklog: async (projectId, status) => {
    const config = status ? { params: { status } } : {};
    const res = await apiClient.get(`/api/projects/${projectId}/user-stories`, config);
    return res.data;
  },

  getUserStoryById: async (storyId) => {
    const res = await apiClient.get(`/api/user-stories/${storyId}`);
    return res.data;
  },

  updateUserStory: async (storyId, data) => {
    const res = await apiClient.put(`/api/user-stories/${storyId}`, data);
    return res.data;
  },

  updateUserStoryStatus: async (storyId, status) => {
    const res = await apiClient.patch(`/api/user-stories/${storyId}/status`, { status });
    return res.data;
  },

  deleteUserStory: async (storyId) => {
    const res = await apiClient.delete(`/api/user-stories/${storyId}`);
    return res.data;
  },
};

export default requirementApi;
