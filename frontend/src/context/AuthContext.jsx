import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/authApi';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('neuroforge_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('neuroforge_token') || null);
  const [loading, setLoading] = useState(true);

  // Validate session on mount
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('neuroforge_token');
      if (storedToken) {
        try {
          const res = await authApi.getCurrentUser();
          if (res && res.data) {
            const userData = {
              userId: res.data.userId,
              email: res.data.email,
              fullName: res.data.name || res.data.fullName,
              role: res.data.role,
              isActive: res.data.isActive,
              createdAt: res.data.createdAt,
            };
            setUser(userData);
            localStorage.setItem('neuroforge_user', JSON.stringify(userData));
          }
        } catch (err) {
          console.error('Session validation failed:', err);
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (credentials) => {
    const res = await authApi.login(credentials);
    const data = res?.data;
    // Backend JwtResponse returns 'token' and 'name'
    const jwt = data?.token || data?.accessToken;
    if (data && jwt) {
      const userData = {
        userId: data.userId,
        email: data.email,
        fullName: data.name || data.fullName,
        role: data.role,
      };
      localStorage.setItem('neuroforge_token', jwt);
      localStorage.setItem('neuroforge_user', JSON.stringify(userData));
      setToken(jwt);
      setUser(userData);
      return userData;
    }
    throw new Error('Invalid response format from server');
  };

  const register = async (userData) => {
    // Send registration payload (matching backend RegisterRequest: name, email, password, role)
    const res = await authApi.register(userData);
    // After successful user creation, automatically authenticate to get JWT token
    if (userData.email && userData.password) {
      return await login({ email: userData.email, password: userData.password });
    }
    return res;
  };

  const logout = () => {
    localStorage.removeItem('neuroforge_token');
    localStorage.removeItem('neuroforge_user');
    setToken(null);
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const res = await authApi.getCurrentUser();
      if (res && res.data) {
        const userData = {
          userId: res.data.userId,
          email: res.data.email,
          fullName: res.data.name || res.data.fullName,
          role: res.data.role,
          isActive: res.data.isActive,
          createdAt: res.data.createdAt,
        };
        setUser(userData);
        localStorage.setItem('neuroforge_user', JSON.stringify(userData));
      }
    } catch (err) {
      console.error('Failed to refresh user:', err);
    }
  };

  // Standardized RBAC role checks
  const rawRole = (user?.role || '').toUpperCase();
  const isAdmin = rawRole.includes('ADMIN');
  const isProjectManager = rawRole.includes('MANAGER') || rawRole.includes('PROJECT_MANAGER');
  const isBusinessAnalyst = rawRole.includes('ANALYST');
  const isDeveloper = (rawRole.includes('DEV') && !rawRole.includes('DEVOPS')) || rawRole === 'DEVELOPER';
  const isTester = rawRole.includes('TEST') || rawRole.includes('QA');
  const isDevOps = rawRole.includes('DEVOPS');

  // Unified RBAC permission capabilities
  const canCreateProject = isAdmin || isProjectManager;
  const canManageProjects = isAdmin || isProjectManager;
  const canManageTeams = isAdmin || isProjectManager;
  const canManageUsers = isAdmin || isProjectManager;
  const canManageRequirements = isAdmin || isProjectManager || isBusinessAnalyst;
  const canUpdateStoryStatus = isAdmin || isProjectManager || isBusinessAnalyst || isDeveloper;

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!token && !!user,
    login,
    register,
    logout,
    refreshUser,
    // Role flags
    isAdmin,
    isProjectManager,
    isBusinessAnalyst,
    isDeveloper,
    isTester,
    isDevOps,
    // Permission capabilities
    canCreateProject,
    canManageProjects,
    canManageTeams,
    canManageUsers,
    canManageRequirements,
    canUpdateStoryStatus,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
