import React, { useEffect, useState } from 'react';
import api from '../lib/api';
import { PageHeader, Card, Button, Input, Select, Textarea, Modal, Badge, EmptyState, Spinner, Alert } from '../components/ui';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SummarizeIcon from '@mui/icons-material/Summarize';
import StyleIcon from '@mui/icons-material/Style';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import SearchIcon from '@mui/icons-material/Search';

const SOURCE_TYPES = ['website', 'pdf', 'youtube', 'article'];
const EMPTY_FORM = { title: '', url: '', source_type: 'website', notes: '', content: '', subject: '', tags: '' };

export default function ResearchPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [filterSubject, setFilterSubject] = useState('');
  const [aiLoading, setAiLoading] = useState({});

  const fetchResearch = async () => {
    try {
      const params = {};
      if (search) params.search = search;
      if (filterSubject) params.subject = filterSubject;
      const res = await api.get('/research', { params });
      setItems(res.data.research);
    } catch { setError('Failed to load research items.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchResearch(); }, [search, filterSubject]);

  const openAdd = () => { setForm(EMPTY_FORM); setEditItem(null); setModalOpen(true); };
  const openEdit = (item) => {
    setForm({ title: item.title, url: item.url || '', source_type: item.source_type, notes: item.notes || '', content: item.content || '', subject: item.subject || '', tags: (item.tags || []).join(', ') });
    setEditItem(item);
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return setError('Title is required.');
    setSaving(true);
    const payload = { ...form, tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [] };
    try {
      if (editItem) {
        const res = await api.put(`/research/${editItem.id}`, payload);
        setItems(items => items.map(i => i.id === editItem.id ? res.data.research : i));
      } else {
        const res = await api.post('/research', payload);
        setItems(items => [res.data.research, ...items]);
      }
      setModalOpen(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save.');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this research item?')) return;
    try {
      await api.delete(`/research/${id}`);
      setItems(items => items.filter(i => i.id !== id));
    } catch { setError('Failed to delete.'); }
  };

  const handleSummarize = async (id) => {
    setAiLoading(s => ({ ...s, [id]: 'summarize' }));
    try {
      const res = await api.post(`/ai/research/${id}/summarize`);
      setItems(items => items.map(i => i.id === id ? { ...i, ai_summary: res.data.summary } : i));
      setSuccess('Summary generated.');
    } catch { setError('AI summarization failed.'); }
    finally { setAiLoading(s => ({ ...s, [id]: null })); }
  };

  const handleGenerateFlashcards = async (id) => {
    setAiLoading(s => ({ ...s, [id]: 'flashcards' }));
    try {
      await api.post(`/ai/research/${id}/flashcards`);
      setSuccess('Flashcards generated and saved.');
    } catch { setError('Failed to generate flashcards.'); }
    finally { setAiLoading(s => ({ ...s, [id]: null })); }
  };

  const setF = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));
  const subjects = [...new Set(items.map(i => i.subject).filter(Boolean))];

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Research Bookmarker"
        subtitle="Save, organize, and summarize your research sources"
        action={<Button onClick={openAdd} icon={AddIcon}>Add Research</Button>}
      />

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}
      {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}

      {/* Search & Filter */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fontSize="small" />
          <input
            placeholder="Search research..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white min-h-[44px]"
            style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}
          />
        </div>
        <Select value={filterSubject} onChange={e => setFilterSubject(e.target.value)} className="w-36">
          <option value="">All Subjects</option>
          {subjects.map(s => <option key={s} value={s}>{s}</option>)}
        </Select>
      </div>

      {items.length === 0 ? (
        <EmptyState
          icon={BookmarkIcon}
          title="No research saved yet"
          description="Save websites, articles, PDFs, and YouTube videos to keep your research organized."
          action={<Button onClick={openAdd} icon={AddIcon}>Add Research</Button>}
        />
      ) : (
        <div className="space-y-4">
          {items.map(item => (
            <Card key={item.id}>
              <div className="flex items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h3 className="font-semibold text-base" style={{ color: '#1A1A1A' }}>{item.title}</h3>
                    <Badge label={item.source_type} color={item.source_type} />
                    {item.subject && <Badge label={item.subject} color="orange" />}
                  </div>
                  {item.url && (
                    <a href={item.url} target="_blank" rel="noopener noreferrer"
                       className="text-sm text-orange-500 hover:underline flex items-center gap-1 mb-2">
                      <OpenInNewIcon fontSize="small" />
                      <span className="truncate max-w-xs">{item.url}</span>
                    </a>
                  )}
                  {item.notes && <p className="text-sm mb-2" style={{ color: '#4A4A4A' }}>{item.notes}</p>}
                  {item.ai_summary && (
                    <div className="mt-2 p-3 rounded-lg text-sm" style={{ background: '#FEF3C7' }}>
                      <p className="font-medium text-xs mb-1" style={{ color: '#D97706' }}>AI Summary</p>
                      <p style={{ color: '#1A1A1A' }}>{item.ai_summary}</p>
                    </div>
                  )}
                  {item.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {item.tags.map(tag => <Badge key={tag} label={tag} color="gray" />)}
                    </div>
                  )}
                  {/* AI Actions */}
                  <div className="flex flex-wrap gap-2 mt-3">
                    <Button variant="outline" size="sm" onClick={() => handleSummarize(item.id)}
                      disabled={aiLoading[item.id] === 'summarize'} icon={SummarizeIcon}>
                      {aiLoading[item.id] === 'summarize' ? 'Summarizing...' : 'AI Summarize'}
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleGenerateFlashcards(item.id)}
                      disabled={aiLoading[item.id] === 'flashcards'} icon={StyleIcon}>
                      {aiLoading[item.id] === 'flashcards' ? 'Generating...' : 'Make Flashcards'}
                    </Button>
                  </div>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <button onClick={() => openEdit(item)} className="p-2 rounded-lg hover:bg-orange-50 text-gray-400 hover:text-orange-500 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center">
                    <EditIcon fontSize="small" />
                  </button>
                  <button onClick={() => handleDelete(item.id)} className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center">
                    <DeleteIcon fontSize="small" />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? 'Edit Research' : 'Add Research'}>
        <form onSubmit={handleSave} className="space-y-4">
          <Input label="Title *" placeholder="e.g. NASA Article on Black Holes" value={form.title} onChange={setF('title')} required />
          <Input label="URL (optional)" type="url" placeholder="https://..." value={form.url} onChange={setF('url')} />
          <div className="grid grid-cols-2 gap-4">
            <Select label="Source type" value={form.source_type} onChange={setF('source_type')}>
              {SOURCE_TYPES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
            </Select>
            <Input label="Subject" placeholder="e.g. Physics" value={form.subject} onChange={setF('subject')} />
          </div>
          <Textarea label="Notes" placeholder="Your notes or key points..." value={form.notes} onChange={setF('notes')} rows={3} />
          <Textarea label="Content / Paste text (for AI summarization)" placeholder="Paste article text here for AI summarization..." value={form.content} onChange={setF('content')} rows={4} />
          <Input label="Tags (comma-separated)" placeholder="e.g. biology, cells, mitosis" value={form.tags} onChange={setF('tags')} />
          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={saving} className="flex-1">
              {saving ? 'Saving...' : editItem ? 'Save Changes' : 'Add Research'}
            </Button>
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
