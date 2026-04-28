const router = require('express').Router();
const db = require('../db/pool');
const { asyncHandler } = require('../middleware/error.middleware');
const { requireAdmin } = require('../middleware/auth.middleware');

router.get('/', asyncHandler(async (req, res) => {
  const { rows } = await db.query(
    `SELECT * FROM ngo_activities WHERE is_active = TRUE ORDER BY sort_order, created_at DESC`
  );
  res.json({ activities: rows });
}));

router.post('/', requireAdmin, asyncHandler(async (req, res) => {
  const { title, description, image_url, date, location, sort_order, is_active } = req.body || {};
  if (!title) return res.status(400).json({ error: 'title required' });
  const { rows } = await db.query(
    `INSERT INTO ngo_activities (title, description, image_url, date, location, sort_order, is_active)
     VALUES ($1,$2,$3,$4,$5,$6,COALESCE($7, TRUE)) RETURNING *`,
    [title, description || null, image_url || null, date || null, location || null, sort_order || 0, is_active]
  );
  res.status(201).json({ activity: rows[0] });
}));

router.put('/:id', requireAdmin, asyncHandler(async (req, res) => {
  const { title, description, image_url, date, location, sort_order, is_active } = req.body || {};
  const { rows } = await db.query(
    `UPDATE ngo_activities SET
       title       = COALESCE($1, title),
       description = COALESCE($2, description),
       image_url   = COALESCE($3, image_url),
       date        = COALESCE($4, date),
       location    = COALESCE($5, location),
       sort_order  = COALESCE($6, sort_order),
       is_active   = COALESCE($7, is_active)
     WHERE id = $8 RETURNING *`,
    [title, description, image_url, date, location, sort_order, is_active, req.params.id]
  );
  if (!rows[0]) return res.status(404).json({ error: 'Activity not found' });
  res.json({ activity: rows[0] });
}));

router.delete('/:id', requireAdmin, asyncHandler(async (req, res) => {
  await db.query(`DELETE FROM ngo_activities WHERE id = $1`, [req.params.id]);
  res.json({ ok: true });
}));

module.exports = router;
