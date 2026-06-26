const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query } = require('../db');

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

const ADMIN_EMAIL = process.env.ADMIN_EMAIL?.trim().toLowerCase();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const JWT_SECRET = process.env.JWT_SECRET || 'studyforge-dev-secret';

const isConfiguredAdmin = (email) => {
  return Boolean(ADMIN_EMAIL && email && email.trim().toLowerCase() === ADMIN_EMAIL);
};

const promoteToAdminIfConfigured = async (userId, email) => {
  if (!isConfiguredAdmin(email)) {
    return 'user';
  }

  await query("UPDATE users SET role = 'admin' WHERE id = $1", [userId]);
  return 'admin';
};

const ensureAdminAccount = async () => {
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    return null;
  }

  const password_hash = await bcrypt.hash(ADMIN_PASSWORD, 12);
  const existing = await query('SELECT id FROM users WHERE email = $1', [ADMIN_EMAIL]);

  if (existing.rows.length > 0) {
    const result = await query(
      `UPDATE users SET name = $1, password_hash = $2, role = 'admin'
       WHERE email = $3
       RETURNING id, name, email, role, school, grade_level, subjects, created_at`,
      ['Admin', password_hash, ADMIN_EMAIL]
    );
    return result.rows[0];
  }

  const result = await query(
    `INSERT INTO users (name, email, password_hash, role)
     VALUES ($1, $2, $3, 'admin')
     RETURNING id, name, email, role, school, grade_level, subjects, created_at`,
    ['Admin', ADMIN_EMAIL, password_hash]
  );

  return result.rows[0];
};

const register = async (req, res, next) => {
  try {
    const { name, email, password, school, grade_level, subjects } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters.' });
    }

    const existing = await query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }

    const password_hash = await bcrypt.hash(password, 12);
    const role = isConfiguredAdmin(email) ? 'admin' : 'user';

    const result = await query(
      `INSERT INTO users (name, email, password_hash, role, school, grade_level, subjects)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, name, email, role, school, grade_level, subjects, created_at`,
      [name.trim(), email.toLowerCase().trim(), password_hash, role, school || null, grade_level || null, subjects || []]
    );

    const user = result.rows[0];
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    res.cookie('token', token, COOKIE_OPTIONS);
    res.status(201).json({ user, token });
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const isAdminLogin = ADMIN_EMAIL && ADMIN_PASSWORD && normalizedEmail === ADMIN_EMAIL && password === ADMIN_PASSWORD;

    let user;
    if (isAdminLogin) {
      user = {
        id: 'admin',
        name: 'Admin',
        email: ADMIN_EMAIL,
        role: 'admin',
        school: null,
        grade_level: null,
        subjects: [],
        created_at: new Date().toISOString(),
      };
    } else {
      const result = await query('SELECT * FROM users WHERE email = $1', [normalizedEmail]);
      if (result.rows.length === 0) {
        return res.status(401).json({ error: 'Invalid email or password.' });
      }

      user = result.rows[0];
      const valid = await bcrypt.compare(password, user.password_hash);
      if (!valid) {
        return res.status(401).json({ error: 'Invalid email or password.' });
      }

      user.role = await promoteToAdminIfConfigured(user.id, user.email);
    }

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    res.cookie('token', token, COOKIE_OPTIONS);

    const { password_hash, ...safeUser } = user;
    res.json({ user: safeUser, token });
  } catch (err) {
    next(err);
  }
};

const logout = (req, res) => {
  res.clearCookie('token', COOKIE_OPTIONS);
  res.json({ message: 'Logged out successfully.' });
};

const me = async (req, res, next) => {
  try {
    if (req.user?.role === 'admin' && ADMIN_EMAIL && req.user?.email?.trim().toLowerCase() === ADMIN_EMAIL) {
      return res.json({
        user: {
          id: 'admin',
          name: 'Admin',
          email: ADMIN_EMAIL,
          role: 'admin',
          school: null,
          grade_level: null,
          subjects: [],
          created_at: new Date().toISOString(),
        },
      });
    }

    const result = await query(
      'SELECT id, name, email, role, school, grade_level, subjects, created_at FROM users WHERE id = $1',
      [req.user.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }

    if (isConfiguredAdmin(result.rows[0].email) && result.rows[0].role !== 'admin') {
      await query("UPDATE users SET role = 'admin' WHERE id = $1", [result.rows[0].id]);
      result.rows[0].role = 'admin';
    }

    res.json({ user: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const { name, school, grade_level, subjects } = req.body;
    const result = await query(
      `UPDATE users SET name=$1, school=$2, grade_level=$3, subjects=$4
       WHERE id=$5
       RETURNING id, name, email, role, school, grade_level, subjects, created_at`,
      [name, school || null, grade_level || null, subjects || [], req.user.id]
    );
    res.json({ user: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login, logout, me, updateProfile };
