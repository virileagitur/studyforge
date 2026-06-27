import React, { useEffect, useState } from 'react';
import api from '../lib/api';
import { PageHeader, Card, Button, Input, Select, Textarea, Modal, Badge, EmptyState, Spinner, Alert } from '../components/ui';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import StarIcon from '@mui/icons-material/Star';
import StarOutlineIcon from '@mui/icons-material/StarOutline';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import SearchIcon from '@mui/icons-material/Search';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import FilterListIcon from '@mui/icons-material/FilterList';
import ReactMarkdown from 'react-markdown';

const STATUSES = ['want_to_read', 'reading', 'finished'];
const SUBJECTS = ['Literature', 'Biology', 'Chemistry', 'Physics', 'Math', 'History', 'Psychology', 'Computer Science', 'Economics', 'Philosophy', 'Art', 'Music'];

const EMPTY_FORM = {
  title: '', author: '', subject: '', status: 'want_to_read', rating: '', progress_percent: 0,
  notes: '', book_cover_url: '', description: '', publisher: '', page_count: '', isbn: '',
  genres: [], language: '', is_favorite: false, tags: []
};

function StarRating({ value, onChange }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star === value ? 0 : star)}
          className="text-[var(--color-accent)] hover:scale-110 transition-transform"
        >
          {value >= star ? <StarIcon fontSize="small" /> : <StarOutlineIcon fontSize="small" />}
        </button>
      ))}
    </div>
  );
}

