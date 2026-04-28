const router = require('express').Router();
const crypto = require('crypto');
const Razorpay = require('razorpay');
const db = require('../db/pool');
const { asyncHandler } = require('../middleware/error.middleware');
const { requireAdmin, optionalAuth } = require('../middleware/auth.middleware');

const RP_KEY_ID     = process.env.RAZORPAY_KEY_ID;
const RP_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;
const rp = (RP_KEY_ID && RP_KEY_SECRET)
  ? new Razorpay({ key_id: RP_KEY_ID, key_secret: RP_KEY_SECRET })
  : null;

// ─── Public config (UPI, Razorpay key id, QR) ───────────────
router.get('/config', asyncHandler(async (req, res) => {
  const { rows } = await db.query(`SELECT key, value FROM app_settings WHERE key IN
     ('upi_id','upi_name','qr_code_url','razorpay_key_id')`);
  const cfg = Object.fromEntries(rows.map((r) => [r.key, r.value]));
  res.json({
    upi_id:           cfg.upi_id || '',
    upi_name:         cfg.upi_name || 'Nandhi Foundation',
    qr_code_url:      cfg.qr_code_url || null,
    razorpay_key_id:  cfg.razorpay_key_id || RP_KEY_ID || '',
  });
}));

// ─── Razorpay: create order ─────────────────────────────────
router.post('/razorpay/order', optionalAuth, asyncHandler(async (req, res) => {
  if (!rp) return res.status(503).json({ error: 'Razorpay not configured' });
  const { amount, donor_name, donor_email, donor_phone, message } = req.body || {};
  const amt = Number(amount);
  if (!amt || amt <= 0) return res.status(400).json({ error: 'Invalid amount' });

  const order = await rp.orders.create({
    amount: Math.round(amt * 100),       // paise
    currency: 'INR',
    notes: { donor_name, donor_email, donor_phone, message },
  });

  await db.query(
    `INSERT INTO donations (user_id, amount, donor_name, donor_email, donor_phone, message,
                            payment_method, razorpay_order_id, status)
     VALUES ($1, $2, $3, $4, $5, $6, 'razorpay', $7, 'pending')`,
    [req.user?.id || null, amt, donor_name || null, donor_email || null,
     donor_phone || null, message || null, order.id]
  );

  res.json({ order });
}));

// ─── Razorpay: verify payment signature ─────────────────────
router.post('/razorpay/verify', asyncHandler(async (req, res) => {
  if (!RP_KEY_SECRET) return res.status(503).json({ error: 'Razorpay not configured' });
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body || {};
  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return res.status(400).json({ error: 'Missing payment fields' });
  }

  const expected = crypto
    .createHmac('sha256', RP_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex');

  const ok = expected === razorpay_signature;
  await db.query(
    `UPDATE donations SET
       razorpay_payment_id = $1,
       razorpay_signature  = $2,
       status              = $3
     WHERE razorpay_order_id = $4`,
    [razorpay_payment_id, razorpay_signature, ok ? 'success' : 'failed', razorpay_order_id]
  );

  if (!ok) return res.status(400).json({ error: 'Signature mismatch' });
  res.json({ ok: true });
}));

// ─── UPI: log a pending donation (user opened a UPI app) ────
router.post('/upi', optionalAuth, asyncHandler(async (req, res) => {
  const { amount, donor_name, donor_email, donor_phone, message } = req.body || {};
  const amt = Number(amount);
  if (!amt || amt <= 0) return res.status(400).json({ error: 'Invalid amount' });
  const { rows } = await db.query(
    `INSERT INTO donations (user_id, amount, donor_name, donor_email, donor_phone,
                            message, payment_method, status)
     VALUES ($1, $2, $3, $4, $5, $6, 'upi', 'pending') RETURNING *`,
    [req.user?.id || null, amt, donor_name || null, donor_email || null,
     donor_phone || null, message || null]
  );
  res.status(201).json({ donation: rows[0] });
}));

// ─── Admin list ─────────────────────────────────────────────
router.get('/', requireAdmin, asyncHandler(async (req, res) => {
  const { rows } = await db.query(`SELECT * FROM donations ORDER BY created_at DESC LIMIT 500`);
  res.json({ donations: rows });
}));

router.put('/:id/status', requireAdmin, asyncHandler(async (req, res) => {
  const { status } = req.body || {};
  if (!['pending','success','failed','refunded'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }
  const { rows } = await db.query(
    `UPDATE donations SET status = $1 WHERE id = $2 RETURNING *`,
    [status, req.params.id]
  );
  res.json({ donation: rows[0] });
}));

module.exports = router;
