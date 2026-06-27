import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ChecklistIcon from '@mui/icons-material/Checklist';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import StyleIcon from '@mui/icons-material/Style';
import NoteAltIcon from '@mui/icons-material/NoteAlt';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import LogoutIcon from '@mui/icons-material/Logout';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';

const navItems = [
  { to: '/', label: 'Dashboard', icon: DashboardIcon, exact: true },
  { to: '/tasks', label: 'Tasks', icon: ChecklistIcon },
  { to: '/research', label: 'Research', icon: BookmarkIcon },
  { to: '/books', label: 'Books', icon: MenuBookIcon },
  { to: '/flashcards', label: 'Flashcards', icon: StyleIcon },
  { to: '/notes', label: 'Notes', icon: NoteAltIcon },
  { to: '/tutor', label: 'AI Tutor', icon: SmartToyIcon },
  { to: '/study-guide', label: 'Study Guide', icon: AutoStoriesIcon },
  { to: '/homework-scanner', label: 'Homework Scanner', icon: CameraAltIcon },
];

const mobileNavItems = [
  { to: '/', label: 'Dashboard', icon: DashboardIcon, exact: true },
  { to: '/tasks', label: 'Tasks', icon: ChecklistIcon },
  { to: '/flashcards', label: 'Flashcards', icon: StyleIcon },
  { to: '/tutor', label: 'Tutor', icon: SmartToyIcon },
  { to: '/notes', label: 'Notes', icon: NoteAltIcon },
];

const linkBase = 'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-150 min-h-[44px]';
const activeClass = 'bg-[var(--color-accent)/10] text-[var(--color-accent)] font-semibold';
const inactiveClass = 'text-[var(--color-text-muted)] hover:bg-[var(--color-background)/50] hover:text-[var(--color-text-primary)]';

export default function AppLayout() {
  const { user, logout } = useAuth();
  const { toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isAdmin = user?.role === 'admin';

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-[var(--color-border)/50] flex items-center gap-2">
        <AutoStoriesIcon style={{ color: 'var(--color-accent)' }} />
        <div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--color-accent)' }}>StudyForge</h1>
          <p className="text-xs text-gray-500 mt-0.5">Academic Copilot</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map(({ to, label, icon: Icon, exact }) => {
          const targetTo = to === '/' && user ? `/${encodeURIComponent(user.name?.toLowerCase().replace(/\s+/g, '-'))}/dashboard` : to;
          return (
            <NavLink
              key={to}
              to={targetTo}
              end={exact}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) => `${linkBase} ${isActive ? activeClass : inactiveClass}`}
            >
              <Icon fontSize="small" style={{ color: 'var(--color-text-primary)' }} />
              <span className="flex-1">{label}</span>
            </NavLink>
          );
        })}
        {isAdmin && (
          <NavLink
            to="/admin"
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) => `${linkBase} ${isActive ? activeClass : inactiveClass}`}
          >
            <AdminPanelSettingsIcon fontSize="small" style={{ color: 'var(--color-text-primary)' }} />
            <span className="flex-1">Admin Panel</span>
          </NavLink>
        )}
      </nav>

      {/* User + Theme Toggle */}
      <div className="px-3 py-4 border-t border-[var(--color-border)/50] flex flex-col items-center gap-2">
        <div className="flex items-center gap-3 w-full">
          {user?.profile_image ? (
            <img
              src={user.profile_image}
              alt={user.name}
              className="w-10 h-10 rounded-full object-cover border-2 border-[var(--color-border)]"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-[var(--color-accent)/20] flex items-center justify-center">
              <span className="text-[var(--color-accent)] font-bold text-sm">
                {user?.name?.charAt(0)?.toUpperCase() || '?'}
              </span>
            </div>
          )}
          <div className="flex-1 space-y-1">
            <p className="text-sm font-medium truncate text-[var(--color-text-primary)]">{user?.name}</p>
            <p className="text-xs text-[var(--color-text-muted)] truncate">{user?.email}</p>
          </div>
        </div>
        <div className="flex w-full justify-between">
          <button
            onClick={handleLogout}
            className={`${linkBase} w-full text-left text-[var(--color-text-muted)] hover:bg-[var(--color-background)/50] hover:text-[var(--color-text-primary)]`}
          >
            <LogoutIcon fontSize="small" style={{ color: 'var(--color-text-muted)' }} />
            <span>Sign Out</span>
          </button>
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-[var(--color-background)/50] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors"
            title="Toggle theme"
          >
            {/* Simple sun/moon icon based on current theme - we'd need theme state, but for now use a placeholder */}
            <span className="text-xl">🌓</span>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--color-background)' }}>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 flex-shrink-0 bg-[var(--color-surface)]" style={{ boxShadow: '2px 0 8px rgba(0,0,0,0.04)' }}>
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/30" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-72 bg-[var(--color-surface)] flex flex-col" style={{ boxShadow: '4px 0 16px rgba(0,0,0,0.1)' }}>
            <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-border)/50]">
              <div className="flex items-center gap-2">
                <AutoStoriesIcon style={{ color: 'var(--color-accent)' }} />
                <h1 className="text-lg font-bold" style={{ color: 'var(--color-accent)' }}>StudyForge</h1>
              </div>
              <button onClick={() => setSidebarOpen(false)} className="p-2 rounded-lg hover:bg-[var(--color-background)/50]">
                <CloseIcon />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <SidebarContent />
            </div>
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header */}
        <header className="lg:hidden flex items-center gap-3 px-4 py-3 bg-[var(--color-surface)]" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-lg hover:bg-[var(--color-background)/50] min-h-[44px] min-w-[44px] flex items-center justify-center">
            <MenuIcon />
          </button>
          <div className="flex items-center gap-2 flex-1">
            <AutoStoriesIcon style={{ color: 'var(--color-accent)' }} />
            <h1 className="text-lg font-bold" style={{ color: 'var(--color-accent)' }}>StudyForge</h1>
          </div>
          <NavLink to="/profile" className="flex-shrink-0">
            {user?.profile_image ? (
              <img
                src={user.profile_image}
                alt={user.name}
                className="w-9 h-9 rounded-full object-cover border-2 border-[var(--color-border)]"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-[var(--color-accent)/20] flex items-center justify-center">
                <span className="text-[var(--color-accent)] font-bold text-sm">
                  {user?.name?.charAt(0)?.toUpperCase() || '?'}
                </span>
              </div>
            )}
          </NavLink>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto pb-20 lg:pb-6">
          <div className="max-w-6xl mx-auto px-4 md:px-6 py-6">
            <Outlet />
          </div>
        </main>

        {/* Mobile Bottom Nav */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-[var(--color-surface)] border-t border-[var(--color-border)/50] flex z-40" style={{ boxShadow: '0 -2px 8px rgba(0,0,0,0.06)' }}>
          {mobileNavItems.map(({ to, label, icon: Icon, exact }) => {
            const targetTo = to === '/' && user ? `/${encodeURIComponent(user.name?.toLowerCase().replace(/\s+/g, '-'))}/dashboard` : to;
            return (
              <NavLink
                key={to}
                to={targetTo}
                end={exact}
                className={({ isActive }) =>
                  `flex-1 flex flex-col items-center justify-center py-2 gap-0.5 min-h-[56px] text-xs font-medium transition-colors ${isActive ? 'text-[var(--color-accent)]' : 'text-[var(--color-text-muted)]'}`
                }
              >
                <Icon fontSize="small" style={{ color: 'var(--color-text-primary)' }} />
                <span>{label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>
    </div>
  );
}