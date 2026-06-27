const { query } = require('../db');

const getStudyGuides = async (req, res, next) => {
  try {
    const result = await query(
      'SELECT id, topic, subject, content, created_at, updated_at FROM study_guides WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user.id]
    );
    res.json({ studyGuides: result.rows });
  } catch (err) {
    next(err);
  }
};

const createStudyGuide = async (req, res, next) => {
  try {
    const { topic, subject, content } = req.body;
    if (!topic || !content) {
      return res.status(400).json({ error: 'Topic and content are required.' });
    }
    const result = await query(
      'INSERT INTO study_guides (user_id, topic, subject, content) VALUES ($1, $2, $3, $4) RETURNING *',
      [req.user.id, topic.trim(), subject || null, JSON.stringify(content)]
    );
    res.status(201).json({ studyGuide: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

const deleteStudyGuide = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await query(
      'DELETE FROM study_guides WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, req.user.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Study guide not found.' });
    }
    res.json({ message: 'Study guide deleted successfully.', id });
  } catch (err) {
    next(err);
  }
};

module.exports = { getStudyGuides, createStudyGuide, deleteStudyGuide };
