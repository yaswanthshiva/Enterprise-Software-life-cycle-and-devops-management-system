import api from './client';

export const authApi = {
  // Login with email and password
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  // Register a new user
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  // Get current logged-in user details
  getCurrentUser: async () => {
    const response = await api.get('/users/me');
    return response.data;
  },

  // Get all users (Admin / Project Manager)
  getAllUsers: async (role = '') => {
    const params = role ? { role } : {};
    const response = await api.get('/users', { params });
    return response.data;
  },

  // Get active platform users (open to all authenticated roles)
  getActiveUsers: async () => {
    const response = await api.get('/users/active');
    return response.data;
  },

  // Health check endpoint
  checkHealth: async () => {
    const response = await api.get('/health');
    return response.data;
  },
};

export default authApi;
