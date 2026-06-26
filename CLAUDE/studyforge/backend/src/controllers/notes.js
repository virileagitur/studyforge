const { query } = require('../db');

const getNotes = async (req, res, next) => {
  try {
    const { subject, search } = req.query;
    let conditions = ['user_id = $1'];
    let params = [req.user.id];
    let idx = 2;

    if (subject) { conditions.push(`subject = $${idx++}`); params.push(subject); }
    if (search) {
      conditions.push(`(title ILIKE $${idx} OR content ILIKE $${idx})`);
      params.push(`%${search}%`);
      idx++;
    }

    const result = await query(
      `SELECT * FROM notes WHERE ${conditions.join(' AND ')} ORDER BY updated_at DESC`,
      params
    );
    res.json({ notes: result.rows });
  } catch (err) {
    next(err);
  }
};

const getNote = async (req, res, next) => {
  try {
    const result = await query('SELECT * FROM notes WHERE id=$1 AND user_id=$2', [req.params.id, req.user.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Note not found.' });
    res.json({ note: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

const createNote = async (req, res, next) => {
  try {
    const { title, content, subject } = req.body;
    if (!title) return res.status(400).json({ error: 'Note title is required.' });

    const result = await query(
      `INSERT INTO notes (user_id, title, content, subject) VALUES ($1, $2, $3, $4) RETURNING *`,
      [req.user.id, title.trim(), content || null, subject || null]
    );
    res.status(201).json({ note: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

const updateNote = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, content, subject, ai_summary, ai_quiz } = req.body;

    const result = await query(
      `UPDATE notes SET title=$1, content=$2, subject=$3, ai_summary=$4, ai_quiz=$5
       WHERE id=$6 AND user_id=$7 RETURNING *`,
      [title, content || null, subject || null, ai_summary || null, ai_quiz || null, id, req.user.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Note not found.' });
    res.json({ note: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

const deleteNote = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await query('DELETE FROM notes WHERE id=$1 AND user_id=$2 RETURNING id', [id, req.user.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Note not found.' });
    res.json({ message: 'Note deleted.' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getNotes, getNote, createNote, updateNote, deleteNote };
