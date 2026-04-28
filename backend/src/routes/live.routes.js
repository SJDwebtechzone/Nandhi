const router = require('express').Router();
const db = require('../db/pool');
const { asyncHandler } = require('../middleware/error.middleware');
const { requireAdmin } = require('../middleware/auth.middleware');

// GET /api/live/current — what mobile app polls for the live banner
router.get('/current', asyncHandler(async (req, res) => {
  const { rows } = await db.query(
    `SELECT * FROM live_streams WHERE is_live = TRUE ORDER BY started_at DESC LIMIT 1`
  );
  res.json({ live: rows[0] || null });
}));

router.get('/', asyncHandler(async (req, res) => {
  const { rows } = await db.query(`SELECT * FROM live_streams ORDER BY created_at DESC LIMIT 50`);
  res.json({ streams: rows });
}));

router.post('/', requireAdmin, asyncHandler(async (req, res) => {
  const { title, description, youtube_url, youtube_id, thumbnail_url, is_live } = req.body || {};
  if (!title) return res.status(400).json({ error: 'title required' });
  // If turning this stream live, mark all others as not-live (only one current at a time)
  if (is_live) await db.query(`UPDATE live_streams SET is_live = FALSE`);
  const { rows } = await db.query(
    `INSERT INTO live_streams (title, description, youtube_url, youtube_id, thumbnail_url, is_live, started_at)
     VALUES ($1, $2, $3, $4, $5, $6, CASE WHEN $6 THEN NOW() ELSE NULL END) RETURNING *`,
    [title, description || null, youtube_url || null, youtube_id || null, thumbnail_url || null, !!is_live]
  );
  res.status(201).json({ stream: rows[0] });
}));

router.put('/:id', requireAdmin, asyncHandler(async (req, res) => {
  const { title, description, youtube_url, youtube_id, thumbnail_url, is_live } = req.body || {};
  if (is_live) await db.query(`UPDATE live_streams SET is_live = FALSE WHERE id <> $1`, [req.params.id]);
  const { rows } = await db.query(
    `UPDATE live_streams SET
       title         = COALESCE($1, title),
       description   = COALESCE($2, description),
       youtube_url   = COALESCE($3, youtube_url),
       youtube_id    = COALESCE($4, youtube_id),
       thumbnail_url = COALESCE($5, thumbnail_url),
       is_live       = COALESCE($6, is_live),
       started_at    = CASE WHEN $6 = TRUE  AND is_live = FALSE THEN NOW() ELSE started_at END,
       ended_at      = CASE WHEN $6 = FALSE AND is_live = TRUE  THEN NOW() ELSE ended_at END
     WHERE id = $7 RETURNING *`,
    [title, description, youtube_url, youtube_id, thumbnail_url, is_live, req.params.id]
  );
  if (!rows[0]) return res.status(404).json({ error: 'Stream not found' });
  res.json({ stream: rows[0] });
}));

router.delete('/:id', requireAdmin, asyncHandler(async (req, res) => {
  await db.query(`DELETE FROM live_streams WHERE id = $1`, [req.params.id]);
  res.json({ ok: true });
}));

module.exports = router;
