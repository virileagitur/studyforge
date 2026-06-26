import React, { useEffect, useState, useRef } from 'react';
import api from '../lib/api';
import { PageHeader, Card, Button, Input, Select, Textarea, Modal, EmptyState, Spinner, Alert, Badge } from '../components/ui';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import StyleIcon from '@mui/icons-material/Style';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import FlipIcon from '@mui/icons-material/Flip';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import EmojiObjectsIcon from '@mui/icons-material/EmojiObjects';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import FolderIcon from '@mui/icons-material/Folder';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import UploadFileIcon from '@mui/icons-material/UploadFile';

const EMPTY_DECK = { name: '', subject: '', description: '' };
const EMPTY_CARD = { front: '', back: '', deck_id: '', subject: '' };

export default function FlashcardsPage() {
  const [decks, setDecks] = useState([]);
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [deckModal, setDeckModal] = useState(false);
  const [cardModal, setCardModal] = useState(false);
  const [editDeck, setEditDeck] = useState(null);
  const [editCard, setEditCard] = useState(null);
  const [deckForm, setDeckForm] = useState(EMPTY_DECK);
  const [cardForm, setCardForm] = useState(EMPTY_CARD);
  const [saving, setSaving] = useState(false);
  const [activeDeck, setActiveDeck] = useState(null);
  const [viewAll, setViewAll] = useState(false);
  const [studyMode, setStudyMode] = useState(false);
  const [studyIndex, setStudyIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [reverse, setReverse] = useState(false);
  const [generateModal, setGenerateModal] = useState(false);
  const [genText, setGenText] = useState('');
  const [genTopic, setGenTopic] = useState('');
  const [genDeck, setGenDeck] = useState('');
  const [genCount, setGenCount] = useState(8);
  const [genLoading, setGenLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState({});
  const [expandedCard, setExpandedCard] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    Promise.all([api.get('/flashcards/decks'), api.get('/flashcards')])
      .then(([d, c]) => { setDecks(d.data.decks); setCards(c.data.flashcards); })
      .catch(() => setError('Failed to load flashcards.'))
      .finally(() => setLoading(false));
  }, []);

  const deckCards = activeDeck ? cards.filter(c => c.deck_id === activeDeck.id) : cards;

  // Decks CRUD
  const handleSaveDeck = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editDeck) {
        const res = await api.put(`/flashcards/decks/${editDeck.id}`, deckForm);
        setDecks(ds => ds.map(d => d.id === editDeck.id ? res.data.deck : d));
      } else {
        const res = await api.post('/flashcards/decks', deckForm);
        setDecks(ds => [res.data.deck, ...ds]);
      }
      setDeckModal(false);
    } catch (err) { setError(err.response?.data?.error || 'Failed to save deck.'); }
    finally { setSaving(false); }
  };

  const handleDeleteDeck = async (id, e) => {
    e.stopPropagation();
    if (!confirm('Delete this deck and all its cards?')) return;
    try {
      await api.delete(`/flashcards/decks/${id}`);
      setDecks(ds => ds.filter(d => d.id !== id));
      setCards(cs => cs.filter(c => c.deck_id !== id));
      if (activeDeck?.id === id) setActiveDeck(null);
    } catch { setError('Failed to delete deck.'); }
  };

  // Cards CRUD
  const handleSaveCard = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editCard) {
        const res = await api.put(`/flashcards/${editCard.id}`, cardForm);
        setCards(cs => cs.map(c => c.id === editCard.id ? res.data.flashcard : c));
      } else {
        const res = await api.post('/flashcards', { ...cardForm, deck_id: activeDeck?.id || cardForm.deck_id });
        setCards(cs => [res.data.flashcard, ...cs]);
      }
      setCardModal(false);
    } catch (err) { setError(err.response?.data?.error || 'Failed to save card.'); }
    finally { setSaving(false); }
  };

  const handleDeleteCard = async (id) => {
    if (!confirm('Delete this card?')) return;
    try {
      await api.delete(`/flashcards/${id}`);
      setCards(cs => cs.filter(c => c.id !== id));
    } catch { setError('Failed to delete card.'); }
  };

  // AI Generation
  const handleAI = async (cardId, type) => {
    setAiLoading(s => ({ ...s, [cardId]: type }));
    try {
      const endpoint = type === 'explain' ? `/ai/flashcards/${cardId}/explain-simply` : `/ai/flashcards/${cardId}/give-example`;
      const res = await api.post(endpoint);
      const field = type === 'explain' ? 'simple_explanation' : 'real_world_example';
      const value = type === 'explain' ? res.data.explanation : res.data.example;
      setCards(cs => cs.map(c => c.id === cardId ? { ...c, [field]: value } : c));
    } catch { setError('AI request failed.'); }
    finally { setAiLoading(s => ({ ...s, [cardId]: null })); }
  };

  const handleGenerate = async () => {
    if (!genText && !genTopic) return setError('Enter text or a topic.');
    setGenLoading(true);
    setError('');
    try {
      const res = await api.post('/ai/flashcards/generate-from-text', {
        text: genText,
        topic: genTopic,
        deck_id: genDeck || null,
        count: genCount,
        subject: activeDeck?.subject || null
      });
      setCards(cs => [...res.data.flashcards, ...cs]);
      // Update deck count manually
      if (genDeck) {
        setDecks(ds => ds.map(d => d.id === genDeck ? { ...d, card_count: parseInt(d.card_count || 0) + res.data.flashcards.length } : d));
      }
      setGenerateModal(false);
      setSuccess(`Generated ${res.data.flashcards.length} flashcards.`);
      setGenText('');
      setGenTopic('');
    } catch { setError('Generation failed.'); }
    finally { setGenLoading(false); }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setError('');
    const reader = new FileReader();

    if (file.type === 'text/plain') {
      reader.onload = (event) => {
        setGenText(event.target.result);
      };
      reader.readAsText(file);
    } else if (file.type === 'application/pdf') {
      if (!window.pdfjsLib) {
        setError('PDF library not loaded yet. Please wait a moment.');
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
          setGenText(text);
        } catch (err) {
          setError('Failed to extract text from PDF file.');
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      setError('Unsupported file type. Please upload a TXT or PDF file.');
    }
  };

  const setDF = (k) => (e) => setDeckForm(f => ({ ...f, [k]: e.target.value }));
  const setCF = (k) => (e) => setCardForm(f => ({ ...f, [k]: e.target.value }));

  const openStudy = () => { setStudyIndex(0); setFlipped(false); setStudyMode(true); };
  const studyCard = deckCards[studyIndex];
  const studyFront = reverse ? studyCard?.back : studyCard?.front;
  const studyBack = reverse ? studyCard?.front : studyCard?.back;

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  // Study mode
  if (studyMode) return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => setStudyMode(false)} icon={ChevronLeftIcon}>Exit Study</Button>
        <span className="text-sm text-gray-500">{studyIndex + 1} / {deckCards.length}</span>
        <Button variant="outline" size="sm" onClick={() => setReverse(r => !r)}>
          {reverse ? 'Back→Front' : 'Front→Back'}
        </Button>
      </div>

      {studyCard && (
        <div
          className="cursor-pointer select-none"
          onClick={() => setFlipped(f => !f)}
        >
          <div className="bg-white rounded-2xl p-10 text-center min-h-[300px] flex flex-col items-center justify-center gap-4 transition-all" style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
            <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#F97316' }}>{flipped ? 'Answer' : 'Question'}</p>
            <p className="text-2xl font-semibold leading-relaxed" style={{ color: '#1A1A1A', fontFamily: 'Georgia, Cambria, serif' }}>{flipped ? studyBack : studyFront}</p>
            {!flipped && <p className="text-xs text-gray-400 mt-4">Tap to reveal</p>}
          </div>
        </div>
      )}

      <div className="flex gap-3 justify-center">
        <Button variant="ghost" icon={ChevronLeftIcon} onClick={() => { setStudyIndex(i => Math.max(0, i-1)); setFlipped(false); }} disabled={studyIndex === 0}>Prev</Button>
        <Button icon={FlipIcon} variant="secondary" onClick={() => setFlipped(f => !f)}>Flip</Button>
        <Button onClick={() => { setStudyIndex(i => Math.min(deckCards.length-1, i+1)); setFlipped(false); }} disabled={studyIndex === deckCards.length-1}>Next <ChevronRightIcon /></Button>
      </div>

      {deckCards.length === 0 && <p className="text-center text-gray-500">No cards in this deck.</p>}
    </div>
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title={activeDeck ? `Deck: ${activeDeck.name}` : viewAll ? 'All Flashcards' : 'Flashcard Decks'}
        subtitle={activeDeck ? activeDeck.description || 'Practice cards in this deck' : 'Create, organize, and study your flashcard decks'}
        action={
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => { setGenDeck(activeDeck?.id || ''); setGenerateModal(true); }} icon={AutoFixHighIcon}>AI Generate</Button>
            <Button onClick={() => { setDeckForm(EMPTY_DECK); setEditDeck(null); setDeckModal(true); }} icon={AddIcon}>New Deck</Button>
          </div>
        }
      />

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}
      {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}

      {/* Navigation & Tabs */}
      <div className="flex justify-between items-center flex-wrap gap-2">
        <div className="flex gap-2">
          {activeDeck && (
            <Button variant="ghost" onClick={() => setActiveDeck(null)} icon={ArrowBackIcon} size="sm">
              Back to Decks
            </Button>
          )}
          {viewAll && (
            <Button variant="ghost" onClick={() => setViewAll(false)} icon={ArrowBackIcon} size="sm">
              Back to Decks
            </Button>
          )}
        </div>
        <div className="flex gap-2">
          {!activeDeck && !viewAll && (
            <button
              onClick={() => setViewAll(true)}
              className="text-sm font-semibold hover:underline px-2 text-orange-500 min-h-[36px]"
            >
              View All Cards ({cards.length})
            </button>
          )}
          {activeDeck && deckCards.length > 0 && (
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" onClick={openStudy} icon={PlayArrowIcon}>Study Deck ({deckCards.length})</Button>
              <Button variant="outline" size="sm" onClick={() => { setCardForm({ ...EMPTY_CARD, deck_id: activeDeck.id }); setEditCard(null); setCardModal(true); }} icon={AddIcon}>Add Card</Button>
            </div>
          )}
        </div>
      </div>

      {/* Main Grid View */}
      {/* 1. Decks List (Default State) */}
      {!activeDeck && !viewAll && (
        decks.length === 0 ? (
          <EmptyState icon={FolderIcon} title="No decks yet"
            description="Create folders or decks to group your flashcards."
            action={<Button onClick={() => { setDeckForm(EMPTY_DECK); setEditDeck(null); setDeckModal(true); }} icon={AddIcon}>New Deck</Button>} />
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {decks.map(deck => (
              <Card key={deck.id} hover onClick={() => setActiveDeck(deck)}>
                <div className="flex justify-between items-start gap-2 mb-3">
                  <div className="flex items-center gap-2 text-orange-500">
                    <FolderIcon />
                    <h3 className="font-bold text-base text-gray-900 truncate">{deck.name}</h3>
                  </div>
                  <div className="flex gap-1 flex-shrink-0" onClick={e => e.stopPropagation()}>
                    <button onClick={() => { setDeckForm({ name: deck.name, subject: deck.subject||'', description: deck.description||'' }); setEditDeck(deck); setDeckModal(true); }}
                      className="p-1 rounded hover:bg-orange-50 text-gray-400 hover:text-orange-500"><EditIcon sx={{ fontSize: 16 }} /></button>
                    <button onClick={(e) => handleDeleteDeck(deck.id, e)} className="p-1 rounded hover:bg-red-50 text-gray-400 hover:text-red-500"><DeleteIcon sx={{ fontSize: 16 }} /></button>
                  </div>
                </div>

                <p className="text-xs text-gray-500 min-h-[32px] line-clamp-2 mb-3">{deck.description || 'No description provided.'}</p>

                <div className="flex justify-between items-center pt-3 border-t border-gray-100 flex-wrap gap-2">
                  {deck.subject ? <Badge label={deck.subject} color="orange" /> : <div />}
                  <span className="text-xs font-semibold text-gray-400">{deck.card_count || 0} cards</span>
                </div>

                <div className="mt-3 flex gap-2" onClick={e => e.stopPropagation()}>
                  <Button variant="secondary" size="sm" className="w-full" onClick={() => { setActiveDeck(deck); setStudyIndex(0); setFlipped(false); setStudyMode(true); }} disabled={parseInt(deck.card_count || 0) === 0} icon={PlayArrowIcon}>Study</Button>
                </div>
              </Card>
            ))}
          </div>
        )
      )}

      {/* 2. Active Deck Cards OR View All Cards Grid */}
      {(activeDeck || viewAll) && (
        deckCards.length === 0 ? (
          <EmptyState icon={StyleIcon} title={activeDeck ? 'No cards in this deck' : 'No flashcards yet'}
            description="Create cards manually or generate them from text/topics with AI."
            action={<Button onClick={() => { setCardForm({ ...EMPTY_CARD, deck_id: activeDeck?.id || '' }); setEditCard(null); setCardModal(true); }} icon={AddIcon}>Add Card</Button>} />
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
            {deckCards.map(card => (
              <Card key={card.id}>
                <div className="flex justify-between items-start gap-2 mb-3">
                  <p className="text-xs font-semibold uppercase tracking-wider text-orange-500">Front</p>
                  <div className="flex gap-1">
                    <button onClick={() => { setCardForm({ front: card.front, back: card.back, deck_id: card.deck_id||'', subject: card.subject||'' }); setEditCard(card); setCardModal(true); }}
                      className="p-1 rounded hover:bg-orange-50 text-gray-400 hover:text-orange-500"><EditIcon sx={{ fontSize: 16 }} /></button>
                    <button onClick={() => handleDeleteCard(card.id)} className="p-1 rounded hover:bg-red-50 text-gray-400 hover:text-red-500"><DeleteIcon sx={{ fontSize: 16 }} /></button>
                  </div>
                </div>

                <p className="font-normal text-lg mb-4 leading-relaxed" style={{ color: '#1A1A1A', fontFamily: 'Georgia, Cambria, serif' }}>{card.front}</p>

                <div className="border-t border-gray-100 pt-3">
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Back</p>
                  <p className="text-base leading-relaxed" style={{ color: '#4A4A4A', fontFamily: 'Georgia, Cambria, serif' }}>{card.back}</p>
                </div>

                {/* AI expanded view */}
                {expandedCard === card.id && (
                  <div className="mt-3 space-y-2 animate-fade-in">
                    {card.simple_explanation && (
                      <div className="p-2.5 rounded-lg text-xs" style={{ background: '#FEF3C7' }}>
                        <p className="font-semibold text-orange-600 mb-1">Simple Explanation</p>
                        <p className="leading-relaxed" style={{ fontFamily: 'Georgia, Cambria, serif' }}>{card.simple_explanation}</p>
                      </div>
                    )}
                    {card.real_world_example && (
                      <div className="p-2.5 rounded-lg text-xs" style={{ background: '#ECFDF5' }}>
                        <p className="font-semibold text-green-600 mb-1">Real-World Example</p>
                        <p className="leading-relaxed" style={{ fontFamily: 'Georgia, Cambria, serif' }}>{card.real_world_example}</p>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-gray-100">
                  <button onClick={() => handleAI(card.id, 'explain')} disabled={!!aiLoading[card.id]}
                    className="flex items-center gap-1 text-xs px-2 py-1.5 rounded-lg hover:bg-orange-50 text-gray-500 hover:text-orange-500 transition-colors min-h-[32px]">
                    <LightbulbIcon sx={{ fontSize: 14 }} />
                    {aiLoading[card.id] === 'explain' ? 'Loading...' : 'Explain Simply'}
                  </button>
                  <button onClick={() => handleAI(card.id, 'example')} disabled={!!aiLoading[card.id]}
                    className="flex items-center gap-1 text-xs px-2 py-1.5 rounded-lg hover:bg-orange-50 text-gray-500 hover:text-orange-500 transition-colors min-h-[32px]">
                    <EmojiObjectsIcon sx={{ fontSize: 14 }} />
                    {aiLoading[card.id] === 'example' ? 'Loading...' : 'Give Example'}
                  </button>
                  {(card.simple_explanation || card.real_world_example) && (
                    <button onClick={() => setExpandedCard(expandedCard === card.id ? null : card.id)}
                      className="text-xs px-2 py-1.5 rounded-lg hover:bg-gray-100 text-gray-500 min-h-[32px] font-medium ml-auto">
                      {expandedCard === card.id ? 'Hide Extra' : 'Show Extra'}
                    </button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )
      )}

      {/* Deck Modal */}
      <Modal open={deckModal} onClose={() => setDeckModal(false)} title={editDeck ? 'Edit Deck' : 'New Deck'}>
        <form onSubmit={handleSaveDeck} className="space-y-4">
          <Input label="Deck name *" placeholder="e.g. Biology Chapter 5" value={deckForm.name} onChange={setDF('name')} required />
          <Input label="Subject" placeholder="e.g. Biology" value={deckForm.subject} onChange={setDF('subject')} />
          <Textarea label="Description" placeholder="What this deck covers..." value={deckForm.description} onChange={setDF('description')} rows={2} />
          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={saving} className="flex-1">{saving ? 'Saving...' : editDeck ? 'Save' : 'Create Deck'}</Button>
            <Button type="button" variant="ghost" onClick={() => setDeckModal(false)}>Cancel</Button>
          </div>
        </form>
      </Modal>

      {/* Card Modal */}
      <Modal open={cardModal} onClose={() => setCardModal(false)} title={editCard ? 'Edit Card' : 'Add Card'}>
        <form onSubmit={handleSaveCard} className="space-y-4">
          <Textarea label="Front (question/term) *" placeholder="What is photosynthesis?" value={cardForm.front} onChange={setCF('front')} rows={3} required />
          <Textarea label="Back (answer/definition) *" placeholder="The process by which plants convert sunlight..." value={cardForm.back} onChange={setCF('back')} rows={3} required />
          <div className="grid grid-cols-2 gap-4">
            <Select label="Deck" value={cardForm.deck_id} onChange={setCF('deck_id')}>
              <option value="">No deck</option>
              {decks.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </Select>
            <Input label="Subject" placeholder="e.g. Biology" value={cardForm.subject} onChange={setCF('subject')} />
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={saving} className="flex-1">{saving ? 'Saving...' : editCard ? 'Save Changes' : 'Add Card'}</Button>
            <Button type="button" variant="ghost" onClick={() => setCardModal(false)}>Cancel</Button>
          </div>
        </form>
      </Modal>

      {/* AI Generate Modal */}
      <Modal open={generateModal} onClose={() => setGenerateModal(false)} title="AI Generate Flashcards" width="max-w-xl">
        <div className="space-y-4">
          {/* File Upload */}
          <div className="border border-dashed border-gray-200 rounded-xl p-4 text-center bg-gray-50">
            <button type="button" onClick={() => fileInputRef.current?.click()} className="flex items-center gap-1.5 text-sm font-semibold text-orange-500 hover:text-orange-600 transition-colors mx-auto min-h-[36px]">
              <UploadFileIcon fontSize="small" />
              <span>Upload TXT or PDF file</span>
            </button>
            <p className="text-[10px] text-gray-400 mt-1">Upload study materials to generate flashcards from file content</p>
            <input type="file" ref={fileInputRef} accept=".txt,.pdf" className="hidden" onChange={handleFileUpload} />
          </div>

          <Textarea label="Paste text (optional)" placeholder="Paste article, notes, or any text..." value={genText} onChange={e => setGenText(e.target.value)} rows={4} />
          <Input label="Or enter a topic" placeholder="e.g. The French Revolution" value={genTopic} onChange={e => setGenTopic(e.target.value)} />
          
          <div className="grid grid-cols-2 gap-4">
            <Select label="Add to deck (optional)" value={genDeck} onChange={e => setGenDeck(e.target.value)}>
              <option value="">No deck</option>
              {decks.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </Select>
            
            {/* Dynamic Card count slider */}
            <div>
              <label className="block text-sm font-semibold mb-1" style={{ color: '#4A4A4A' }}>Cards count: {genCount}</label>
              <input
                type="range"
                min="5"
                max="20"
                step="1"
                value={genCount}
                onChange={e => setGenCount(parseInt(e.target.value))}
                className="w-full accent-orange-500 cursor-pointer h-2 bg-gray-200 rounded-lg appearance-none"
              />
              <div className="flex justify-between text-[10px] text-gray-400 mt-1 font-semibold">
                <span>5</span>
                <span>10</span>
                <span>15</span>
                <span>20</span>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button onClick={handleGenerate} disabled={genLoading} icon={AutoFixHighIcon} className="flex-1">
              {genLoading ? 'Generating...' : `Generate ${genCount} Flashcards`}
            </Button>
            <Button variant="ghost" onClick={() => setGenerateModal(false)}>Cancel</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
