const router = require('express').Router();
const db = require('../db/pool');
const { asyncHandler } = require('../middleware/error.middleware');
const { requireAdmin, optionalAuth, requireAuth } = require('../middleware/auth.middleware');
const { sendNotification } = require('../services/firebase');

// ─── User-facing list ───────────────────────────────────────
router.get('/', optionalAuth, asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  const { rows } = await db.query(
    `SELECT * FROM notifications
     WHERE target_user_id IS NULL OR target_user_id = $1
     ORDER BY sent_at DESC LIMIT 100`,
    [userId || 0]
  );
  res.json({ notifications: rows });
}));

// ─── Register a device for push ─────────────────────────────
router.post('/register-device', requireAuth, asyncHandler(async (req, res) => {
  const { token, platform } = req.body || {};
  if (!token) return res.status(400).json({ error: 'token required' });
  await db.query(
    `INSERT INTO device_tokens (user_id, token, platform) VALUES ($1, $2, $3)
     ON CONFLICT (token) DO UPDATE SET user_id = EXCLUDED.user_id, platform = EXCLUDED.platform`,
    [req.user.id, token, platform || null]
  );
  res.json({ ok: true });
}));

// ─── Admin: send notification + persist ─────────────────────
router.post('/', requireAdmin, asyncHandler(async (req, res) => {
  const { title, body, image_url, link_type, link_value, target_user_id } = req.body || {};
  if (!title) return res.status(400).json({ error: 'title required' });

  const { rows } = await db.query(
    `INSERT INTO notifications (title, body, image_url, link_type, link_value, target_user_id)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [title, body || null, image_url || null, link_type || null, link_value || null, target_user_id || null]
  );
  const notif = rows[0];

  // Best-effort push fan-out
  try {
    let tokenRows;
    if (target_user_id) {
      tokenRows = (await db.query(`SELECT token FROM device_tokens WHERE user_id = $1`, [target_user_id])).rows;
    } else {
      tokenRows = (await db.query(`SELECT token FROM device_tokens`)).rows;
    }
    for (const r of tokenRows) {
      sendNotification(r.token, {
        notification: { title, body: body || '' },
        data: { link_type: link_type || '', link_value: link_value || '' },
      }).catch(() => {});
    }
  } catch (e) { /* notification was saved; push is best-effort */ }

  res.status(201).json({ notification: notif });
}));

router.delete('/:id', requireAdmin, asyncHandler(async (req, res) => {
  await db.query(`DELETE FROM notifications WHERE id = $1`, [req.params.id]);
  res.json({ ok: true });
}));

module.exports = router;
