import client from './client';

export const qaApi = {
  // ==========================================
  // TEST CASE MANAGEMENT ENDPOINTS
  // ==========================================

  // Create new test case
  createTestCase: async (data) => {
    const res = await client.post('/test-cases', data);
    return res.data;
  },

  // Get test cases by project
  getTestCasesByProject: async (projectId) => {
    const res = await client.get(`/projects/${projectId}/test-cases`);
    return res.data;
  },

  // Get test cases by sprint
  getTestCasesBySprint: async (sprintId) => {
    const res = await client.get(`/sprints/${sprintId}/test-cases`);
    return res.data;
  },

  // Get test cases by task
  getTestCasesByTask: async (taskId) => {
    const res = await client.get(`/tasks/${taskId}/test-cases`);
    return res.data;
  },

  // Get test case by ID
  getTestCaseById: async (testCaseId) => {
    const res = await client.get(`/test-cases/${testCaseId}`);
    return res.data;
  },

  // Update test case
  updateTestCase: async (testCaseId, data) => {
    const res = await client.put(`/test-cases/${testCaseId}`, data);
    return res.data;
  },

  // Execute test case (Update pass/fail/blocked verdict & notes)
  executeTestCase: async (testCaseId, data) => {
    const res = await client.patch(`/test-cases/${testCaseId}/execute`, data);
    return res.data;
  },

  // Delete test case
  deleteTestCase: async (testCaseId) => {
    const res = await client.delete(`/test-cases/${testCaseId}`);
    return res.data;
  },

  // ==========================================
  // DEFECT & ISSUE TRACKING ENDPOINTS
  // ==========================================

  // Report new issue/defect
  createIssue: async (data) => {
    const res = await client.post('/issues', data);
    return res.data;
  },

  // Get all issues for a project with optional filters (status, severity)
  getIssuesByProject: async (projectId, status, severity) => {
    const params = {};
    if (status && status !== 'ALL') params.status = status;
    if (severity && severity !== 'ALL') params.severity = severity;
    const res = await client.get(`/projects/${projectId}/issues`, { params });
    return res.data;
  },

  // Get issues linked to a task
  getIssuesByTask: async (taskId) => {
    const res = await client.get(`/tasks/${taskId}/issues`);
    return res.data;
  },

  // Get issues assigned to the logged-in user
  getMyAssignedIssues: async (status) => {
    const params = {};
    if (status && status !== 'ALL') params.status = status;
    const res = await client.get('/issues/my-assigned', { params });
    return res.data;
  },

  // Get issues reported by the logged-in user
  getMyReportedIssues: async () => {
    const res = await client.get('/issues/my-reported');
    return res.data;
  },

  // Get issue by ID
  getIssueById: async (issueId) => {
    const res = await client.get(`/issues/${issueId}`);
    return res.data;
  },

  // Update issue details
  updateIssue: async (issueId, data) => {
    const res = await client.put(`/issues/${issueId}`, data);
    return res.data;
  },

  // Transition issue status (Open, In Progress, Resolved, Closed, Reopened)
  updateIssueStatus: async (issueId, data) => {
    const res = await client.patch(`/issues/${issueId}/status`, data);
    return res.data;
  },

  // Reassign issue to developer
  assignIssue: async (issueId, userId) => {
    const res = await client.patch(`/issues/${issueId}/assign?userId=${userId}`);
    return res.data;
  },

  // Delete issue
  deleteIssue: async (issueId) => {
    const res = await client.delete(`/issues/${issueId}`);
    return res.data;
  },

  // Get live QA telemetry metrics for a project
  getProjectQaMetrics: async (projectId) => {
    const res = await client.get(`/projects/${projectId}/qa-metrics`);
    return res.data;
  },
};

export default qaApi;
