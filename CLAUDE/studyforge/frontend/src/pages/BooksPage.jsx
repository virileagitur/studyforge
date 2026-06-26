import React, { useEffect, useState } from 'react';
import api from '../lib/api';
import { PageHeader, Card, Button, Input, Select, Textarea, Modal, Badge, EmptyState, Spinner, Alert } from '../components/ui';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SummarizeIcon from '@mui/icons-material/Summarize';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';

const STATUSES = ['want_to_read', 'reading', 'finished'];
const EMPTY_FORM = { title: '', author: '', subject: '', status: 'want_to_read', rating: '', progress_percent: 0, notes: '' };

export default function BooksPage() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [summaryModal, setSummaryModal] = useState(null);
  const [editBook, setEditBook] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [filterStatus, setFilterStatus] = useState('');
  const [chapterText, setChapterText] = useState('');
  const [chapterName, setChapterName] = useState('');
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summary, setSummary] = useState('');

  const fetchBooks = async () => {
    try {
      const params = filterStatus ? { status: filterStatus } : {};
      const res = await api.get('/books', { params });
      setBooks(res.data.books);
    } catch { setError('Failed to load books.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchBooks(); }, [filterStatus]);

  const openAdd = () => { setForm(EMPTY_FORM); setEditBook(null); setModalOpen(true); };
  const openEdit = (b) => {
    setForm({ title: b.title, author: b.author || '', subject: b.subject || '', status: b.status, rating: b.rating || '', progress_percent: b.progress_percent || 0, notes: b.notes || '' });
    setEditBook(b);
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return setError('Title is required.');
    setSaving(true);
    const payload = { ...form, rating: form.rating ? Number(form.rating) : null, progress_percent: Number(form.progress_percent) };
    try {
      if (editBook) {
        const res = await api.put(`/books/${editBook.id}`, payload);
        setBooks(bs => bs.map(b => b.id === editBook.id ? res.data.book : b));
      } else {
        const res = await api.post('/books', payload);
        setBooks(bs => [res.data.book, ...bs]);
      }
      setModalOpen(false);
    } catch (err) { setError(err.response?.data?.error || 'Failed to save.'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this book?')) return;
    try {
      await api.delete(`/books/${id}`);
      setBooks(bs => bs.filter(b => b.id !== id));
    } catch { setError('Failed to delete.'); }
  };

  const handleSummarizeChapter = async () => {
    if (!chapterText.trim()) return setError('Please paste some chapter text first.');
    setSummaryLoading(true);
    setSummary('');
    try {
      const res = await api.post(`/ai/books/${summaryModal.id}/summarize-chapter`, { chapter_text: chapterText, chapter_name: chapterName });
      setSummary(res.data.summary);
    } catch { setError('AI summarization failed.'); }
    finally { setSummaryLoading(false); }
  };

  const setF = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));

  const statusGroups = { want_to_read: 'Want to Read', reading: 'Currently Reading', finished: 'Finished' };

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Book Tracker"
        subtitle="Track your reading progress and generate summaries"
        action={<Button onClick={openAdd} icon={AddIcon}>Add Book</Button>}
      />

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}
      {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}

      <div className="flex gap-3">
        {['', ...STATUSES].map(s => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors min-h-[44px] ${filterStatus === s ? 'bg-orange-500 text-white' : 'bg-white text-gray-600 hover:bg-orange-50'}`}
            style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}
          >
            {s ? statusGroups[s] : 'All Books'}
          </button>
        ))}
      </div>

      {books.length === 0 ? (
        <EmptyState icon={MenuBookIcon} title="No books yet" description="Start tracking your reading list — textbooks, novels, study guides." action={<Button onClick={openAdd} icon={AddIcon}>Add Book</Button>} />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {books.map(book => (
            <Card key={book.id}>
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-base leading-tight" style={{ color: '#1A1A1A' }}>{book.title}</h3>
                  {book.author && <p className="text-sm mt-0.5" style={{ color: '#4A4A4A' }}>by {book.author}</p>}
                </div>
                <div className="flex gap-1">
                  <button onClick={() => { setSummaryModal(book); setSummary(''); setChapterText(''); setChapterName(''); }} className="p-1.5 rounded-lg hover:bg-orange-50 text-gray-400 hover:text-orange-500 transition-colors" title="AI Chapter Summary">
                    <SummarizeIcon fontSize="small" />
                  </button>
                  <button onClick={() => openEdit(book)} className="p-1.5 rounded-lg hover:bg-orange-50 text-gray-400 hover:text-orange-500">
                    <EditIcon fontSize="small" />
                  </button>
                  <button onClick={() => handleDelete(book.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500">
                    <DeleteIcon fontSize="small" />
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-3">
                <Badge label={book.status} color={book.status} />
                {book.subject && <Badge label={book.subject} color="orange" />}
              </div>

              {/* Progress bar */}
              {book.status === 'reading' && (
                <div className="mb-3">
                  <div className="flex justify-between text-xs mb-1" style={{ color: '#4A4A4A' }}>
                    <span>Progress</span><span>{book.progress_percent}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${book.progress_percent}%`, background: '#F97316' }} />
                  </div>
                </div>
              )}

              {/* Star rating */}
              {book.rating && (
                <div className="flex gap-0.5">
                  {[1,2,3,4,5].map(n => n <= book.rating
                    ? <StarIcon key={n} style={{ color: '#FACC15', fontSize: 18 }} />
                    : <StarBorderIcon key={n} style={{ color: '#D1D5DB', fontSize: 18 }} />
                  )}
                </div>
              )}

              {book.notes && <p className="text-xs mt-2 line-clamp-2" style={{ color: '#6B7280' }}>{book.notes}</p>}
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editBook ? 'Edit Book' : 'Add Book'}>
        <form onSubmit={handleSave} className="space-y-4">
          <Input label="Title *" placeholder="e.g. The Great Gatsby" value={form.title} onChange={setF('title')} required />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Author" placeholder="Author name" value={form.author} onChange={setF('author')} />
            <Input label="Subject / Course" placeholder="e.g. English" value={form.subject} onChange={setF('subject')} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Select label="Status" value={form.status} onChange={setF('status')}>
              {STATUSES.map(s => <option key={s} value={s}>{statusGroups[s]}</option>)}
            </Select>
            <Select label="Rating (1-5)" value={form.rating} onChange={setF('rating')}>
              <option value="">No rating</option>
              {[1,2,3,4,5].map(n => <option key={n} value={n}>{n} star{n > 1 ? 's' : ''}</option>)}
            </Select>
          </div>
          {form.status === 'reading' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Progress ({form.progress_percent}%)</label>
              <input type="range" min="0" max="100" value={form.progress_percent} onChange={setF('progress_percent')} className="w-full accent-orange-500" />
            </div>
          )}
          <Textarea label="Notes" placeholder="Your thoughts, key ideas..." value={form.notes} onChange={setF('notes')} rows={3} />
          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={saving} className="flex-1">{saving ? 'Saving...' : editBook ? 'Save Changes' : 'Add Book'}</Button>
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
          </div>
        </form>
      </Modal>

      {/* Chapter Summary Modal */}
      <Modal open={!!summaryModal} onClose={() => { setSummaryModal(null); setSummary(''); }} title={`AI Chapter Summary — ${summaryModal?.title}`} width="max-w-2xl">
        <div className="space-y-4">
          <Input label="Chapter name (optional)" placeholder="e.g. Chapter 3: The Conflict" value={chapterName} onChange={e => setChapterName(e.target.value)} />
          <Textarea label="Paste chapter text" placeholder="Paste the chapter content here..." value={chapterText} onChange={e => setChapterText(e.target.value)} rows={6} />
          <Button onClick={handleSummarizeChapter} disabled={summaryLoading} icon={SummarizeIcon}>
            {summaryLoading ? 'Generating summary...' : 'Generate Summary'}
          </Button>
          {summary && (
            <div className="p-4 rounded-xl text-sm" style={{ background: '#FEF3C7' }}>
              <p className="font-semibold mb-2" style={{ color: '#D97706' }}>AI Summary</p>
              <p style={{ color: '#1A1A1A', whiteSpace: 'pre-wrap' }}>{summary}</p>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
