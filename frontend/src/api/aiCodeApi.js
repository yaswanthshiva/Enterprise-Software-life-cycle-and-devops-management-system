import client from './client';

export const aiCodeApi = {
  // 1. Synthesize production code for task
  generateTaskCode: async (taskId, payload = {}) => {
    const res = await client.post(`/ai/tasks/${taskId}/generate-code`, payload);
    return res.data;
  },

  // 2. Perform AI code review (Security, OWASP, Performance, Clean Code)
  reviewCode: async (taskId, payload) => {
    const res = await client.post(`/ai/tasks/${taskId}/review-code`, payload);
    return res.data;
  },

  // 3. Generate automated unit tests (JUnit 5, Mockito, Jest, PyTest)
  generateUnitTests: async (taskId, payload = {}) => {
    const res = await client.post(`/ai/tasks/${taskId}/generate-unit-tests`, payload);
    return res.data;
  },

  // 4. Intelligently refactor source code (SOLID, Performance, Concurrency, Idiomatic)
  refactorCode: async (taskId, payload) => {
    const res = await client.post(`/ai/tasks/${taskId}/refactor-code`, payload);
    return res.data;
  },

  // 5. Get historical AI code suggestions for a task
  getSuggestionsByTask: async (taskId) => {
    const res = await client.get(`/ai/tasks/${taskId}/suggestions`);
    return res.data;
  },
};

export default aiCodeApi;
