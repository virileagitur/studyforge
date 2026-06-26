const { query } = require('../db');

// --- Decks ---
const getDecks = async (req, res, next) => {
  try {
    const result = await query(
      `SELECT d.*, COUNT(f.id)::int as card_count
       FROM flashcard_decks d
       LEFT JOIN flashcards f ON f.deck_id = d.id
       WHERE d.user_id = $1
       GROUP BY d.id
       ORDER BY d.created_at DESC`,
      [req.user.id]
    );
    res.json({ decks: result.rows });
  } catch (err) {
    next(err);
  }
};

const createDeck = async (req, res, next) => {
  try {
    const { name, subject, description } = req.body;
    if (!name) return res.status(400).json({ error: 'Deck name is required.' });

    const result = await query(
      `INSERT INTO flashcard_decks (user_id, name, subject, description) VALUES ($1, $2, $3, $4) RETURNING *`,
      [req.user.id, name.trim(), subject || null, description || null]
    );
    res.status(201).json({ deck: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

const updateDeck = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, subject, description } = req.body;
    const result = await query(
      `UPDATE flashcard_decks SET name=$1, subject=$2, description=$3 WHERE id=$4 AND user_id=$5 RETURNING *`,
      [name, subject || null, description || null, id, req.user.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Deck not found.' });
    res.json({ deck: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

const deleteDeck = async (req, res, next) => {
  try {
    const { id } = req.params;
    await query('DELETE FROM flashcard_decks WHERE id=$1 AND user_id=$2', [id, req.user.id]);
    res.json({ message: 'Deck deleted.' });
  } catch (err) {
    next(err);
  }
};

// --- Flashcards ---
const getFlashcards = async (req, res, next) => {
  try {
    const { deck_id, subject } = req.query;
    let conditions = ['user_id = $1'];
    let params = [req.user.id];
    let idx = 2;

    if (deck_id) { conditions.push(`deck_id = $${idx++}`); params.push(deck_id); }
    if (subject) { conditions.push(`subject = $${idx++}`); params.push(subject); }

    const result = await query(
      `SELECT * FROM flashcards WHERE ${conditions.join(' AND ')} ORDER BY created_at DESC`,
      params
    );
    res.json({ flashcards: result.rows });
  } catch (err) {
    next(err);
  }
};

const createFlashcard = async (req, res, next) => {
  try {
    const { front, back, deck_id, subject } = req.body;
    if (!front || !back) return res.status(400).json({ error: 'Front and back are required.' });

    const result = await query(
      `INSERT INTO flashcards (user_id, deck_id, front, back, subject) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [req.user.id, deck_id || null, front.trim(), back.trim(), subject || null]
    );
    res.status(201).json({ flashcard: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

const updateFlashcard = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { front, back, deck_id, subject, simple_explanation, real_world_example } = req.body;

    const result = await query(
      `UPDATE flashcards SET front=$1, back=$2, deck_id=$3, subject=$4, simple_explanation=$5, real_world_example=$6
       WHERE id=$7 AND user_id=$8 RETURNING *`,
      [front, back, deck_id || null, subject || null, simple_explanation || null, real_world_example || null, id, req.user.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Flashcard not found.' });
    res.json({ flashcard: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

const deleteFlashcard = async (req, res, next) => {
  try {
    const { id } = req.params;
    await query('DELETE FROM flashcards WHERE id=$1 AND user_id=$2', [id, req.user.id]);
    res.json({ message: 'Flashcard deleted.' });
  } catch (err) {
    next(err);
  }
};

const bulkCreateFlashcards = async (req, res, next) => {
  try {
    const { cards, deck_id, subject } = req.body;
    if (!Array.isArray(cards) || cards.length === 0) {
      return res.status(400).json({ error: 'Cards array is required.' });
    }

    const inserted = [];
    for (const card of cards) {
      if (!card.front || !card.back) continue;
      const result = await query(
        `INSERT INTO flashcards (user_id, deck_id, front, back, subject) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [req.user.id, deck_id || null, card.front.trim(), card.back.trim(), subject || null]
      );
      inserted.push(result.rows[0]);
    }
    res.status(201).json({ flashcards: inserted });
  } catch (err) {
    next(err);
  }
};

module.exports = { getDecks, createDeck, updateDeck, deleteDeck, getFlashcards, createFlashcard, updateFlashcard, deleteFlashcard, bulkCreateFlashcards };
