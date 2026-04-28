const router = require('express').Router();
const db = require('../db/pool');
const { asyncHandler } = require('../middleware/error.middleware');
const { requireAdmin, optionalAuth } = require('../middleware/auth.middleware');

router.get('/', asyncHandler(async (req, res) => {
  const { upcoming } = req.query;
  let sql = `SELECT * FROM events WHERE is_published = TRUE`;
  if (upcoming === '1' || upcoming === 'true') sql += ` AND start_date >= NOW()`;
  sql += ` ORDER BY start_date ASC LIMIT 100`;
  const { rows } = await db.query(sql);
  res.json({ events: rows });
}));

router.get('/:id', asyncHandler(async (req, res) => {
  const { rows } = await db.query(`SELECT * FROM events WHERE id = $1`, [req.params.id]);
  if (!rows[0]) return res.status(404).json({ error: 'Event not found' });
  res.json({ event: rows[0] });
}));

// Public: anyone can register for an event (mobile users)
router.post('/:id/register', optionalAuth, asyncHandler(async (req, res) => {
  const { name, email, phone, message } = req.body || {};
  if (!name) return res.status(400).json({ error: 'name required' });
  const { rows } = await db.query(
    `INSERT INTO event_registrations (event_id, user_id, name, email, phone, message)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [req.params.id, req.user?.id || null, name, email || null, phone || null, message || null]
  );
  res.status(201).json({ registration: rows[0] });
}));

// Admin
router.post('/', requireAdmin, asyncHandler(async (req, res) => {
  const fields = ['title','description','image_url','start_date','end_date','location',
                  'is_published','registration_required','registration_link'];
  const values = fields.map((f) => req.body?.[f] ?? null);
  if (!values[0] || !values[3]) return res.status(400).json({ error: 'title and start_date required' });
  const { rows } = await db.query(
    `INSERT INTO events (${fields.join(',')})
     VALUES (${fields.map((_, i) => '$' + (i + 1)).join(',')}) RETURNING *`,
    values
  );
  res.status(201).json({ event: rows[0] });
}));

router.put('/:id', requireAdmin, asyncHandler(async (req, res) => {
  const fields = ['title','description','image_url','start_date','end_date','location',
                  'is_published','registration_required','registration_link'];
  const sets = fields.map((f, i) => `${f} = COALESCE($${i + 1}, ${f})`).join(', ');
  const values = fields.map((f) => req.body?.[f] ?? null);
  values.push(req.params.id);
  const { rows } = await db.query(
    `UPDATE events SET ${sets} WHERE id = $${values.length} RETURNING *`,
    values
  );
  if (!rows[0]) return res.status(404).json({ error: 'Event not found' });
  res.json({ event: rows[0] });
}));

router.delete('/:id', requireAdmin, asyncHandler(async (req, res) => {
  await db.query(`DELETE FROM events WHERE id = $1`, [req.params.id]);
  res.json({ ok: true });
}));

router.get('/:id/registrations', requireAdmin, asyncHandler(async (req, res) => {
  const { rows } = await db.query(
    `SELECT * FROM event_registrations WHERE event_id = $1 ORDER BY created_at DESC`,
    [req.params.id]
  );
  res.json({ registrations: rows });
}));

module.exports = router;
