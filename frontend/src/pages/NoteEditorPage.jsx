import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { Button, Input, Alert, Spinner } from '../components/ui';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SummarizeIcon from '@mui/icons-material/Summarize';
import QuizIcon from '@mui/icons-material/Quiz';
import SaveIcon from '@mui/icons-material/Save';
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import FormatUnderlinedIcon from '@mui/icons-material/FormatUnderlined';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';
import FormatClearIcon from '@mui/icons-material/FormatClear';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import ImageIcon from '@mui/icons-material/Image';

import EditIcon from '@mui/icons-material/Edit';

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
  const [isEditing, setIsEditing] = useState(false); // default: review mode (read-only)
  const saveTimer = useRef(null);

  const editorRef = useRef(null);
  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);

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

  // Sync editor content when toggling to edit mode
  useEffect(() => {
    if (isEditing && editorRef.current) {
      editorRef.current.innerHTML = content || '';
    }
  }, [isEditing]);

  const handleEditorInput = () => {
    if (!editorRef.current) return;
    const html = editorRef.current.innerHTML;
    setContent(html);
    setSaved(false);
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      try {
        await api.put(`/notes/${id}`, { title, content: html, subject });
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
      setIsEditing(false); // return to read-only mode after explicit save
    } catch { setError('Failed to save note.'); }
    finally { setSaving(false); }
  };

  const executeCommand = (command, value = null) => {
    document.execCommand(command, false, value);
    handleEditorInput();
  };

  const insertHtmlAtCursor = (html) => {
    if (!editorRef.current) return;
    editorRef.current.focus();

    const sel = window.getSelection();
    if (sel.getRangeAt && sel.rangeCount) {
      let range = sel.getRangeAt(0);

      // Check if cursor is actually inside the editor
      if (!editorRef.current.contains(range.commonAncestorContainer)) {
        editorRef.current.innerHTML += html;
        handleEditorInput();
        return;
      }

      range.deleteContents();

      const el = document.createElement('div');
      el.innerHTML = html;
      const frag = document.createDocumentFragment();
      let node;
      let lastNode;
      while ((node = el.firstChild)) {
        lastNode = frag.appendChild(node);
      }
      range.insertNode(frag);

      if (lastNode) {
        range = range.cloneRange();
        range.setStartAfter(lastNode);
        range.collapse(true);
        sel.removeAllRanges();
        sel.addRange(range);
      }
    } else {
      editorRef.current.innerHTML += html;
    }
    handleEditorInput();
  };

  const insertTextAtCursor = (text) => {
    const formatted = text.replace(/\n/g, '<br/>');
    insertHtmlAtCursor(formatted);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setError('');
    const reader = new FileReader();

    if (file.type === 'text/plain') {
      reader.onload = (event) => {
        insertTextAtCursor(event.target.result);
      };
      reader.readAsText(file);
    } else if (file.type === 'application/pdf') {
      if (!window.pdfjsLib) {
        setError('PDF library not loaded. Please refresh and try again.');
        return;
      }
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';

      reader.onload = async function() {
        try {
          const typedarray = new Uint8Array(this.result);
          const pdf = await window.pdfjsLib.getDocument(typedarray).promise;
          let text = '';
          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            text += textContent.items.map(item => item.str).join(' ') + '\n';
          }
          insertTextAtCursor(text);
        } catch (err) {
          setError('Failed to extract text from PDF file.');
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      setError('Unsupported file type. Please upload a TXT or PDF file.');
    }
    e.target.value = ''; // Reset file input
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setError('');
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const max = 500;
        if (width > max || height > max) {
          if (width > height) {
            height = Math.round((height * max) / width);
            width = max;
          } else {
            width = Math.round((width * max) / height);
            height = max;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);

        insertHtmlAtCursor(`<img src="${dataUrl}" alt="embedded image" style="max-width: 100%; border-radius: 8px; margin: 8px 0; display: block;" />`);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
    e.target.value = ''; // Reset image input
  };

  const handleSummarize = async () => {
    setAiLoading('summarize');
    try {
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
        <button onClick={() => navigate('/notes')} className="flex items-center gap-1 text-sm text-gray-500 hover:text-[#8DA9A0] transition-colors min-h-[44px] px-2 font-medium">
          <ArrowBackIcon fontSize="small" />
          <span>Back to Notes</span>
        </button>
        <div className="flex items-center gap-2">
          {saved && <span className="text-xs text-green-600 font-semibold mr-2">Auto-saved</span>}
          {isEditing ? (
            <div className="flex gap-2">
              <Button onClick={() => {
                // Cancel: revert inputs and exit edit mode
                setTitle(note?.title || '');
                setContent(note?.content || '');
                setSubject(note?.subject || '');
                setIsEditing(false);
              }} variant="ghost" size="sm">
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={saving} icon={SaveIcon} size="sm">
                {saving ? 'Saving...' : 'Save'}
              </Button>
            </div>
          ) : (
            <Button onClick={() => setIsEditing(true)} icon={EditIcon} size="sm">
              Edit Note
            </Button>
          )}
        </div>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      {/* Title & Subject */}
      <div className="bg-white rounded-xl p-6" style={{ boxShadow: 'var(--shadow-card)' }}>
        {isEditing ? (
          <>
            <input
              className="w-full text-2xl font-bold focus:outline-none bg-transparent mb-2 border-b border-gray-100 pb-1"
              style={{ color: 'var(--color-text)' }}
              placeholder="Note title..."
              value={title}
              onChange={e => { setTitle(e.target.value); setSaved(false); }}
            />
            <input
              className="w-full text-sm focus:outline-none bg-transparent"
              style={{ color: 'var(--color-text-secondary)' }}
              placeholder="Subject (optional)..."
              value={subject}
              onChange={e => { setSubject(e.target.value); setSaved(false); }}
            />
          </>
        ) : (
          <div>
            <h1 className="text-2xl font-extrabold text-[#2C2C2C] mb-1">{title}</h1>
            {subject ? (
              <span className="inline-block bg-[#EEF4F2] text-[#7A958E] text-xs font-semibold px-2.5 py-1 rounded-full border border-[#B0C8C2]">
                {subject}
              </span>
            ) : (
              <span className="text-xs text-gray-400 italic">No subject</span>
            )}
          </div>
        )}
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
        {/* Main editor/viewer container */}
        <div className="lg:col-span-2 space-y-2">
          {isEditing ? (
            <>
              {/* Formatting Toolbar */}
              <div className="bg-white rounded-xl p-2 flex flex-wrap gap-1 items-center" style={{ boxShadow: 'var(--shadow-card)' }}>
                <button type="button" onClick={() => executeCommand('bold')} className="p-1.5 rounded hover:bg-gray-100 text-gray-600 hover:text-[#8DA9A0] transition-colors" title="Bold"><FormatBoldIcon fontSize="small" /></button>
                <button type="button" onClick={() => executeCommand('italic')} className="p-1.5 rounded hover:bg-gray-100 text-gray-600 hover:text-[#8DA9A0] transition-colors" title="Italic"><FormatItalicIcon fontSize="small" /></button>
                <button type="button" onClick={() => executeCommand('underline')} className="p-1.5 rounded hover:bg-gray-100 text-gray-600 hover:text-[#8DA9A0] transition-colors" title="Underline"><FormatUnderlinedIcon fontSize="small" /></button>
                <div className="w-px h-6 bg-gray-200 mx-1" />
                <button type="button" onClick={() => executeCommand('insertUnorderedList')} className="p-1.5 rounded hover:bg-gray-100 text-gray-600 hover:text-[#8DA9A0] transition-colors" title="Bullet List"><FormatListBulletedIcon fontSize="small" /></button>
                <button type="button" onClick={() => executeCommand('insertOrderedList')} className="p-1.5 rounded hover:bg-gray-100 text-gray-600 hover:text-[#8DA9A0] transition-colors" title="Numbered List"><FormatListNumberedIcon fontSize="small" /></button>
                <button type="button" onClick={() => executeCommand('formatBlock', '<h3>')} className="p-1.5 px-2 rounded hover:bg-gray-100 text-gray-600 hover:text-[#8DA9A0] transition-colors font-bold text-xs min-h-[32px] flex items-center justify-center" title="Heading 3">H3</button>
                <button type="button" onClick={() => executeCommand('removeFormat')} className="p-1.5 rounded hover:bg-gray-150 text-gray-600 hover:text-[#8DA9A0] transition-colors" title="Clear Formatting"><FormatClearIcon fontSize="small" /></button>
                <div className="w-px h-6 bg-gray-200 mx-1" />
                <button type="button" onClick={() => fileInputRef.current?.click()} className="p-1.5 rounded hover:bg-gray-100 text-gray-600 hover:text-[#8DA9A0] transition-colors flex items-center gap-1 text-xs font-medium min-h-[32px]" title="Import TXT/PDF"><UploadFileIcon fontSize="small" /><span>Import File</span></button>
                <button type="button" onClick={() => imageInputRef.current?.click()} className="p-1.5 rounded hover:bg-gray-100 text-gray-600 hover:text-[#8DA9A0] transition-colors flex items-center gap-1 text-xs font-medium min-h-[32px]" title="Insert Image"><ImageIcon fontSize="small" /><span>Insert Image</span></button>
                <input type="file" ref={fileInputRef} accept=".txt,.pdf" className="hidden" onChange={handleFileUpload} />
                <input type="file" ref={imageInputRef} accept="image/*" className="hidden" onChange={handleImageUpload} />
              </div>

              <div
                ref={editorRef}
                contentEditable
                suppressContentEditableWarning
                onInput={handleEditorInput}
                className="w-full bg-white rounded-xl p-6 focus:outline-none focus:ring-2 focus:ring-[#8DA9A0]/40 resize-none overflow-y-auto"
                style={{
                  minHeight: '500px',
                  maxHeight: '700px',
                  boxShadow: 'var(--shadow-card)',
                  color: 'var(--color-text)',
                  fontFamily: "'Nunito', sans-serif",
                  fontSize: '1.1rem',
                  lineHeight: '1.85',
                }}
                placeholder="Start writing your notes here..."
              />
            </>
          ) : (
            <div
              className="note-content w-full bg-white rounded-xl p-8 overflow-y-auto leading-relaxed"
              style={{
                minHeight: '500px',
                maxHeight: '700px',
                boxShadow: 'var(--shadow-card)',
                color: 'var(--color-text)',
              }}
              dangerouslySetInnerHTML={{
                __html: content || '<p class="text-gray-400 italic">No content in this note yet. Click Edit Note to start writing.</p>'
              }}
            />
          )}
        </div>

        {/* Side panel */}
        <div className="space-y-4">
          {summary && (
            <div className="bg-white rounded-xl p-5 border border-[#EBE6DE]" style={{ boxShadow: 'var(--shadow-card)' }}>
              <p className="text-sm font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--color-primary-dark)' }}>AI Summary</p>
              <p className="text-sm leading-relaxed animate-fade-in" style={{ color: 'var(--color-text)', whiteSpace: 'pre-wrap' }}>{summary}</p>
            </div>
          )}

          {quiz && quiz.length > 0 && (
            <div className="bg-white rounded-xl p-5 border border-[#EBE6DE]" style={{ boxShadow: 'var(--shadow-card)' }}>
              <p className="text-sm font-bold uppercase tracking-wider mb-4" style={{ color: 'var(--color-primary-dark)' }}>AI Quiz</p>
              <div className="space-y-4">
                {quiz.map((q, i) => (
                  <div key={i} className="border-b border-gray-100 pb-3 last:border-0">
                    <p className="text-sm font-semibold mb-2" style={{ color: 'var(--color-text)' }}>{i + 1}. {q.question}</p>
                    <details className="group">
                      <summary className="text-xs font-semibold cursor-pointer select-none text-[#5F8B8B] hover:text-[#8DA9A0]">Show answer</summary>
                      <p className="text-sm mt-2 p-3 rounded-lg leading-relaxed bg-[#FBF4E6] text-gray-800 border border-[#E4C07A]/40">{q.answer}</p>
                    </details>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!summary && !quiz && (
            <div className="bg-white rounded-xl p-5 text-center border border-[#EBE6DE]" style={{ boxShadow: 'var(--shadow-card)' }}>
              <p className="text-sm text-gray-400">Use the AI tools above to generate a summary or quiz from your notes.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
