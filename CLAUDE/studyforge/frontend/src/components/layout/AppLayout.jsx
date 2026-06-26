import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
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
  { to: '/', label: 'Home', icon: DashboardIcon, exact: true },
  { to: '/tasks', label: 'Tasks', icon: ChecklistIcon },
  { to: '/flashcards', label: 'Cards', icon: StyleIcon },
  { to: '/tutor', label: 'Tutor', icon: SmartToyIcon },
  { to: '/notes', label: 'Notes', icon: NoteAltIcon },
];

const linkBase = 'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-150 min-h-[44px]';
const activeClass = 'bg-orange-50 text-orange-600 font-semibold';
const inactiveClass = 'text-gray-600 hover:bg-orange-50 hover:text-orange-500';

export default function AppLayout() {
  const { user, logout } = useAuth();
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
      <div className="px-6 py-5 border-b border-orange-100">
        <h1 className="text-xl font-bold" style={{ color: '#F97316' }}>StudyForge</h1>
        <p className="text-xs text-gray-500 mt-0.5">Academic Co-pilot</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map(({ to, label, icon: Icon, exact }) => (
          <NavLink
            key={to}
            to={to}
            end={exact}
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) => `${linkBase} ${isActive ? activeClass : inactiveClass}`}
          >
            <Icon fontSize="small" />
            <span>{label}</span>
          </NavLink>
        ))}
        {isAdmin && (
          <NavLink
            to="/admin"
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) => `${linkBase} ${isActive ? activeClass : inactiveClass}`}
          >
            <AdminPanelSettingsIcon fontSize="small" />
            <span>Admin Access</span>
          </NavLink>
        )}
      </nav>

      {/* User + Logout */}
      <div className="px-3 py-4 border-t border-orange-100">
        <NavLink
          to="/profile"
          onClick={() => setSidebarOpen(false)}
          className={({ isActive }) => `${linkBase} ${isActive ? activeClass : inactiveClass}`}
        >
          <AccountCircleIcon fontSize="small" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.name}</p>
            <p className="text-xs text-gray-400 truncate">{user?.email}</p>
          </div>
        </NavLink>
        <button
          onClick={handleLogout}
          className={`${linkBase} ${inactiveClass} w-full mt-1 text-left`}
        >
          <LogoutIcon fontSize="small" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#FFFDF7' }}>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 flex-shrink-0 bg-white" style={{ boxShadow: '2px 0 8px rgba(0,0,0,0.04)' }}>
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/30" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-72 bg-white flex flex-col" style={{ boxShadow: '4px 0 16px rgba(0,0,0,0.1)' }}>
            <div className="flex items-center justify-between px-4 py-3 border-b border-orange-100">
              <h1 className="text-lg font-bold" style={{ color: '#F97316' }}>StudyForge</h1>
              <button onClick={() => setSidebarOpen(false)} className="p-2 rounded-lg hover:bg-gray-100">
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
        <header className="lg:hidden flex items-center gap-3 px-4 py-3 bg-white" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-lg hover:bg-gray-100 min-h-[44px] min-w-[44px] flex items-center justify-center">
            <MenuIcon />
          </button>
          <h1 className="text-lg font-bold" style={{ color: '#F97316' }}>StudyForge</h1>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto pb-20 lg:pb-6">
          <div className="max-w-6xl mx-auto px-4 md:px-6 py-6">
            <Outlet />
          </div>
        </main>

        {/* Mobile Bottom Nav */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex z-40" style={{ boxShadow: '0 -2px 8px rgba(0,0,0,0.06)' }}>
          {mobileNavItems.map(({ to, label, icon: Icon, exact }) => (
            <NavLink
              key={to}
              to={to}
              end={exact}
              className={({ isActive }) =>
                `flex-1 flex flex-col items-center justify-center py-2 gap-0.5 min-h-[56px] text-xs font-medium transition-colors ${isActive ? 'text-orange-500' : 'text-gray-500'}`
              }
            >
              <Icon fontSize="small" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
}
