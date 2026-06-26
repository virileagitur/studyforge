import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button, Input, Alert } from '../components/ui';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12" style={{ background: '#FFFDF7' }}>
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4" style={{ background: '#FEF3C7' }}>
            <AutoStoriesIcon style={{ color: '#F97316', fontSize: 32 }} />
          </div>
          <h1 className="text-3xl font-bold" style={{ color: '#1A1A1A' }}>StudyForge</h1>
          <p className="text-sm mt-1" style={{ color: '#4A4A4A' }}>Sign in to your academic co-pilot</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl p-8" style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
          <h2 className="text-xl font-bold mb-6" style={{ color: '#1A1A1A' }}>Welcome back</h2>

          {error && <Alert type="error" message={error} onClose={() => setError('')} className="mb-4" />}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email address"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              required
              autoComplete="email"
            />
            <Input
              label="Password"
              type="password"
              placeholder="Enter your password"
              value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              required
              autoComplete="current-password"
            />
            <Button type="submit" disabled={loading} size="lg" className="w-full mt-2">
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <p className="text-center text-sm mt-6" style={{ color: '#4A4A4A' }}>
            New to StudyForge?{' '}
            <Link to="/register" className="font-semibold hover:underline" style={{ color: '#F97316' }}>
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
