import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { PageHeader, Card, Button, Input, Select, Alert } from '../components/ui';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import SchoolIcon from '@mui/icons-material/School';
import SaveIcon from '@mui/icons-material/Save';

const GRADE_LEVELS = ['Elementary School', 'Middle School', 'High School', 'Undergraduate', 'Graduate', 'Self-Learner', 'Other'];
const COMMON_SUBJECTS = ['Math', 'Science', 'Biology', 'Chemistry', 'Physics', 'English', 'History', 'Geography', 'Computer Science', 'Economics', 'Psychology', 'Art', 'Music'];

export default function ProfilePage() {
  const { user, updateProfile } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || '',
    school: user?.school || '',
    grade_level: user?.grade_level || '',
    subjects: user?.subjects || [],
  });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const setF = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));

  const toggleSubject = (subject) => {
    setForm(f => ({
      ...f,
      subjects: f.subjects.includes(subject)
        ? f.subjects.filter(s => s !== subject)
        : [...f.subjects, subject],
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return setError('Name is required.');
    setSaving(true);
    setError('');
    try {
      await updateProfile(form);
      setSuccess('Profile updated successfully.');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <PageHeader title="Profile" subtitle="Manage your account information" />

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}
      {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}

      {/* Avatar / Identity */}
      <Card>
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: '#FEF3C7' }}>
            <AccountCircleIcon style={{ fontSize: 40, color: '#F97316' }} />
          </div>
          <div>
            <p className="font-semibold text-lg" style={{ color: '#1A1A1A' }}>{user?.name}</p>
            <p className="text-sm" style={{ color: '#4A4A4A' }}>{user?.email}</p>
            {user?.role === 'admin' && (
              <span className="inline-flex mt-2 px-2.5 py-1 rounded-full text-xs font-semibold" style={{ background: '#FFF7ED', color: '#C2410C' }}>
                Admin access
              </span>
            )}
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-5">
          <Input
            label="Full name"
            placeholder="Your full name"
            value={form.name}
            onChange={setF('name')}
            required
          />
          <Input
            label="School / Institution"
            placeholder="e.g. Lincoln High School"
            value={form.school}
            onChange={setF('school')}
          />
          <Select label="Grade level" value={form.grade_level} onChange={setF('grade_level')}>
            <option value="">Select level</option>
            {GRADE_LEVELS.map(g => <option key={g} value={g}>{g}</option>)}
          </Select>

          {/* Subjects */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subjects you study
            </label>
            <div className="flex flex-wrap gap-2">
              {COMMON_SUBJECTS.map(subject => (
                <button
                  type="button"
                  key={subject}
                  onClick={() => toggleSubject(subject)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors min-h-[36px] ${
                    form.subjects.includes(subject)
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-orange-50 hover:text-orange-600'
                  }`}
                >
                  {subject}
                </button>
              ))}
            </div>
          </div>

          <Button type="submit" disabled={saving} icon={SaveIcon}>
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </form>
      </Card>

      {/* Account Info */}
      <Card>
        <h3 className="text-base font-semibold mb-4" style={{ color: '#1A1A1A' }}>Account Details</h3>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span style={{ color: '#4A4A4A' }}>Email address</span>
            <span className="font-medium" style={{ color: '#1A1A1A' }}>{user?.email}</span>
          </div>
          <div className="flex justify-between">
            <span style={{ color: '#4A4A4A' }}>Member since</span>
            <span className="font-medium" style={{ color: '#1A1A1A' }}>
              {user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '—'}
            </span>
          </div>
        </div>
      </Card>

      {/* API Key notice */}
      <Card>
        <div className="flex items-start gap-3">
          <SchoolIcon style={{ color: '#F97316', flexShrink: 0, marginTop: 2 }} />
          <div>
            <p className="font-semibold text-sm mb-1" style={{ color: '#1A1A1A' }}>Enable AI Features</p>
            <p className="text-sm" style={{ color: '#4A4A4A' }}>
              AI features require an Anthropic API key. Add it to your backend <code className="bg-gray-100 px-1 py-0.5 rounded text-xs">.env</code> file as <code className="bg-gray-100 px-1 py-0.5 rounded text-xs">ANTHROPIC_API_KEY</code>.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
