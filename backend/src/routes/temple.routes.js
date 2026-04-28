const router = require('express').Router();
const db = require('../db/pool');
const { asyncHandler } = require('../middleware/error.middleware');
const { requireAdmin } = require('../middleware/auth.middleware');

router.get('/', asyncHandler(async (req, res) => {
  const { rows } = await db.query(
    `SELECT * FROM temples WHERE is_active = TRUE ORDER BY sort_order, name`
  );
  res.json({ temples: rows });
}));

router.get('/:id', asyncHandler(async (req, res) => {
  const { rows } = await db.query(`SELECT * FROM temples WHERE id = $1`, [req.params.id]);
  if (!rows[0]) return res.status(404).json({ error: 'Temple not found' });
  res.json({ temple: rows[0] });
}));

router.post('/', requireAdmin, asyncHandler(async (req, res) => {
  const fields = ['name','alt_name','deity','location','city','state','country',
                  'latitude','longitude','image_url','description','sthala_puranam','sort_order','is_active'];
  const values = fields.map((f) => req.body?.[f] ?? null);
  if (!values[0]) return res.status(400).json({ error: 'name required' });
  const { rows } = await db.query(
    `INSERT INTO temples (${fields.join(',')})
     VALUES (${fields.map((_, i) => '$' + (i + 1)).join(',')}) RETURNING *`,
    values
  );
  res.status(201).json({ temple: rows[0] });
}));

router.put('/:id', requireAdmin, asyncHandler(async (req, res) => {
  const fields = ['name','alt_name','deity','location','city','state','country',
                  'latitude','longitude','image_url','description','sthala_puranam','sort_order','is_active'];
  const sets = fields.map((f, i) => `${f} = COALESCE($${i + 1}, ${f})`).join(', ');
  const values = fields.map((f) => req.body?.[f] ?? null);
  values.push(req.params.id);
  const { rows } = await db.query(
    `UPDATE temples SET ${sets} WHERE id = $${values.length} RETURNING *`,
    values
  );
  if (!rows[0]) return res.status(404).json({ error: 'Temple not found' });
  res.json({ temple: rows[0] });
}));

router.delete('/:id', requireAdmin, asyncHandler(async (req, res) => {
  await db.query(`DELETE FROM temples WHERE id = $1`, [req.params.id]);
  res.json({ ok: true });
}));

module.exports = router;
