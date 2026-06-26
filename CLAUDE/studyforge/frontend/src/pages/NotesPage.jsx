import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { PageHeader, Card, Button, Input, Modal, EmptyState, Spinner, Alert, Badge } from '../components/ui';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import NoteAltIcon from '@mui/icons-material/NoteAlt';
import SearchIcon from '@mui/icons-material/Search';
import { formatDistanceToNow } from 'date-fns';

export default function NotesPage() {
  const navigate = useNavigate();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [newModal, setNewModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newSubject, setNewSubject] = useState('');
  const [creating, setCreating] = useState(false);

  const fetchNotes = async () => {
    try {
      const params = {};
      if (search) params.search = search;
      const res = await api.get('/notes', { params });
      setNotes(res.data.notes);
    } catch { setError('Failed to load notes.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchNotes(); }, [search]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setCreating(true);
    try {
      const res = await api.post('/notes', { title: newTitle, subject: newSubject, content: '' });
      navigate(`/notes/${res.data.note.id}`);
    } catch (err) { setError(err.response?.data?.error || 'Failed to create note.'); }
    finally { setCreating(false); }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!confirm('Delete this note?')) return;
    try {
      await api.delete(`/notes/${id}`);
      setNotes(ns => ns.filter(n => n.id !== id));
    } catch { setError('Failed to delete note.'); }
  };

  const subjects = [...new Set(notes.map(n => n.subject).filter(Boolean))];

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notes"
        subtitle="Take, organize, and summarize your study notes"
        action={<Button onClick={() => { setNewTitle(''); setNewSubject(''); setNewModal(true); }} icon={AddIcon}>New Note</Button>}
      />

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      {/* Search */}
      <div className="relative">
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fontSize="small" />
        <input
          placeholder="Search notes..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white min-h-[44px]"
          style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}
        />
      </div>

      {notes.length === 0 ? (
        <EmptyState icon={NoteAltIcon} title="No notes yet" description="Start taking notes — you can summarize them and generate quizzes with AI."
          action={<Button onClick={() => setNewModal(true)} icon={AddIcon}>Create Note</Button>} />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {notes.map(note => (
            <Card key={note.id} hover onClick={() => navigate(`/notes/${note.id}`)}>
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-base truncate mb-1" style={{ color: '#1A1A1A' }}>{note.title}</h3>
                  {note.subject && <Badge label={note.subject} color="orange" />}
                  {note.content && (
                    <p className="text-sm mt-2 line-clamp-3" style={{ color: '#4A4A4A' }}>
                      {note.content.replace(/<[^>]+>/g, '').substring(0, 120)}...
                    </p>
                  )}
                  <p className="text-xs mt-2" style={{ color: '#6B7280' }}>
                    {formatDistanceToNow(new Date(note.updated_at), { addSuffix: true })}
                  </p>
                </div>
                <button onClick={(e) => handleDelete(note.id, e)}
                  className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 flex-shrink-0 transition-colors">
                  <DeleteIcon fontSize="small" />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal open={newModal} onClose={() => setNewModal(false)} title="New Note">
        <form onSubmit={handleCreate} className="space-y-4">
          <Input label="Note title *" placeholder="e.g. Chapter 4 Notes - Biology" value={newTitle} onChange={e => setNewTitle(e.target.value)} required />
          <Input label="Subject (optional)" placeholder="e.g. Biology" value={newSubject} onChange={e => setNewSubject(e.target.value)} />
          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={creating} className="flex-1">{creating ? 'Creating...' : 'Create Note'}</Button>
            <Button type="button" variant="ghost" onClick={() => setNewModal(false)}>Cancel</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
