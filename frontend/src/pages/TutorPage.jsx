import React, { useState, useEffect, useRef } from 'react';
import api from '../lib/api';
import { Button, Input, Spinner, Alert, Select } from '../components/ui';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import SendIcon from '@mui/icons-material/Send';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonIcon from '@mui/icons-material/Person';
import { formatDistanceToNow } from 'date-fns';

export default function TutorPage() {
  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [subject, setSubject] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const bottomRef = useRef(null);

  useEffect(() => {
    api.get('/ai/tutor/conversations')
      .then(res => setConversations(res.data.conversations))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, sending]);

  const loadConversation = async (conv) => {
    setActiveConv(conv);
    try {
      const res = await api.get(`/ai/tutor/conversations/${conv.id}`);
      setMessages(res.data.conversation.messages || []);
    } catch { setError('Failed to load conversation.'); }
  };

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!input.trim() || sending) return;
    const msg = input.trim();
    setInput('');
    setSending(true);

    // Optimistically add user message
    const userMsg = { role: 'user', content: msg, timestamp: new Date().toISOString() };
    setMessages(ms => [...ms, userMsg]);

    try {
      const res = await api.post('/ai/tutor/chat', {
        message: msg,
        conversation_id: activeConv?.id,
        subject: subject || undefined,
      });
      setMessages(res.data.conversation.messages);
      const conv = res.data.conversation;
      setActiveConv(conv);
      setConversations(cs => {
        const exists = cs.find(c => c.id === conv.id);
        if (exists) return cs.map(c => c.id === conv.id ? { ...c, ...conv } : c);
        return [conv, ...cs];
      });
    } catch (err) {
      setError('Message failed to send. Please try again.');
      setMessages(ms => ms.slice(0, -1));
    } finally {
      setSending(false);
    }
  };

  const handleNewChat = () => {
    setActiveConv(null);
    setMessages([]);
    setInput('');
  };

  const handleDeleteConv = async (id, e) => {
    e.stopPropagation();
    try {
      await api.delete(`/ai/tutor/conversations/${id}`);
      setConversations(cs => cs.filter(c => c.id !== id));
      if (activeConv?.id === id) { setActiveConv(null); setMessages([]); }
    } catch { setError('Failed to delete conversation.'); }
  };

  return (
    <div className="flex gap-4 h-[calc(100vh-180px)] lg:h-[calc(100vh-120px)]">
      {/* Sidebar: conversation history */}
      <div className="hidden lg:flex flex-col w-64 bg-white rounded-xl overflow-hidden flex-shrink-0" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
        <div className="p-4 border-b border-gray-100">
          <Button onClick={handleNewChat} icon={AddIcon} size="sm" className="w-full">New Conversation</Button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {conversations.map(conv => (
            <div
              key={conv.id}
              onClick={() => loadConversation(conv)}
              className={`flex items-center gap-2 p-3 rounded-lg cursor-pointer text-sm transition-colors ${activeConv?.id === conv.id ? 'bg-orange-50 text-orange-600' : 'hover:bg-gray-50 text-gray-700'}`}
            >
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{conv.session_name}</p>
                <p className="text-xs text-gray-400 truncate">{formatDistanceToNow(new Date(conv.updated_at), { addSuffix: true })}</p>
              </div>
              <button onClick={(e) => handleDeleteConv(conv.id, e)} className="p-1 rounded hover:bg-red-50 text-gray-300 hover:text-red-400 flex-shrink-0">
                <DeleteIcon sx={{ fontSize: 14 }} />
              </button>
            </div>
          ))}
          {conversations.length === 0 && !loading && (
            <p className="text-xs text-gray-400 text-center py-4">No conversations yet</p>
          )}
        </div>
      </div>

      {/* Main chat */}
      <div className="flex-1 flex flex-col bg-white rounded-xl overflow-hidden" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
        {/* Chat header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <SmartToyIcon style={{ color: '#F97316' }} />
            <h3 className="font-semibold" style={{ color: '#1A1A1A' }}>AI Tutor</h3>
          </div>
          <div className="flex items-center gap-2">
            <Select value={subject} onChange={e => setSubject(e.target.value)} className="w-36">
              <option value="">Any subject</option>
              {['Math', 'Science', 'English', 'History', 'Biology', 'Chemistry', 'Physics', 'Programming'].map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </Select>
            <Button variant="ghost" size="sm" onClick={handleNewChat} icon={AddIcon}>New Chat</Button>
          </div>
        </div>

        {error && <div className="px-4 pt-2"><Alert type="error" message={error} onClose={() => setError('')} /></div>}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <SmartToyIcon style={{ fontSize: 56, color: '#FACC15', marginBottom: 12 }} />
              <h3 className="text-lg font-semibold mb-2" style={{ color: '#1A1A1A' }}>Your AI Tutor</h3>
              <p className="text-sm max-w-sm" style={{ color: '#4A4A4A' }}>
                Ask me anything — homework help, concept explanations, essay feedback, or step-by-step math solutions.
              </p>
              <div className="mt-6 flex flex-wrap gap-2 justify-center">
                {['Explain photosynthesis', 'Help with quadratic equations', 'Outline an essay about climate change', 'What is the French Revolution?'].map(q => (
                  <button key={q} onClick={() => { setInput(q); }} className="text-sm px-3 py-2 rounded-lg border border-orange-200 text-orange-600 hover:bg-orange-50 transition-colors">
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-orange-100' : 'bg-yellow-100'}`}>
                {msg.role === 'user'
                  ? <PersonIcon sx={{ fontSize: 18, color: '#F97316' }} />
                  : <SmartToyIcon sx={{ fontSize: 18, color: '#D97706' }} />
                }
              </div>
              <div className={`max-w-[80%] px-4 py-3 rounded-xl text-sm leading-relaxed ${msg.role === 'user' ? 'bg-orange-500 text-white' : 'bg-gray-50 text-gray-900'}`}
                style={{ whiteSpace: 'pre-wrap' }}>
                {msg.content}
              </div>
            </div>
          ))}

          {sending && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center">
                <SmartToyIcon sx={{ fontSize: 18, color: '#D97706' }} />
              </div>
              <div className="px-4 py-3 rounded-xl bg-gray-50">
                <div className="flex gap-1">
                  {[0,1,2].map(i => (
                    <div key={i} className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                  ))}
                </div>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSend} className="border-t border-gray-100 p-4 flex gap-3">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Ask your tutor anything..."
            className="flex-1 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-gray-50 min-h-[44px]"
            style={{ color: '#1A1A1A' }}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }}}
          />
          <Button type="submit" disabled={sending || !input.trim()} icon={SendIcon}>Send</Button>
        </form>
      </div>
    </div>
  );
}
