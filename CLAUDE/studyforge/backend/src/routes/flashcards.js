const express = require('express');
const router = express.Router();
const {
  getDecks, createDeck, updateDeck, deleteDeck,
  getFlashcards, createFlashcard, updateFlashcard, deleteFlashcard, bulkCreateFlashcards
} = require('../controllers/flashcards');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

// Decks
router.get('/decks', getDecks);
router.post('/decks', createDeck);
router.put('/decks/:id', updateDeck);
router.delete('/decks/:id', deleteDeck);

// Cards
router.get('/', getFlashcards);
router.post('/', createFlashcard);
router.post('/bulk', bulkCreateFlashcards);
router.put('/:id', updateFlashcard);
router.delete('/:id', deleteFlashcard);

module.exports = router;
