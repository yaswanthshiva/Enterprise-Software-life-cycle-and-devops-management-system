import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AppLayout from './components/layout/AppLayout';

// Public Pages
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';

// Workspace & Module Pages
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import UserDirectory from './pages/UserDirectory';
import Projects from './pages/Projects';
import ProjectDetail from './pages/ProjectDetail';
import Teams from './pages/Teams';
import ModulePlaceholder from './pages/ModulePlaceholder';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Entrance / Landing Page (Option 1: Minimal & Sleek) */}
          <Route path="/" element={<LandingPage />} />

          {/* Authentication Pages */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Enterprise SDLC Workspace */}
          <Route
            path="/workspace"
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            {/* Overview Dashboard & Profile */}
            <Route index element={<Dashboard />} />
            <Route path="profile" element={<Profile />} />

            {/* Administration / User Directory (Admin & PM) */}
            <Route
              path="users"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'PROJECT_MANAGER']}>
                  <UserDirectory />
                </ProtectedRoute>
              }
            />

            {/* SDLC Module 02: Project Portfolios & Governance */}
            <Route path="projects" element={<Projects />} />
            <Route path="projects/:projectId" element={<ProjectDetail />} />

            {/* SDLC Module 03: Team Workspaces & Collaborators */}
            <Route path="teams" element={<Teams />} />
            <Route
              path="requirements"
              element={
                <ModulePlaceholder
                  moduleNumber="04"
                  title="Requirements Engineering & User Stories"
                  description="PRD specifications, user story breakdowns, and acceptance criteria verification."
                  nextStep="Step 4"
                />
              }
            />
            <Route
              path="ai/requirements"
              element={
                <ModulePlaceholder
                  moduleNumber="05"
                  title="AI Requirements Studio"
                  description="Autonomous Gemini AI prompt-to-PRD generator and interactive acceptance review."
                  nextStep="Step 5"
                />
              }
            />
            <Route
              path="sprints"
              element={
                <ModulePlaceholder
                  moduleNumber="06"
                  title="Agile Sprints & Kanban Board"
                  description="Sprint milestones, velocity tracking, and interactive drag-and-drop task boards."
                  nextStep="Step 6"
                />
              }
            />
            <Route
              path="ai/code"
              element={
                <ModulePlaceholder
                  moduleNumber="07"
                  title="AI Code Intelligence Studio"
                  description="Autonomous code synthesis, syntax code review, and automated JUnit test generation."
                  nextStep="Step 7"
                />
              }
            />
            <Route
              path="qa"
              element={
                <ModulePlaceholder
                  moduleNumber="08"
                  title="Quality Assurance & Issue Tracking"
                  description="Test case test suites, bug triage severity tracking, and QA health metrics."
                  nextStep="Step 8"
                />
              }
            />
            <Route
              path="releases"
              element={
                <ModulePlaceholder
                  moduleNumber="09"
                  title="Release Command Center & CI/CD"
                  description="Semantic release versioning, staging/production deployments, and deployment audit logs."
                  nextStep="Step 9"
                />
              }
            />
          </Route>

          {/* Fallback to entrance */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
