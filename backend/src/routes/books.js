const express = require('express');
const router = express.Router();
const { getBooks, createBook, updateBook, deleteBook, lookupBookByISBN, generateBookSummary } = require('../controllers/books');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);
router.get('/', getBooks);
router.post('/', createBook);
router.get('/isbn/:isbn', lookupBookByISBN);   // must be before /:id
router.put('/:id', updateBook);
router.delete('/:id', deleteBook);
router.post('/:id/summary', generateBookSummary);

module.exports = router;
