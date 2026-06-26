const express = require('express');
const router = express.Router();
const {
  tutorChat, getConversations, getConversation, deleteConversation,
  smartPrioritize, generateStudyGuide,
  summarizeResearch, generateFlashcardsFromResearch,
  summarizeNote, generateQuizFromNote,
  summarizeBook, explainSimply, giveExample,
  dailyCheckIn, homeworkScanner, generateFlashcardsFromText,
} = require('../controllers/ai');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

// Tutor
router.post('/tutor/chat', tutorChat);
router.get('/tutor/conversations', getConversations);
router.get('/tutor/conversations/:id', getConversation);
router.delete('/tutor/conversations/:id', deleteConversation);

// Prioritizer & Study Guide
router.get('/prioritize', smartPrioritize);
router.post('/study-guide', generateStudyGuide);

// Research AI
router.post('/research/:research_id/summarize', summarizeResearch);
router.post('/research/:research_id/flashcards', generateFlashcardsFromResearch);

// Note AI
router.post('/notes/:note_id/summarize', summarizeNote);
router.post('/notes/:note_id/quiz', generateQuizFromNote);

// Book AI
router.post('/books/:book_id/summarize-chapter', summarizeBook);

// Flashcard AI
router.post('/flashcards/:flashcard_id/explain-simply', explainSimply);
router.post('/flashcards/:flashcard_id/give-example', giveExample);
router.post('/flashcards/generate-from-text', generateFlashcardsFromText);

// Daily buddy
router.post('/daily-checkin', dailyCheckIn);

// Homework scanner
router.post('/homework-scan', homeworkScanner);

module.exports = router;
