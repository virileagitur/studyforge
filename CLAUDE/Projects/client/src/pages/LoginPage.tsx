import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Check if user is already logged in (optional, can be done in a higher component)
  // For now, we'll just handle the form submission.

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        credentials: 'omit',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Store the token and user data in localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify({
        id: data.id,
        name: data.name,
        email: data.email,
        school_grade: data.school_grade,
        subjects: data.subjects,
      }));

      // Redirect to dashboard
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='min-h-screen bg-light-background flex items-center justify-center py-4 px-4 sm:px-6 lg:px-8'>
      <div className='w-full max-w-md space-y-8'>
        <div>
          <h2 className='mt-6 text-center text-3xl font-extrabold text-text-primary'>
            Sign in to your account
          </h2>
          <p className='mt-2 text-center text-sm text-text-secondary'>
            Don't have an account yet?
              <Link
                to='/register'
                className='font-medium text-primary-orange hover:text-primary-orange-light'
              >
                Sign up
              </Link>
          </p>
        </div>
        <form className='mt-8 space-y-6' onSubmit={handleSubmit}>
          <div className='rounded-md shadow-sm -space-y-px'>
            <div>
              <label htmlFor='email-address' className='sr-only'>
                Email address
              </label>
              <input
                id='email-address'
                name='email'
                type='email'
                required
                autoComplete='email'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className='appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus-z-10 sm:text-sm'
                placeholder='Email address'
              />
            </div>
            <div>
              <label htmlFor='password' className='sr-only'>
                Password
              </label>
              <input
                id='password'
                name='password'
                type='password'
                required
                autoComplete='current-password'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className='appearance-none rounded-none block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus-z-10 sm:text-sm'
                placeholder='Password'
              />
            </div>
          </div>

          {error && (
            <p className='mt-2 text-sm text-red-600'>{error}</p>
          )}

          <div className='flex items-center justify-between'>
            <div className='flex items-center'>
              <input
                id='remember-me'
                name='remember-me'
                type='checkbox'
                checked={false} // We're not implementing remember me for now
                onChange={() => {}} // Placeholder
                className='h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded'
              />
              <label htmlFor='remember-me' className='ml-2 block text-sm text-text-secondary'>
                Remember me
              </label>
            </div>

            <div className='text-sm'>
              <a
                href='#'
                className='font-medium text-primary-orange hover:text-primary-orange-light'
              >
                Forgot password?
              </a>
            </div>
          </div>

          <div>
            <button
              type='submit'
              disabled={loading}
              className={`group relative w-full justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-orange hover:bg-primary-orange-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-orange ${
                loading ? 'opacity-50' : ''
              }`}
              >
                {loading ? 'Logging in...' : 'Sign in'}
              </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;