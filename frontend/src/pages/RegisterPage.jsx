import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button, Input, Select, Alert } from '../components/ui';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';

const GRADE_LEVELS = ['Elementary School', 'Middle School', 'High School', 'Undergraduate', 'Graduate', 'Self-Learner', 'Other'];

export default function RegisterPage() {
  const { register, googleLogin } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', school: '', grade_level: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 8) {
      return setError('Password must be at least 8 characters.');
    }
    setLoading(true);
    try {
      await register(form);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleCallback = async (response) => {
    setError('');
    setLoading(true);
    try {
      await googleLogin(response.credential);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Google sign-up failed.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initializeGoogleBtn = () => {
      if (!window.google) return;
      window.google.accounts.id.initialize({
        client_id: '1050910884095-gkdcdijcn25s3f9leaq25b87snrf9b6t.apps.googleusercontent.com',
        callback: handleGoogleCallback,
      });
      window.google.accounts.id.renderButton(
        document.getElementById('googleSignUpBtn'),
        { theme: 'outline', size: 'large', width: '384', text: 'signup_with' }
      );
    };

    if (window.google) {
      initializeGoogleBtn();
    } else {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = initializeGoogleBtn;
      document.head.appendChild(script);
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12" style={{ background: '#F5F0E8' }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4" style={{ background: 'var(--color-primary-bg)' }}>
            <AutoStoriesIcon style={{ color: '#8DA9A0', fontSize: 32 }} />
          </div>
          <h1 className="text-3xl font-bold" style={{ color: '#2C2C2C' }}>StudyForge</h1>
          <p className="text-sm mt-1" style={{ color: '#4A4A4A' }}>Create your co-pilot account</p>
        </div>

        <div className="bg-white rounded-2xl p-8" style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
          <h2 className="text-xl font-bold mb-6" style={{ color: '#2C2C2C' }}>Get started</h2>

          {error && <Alert type="error" message={error} onClose={() => setError('')} />}

          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <Input label="Full name" type="text" placeholder="Jane Smith" value={form.name} onChange={set('name')} required />
            <Input label="Email address" type="email" placeholder="you@example.com" value={form.email} onChange={set('email')} required autoComplete="email" />
            <Input label="Password" type="password" placeholder="At least 8 characters" value={form.password} onChange={set('password')} required autoComplete="new-password" />
            <Input label="School / Institution (optional)" type="text" placeholder="e.g. Lincoln High School" value={form.school} onChange={set('school')} />
            <Select label="Grade level (optional)" value={form.grade_level} onChange={set('grade_level')}>
              <option value="">Select your level</option>
              {GRADE_LEVELS.map(g => <option key={g} value={g}>{g}</option>)}
            </Select>

            <Button type="submit" disabled={loading} size="lg" className="w-full mt-2">
              {loading ? 'Creating account...' : 'Create Account'}
            </Button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center justify-between">
            <span className="border-b w-[40%]"></span>
            <span className="text-xs text-center text-gray-400 uppercase font-semibold">or</span>
            <span className="border-b w-[40%]"></span>
          </div>

          {/* Google Sign-up */}
          <div className="flex justify-center min-h-[44px]">
            <div id="googleSignUpBtn" className="w-full flex justify-center"></div>
          </div>

          <p className="text-center text-sm mt-6" style={{ color: '#4A4A4A' }}>
            Already have an account?{' '}
            <Link to="/login" className="font-semibold hover:underline" style={{ color: '#5F8B8B' }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
