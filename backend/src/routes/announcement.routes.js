const router = require('express').Router();
const db = require('../db/pool');
const { asyncHandler } = require('../middleware/error.middleware');
const { requireAdmin } = require('../middleware/auth.middleware');

router.get('/', asyncHandler(async (req, res) => {
  const { rows } = await db.query(
    `SELECT * FROM announcements WHERE is_active = TRUE ORDER BY created_at DESC LIMIT 50`
  );
  res.json({ announcements: rows });
}));

router.post('/', requireAdmin, asyncHandler(async (req, res) => {
  const { title, body, is_active } = req.body || {};
  if (!title) return res.status(400).json({ error: 'title required' });
  const { rows } = await db.query(
    `INSERT INTO announcements (title, body, is_active) VALUES ($1, $2, COALESCE($3, TRUE)) RETURNING *`,
    [title, body || null, is_active]
  );
  res.status(201).json({ announcement: rows[0] });
}));

router.put('/:id', requireAdmin, asyncHandler(async (req, res) => {
  const { title, body, is_active } = req.body || {};
  const { rows } = await db.query(
    `UPDATE announcements SET
       title     = COALESCE($1, title),
       body      = COALESCE($2, body),
       is_active = COALESCE($3, is_active)
     WHERE id = $4 RETURNING *`,
    [title, body, is_active, req.params.id]
  );
  if (!rows[0]) return res.status(404).json({ error: 'Announcement not found' });
  res.json({ announcement: rows[0] });
}));

router.delete('/:id', requireAdmin, asyncHandler(async (req, res) => {
  await db.query(`DELETE FROM announcements WHERE id = $1`, [req.params.id]);
  res.json({ ok: true });
}));

module.exports = router;
