import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

import AppLayout from './components/layout/AppLayout';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import TasksPage from './pages/TasksPage';
import ResearchPage from './pages/ResearchPage';
import BooksPage from './pages/BooksPage';
import FlashcardsPage from './pages/FlashcardsPage';
import NotesPage from './pages/NotesPage';
import NoteEditorPage from './pages/NoteEditorPage';
import TutorPage from './pages/TutorPage';
import StudyGuidePage from './pages/StudyGuidePage';
import HomeworkScannerPage from './pages/HomeworkScannerPage';
import ProfilePage from './pages/ProfilePage';
import AdminPage from './pages/AdminPage';
import OnboardingPage from './pages/OnboardingPage';

function RequireAuth({ children }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="flex items-center justify-center min-h-screen" style={{ background: '#F5F0E8' }}>
      <div className="text-center">
        <div className="w-10 h-10 border-4 border-[#8DA9A0] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-[#4A4A4A]">Loading StudyForge...</p>
      </div>
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function GuestOnly({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) {
    const slug = encodeURIComponent(user.name?.toLowerCase().replace(/\s+/g, '-'));
    return <Navigate to={`/${slug}/dashboard`} replace />;
  }
  return children;
}

function WildcardRoute() {
  const { user } = useAuth();
  if (user) {
    const slug = encodeURIComponent(user.name?.toLowerCase().replace(/\s+/g, '-'));
    return <Navigate to={`/${slug}/dashboard`} replace />;
  }
  return <Navigate to="/" replace />;
}

function OnboardingGuard({ children }) {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.onboarding_completed) {
      const slug = encodeURIComponent(user.name?.toLowerCase().replace(/\s+/g, '-'));
      navigate(`/${slug}/dashboard`, { replace: true });
    }
  }, [user, navigate]);

  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<GuestOnly><LoginPage /></GuestOnly>} />
          <Route path="/register" element={<GuestOnly><RegisterPage /></GuestOnly>} />

          {/* Onboarding (full-screen, no sidebar) */}
          <Route path="/onboarding" element={<RequireAuth><OnboardingGuard><OnboardingPage /></OnboardingGuard></RequireAuth>} />

          {/* Authenticated Application Shell */}
          <Route path="/" element={<RequireAuth><AppLayout /></RequireAuth>}>
            <Route path=":name/dashboard" element={<DashboardPage />} />
            <Route path="tasks" element={<TasksPage />} />
            <Route path="research" element={<ResearchPage />} />
            <Route path="books" element={<BooksPage />} />
            <Route path="flashcards" element={<FlashcardsPage />} />
            <Route path="notes" element={<NotesPage />} />
            <Route path="notes/:id" element={<NoteEditorPage />} />
            <Route path="tutor" element={<TutorPage />} />
            <Route path="study-guide" element={<StudyGuidePage />} />
            <Route path="homework-scanner" element={<HomeworkScannerPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="admin" element={<AdminPage />} />
          </Route>

          <Route path="*" element={<WildcardRoute />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
