const jwt = require('jsonwebtoken');
const { query } = require('../db');
const JWT_SECRET = process.env.JWT_SECRET || 'studyforge-dev-secret';

const authenticate = (req, res, next) => {
  const token =
    req.cookies?.token ||
    (req.headers.authorization?.startsWith('Bearer ')
      ? req.headers.authorization.slice(7)
      : null);

  if (!token) {
    return res.status(401).json({ error: 'Authentication required.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
};

const requireAdmin = async (req, res, next) => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();

    if (req.user?.role === 'admin' || (adminEmail && req.user?.email?.trim().toLowerCase() === adminEmail)) {
      return next();
    }

    if (req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required.' });
    }

    next();
  } catch (err) {
    next(err);
  }
};

module.exports = { authenticate, requireAdmin };
