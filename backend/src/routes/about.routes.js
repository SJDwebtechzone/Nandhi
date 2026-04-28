const router = require('express').Router();
const db = require('../db/pool');
const { asyncHandler } = require('../middleware/error.middleware');
const { requireAdmin } = require('../middleware/auth.middleware');

router.get('/', asyncHandler(async (req, res) => {
  const { rows } = await db.query(`SELECT * FROM about_content WHERE id = 1`);
  res.json({ about: rows[0] || null });
}));

router.put('/', requireAdmin, asyncHandler(async (req, res) => {
  const fields = ['title','body','vision','mission','contact_email','contact_phone',
                  'contact_address','website','facebook','instagram','youtube','twitter'];
  const sets = fields.map((f, i) => `${f} = COALESCE($${i + 1}, ${f})`).join(', ');
  const values = fields.map((f) => req.body?.[f] ?? null);
  await db.query(
    `INSERT INTO about_content (id) VALUES (1) ON CONFLICT (id) DO NOTHING`
  );
  const { rows } = await db.query(
    `UPDATE about_content SET ${sets}, updated_at = NOW() WHERE id = 1 RETURNING *`,
    values
  );
  res.json({ about: rows[0] });
}));

module.exports = router;
