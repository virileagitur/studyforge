import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { Button, Input, Alert, Spinner } from '../components/ui';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SummarizeIcon from '@mui/icons-material/Summarize';
import QuizIcon from '@mui/icons-material/Quiz';
import SaveIcon from '@mui/icons-material/Save';

export default function NoteEditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [note, setNote] = useState(null);
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [summary, setSummary] = useState('');
  const [quiz, setQuiz] = useState(null);
  const [aiLoading, setAiLoading] = useState('');
  const saveTimer = useRef(null);

  useEffect(() => {
    api.get(`/notes/${id}`)
      .then(res => {
        const n = res.data.note;
        setNote(n);
        setTitle(n.title);
        setContent(n.content || '');
        setSubject(n.subject || '');
        if (n.ai_summary) setSummary(n.ai_summary);
        if (n.ai_quiz) setQuiz(n.ai_quiz);
      })
      .catch(() => setError('Note not found.'))
      .finally(() => setLoading(false));
  }, [id]);

  // Auto-save
  const handleContentChange = (e) => {
    setContent(e.target.value);
    setSaved(false);
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      try {
        await api.put(`/notes/${id}`, { title, content: e.target.value, subject });
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      } catch {}
    }, 1500);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put(`/notes/${id}`, { title, content, subject });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch { setError('Failed to save note.'); }
    finally { setSaving(false); }
  };

  const handleSummarize = async () => {
    setAiLoading('summarize');
    try {
      // Save first
      await api.put(`/notes/${id}`, { title, content, subject });
      const res = await api.post(`/ai/notes/${id}/summarize`);
      setSummary(res.data.summary);
    } catch { setError('AI summarization failed.'); }
    finally { setAiLoading(''); }
  };

  const handleGenerateQuiz = async () => {
    setAiLoading('quiz');
    try {
      await api.put(`/notes/${id}`, { title, content, subject });
      const res = await api.post(`/ai/notes/${id}/quiz`);
      setQuiz(res.data.quiz);
    } catch { setError('Quiz generation failed.'); }
    finally { setAiLoading(''); }
  };

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <button onClick={() => navigate('/notes')} className="flex items-center gap-1 text-sm text-gray-500 hover:text-orange-500 transition-colors min-h-[44px] px-2">
          <ArrowBackIcon fontSize="small" />
          <span>Back to Notes</span>
        </button>
        <div className="flex items-center gap-2">
          {saved && <span className="text-xs text-green-600">Saved</span>}
          <Button onClick={handleSave} disabled={saving} icon={SaveIcon} size="sm">
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      {/* Title & Subject */}
      <div className="bg-white rounded-xl p-4" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
        <input
          className="w-full text-2xl font-bold focus:outline-none bg-transparent mb-2"
          style={{ color: '#1A1A1A' }}
          placeholder="Note title..."
          value={title}
          onChange={e => { setTitle(e.target.value); setSaved(false); }}
          onBlur={handleSave}
        />
        <input
          className="w-full text-sm focus:outline-none bg-transparent"
          style={{ color: '#6B7280' }}
          placeholder="Subject (optional)..."
          value={subject}
          onChange={e => { setSubject(e.target.value); setSaved(false); }}
          onBlur={handleSave}
        />
      </div>

      {/* AI Actions */}
      <div className="flex gap-3">
        <Button variant="outline" onClick={handleSummarize} disabled={!!aiLoading} icon={SummarizeIcon} size="sm">
          {aiLoading === 'summarize' ? 'Summarizing...' : 'AI Summarize'}
        </Button>
        <Button variant="outline" onClick={handleGenerateQuiz} disabled={!!aiLoading} icon={QuizIcon} size="sm">
          {aiLoading === 'quiz' ? 'Generating Quiz...' : 'Generate Quiz'}
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* Main editor */}
        <div className="lg:col-span-2">
          <textarea
            className="w-full bg-white rounded-xl p-6 text-base focus:outline-none focus:ring-2 focus:ring-orange-300 resize-none leading-relaxed"
            style={{ minHeight: '500px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', color: '#1A1A1A' }}
            placeholder="Start writing your notes here..."
            value={content}
            onChange={handleContentChange}
          />
        </div>

        {/* Side panel */}
        <div className="space-y-4">
          {summary && (
            <div className="bg-white rounded-xl p-4" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
              <p className="text-sm font-semibold mb-2" style={{ color: '#F97316' }}>AI Summary</p>
              <p className="text-sm" style={{ color: '#1A1A1A', whiteSpace: 'pre-wrap' }}>{summary}</p>
            </div>
          )}

          {quiz && quiz.length > 0 && (
            <div className="bg-white rounded-xl p-4" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
              <p className="text-sm font-semibold mb-3" style={{ color: '#F97316' }}>AI Quiz</p>
              <div className="space-y-4">
                {quiz.map((q, i) => (
                  <div key={i} className="border-b border-gray-100 pb-3 last:border-0">
                    <p className="text-sm font-medium mb-1" style={{ color: '#1A1A1A' }}>{i + 1}. {q.question}</p>
                    <details className="group">
                      <summary className="text-xs text-orange-500 cursor-pointer hover:text-orange-600 select-none">Show answer</summary>
                      <p className="text-xs mt-1 p-2 rounded" style={{ color: '#4A4A4A', background: '#FEF3C7' }}>{q.answer}</p>
                    </details>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!summary && !quiz && (
            <div className="bg-white rounded-xl p-4 text-center" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
              <p className="text-sm" style={{ color: '#6B7280' }}>Use the AI tools above to generate a summary or quiz from your notes.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
