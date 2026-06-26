import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Dashboard from './pages/Dashboard';
import TasksPage from './pages/tasks/TasksPage';
import TaskForm from './components/tasks/TaskForm';
import BookmarksPage from './pages/bookmarks/BookmarksPage';
import BookmarkForm from './components/bookmarks/BookmarkForm';

const App: React.FC = () => {
  // Check if user is authenticated by looking for token in localStorage
  const isAuthenticated = () => {
    return localStorage.getItem('token') !== null;
  };

  return (
    <BrowserRouter>
      <div className='min-h-screen bg-light-background text-text-primary'>
        <Routes>
          <Route path='/login' element={<LoginPage />} />
          <Route path='/register' element={<RegisterPage />} />
          <Route
            path='/dashboard'
            element={
              isAuthenticated() ? <Dashboard /> : <Navigate replace to='/login' />
            }
          />
          <Route
            path='/tasks'
            element={
              isAuthenticated() ? <TasksPage /> : <Navigate replace to='/login' />
            }
          />
          <Route
            path='/tasks/new'
            element={
              isAuthenticated() ? <TaskForm /> : <Navigate replace to='/login' />
            }
          />
          <Route
            path='/tasks/:id/edit'
            element={
              isAuthenticated() ? <TaskForm /> : <Navigate replace to='/login' />
            }
          />
          <Route
            path='/bookmarks'
            element={
              isAuthenticated() ? <BookmarksPage /> : <Navigate replace to='/login' />
            }
          />
          <Route
            path='/bookmarks/new'
            element={
              isAuthenticated() ? <BookmarkForm /> : <Navigate replace to='/login' />
            }
          />
          <Route
            path='/bookmarks/:id/edit'
            element={
              isAuthenticated() ? <BookmarkForm /> : <Navigate replace to='/login' />
            }
          />
          {/* Redirect root to login */}
          <Route path='*' element={<Navigate replace to='/login' />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
};

export default App;