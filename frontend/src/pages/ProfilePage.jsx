import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';
import { PageHeader, Card, Button, Input, Select, Alert, Modal } from '../components/ui';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import SchoolIcon from '@mui/icons-material/School';
import SaveIcon from '@mui/icons-material/Save';
import EditIcon from '@mui/icons-material/Edit';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

const GRADE_LEVELS = ['Elementary School', 'Middle School', 'High School', 'Undergraduate', 'Graduate', 'Self-Learner', 'Other'];
const COMMON_SUBJECTS = ['Math', 'Science', 'Biology', 'Chemistry', 'Physics', 'English', 'History', 'Geography', 'Computer Science', 'Economics', 'Psychology', 'Art', 'Music'];

export default function ProfilePage() {
  const { user, updateProfile, logout } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [form, setForm] = useState({
    name: user?.name || '',
    school: user?.school || '',
    grade_level: user?.grade_level || '',
    subjects: user?.subjects || [],
    profile_image: user?.profile_image || '',
  });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Delete account state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteForm, setDeleteForm] = useState({ password: '', confirm: '' });
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const setF = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));

  const toggleSubject = (subject) => {
    setForm(f => ({
      ...f,
      subjects: f.subjects.includes(subject)
        ? f.subjects.filter(s => s !== subject)
        : [...f.subjects, subject],
    }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setError('');
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const size = 160; // 160x160 for crisp avatar rendering
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');

        // Center crop the image into the canvas
        const minDim = Math.min(img.width, img.height);
        const sx = (img.width - minDim) / 2;
        const sy = (img.height - minDim) / 2;

        ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, size, size);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.88);

        setForm(f => ({ ...f, profile_image: dataUrl }));
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
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

  const handleDeleteAccount = async () => {
    setDeleteError('');
    if (deleteForm.confirm.trim().toLowerCase() !== 'delete my account') {
      setDeleteError('Please type "delete my account" exactly to confirm.');
      return;
    }
    setDeleting(true);
    try {
      // Note: The endpoint might be different; adjust if needed
      await api.delete('/auth/me', { data: { password: deleteForm.password, confirm: deleteForm.confirm } });
      await logout();
      navigate('/');
    } catch (err) {
      setDeleteError(err.response?.data?.error || 'Failed to delete account. Please check your password.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <PageHeader title="Profile" subtitle="Manage your account information" />

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}
      {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}

      {/* Avatar / Identity */}
      <Card>
        <div className="flex items-center gap-6 mb-6">
          <div
            onClick={() => fileInputRef.current?.click()}
            className="w-20 h-20 rounded-full overflow-hidden relative flex items-center justify-center cursor-pointer hover:opacity-90 transition-opacity"
            title="Click to change profile image"
          >
            {form.profile_image ? (
              <img src={form.profile_image} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <div className="flex w-full h-full items-center justify-center bg-[var(--color-surface-raised)]">
                <AccountCircleIcon style={{ fontSize: 48, color: 'var(--color-accent)' }} />
              </div>
            )}
            <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded">
              <EditIcon style={{ color: 'white', fontSize: 20 }} />
            </div>
          </div>
          <input type="file" ref={fileInputRef} accept="image/*" className="hidden" onChange={handleImageUpload} />

          <div>
            <p className="font-bold text-xl" style={{ color: 'var(--color-text-primary)' }}>{user?.name}</p>
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>{user?.email}</p>
            <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
              Member since {user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long' }) : '—'}
            </p>
            {user?.role === 'admin' && (
              <span className="inline-flex mt-2 px-2.5 py-1 rounded-full text-xs font-semibold bg-[var(--color-success)/10] text-[var(--color-success)] border border-[var(--color-success)/20]">
                Admin Access
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
            {GRADE_LEVELS.map(g => (
              <option key={g} value={g}>{g}</option>
            ))}
          </Select>

          {/* Subjects */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-secondary)' }}>
              Subjects you study
            </label>
            <div className="flex flex-wrap gap-2">
              {COMMON_SUBJECTS.map(subject => (
                <button
                  key={subject}
                  type="button"
                  onClick={() => toggleSubject(subject)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border border-[var(--color-border)] ${form.subjects.includes(subject)
                    ? 'bg-[var(--color-accent)] text-white'
                    : 'bg-[var(--color-background)] text-[var(--color-text-secondary)] hover:bg-[var(--color-background)/50]'
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

      {/* Account Details */}
      <Card>
        <h3 className="text-base font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>Account Details</h3>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-[var(--color-text-secondary)]">Email address</span>
            <span className="font-medium" style={{ color: 'var(--color-text-primary)' }}>{user?.email}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[var(--color-text-secondary)]">Account type</span>
            <span className="font-medium capitalize" style={{ color: 'var(--color-text-primary)' }}>{user?.role || 'Student'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[var(--color-text-secondary)]">Member since</span>
            <span className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
              {user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '—'}
            </span>
          </div>
        </div>
      </Card>

      {/* AI Features notice */}
      <Card>
        <div className="flex items-start gap-3">
          <SchoolIcon style={{ color: 'var(--color-accent)', flexShrink: 0, marginTop: 2 }} />
          <div>
            <p className="font-semibold text-sm mb-1" style={{ color: 'var(--color-text-primary)' }}>AI Features Active</p>
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              AI features are powered by advanced language models, integrated directly into the platform.
            </p>
          </div>
        </div>
      </Card>

      {/* Danger Zone */}
      <Card className="border border-[var(--color-error)/20]">
        <div className="flex items-center gap-2 mb-3">
          <WarningAmberIcon style={{ color: 'var(--color-error)', fontSize: 20 }} />
          <h3 className="text-base font-semibold text-[var(--color-error)]">Danger Zone</h3>
        </div>
        <p className="text-sm text-[var(--color-text-muted)] mb-4 leading-relaxed">
          Permanently delete your account and all your data, including notes, tasks, flashcards, books, and research items.
          This action <strong>cannot be undone</strong>.
        </p>
        <Button
          variant="destructive"
          icon={DeleteForeverIcon}
          onClick={() => { setDeleteModalOpen(true); setDeleteForm({ password: '', confirm: '' }); setDeleteError(''); }}
        >
          Delete My Account
        </Button>
      </Card>

      {/* Delete Account Confirmation Modal */}
      <Modal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="⚠️ Delete Account"
        width="max-w-md"
      >
        <div className="space-y-4">
          <div className="p-4 bg-[var(--color-error)/10] rounded-xl border border-[var(--color-error)]">
            <p className="text-sm text-[var(--color-error)] font-semibold mb-1">This will permanently delete:</p>
            <ul className="text-sm text-[var(--color-error)] list-disc list-inside space-y-1">
              <li>All your notes and study guides</li>
              <li>All flashcards and decks</li>
              <li>All tasks and assignments</li>
              <li>Books, research items, and tutor conversations</li>
              <li>Your profile and account data</li>
            </ul>
          </div>

          {deleteError && <Alert type="error" message={deleteError} onClose={() => setDeleteError('')} />}

          <Input
            label="Your password"
            type="password"
            placeholder="Enter your account password"
            value={deleteForm.password}
            onChange={e => setDeleteForm(f => ({ ...f, password: e.target.value }))}
          />
          <Input
            label='Type "delete my account" to confirm'
            type="text"
            placeholder="delete my account"
            value={deleteForm.confirm}
            onChange={e => setDeleteForm(f => ({ ...f, confirm: e.target.value }))}
          />

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="destructive"
              disabled={deleting || !deleteForm.password || deleteForm.confirm.toLowerCase() !== 'delete my account'}
              onClick={handleDeleteAccount}
              className="flex-1"
            >
              {deleting ? 'Deleting...' : 'Delete My Account Forever'}
            </Button>
            <Button type="button" variant="ghost" onClick={() => setDeleteModalOpen(false)}>
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}