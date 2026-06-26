const { query, bootstrapDatabase } = require('../db');

const me = async (req, res, next) => {
  try {
    res.json({ user: req.user, message: 'Admin access granted.' });
  } catch (err) {
    next(err);
  }
};

// Admin-only: Force database schema initialization
const initDb = async (req, res, next) => {
  try {
    await bootstrapDatabase();
    res.json({ message: 'Database schema initialized/verified successfully.' });
  } catch (err) {
    next(err);
  }
};

// Admin-only: Get all users
const getUsers = async (req, res, next) => {
  try {
    const result = await query(
      'SELECT id, name, email, role, school, grade_level, created_at FROM users ORDER BY created_at DESC'
    );
    res.json({ users: result.rows });
  } catch (err) {
    next(err);
  }
};

// Admin-only: Delete a user
const deleteUser = async (req, res, next) => {
  try {
    await query('DELETE FROM users WHERE id = $1', [req.params.id]);
    res.json({ message: 'User deleted.' });
  } catch (err) {
    next(err);
  }
};

// Admin-only: Promote a user to admin
const promoteUser = async (req, res, next) => {
  try {
    const result = await query(
      "UPDATE users SET role = 'admin' WHERE id = $1 RETURNING id, name, email, role",
      [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'User not found.' });
    res.json({ user: result.rows[0], message: 'User promoted to admin.' });
  } catch (err) {
    next(err);
  }
};

module.exports = { me, initDb, getUsers, deleteUser, promoteUser };