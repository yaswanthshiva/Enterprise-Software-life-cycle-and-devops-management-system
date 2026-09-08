import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  FolderKanban,
  Users2,
  FileText,
  Sparkles,
  KanbanSquare,
  Cpu,
  Bug,
  Rocket,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Hexagon
} from 'lucide-react';

export const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();

  const navItems = [
    { to: '/workspace', label: 'Overview', icon: LayoutDashboard, exact: true },
    { to: '/workspace/projects', label: 'Projects', icon: FolderKanban },
    { to: '/workspace/teams', label: 'Teams', icon: Users2 },
    { to: '/workspace/requirements', label: 'Requirements', icon: FileText },
    { to: '/workspace/ai/requirements', label: 'AI PRD Studio', icon: Sparkles, badge: 'AI' },
    { to: '/workspace/sprints', label: 'Sprints & Kanban', icon: KanbanSquare },
    { to: '/workspace/ai/code', label: 'AI Code Assistant', icon: Cpu, badge: 'AI' },
    { to: '/workspace/qa', label: 'QA & Issues', icon: Bug },
    { to: '/workspace/releases', label: 'Releases & CI/CD', icon: Rocket },
  ];

  // Admin and PM access to User Management
  const canManageUsers = user?.role === 'ADMIN' || user?.role === 'PROJECT_MANAGER';

  return (
    <aside style={{
      width: collapsed ? '72px' : '250px',
      transition: 'width 0.25s ease',
      backgroundColor: 'var(--bg-sidebar)',
      borderRight: '1px solid var(--border-subtle)',
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      position: 'sticky',
      top: 0,
      zIndex: 40,
      flexShrink: 0,
    }}>
      {/* Brand Header */}
      <div style={{
        height: '64px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: collapsed ? 'center' : 'space-between',
        padding: collapsed ? '0' : '0 18px',
        borderBottom: '1px solid var(--border-subtle)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '34px',
            height: '34px',
            borderRadius: '6px',
            background: 'linear-gradient(135deg, var(--primary) 0%, #ff8c26 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 15px var(--primary-glow)',
          }}>
            <Hexagon size={20} color="#000000" />
          </div>
          {!collapsed && (
            <span className="text-gradient-white" style={{
              fontFamily: 'var(--font-heading)',
              fontWeight: '700',
              fontSize: '1.15rem',
              letterSpacing: '-0.03em',
            }}>
              NeuroForge
            </span>
          )}
        </div>

        <button
          onClick={() => setCollapsed(!collapsed)}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            padding: '4px',
            display: collapsed ? 'none' : 'flex',
            alignItems: 'center',
            borderRadius: '4px',
          }}
          title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          <ChevronLeft size={18} />
        </button>
      </div>

      {/* Nav List */}
      <nav style={{
        flex: 1,
        overflowY: 'auto',
        padding: '12px 10px',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
      }}>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.exact}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 12px',
                borderRadius: '8px',
                color: isActive ? '#fff' : 'var(--text-secondary)',
                backgroundColor: isActive ? 'var(--primary-subtle)' : 'transparent',
                border: isActive ? '1px solid var(--border-focus)' : '1px solid transparent',
                fontWeight: isActive ? '600' : '400',
                fontSize: '0.88rem',
                textDecoration: 'none',
                transition: 'all 0.15s ease',
                justifyContent: collapsed ? 'center' : 'flex-start',
              })}
              title={collapsed ? item.label : undefined}
            >
              <Icon size={18} style={{ flexShrink: 0 }} />
              {!collapsed && <span style={{ flex: 1 }}>{item.label}</span>}
              {!collapsed && item.badge && (
                <span style={{
                  padding: '2px 6px',
                  borderRadius: '4px',
                  background: 'linear-gradient(135deg, var(--primary) 0%, var(--violet) 100%)',
                  color: '#fff',
                  fontSize: '0.65rem',
                  fontWeight: '700',
                  letterSpacing: '0.05em',
                }}>
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}

        {canManageUsers && (
          <>
            <div style={{
              margin: '12px 6px 6px 6px',
              borderTop: '1px solid var(--border-subtle)',
              paddingTop: '10px',
              fontSize: '0.7rem',
              fontWeight: '700',
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              display: collapsed ? 'none' : 'block',
            }}>
              Administration
            </div>
            <NavLink
              to="/workspace/users"
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 12px',
                borderRadius: '8px',
                color: isActive ? '#fff' : 'var(--text-secondary)',
                backgroundColor: isActive ? 'var(--primary-subtle)' : 'transparent',
                border: isActive ? '1px solid var(--border-focus)' : '1px solid transparent',
                fontWeight: isActive ? '600' : '400',
                fontSize: '0.88rem',
                textDecoration: 'none',
                justifyContent: collapsed ? 'center' : 'flex-start',
              })}
              title={collapsed ? 'User Directory' : undefined}
            >
              <ShieldCheck size={18} style={{ flexShrink: 0 }} />
              {!collapsed && <span>User Directory</span>}
            </NavLink>
          </>
        )}
      </nav>

      {/* Footer Profile & Logout */}
      <div style={{
        padding: '12px',
        borderTop: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: collapsed ? 'center' : 'space-between',
        gap: '8px',
      }}>
        {!collapsed && user && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            minWidth: 0,
            flex: 1,
          }}>
            <span style={{
              fontSize: '0.85rem',
              fontWeight: '600',
              color: 'var(--text-primary)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}>
              {user.fullName || user.email}
            </span>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              {user.role}
            </span>
          </div>
        )}

        <button
          onClick={logout}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            padding: '8px',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'color 0.15s ease, background-color 0.15s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'var(--danger)';
            e.currentTarget.style.backgroundColor = 'var(--danger-bg)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'var(--text-muted)';
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
          title="Sign Out"
        >
          <LogOut size={18} />
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
