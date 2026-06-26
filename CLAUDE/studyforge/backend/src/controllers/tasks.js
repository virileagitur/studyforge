const { query } = require('../db');

const getTasks = async (req, res, next) => {
  try {
    const { subject, priority, status, sort = 'due_date', order = 'asc' } = req.query;
    let conditions = ['user_id = $1'];
    let params = [req.user.id];
    let idx = 2;

    if (subject) { conditions.push(`subject = $${idx++}`); params.push(subject); }
    if (priority) { conditions.push(`priority = $${idx++}`); params.push(priority); }
    if (status) { conditions.push(`status = $${idx++}`); params.push(status); }

    const validSorts = ['due_date', 'priority', 'created_at', 'title'];
    const validOrders = ['asc', 'desc'];
    const sortCol = validSorts.includes(sort) ? sort : 'due_date';
    const sortOrder = validOrders.includes(order) ? order : 'asc';

    const sql = `
      SELECT * FROM tasks
      WHERE ${conditions.join(' AND ')}
      ORDER BY ${sortCol} ${sortOrder} NULLS LAST, created_at DESC
    `;
    const result = await query(sql, params);
    res.json({ tasks: result.rows });
  } catch (err) {
    next(err);
  }
};

const createTask = async (req, res, next) => {
  try {
    const { title, description, subject, due_date, priority, status } = req.body;
    if (!title) return res.status(400).json({ error: 'Task title is required.' });

    const result = await query(
      `INSERT INTO tasks (user_id, title, description, subject, due_date, priority, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [req.user.id, title.trim(), description || null, subject || null, due_date || null, priority || 'medium', status || 'not_started']
    );
    res.status(201).json({ task: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

const updateTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, subject, due_date, priority, status } = req.body;

    const result = await query(
      `UPDATE tasks SET title=$1, description=$2, subject=$3, due_date=$4, priority=$5, status=$6
       WHERE id=$7 AND user_id=$8
       RETURNING *`,
      [title, description || null, subject || null, due_date || null, priority, status, id, req.user.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Task not found.' });
    res.json({ task: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

const deleteTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await query('DELETE FROM tasks WHERE id=$1 AND user_id=$2 RETURNING id', [id, req.user.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Task not found.' });
    res.json({ message: 'Task deleted.' });
  } catch (err) {
    next(err);
  }
};

const completeTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await query(
      `UPDATE tasks SET status='completed' WHERE id=$1 AND user_id=$2 RETURNING *`,
      [id, req.user.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Task not found.' });
    res.json({ task: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

module.exports = { getTasks, createTask, updateTask, deleteTask, completeTask };
