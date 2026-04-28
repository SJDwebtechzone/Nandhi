const router = require('express').Router();
const db = require('../db/pool');
const { asyncHandler } = require('../middleware/error.middleware');
const { requireAdmin } = require('../middleware/auth.middleware');

router.get('/', requireAdmin, asyncHandler(async (req, res) => {
  const { rows } = await db.query(
    `SELECT id, phone, name, email, city, role, profile_complete, created_at
     FROM users ORDER BY created_at DESC LIMIT 500`
  );
  res.json({ users: rows });
}));

router.get('/:id', requireAdmin, asyncHandler(async (req, res) => {
  const { rows } = await db.query(
    `SELECT id, phone, name, email, city, role, profile_complete, created_at
     FROM users WHERE id = $1`,
    [req.params.id]
  );
  if (!rows[0]) return res.status(404).json({ error: 'User not found' });
  res.json({ user: rows[0] });
}));

router.delete('/:id', requireAdmin, asyncHandler(async (req, res) => {
  await db.query(`DELETE FROM users WHERE id = $1`, [req.params.id]);
  res.json({ ok: true });
}));

module.exports = router;
