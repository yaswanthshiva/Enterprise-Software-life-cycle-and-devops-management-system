import apiClient from './client';

export const requirementApi = {
  // ==================== REQUIREMENTS ====================
  createRequirement: async (projectId, data) => {
    const res = await apiClient.post(`/projects/${projectId}/requirements`, data);
    return res.data;
  },

  getRequirementsByProject: async (projectId, status) => {
    const config = status ? { params: { status } } : {};
    const res = await apiClient.get(`/projects/${projectId}/requirements`, config);
    return res.data;
  },

  getRequirementById: async (requirementId) => {
    const res = await apiClient.get(`/requirements/${requirementId}`);
    return res.data;
  },

  updateRequirement: async (requirementId, data) => {
    const res = await apiClient.put(`/requirements/${requirementId}`, data);
    return res.data;
  },

  updateRequirementStatus: async (requirementId, status) => {
    const res = await apiClient.patch(`/requirements/${requirementId}/status`, { status });
    return res.data;
  },

  deleteRequirement: async (requirementId) => {
    const res = await apiClient.delete(`/requirements/${requirementId}`);
    return res.data;
  },

  // ==================== USER STORIES ====================
  createUserStory: async (requirementId, data) => {
    const res = await apiClient.post(`/requirements/${requirementId}/user-stories`, data);
    return res.data;
  },

  getUserStoriesByRequirement: async (requirementId) => {
    const res = await apiClient.get(`/requirements/${requirementId}/user-stories`);
    return res.data;
  },

  getProductBacklog: async (projectId, status) => {
    const config = status ? { params: { status } } : {};
    const res = await apiClient.get(`/projects/${projectId}/user-stories`, config);
    return res.data;
  },

  getUserStoryById: async (storyId) => {
    const res = await apiClient.get(`/user-stories/${storyId}`);
    return res.data;
  },

  updateUserStory: async (storyId, data) => {
    const res = await apiClient.put(`/user-stories/${storyId}`, data);
    return res.data;
  },

  updateUserStoryStatus: async (storyId, status) => {
    const res = await apiClient.patch(`/user-stories/${storyId}/status`, { status });
    return res.data;
  },

  deleteUserStory: async (storyId) => {
    const res = await apiClient.delete(`/user-stories/${storyId}`);
    return res.data;
  },
};

export default requirementApi;
