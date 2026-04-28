const router = require('express').Router();
const bcrypt = require('bcryptjs');
const db = require('../db/pool');
const { asyncHandler } = require('../middleware/error.middleware');
const { requireAuth, signToken } = require('../middleware/auth.middleware');
const { verifyIdToken } = require('../services/firebase');

// ─── Mobile: exchange Firebase ID token for our JWT ─────────
// POST /api/auth/verify-otp { id_token }
router.post('/verify-otp', asyncHandler(async (req, res) => {
  const { id_token } = req.body || {};
  if (!id_token) return res.status(400).json({ error: 'id_token required' });

  let decoded;
  try {
    decoded = await verifyIdToken(id_token);
  } catch (e) {
    console.error('[verify-otp] Firebase token verification failed:', e.code || '', e.message);
    return res.status(401).json({ error: 'Invalid or expired Firebase token', detail: e.message });
  }

  const firebaseUid = decoded.uid;
  const phone = decoded.phone_number || null;

  // Upsert user by firebase_uid (primary) or phone (fallback)
  let { rows } = await db.query(
    `SELECT id, phone, name, email, city, role, profile_complete
     FROM users WHERE firebase_uid = $1 OR (phone IS NOT NULL AND phone = $2)
     LIMIT 1`,
    [firebaseUid, phone]
  );

  let user;
  if (rows[0]) {
    user = rows[0];
    // Make sure firebase_uid + phone are stored
    await db.query(
      `UPDATE users SET firebase_uid = COALESCE($1, firebase_uid),
                        phone        = COALESCE($2, phone),
                        updated_at   = NOW()
       WHERE id = $3`,
      [firebaseUid, phone, user.id]
    );
  } else {
    const ins = await db.query(
      `INSERT INTO users (firebase_uid, phone, role, profile_complete)
       VALUES ($1, $2, 'user', FALSE)
       RETURNING id, phone, name, email, city, role, profile_complete`,
      [firebaseUid, phone]
    );
    user = ins.rows[0];
  }

  const token = signToken(user);
  res.json({ token, user });
}));

// ─── Admin: email/password login ────────────────────────────
// POST /api/auth/login { email, password }
router.post('/login', asyncHandler(async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'email and password required' });

  const { rows } = await db.query(
    `SELECT id, email, name, role, password_hash FROM users WHERE email = $1 AND role = 'admin'`,
    [email]
  );
  const user = rows[0];
  if (!user || !user.password_hash) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

  const token = signToken(user);
  delete user.password_hash;
  res.json({ token, user });
}));

// ─── Get current user ───────────────────────────────────────
router.get('/me', requireAuth, asyncHandler(async (req, res) => {
  res.json({ user: req.user });
}));

// ─── Update profile (mobile users) ──────────────────────────
router.put('/profile', requireAuth, asyncHandler(async (req, res) => {
  const { name, email, city } = req.body || {};
  const { rows } = await db.query(
    `UPDATE users SET
       name             = COALESCE($1, name),
       email            = COALESCE($2, email),
       city             = COALESCE($3, city),
       profile_complete = TRUE,
       updated_at       = NOW()
     WHERE id = $4
     RETURNING id, phone, name, email, city, role, profile_complete`,
    [name, email, city, req.user.id]
  );
  res.json({ user: rows[0] });
}));

// ─── Delete own account ─────────────────────────────────────
router.delete('/account', requireAuth, asyncHandler(async (req, res) => {
  await db.query(`DELETE FROM users WHERE id = $1`, [req.user.id]);
  res.json({ ok: true });
}));

module.exports = router;
