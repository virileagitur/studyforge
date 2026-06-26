import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

import AppLayout from './components/layout/AppLayout';
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

function RequireAuth({ children }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="flex items-center justify-center min-h-screen" style={{ background: '#FFFDF7' }}>
      <div className="text-center">
        <div className="w-10 h-10 border-4 border-orange-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-text-secondary">Loading StudyForge...</p>
      </div>
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function GuestOnly({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<GuestOnly><LoginPage /></GuestOnly>} />
          <Route path="/register" element={<GuestOnly><RegisterPage /></GuestOnly>} />

          <Route path="/" element={<RequireAuth><AppLayout /></RequireAuth>}>
            <Route index element={<DashboardPage />} />
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

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
