import client from './client';

export const taskApi = {
  // Create Task in Sprint
  createTask: async (data) => {
    const res = await client.post('/tasks', data);
    return res.data;
  },

  // Get Tasks by Sprint (optional status filter)
  getTasksBySprint: async (sprintId, status) => {
    const params = status ? { status } : {};
    const res = await client.get(`/sprints/${sprintId}/tasks`, { params });
    return res.data;
  },

  // Get Tasks by User Story
  getTasksByStory: async (storyId) => {
    const res = await client.get(`/user-stories/${storyId}/tasks`);
    return res.data;
  },

  // Get Tasks assigned to current authenticated user
  getMyTasks: async (status) => {
    const params = status ? { status } : {};
    const res = await client.get('/tasks/my-tasks', { params });
    return res.data;
  },

  // Get Task by ID
  getTaskById: async (taskId) => {
    const res = await client.get(`/tasks/${taskId}`);
    return res.data;
  },

  // Update Task
  updateTask: async (taskId, data) => {
    const res = await client.put(`/tasks/${taskId}`, data);
    return res.data;
  },

  // Update Task Status (To Do, In Progress, In Review, Done)
  updateTaskStatus: async (taskId, status) => {
    const res = await client.patch(`/tasks/${taskId}/status`, { status });
    return res.data;
  },

  // Assign Task to User
  assignTask: async (taskId, userId) => {
    const res = await client.patch(`/tasks/${taskId}/assign`, { userId });
    return res.data;
  },

  // Delete Task
  deleteTask: async (taskId) => {
    const res = await client.delete(`/tasks/${taskId}`);
    return res.data;
  },
};

export default taskApi;
