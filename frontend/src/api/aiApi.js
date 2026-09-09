import apiClient from './client';

export const aiApi = {
  // Generate User Stories from Requirement using Gemini AI
  generateUserStories: async (requirementId, data = {}) => {
    const res = await apiClient.post(`/ai/requirements/${requirementId}/generate-stories`, data);
    return res.data;
  },

  // Analyze and improve PRD specifications
  improveRequirement: async (requirementId, data = {}) => {
    const res = await apiClient.post(`/ai/requirements/${requirementId}/improve`, data);
    return res.data;
  },

  // Generate system architecture & diagram recommendations
  generateArchitectureDesign: async (requirementId, data = {}) => {
    const res = await apiClient.post(`/ai/requirements/${requirementId}/architecture`, data);
    return res.data;
  },

  // Get all AI suggestions for a requirement
  getSuggestionsByRequirement: async (requirementId) => {
    const res = await apiClient.get(`/ai/requirements/${requirementId}/suggestions`);
    return res.data;
  },

  // Get specific suggestion by ID
  getSuggestionById: async (suggestionId) => {
    const res = await apiClient.get(`/ai/suggestions/${suggestionId}`);
    return res.data;
  },

  // Review suggestion (Accept/Reject, optionally adopt into Backlog)
  reviewSuggestion: async (suggestionId, reviewData) => {
    const res = await apiClient.post(`/ai/suggestions/${suggestionId}/review`, reviewData);
    return res.data;
  },
};

export default aiApi;
