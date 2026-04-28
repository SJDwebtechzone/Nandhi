const router = require('express').Router();
const db = require('../db/pool');
const { asyncHandler } = require('../middleware/error.middleware');
const { requireAdmin } = require('../middleware/auth.middleware');

router.get('/', asyncHandler(async (req, res) => {
  const { rows } = await db.query(`SELECT * FROM categories ORDER BY sort_order, name`);
  res.json({ categories: rows });
}));

router.post('/', requireAdmin, asyncHandler(async (req, res) => {
  const { slug, name, sort_order } = req.body || {};
  if (!slug || !name) return res.status(400).json({ error: 'slug and name required' });
  const { rows } = await db.query(
    `INSERT INTO categories (slug, name, sort_order) VALUES ($1, $2, $3) RETURNING *`,
    [slug, name, sort_order || 0]
  );
  res.status(201).json({ category: rows[0] });
}));

router.put('/:id', requireAdmin, asyncHandler(async (req, res) => {
  const { slug, name, sort_order } = req.body || {};
  const { rows } = await db.query(
    `UPDATE categories SET
       slug       = COALESCE($1, slug),
       name       = COALESCE($2, name),
       sort_order = COALESCE($3, sort_order)
     WHERE id = $4 RETURNING *`,
    [slug, name, sort_order, req.params.id]
  );
  if (!rows[0]) return res.status(404).json({ error: 'Category not found' });
  res.json({ category: rows[0] });
}));

router.delete('/:id', requireAdmin, asyncHandler(async (req, res) => {
  await db.query(`DELETE FROM categories WHERE id = $1`, [req.params.id]);
  res.json({ ok: true });
}));

module.exports = router;
