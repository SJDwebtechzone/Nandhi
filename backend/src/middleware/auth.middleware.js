const jwt = require('jsonwebtoken');
const db = require('../db/pool');

const JWT_SECRET = process.env.JWT_SECRET || 'change-me';

// Verifies our own JWT (issued by /auth/login or /auth/verify-otp).
// On success, attaches req.user = { id, role, ... }.
async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) return res.status(401).json({ error: 'Authorization token required' });

    const payload = jwt.verify(token, JWT_SECRET);
    // Optional: hydrate from DB so role is fresh
    const { rows } = await db.query(
      `SELECT id, phone, name, email, city, role, profile_complete
       FROM users WHERE id = $1`,
      [payload.id]
    );
    if (!rows[0]) return res.status(401).json({ error: 'User no longer exists' });
    req.user = rows[0];
    return next();
  } catch (e) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// Same as requireAuth but only allows users with role = 'admin'.
async function requireAdmin(req, res, next) {
  return requireAuth(req, res, () => {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    return next();
  });
}

// Same as requireAuth but optional — attaches req.user if a valid token is
// present, otherwise just continues (used for endpoints that work for both
// guests and signed-in users).
async function optionalAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return next();
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const { rows } = await db.query(
      `SELECT id, phone, name, email, city, role, profile_complete
       FROM users WHERE id = $1`,
      [payload.id]
    );
    if (rows[0]) req.user = rows[0];
  } catch (e) { /* ignore — guest */ }
  return next();
}

function signToken(user) {
  return jwt.sign(
    { id: user.id, role: user.role || 'user' },
    JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '30d' }
  );
}

module.exports = { requireAuth, requireAdmin, optionalAuth, signToken, JWT_SECRET };
