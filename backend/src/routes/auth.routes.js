const router = require('express').Router();
const bcrypt = require('bcryptjs');
const db = require('../db/pool');
const { asyncHandler } = require('../middleware/error.middleware');
const { requireAuth, signToken } = require('../middleware/auth.middleware');
const { sendOtp: twilioSendOtp, checkOtp: twilioCheckOtp } = require('../services/twilio');

// Normalise to E.164 e.g. "9876543210" or "+91 98765 43210" -> "+919876543210".
// Assumes Indian country code when no prefix is supplied.
function normalisePhone(raw) {
  if (!raw) return null;
  const cleaned = String(raw).replace(/[\s\-()]/g, '');
  if (cleaned.startsWith('+')) return cleaned;
  if (/^\d{10}$/.test(cleaned)) return '+91' + cleaned;
  return cleaned;
}

// ─── Mobile: send OTP via Twilio Verify ─────────────────────
// POST /api/auth/send-otp { phone }
router.post('/send-otp', asyncHandler(async (req, res) => {
  const phone = normalisePhone(req.body?.phone);
  if (!phone || !/^\+\d{8,15}$/.test(phone)) {
    return res.status(400).json({ error: 'Valid phone number required (E.164)' });
  }
  try {
    const verification = await twilioSendOtp(phone);
    res.json({ ok: true, status: verification.status });
  } catch (e) {
    console.error('[send-otp] Twilio error:', e.code || '', e.message);
    // 60200 = invalid parameter; 60410 = max attempts; 60203 = max send attempts
    const status = (e.status && e.status < 600) ? e.status : 502;
    return res.status(status).json({
      error: 'Could not send OTP',
      detail: e.message,
      code: e.code || null,
    });
  }
}));

// ─── Mobile: verify Twilio OTP and exchange for our JWT ─────
// POST /api/auth/verify-otp { phone, code }
router.post('/verify-otp', asyncHandler(async (req, res) => {
  const phone = normalisePhone(req.body?.phone);
  const code  = (req.body?.code || '').toString().trim();

  if (!phone) return res.status(400).json({ error: 'phone required' });
  if (!/^\d{4,8}$/.test(code)) return res.status(400).json({ error: 'code required' });

  let check;
  try {
    check = await twilioCheckOtp(phone, code);
  } catch (e) {
    console.error('[verify-otp] Twilio check error:', e.code || '', e.message);
    return res.status(401).json({ error: 'OTP verification failed', detail: e.message });
  }

  if (check.status !== 'approved') {
    return res.status(401).json({ error: 'Invalid or expired OTP' });
  }

  // Upsert user by phone
  let { rows } = await db.query(
    `SELECT id, phone, name, email, city, role, profile_complete
     FROM users WHERE phone = $1 LIMIT 1`,
    [phone]
  );

  let user;
  if (rows[0]) {
    user = rows[0];
    await db.query(`UPDATE users SET updated_at = NOW() WHERE id = $1`, [user.id]);
  } else {
    const ins = await db.query(
      `INSERT INTO users (phone, role, profile_complete)
       VALUES ($1, 'user', FALSE)
       RETURNING id, phone, name, email, city, role, profile_complete`,
      [phone]
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
