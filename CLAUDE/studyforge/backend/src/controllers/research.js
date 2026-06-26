const { query } = require('../db');

const getResearch = async (req, res, next) => {
  try {
    const { subject, search } = req.query;
    let conditions = ['user_id = $1'];
    let params = [req.user.id];
    let idx = 2;

    if (subject) { conditions.push(`subject = $${idx++}`); params.push(subject); }
    if (search) {
      conditions.push(`(title ILIKE $${idx} OR notes ILIKE $${idx} OR url ILIKE $${idx})`);
      params.push(`%${search}%`);
      idx++;
    }

    const result = await query(
      `SELECT * FROM research_items WHERE ${conditions.join(' AND ')} ORDER BY created_at DESC`,
      params
    );
    res.json({ research: result.rows });
  } catch (err) {
    next(err);
  }
};

const createResearch = async (req, res, next) => {
  try {
    const { title, url, source_type, notes, content, subject, tags } = req.body;
    if (!title) return res.status(400).json({ error: 'Title is required.' });

    const result = await query(
      `INSERT INTO research_items (user_id, title, url, source_type, notes, content, subject, tags)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [req.user.id, title.trim(), url || null, source_type || 'website', notes || null, content || null, subject || null, tags || []]
    );
    res.status(201).json({ research: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

const updateResearch = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, url, source_type, notes, content, subject, tags, ai_summary } = req.body;

    const result = await query(
      `UPDATE research_items SET title=$1, url=$2, source_type=$3, notes=$4, content=$5, subject=$6, tags=$7, ai_summary=$8
       WHERE id=$9 AND user_id=$10
       RETURNING *`,
      [title, url || null, source_type, notes || null, content || null, subject || null, tags || [], ai_summary || null, id, req.user.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Research item not found.' });
    res.json({ research: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

const deleteResearch = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await query('DELETE FROM research_items WHERE id=$1 AND user_id=$2 RETURNING id', [id, req.user.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Research item not found.' });
    res.json({ message: 'Research item deleted.' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getResearch, createResearch, updateResearch, deleteResearch };
