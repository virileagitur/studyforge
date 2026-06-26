import React, { useEffect, useState } from 'react';
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
  const [studyMode, setStudyMode] = useState(false);
  const [studyIndex, setStudyIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [reverse, setReverse] = useState(false);
  const [generateModal, setGenerateModal] = useState(false);
  const [genText, setGenText] = useState('');
  const [genTopic, setGenTopic] = useState('');
  const [genDeck, setGenDeck] = useState('');
  const [genLoading, setGenLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState({});
  const [expandedCard, setExpandedCard] = useState(null);

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

  const handleDeleteDeck = async (id) => {
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

  // AI
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
    try {
      const res = await api.post('/ai/flashcards/generate-from-text', { text: genText, topic: genTopic, deck_id: genDeck || null });
      setCards(cs => [...res.data.flashcards, ...cs]);
      setGenerateModal(false);
      setSuccess(`Generated ${res.data.flashcards.length} flashcards.`);
    } catch { setError('Generation failed.'); }
    finally { setGenLoading(false); }
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
          <div className="bg-white rounded-2xl p-8 text-center min-h-[240px] flex flex-col items-center justify-center gap-4 transition-all" style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
            <p className="text-xs font-medium uppercase tracking-wide" style={{ color: '#F97316' }}>{flipped ? 'Answer' : 'Question'}</p>
            <p className="text-lg font-medium" style={{ color: '#1A1A1A' }}>{flipped ? studyBack : studyFront}</p>
            {!flipped && <p className="text-xs text-gray-400">Tap to reveal</p>}
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
        title="Flashcards"
        subtitle="Create, organize, and study your flashcard decks"
        action={
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => setGenerateModal(true)} icon={AutoFixHighIcon}>AI Generate</Button>
            <Button onClick={() => { setDeckForm(EMPTY_DECK); setEditDeck(null); setDeckModal(true); }} icon={AddIcon}>New Deck</Button>
          </div>
        }
      />

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}
      {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}

      {/* Deck selector */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setActiveDeck(null)}
          className={`px-4 py-2 rounded-lg text-sm font-medium min-h-[44px] transition-colors ${!activeDeck ? 'bg-orange-500 text-white' : 'bg-white text-gray-600 hover:bg-orange-50'}`}
          style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}
        >
          All Cards ({cards.length})
        </button>
        {decks.map(deck => (
          <div key={deck.id} className="flex items-center gap-1">
            <button
              onClick={() => setActiveDeck(deck)}
              className={`px-4 py-2 rounded-lg text-sm font-medium min-h-[44px] transition-colors ${activeDeck?.id === deck.id ? 'bg-orange-500 text-white' : 'bg-white text-gray-600 hover:bg-orange-50'}`}
              style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}
            >
              {deck.name} ({deck.card_count})
            </button>
            <button onClick={() => { setDeckForm({ name: deck.name, subject: deck.subject||'', description: deck.description||'' }); setEditDeck(deck); setDeckModal(true); }}
              className="p-1.5 rounded hover:bg-orange-50 text-gray-400 hover:text-orange-500">
              <EditIcon fontSize="small" />
            </button>
            <button onClick={() => handleDeleteDeck(deck.id)} className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-500">
              <DeleteIcon fontSize="small" />
            </button>
          </div>
        ))}
      </div>

      {/* Study & Add buttons */}
      {deckCards.length > 0 && (
        <div className="flex gap-3">
          <Button variant="secondary" onClick={openStudy} icon={PlayArrowIcon}>Study {deckCards.length} Cards</Button>
          <Button variant="outline" onClick={() => { setCardForm({ ...EMPTY_CARD, deck_id: activeDeck?.id || '' }); setEditCard(null); setCardModal(true); }} icon={AddIcon}>Add Card</Button>
        </div>
      )}

      {deckCards.length === 0 ? (
        <EmptyState icon={StyleIcon} title={activeDeck ? 'No cards in this deck' : 'No flashcards yet'}
          description="Create cards manually or use AI to generate them from text or a topic."
          action={<Button onClick={() => { setCardForm(EMPTY_CARD); setEditCard(null); setCardModal(true); }} icon={AddIcon}>Add Card</Button>} />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {deckCards.map(card => (
            <Card key={card.id}>
              <div className="flex justify-between items-start gap-2 mb-3">
                <p className="text-xs font-semibold uppercase" style={{ color: '#F97316' }}>Front</p>
                <div className="flex gap-1">
                  <button onClick={() => { setCardForm({ front: card.front, back: card.back, deck_id: card.deck_id||'', subject: card.subject||'' }); setEditCard(card); setCardModal(true); }}
                    className="p-1 rounded hover:bg-orange-50 text-gray-400 hover:text-orange-500"><EditIcon sx={{ fontSize: 16 }} /></button>
                  <button onClick={() => handleDeleteCard(card.id)} className="p-1 rounded hover:bg-red-50 text-gray-400 hover:text-red-500"><DeleteIcon sx={{ fontSize: 16 }} /></button>
                </div>
              </div>
              <p className="font-medium text-sm mb-3" style={{ color: '#1A1A1A' }}>{card.front}</p>
              <div className="border-t border-gray-100 pt-3">
                <p className="text-xs font-semibold uppercase mb-1" style={{ color: '#4A4A4A' }}>Back</p>
                <p className="text-sm" style={{ color: '#4A4A4A' }}>{card.back}</p>
              </div>

              {/* AI expanded view */}
              {expandedCard === card.id && (
                <div className="mt-3 space-y-2">
                  {card.simple_explanation && (
                    <div className="p-2 rounded-lg text-xs" style={{ background: '#FEF3C7' }}>
                      <p className="font-semibold text-orange-600 mb-1">Simple Explanation</p>
                      <p>{card.simple_explanation}</p>
                    </div>
                  )}
                  {card.real_world_example && (
                    <div className="p-2 rounded-lg text-xs" style={{ background: '#ECFDF5' }}>
                      <p className="font-semibold text-green-600 mb-1">Real-World Example</p>
                      <p>{card.real_world_example}</p>
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
                    className="text-xs px-2 py-1.5 rounded-lg hover:bg-gray-100 text-gray-500 min-h-[32px]">
                    {expandedCard === card.id ? 'Hide' : 'Show AI'}
                  </button>
                )}
              </div>
            </Card>
          ))}
        </div>
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
          <Textarea label="Paste text (optional)" placeholder="Paste article, notes, or any text..." value={genText} onChange={e => setGenText(e.target.value)} rows={4} />
          <Input label="Or enter a topic" placeholder="e.g. The French Revolution" value={genTopic} onChange={e => setGenTopic(e.target.value)} />
          <Select label="Add to deck (optional)" value={genDeck} onChange={e => setGenDeck(e.target.value)}>
            <option value="">No deck</option>
            {decks.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </Select>
          <div className="flex gap-3 pt-2">
            <Button onClick={handleGenerate} disabled={genLoading} icon={AutoFixHighIcon} className="flex-1">
              {genLoading ? 'Generating...' : 'Generate Flashcards'}
            </Button>
            <Button variant="ghost" onClick={() => setGenerateModal(false)}>Cancel</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
