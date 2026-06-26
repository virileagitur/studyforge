const { query } = require('../db');

const getBooks = async (req, res, next) => {
  try {
    const { status, subject } = req.query;
    let conditions = ['user_id = $1'];
    let params = [req.user.id];
    let idx = 2;

    if (status) { conditions.push(`status = $${idx++}`); params.push(status); }
    if (subject) { conditions.push(`subject = $${idx++}`); params.push(subject); }

    const result = await query(
      `SELECT * FROM books WHERE ${conditions.join(' AND ')} ORDER BY created_at DESC`,
      params
    );
    res.json({ books: result.rows });
  } catch (err) {
    next(err);
  }
};

const createBook = async (req, res, next) => {
  try {
    const { title, author, subject, status, rating, progress_percent, notes } = req.body;
    if (!title) return res.status(400).json({ error: 'Book title is required.' });

    const result = await query(
      `INSERT INTO books (user_id, title, author, subject, status, rating, progress_percent, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [req.user.id, title.trim(), author || null, subject || null, status || 'want_to_read', rating || null, progress_percent || 0, notes || null]
    );
    res.status(201).json({ book: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

const updateBook = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, author, subject, status, rating, progress_percent, notes } = req.body;

    const result = await query(
      `UPDATE books SET title=$1, author=$2, subject=$3, status=$4, rating=$5, progress_percent=$6, notes=$7
       WHERE id=$8 AND user_id=$9
       RETURNING *`,
      [title, author || null, subject || null, status, rating || null, progress_percent || 0, notes || null, id, req.user.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Book not found.' });
    res.json({ book: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

const deleteBook = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await query('DELETE FROM books WHERE id=$1 AND user_id=$2 RETURNING id', [id, req.user.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Book not found.' });
    res.json({ message: 'Book deleted.' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getBooks, createBook, updateBook, deleteBook };