export default function BooksPage() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editBook, setEditBook] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [filters, setFilters] = useState({ status: '', subject: '' });
  const [selectedBook, setSelectedBook] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [summaryLoading, setSummaryLoading] = useState(false);

  // OpenLibrary search state
  const [isbnQuery, setIsbnQuery] = useState('');
  const [isbnLoading, setIsbnLoading] = useState(false);
  const [isbnResult, setIsbnResult] = useState(null);

  const fetchBooks = async () => {
    try {
      const params = {};
      if (filters.status) params.status = filters.status;
      if (filters.subject) params.subject = filters.subject;
      const res = await api.get('/books', { params });
      setBooks(res.data.books);
    } catch {
      setError('Failed to load books.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBooks(); }, [filters]);

  const openAdd = () => { setForm(EMPTY_FORM); setEditBook(null); setIsbnResult(null); setIsbnQuery(''); setModalOpen(true); };
  const openEdit = (b) => {
    setForm({
      title: b.title, author: b.author || '', subject: b.subject || '', status: b.status,
      rating: b.rating || '', progress_percent: b.progress_percent || 0, notes: b.notes || '',
      book_cover_url: b.book_cover_url || '', description: b.description || '',
      publisher: b.publisher || '', page_count: b.page_count || '', isbn: b.isbn || '',
      genres: b.genres || [], language: b.language || '', is_favorite: b.is_favorite || false,
      tags: b.tags || []
    });
    setEditBook(b);
    setIsbnResult(null);
    setIsbnQuery('');
    setModalOpen(true);
  };

  const openDetail = (book) => {
    setSelectedBook(book);
    setDetailOpen(true);
  };

  const handleISBNLookup = async () => {
    if (!isbnQuery.trim()) return;
    setIsbnLoading(true);
    setIsbnResult(null);
    try {
      const res = await api.get(`/books/isbn/${isbnQuery.replace(/[-\s]/g, '')}`);
      const bookData = res.data.book;
      setIsbnResult(bookData);
      // Auto-fill form
      setForm(f => ({
        ...f,
        title: bookData.title || f.title,
        author: bookData.author || f.author,
        publisher: bookData.publisher || f.publisher,
        published_date: bookData.published_date || f.published_date,
        page_count: bookData.page_count || f.page_count,
        book_cover_url: bookData.book_cover_url || f.book_cover_url,
        description: bookData.description || f.description,
        genres: bookData.genres || f.genres,
        isbn: isbnQuery.trim(),
      }));
    } catch {
      setError('No book found for that ISBN. Try entering details manually.');
    } finally {
      setIsbnLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return setError('Title is required.');
    setSaving(true);
    try {
      const payload = {
        ...form,
        rating: form.rating ? parseInt(form.rating) : null,
        progress_percent: parseInt(form.progress_percent) || 0,
        page_count: form.page_count ? parseInt(form.page_count) : null,
      };
      if (editBook) {
        const res = await api.put(`/books/${editBook.id}`, payload);
        setBooks(bs => bs.map(b => b.id === editBook.id ? res.data.book : b));
        if (selectedBook?.id === editBook.id) setSelectedBook(res.data.book);
      } else {
        const res = await api.post('/books', payload);
        setBooks(bs => [res.data.book, ...bs]);
      }
      setModalOpen(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save book.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Remove this book from your library?')) return;
    try {
      await api.delete(`/books/${id}`);
      setBooks(bs => bs.filter(b => b.id !== id));
      if (detailOpen && selectedBook?.id === id) setDetailOpen(false);
    } catch {
      setError('Failed to delete book.');
    }
  };

  const handleGenerateSummary = async (bookId) => {
    setSummaryLoading(true);
    try {
      const res = await api.post(`/books/${bookId}/summary`);
      const updatedBook = res.data.book;
      setBooks(bs => bs.map(b => b.id === bookId ? updatedBook : b));
      setSelectedBook(updatedBook);
    } catch {
      setError('Failed to generate AI summary.');
    } finally {
      setSummaryLoading(false);
    }
  };

  const toggleFavorite = async (book) => {
    try {
      const updatedFields = {
        title: book.title, author: book.author, subject: book.subject, status: book.status,
        rating: book.rating, progress_percent: book.progress_percent, notes: book.notes,
        book_cover_url: book.book_cover_url, description: book.description, publisher: book.publisher,
        page_count: book.page_count, isbn: book.isbn, genres: book.genres, language: book.language,
        is_favorite: !book.is_favorite, tags: book.tags, summary: book.summary,
        summary_generated: book.summary_generated
      };
      const res = await api.put(`/books/${book.id}`, updatedFields);
      setBooks(bs => bs.map(b => b.id === book.id ? res.data.book : b));
      if (selectedBook?.id === book.id) setSelectedBook(res.data.book);
    } catch {
      setError('Failed to update favorite.');
    }
  };

  const setF = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));
  const setFilter = (key) => (e) => setFilters(f => ({ ...f, [key]: e.target.value }));

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Book Library"
        subtitle={`${books.length} book${books.length !== 1 ? 's' : ''} in your collection`}
        action={<Button onClick={openAdd} icon={AddIcon}>Add Book</Button>}
      />

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center p-4 bg-[var(--color-surface)] rounded-xl">
        <FilterListIcon style={{ color: 'var(--color-accent)' }} />
        <Select value={filters.status} onChange={setFilter('status')} className="w-40">
          <option value="">All Reading Status</option>
          {STATUSES.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
        </Select>
        <Select value={filters.subject} onChange={setFilter('subject')} className="w-36">
          <option value="">All Subjects</option>
          {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
        </Select>
        {(filters.status || filters.subject) && (
          <Button variant="ghost" size="sm" onClick={() => setFilters({ status: '', subject: '' })}>Clear Filters</Button>
        )}
      </div>

      {/* Book Grid */}
      {books.length === 0 ? (
        <EmptyState
          icon={MenuBookIcon}
          title="No books yet"
          description="Build your reading library. Search by ISBN or add books manually."
          action={<Button onClick={openAdd} icon={AddIcon}>Add Your First Book</Button>}
        />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {books.map(book => (
            <div
              key={book.id}
              className="bg-[var(--color-surface)] rounded-2xl overflow-hidden cursor-pointer hover:shadow-md transition-transform hover:-translate-y-0.5 relative"
              onClick={() => openDetail(book)}
            >
              {/* Cover Image */}
              <div className="h-44 bg-[var(--color-surface-raised)] flex items-center justify-center relative">
                {book.book_cover_url ? (
                  <img
                    src={book.book_cover_url}
                    alt={book.title}
                    className="h-full w-full object-cover"
                    onError={e => { e.target.style.display = 'none'; }}
                  />
                ) : (
                  <AutoStoriesIcon style={{ fontSize: 48, color: 'var(--color-accent)' }} />
                )}
                {/* Favorite Heart */}
                <button
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-[var(--color-surface)]/80 hover:bg-[var(--color-surface)] transition-colors z-10"
                  onClick={e => { e.stopPropagation(); toggleFavorite(book); }}
                  title={book.is_favorite ? 'Remove from favorites' : 'Add to favorites'}
                >
                  {book.is_favorite
                    ? <FavoriteIcon style={{ color: 'var(--color-error)', fontSize: 18 }} />
                    : <FavoriteBorderIcon style={{ color: 'var(--color-text-muted)', fontSize: 18 }} />
                  }
                </button>
                {/* Status badge */}
                <span className={`absolute bottom-2 left-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-[var(--color-background)] text-[var(--color-text-primary)]`}>
                  {book.status.replace(/_/g, ' ')}
                </span>
              </div>

              {/* Info */}
              <div className="p-4 space-y-2">
                <h3 className="font-semibold text-sm leading-tight line-clamp-2" style={{ color: 'var(--color-text-primary)' }}>
                  {book.title}
                </h3>
                {book.author && (
                  <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>by {book.author}</p>
                )}
                {book.rating > 0 && (
                  <div className="flex items-center gap-1">
                    {[...Array(book.rating)].map((_, i) => <StarIcon key={i} style={{ fontSize: 14, color: 'var(--color-accent)' }} />)}
                  </div>
                )}
                {book.status === 'reading' && book.progress_percent > 0 && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-[var(--color-text-muted)]">
                      <span>Progress</span>
                      <span>{book.progress_percent}%</span>
                    </div>
                    <div className="w-full bg-[var(--color-background)] rounded-full h-1.5 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[var(--color-accent)] transition-all"
                        style={{ width: `${book.progress_percent}%` }}
                      />
                    </div>
                  </div>
                )}
                <div className="flex gap-1 pt-1">
                  <button
                    onClick={e => { e.stopPropagation(); openEdit(book); }}
                    className="p-1.5 rounded-lg hover:bg-[var(--color-background)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors"
                  >
                    <EditIcon style={{ fontSize: 16 }} />
                  </button>
                  <button
                    onClick={e => { e.stopPropagation(); handleDelete(book.id); }}
                    className="p-1.5 rounded-lg hover:bg-[var(--color-background)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors"
                  >
                    <DeleteIcon style={{ fontSize: 16 }} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Book Detail Modal */}
      <Modal open={detailOpen} onClose={() => setDetailOpen(false)} title={selectedBook?.title || 'Book Detail'} width="max-w-2xl">
        {selectedBook && (
          <div className="space-y-5">
            <div className="flex gap-5">
              {selectedBook.book_cover_url ? (
                <img
                  src={selectedBook.book_cover_url}
                  alt={selectedBook.title}
                  className="w-24 h-36 object-cover rounded-xl flex-shrink-0 shadow-md"
                />
              ) : (
                <div className="w-24 h-36 rounded-xl bg-[var(--color-surface-raised)] flex items-center justify-center flex-shrink-0">
                  <AutoStoriesIcon style={{ fontSize: 36, color: 'var(--color-accent)' }} />
                </div>
              )}
              <div className="space-y-2 flex-1">
                <h2 className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>{selectedBook.title}</h2>
                {selectedBook.author && <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>by {selectedBook.author}</p>}
                {selectedBook.publisher && <p className="text-xs text-[var(--color-text-muted)]">{selectedBook.publisher}</p>}
                <div className="flex flex-wrap gap-2 mt-2">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full bg-[var(--color-background)] text-[var(--color-text-primary)]`}>
                    {selectedBook.status.replace(/_/g, ' ')}
                  </span>
                  {selectedBook.subject && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--color-background)]: background-color: var(--color-surface-raised); text-[var(--color-text-muted)] font-medium">
                      {selectedBook.subject}
                    </span>
                  )}
                </div>
                {selectedBook.rating > 0 && (
                  <div className="flex items-center gap-1 text-[var(--color-accent)]">
                    {[...Array(selectedBook.rating)].map((_, i) => <StarIcon key={i} style={{ fontSize: 16 }} />)}
                  </div>
                )}
                {selectedBook.page_count && (
                  <p className="text-xs text-[var(--color-text-muted)]">{selectedBook.page_count} pages</p>
                )}
              </div>
            </div>

            {selectedBook.status === 'reading' && (
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">Reading Progress</span>
                  <span className="font-bold" style={{ color: 'var(--color-accent)' }}>{selectedBook.progress_percent}%</span>
                </div>
                <div className="w-full bg-[var(--color-background)] rounded-full h-2.5 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[var(--color-accent)]"
                    style={{ width: `${selectedBook.progress_percent}%` }}
                  />
                </div>
              </div>
            )}

            {selectedBook.description && (
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)] mb-2">Description</p>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                  {selectedBook.description}
                </p>
              </div>
            )}

            {selectedBook.notes && (
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)] mb-2">My Notes</p>
                <p className="text-sm leading-relaxed italic" style={{ color: 'var(--color-text-primary)' }}>
                  {selectedBook.notes}
                </p>
              </div>
            )}

            {/* AI Summary Section */}
            <div className="border-t border-[var(--color-border)] pt-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-bold uppercase tracking-wider text-[var(--color-text-muted)]">AI Summary</p>
                <Button
                  variant="outline"
                  size="sm"
                  icon={SmartToyIcon}
                  onClick={() => handleGenerateSummary(selectedBook.id)}
                  disabled={summaryLoading}
                >
                  {summaryLoading ? 'Generating...' : selectedBook.summary_generated ? 'Regenerate' : 'Generate Summary'}
                </Button>
              </div>
              {selectedBook.summary ? (
                <div className="book-summary-content text-sm leading-relaxed p-4 bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)]">
                  <ReactMarkdown>{selectedBook.summary}</ReactMarkdown>
                </div>
              ) : (
                <p className="text-sm text-[var(--color-text-muted)] italic">
                  Generate an AI-powered summary and analysis of this book using the button above.
                </p>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <Button onClick={() => { setDetailOpen(false); openEdit(selectedBook); }} icon={EditIcon} variant="outline" size="sm">
                Edit Details
              </Button>
              <Button onClick={() => handleDelete(selectedBook.id)} variant="destructive" size="sm">
                Remove Book
              </Button>
            </div>
          </div>
        )}

      </Modal>

      {/* Add / Edit Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editBook ? 'Edit Book' : 'Add Book to Library'}
        width="max-w-2xl"
      >
        <form onSubmit={handleSave} className="space-y-5">
          {/* ISBN Lookup */}
          {!editBook && (
            <div className="p-4 bg-[var(--color-surface-raised)] rounded-xl border border-[var(--color-border)]/40">
              <p className="text-sm font-bold mb-2" style={{ color: 'var(--color-accent)' }}>Quick Fill via ISBN</p>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter ISBN-10 or ISBN-13..."
                  value={isbnQuery}
                  onChange={e => setIsbnQuery(e.target.value)}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="secondary"
                  icon={SearchIcon}
                  onClick={handleISBNLookup}
                  disabled={isbnLoading || !isbnQuery.trim()}
                  size="md"
                >
                  {isbnLoading ? 'Searching...' : 'Lookup'}
                </Button>
              </div>
              {isbnResult && (
                <p className="text-xs text-[var(--color-success)] mt-2 font-semibold">
                  ✓ Found: <span className="font-bold">{isbnResult.title}</span> — fields auto-filled below.
                </p>
              )}
              <p className="text-xs text-[var(--color-text-muted)] mt-1">Uses OpenLibrary API to auto-fill book details.</p>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Title *" placeholder="Book title" value={form.title} onChange={setF('title')} required />
            <Input label="Author" placeholder="Author name" value={form.author} onChange={setF('author')} />
            <Input label="Publisher" placeholder="Publisher name" value={form.publisher} onChange={setF('publisher')} />
            <Input label="ISBN" placeholder="ISBN-10 or ISBN-13" value={form.isbn} onChange={setF('isbn')} />
            <Input label="Page Count" type="number" placeholder="e.g. 320" value={form.page_count} onChange={setF('page_count')} />
            <Input label="Book Cover URL" placeholder="https://..." value={form.book_cover_url} onChange={setF('book_cover_url')} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select label="Subject" value={form.subject} onChange={setF('subject')}>
              <option value="">Select subject</option>
              {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
            </Select>
            <Select label="Reading Status" value={form.status} onChange={setF('status')}>
              {STATUSES.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
            </Select>
          </div>

          {form.status === 'reading' && (
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">Reading Progress: {form.progress_percent}%</label>
              <input
                type="range"
                min="0"
                max="100"
                value={form.progress_percent}
                onChange={e => setForm(f => ({ ...f, progress_percent: parseInt(e.target.value) }))}
                className="w-full accent-[var(--color-accent)]"
              />
            </div>
          )}

          {form.status === 'finished' && (
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">Your Rating</label>
              <StarRating value={parseInt(form.rating) || 0} onChange={v => setForm(f => ({ ...f, rating: v }))} />
            </div>
          )}

          <Textarea label="Description" placeholder="Book description..." value={form.description} onChange={setF('description')} rows={2} />
          <Textarea label="Personal Notes" placeholder="Your notes about this book..." value={form.notes} onChange={setF('notes')} rows={2} />

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="is_favorite"
              checked={form.is_favorite}
              onChange={e => setForm(f => ({ ...f, is_favorite: e.target.checked }))}
              className="rounded accent-[var(--color-accent)] w-4 h-4"
            />
            <label htmlFor="is_favorite" className="text-sm font-medium text-[var(--color-text-secondary)] flex items-center gap-1">
              <FavoriteIcon style={{ color: 'var(--color-error)', fontSize: 16 }} /> Add to Favorites
            </label>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={saving} className="flex-1">
              {saving ? 'Saving...' : editBook ? 'Save Changes' : 'Add to Library'}
            </Button>
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}