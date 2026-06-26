import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const RegisterPage: React.FC = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          password,
        }),
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      // Store the token and user data in localStorage
      localStorage.setItem('token', data.token);
      // Note: the backend returns _id, but we store as id for consistency
      localStorage.setItem('user', JSON.stringify({
        id: data._id || data.id,
        name: `${data.firstName} ${data.lastName}`.trim(),
        email: data.email,
        school_grade: '', // Not provided in registration, we can leave empty or set from body
        subjects: [], // Not provided in registration
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
            Create your account
          </h2>
          <p className='mt-2 text-center text-sm text-text-secondary'>
            Already have an account?
              <Link
                to='/login'
                className='font-medium text-primary-orange hover:text-primary-orange-light'
              >
                Sign in
              </Link>
          </p>
        </div>
        {success && (
          <div className='mb-4 p-3 bg-green-100 text-green-800 rounded'>
            {success}
          </div>
        )}
        {error && (
          <div className='mb-4 p-3 bg-red-100 text-red-800 rounded'>
            {error}
          </div>
        )}
        <form className='mt-8 space-y-6' onSubmit={handleSubmit}>
          <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
            <div>
              <label htmlFor='first-name' className='sr-only'>
                First name
              </label>
              <input
                id='first-name'
                name='firstName'
                type='text'
                required
                autoComplete='given-name'
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className='appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus-z-10 sm:text-sm'
                placeholder='First name'
              />
            </div>
            <div>
              <label htmlFor='last-name' className='sr-only'>
                Last name
              </label>
              <input
                id='last-name'
                name='lastName'
                type='text'
                required
                autoComplete='family-name'
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className='appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus-z-10 sm:text-sm'
                placeholder='Last name'
              />
            </div>
          </div>

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
              autoComplete='new-password'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className='appearance-none rounded-none block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus-z-10 sm:text-sm'
              placeholder='Password'
            />
          </div>

          <div>
            <button
              type='submit'
              disabled={loading}
              className={`group relative w-full justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-orange hover:bg-primary-orange-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-orange ${
                loading ? 'opacity-50' : ''
              }`}
              >
                {loading ? 'Creating account...' : 'Create account'}
              </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;