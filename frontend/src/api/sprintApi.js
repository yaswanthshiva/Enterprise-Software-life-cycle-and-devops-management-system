import client from './client';

export const sprintApi = {
  // Create Sprint
  createSprint: async (projectId, data) => {
    const res = await client.post(`/projects/${projectId}/sprints`, data);
    return res.data;
  },

  // Get Sprints by Project (optional status filter: Planned, Active, Completed)
  getSprintsByProject: async (projectId, status) => {
    const params = status ? { status } : {};
    const res = await client.get(`/projects/${projectId}/sprints`, { params });
    return res.data;
  },

  // Get Active Sprint for Project
  getActiveSprint: async (projectId) => {
    const res = await client.get(`/projects/${projectId}/sprints/active`);
    return res.data;
  },

  // Get Sprint by ID
  getSprintById: async (sprintId) => {
    const res = await client.get(`/sprints/${sprintId}`);
    return res.data;
  },

  // Update Sprint details
  updateSprint: async (sprintId, data) => {
    const res = await client.put(`/sprints/${sprintId}`, data);
    return res.data;
  },

  // Transition Sprint to Active
  startSprint: async (sprintId) => {
    const res = await client.patch(`/sprints/${sprintId}/start`);
    return res.data;
  },

  // Transition Sprint to Completed
  completeSprint: async (sprintId) => {
    const res = await client.patch(`/sprints/${sprintId}/complete`);
    return res.data;
  },

  // Delete Sprint
  deleteSprint: async (sprintId) => {
    const res = await client.delete(`/sprints/${sprintId}`);
    return res.data;
  },

  // Get Kanban Board for Sprint (todoTasks, inProgressTasks, inReviewTasks, doneTasks)
  getKanbanBoard: async (sprintId) => {
    const res = await client.get(`/sprints/${sprintId}/kanban`);
    return res.data;
  },
};

export default sprintApi;
