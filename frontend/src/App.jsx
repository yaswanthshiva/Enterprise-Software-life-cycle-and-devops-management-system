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
import Requirements from './pages/Requirements';
import AiPrdStudio from './pages/AiPrdStudio';
import Sprints from './pages/Sprints';
import AiCodeStudio from './pages/AiCodeStudio';
import QualityAssurance from './pages/QualityAssurance';
import Releases from './pages/Releases';
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
            {/* SDLC Module 04: Requirements Engineering & User Stories */}
            <Route path="requirements" element={<Requirements />} />
            {/* SDLC Module 05: AI PRD Studio with Gemini */}
            <Route path="ai/requirements" element={<AiPrdStudio />} />
            {/* SDLC Module 06: Agile Sprints & Interactive Kanban Board */}
            <Route path="sprints" element={<Sprints />} />
            {/* SDLC Module 07: AI Code Intelligence Studio with Gemini */}
            <Route path="ai/code" element={<AiCodeStudio />} />
            {/* SDLC Module 08: Quality Assurance & Defect Tracking */}
            <Route path="qa" element={<QualityAssurance />} />
            {/* SDLC Module 09: Release Command Center & CI/CD Deployment Orchestrator */}
            <Route path="releases" element={<Releases />} />
          </Route>

          {/* Fallback to entrance */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
