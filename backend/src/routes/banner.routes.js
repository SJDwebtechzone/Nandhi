const router = require('express').Router();
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const db = require('../db/pool');
const { asyncHandler } = require('../middleware/error.middleware');
const { requireAdmin } = require('../middleware/auth.middleware');

// ─── Multer: store uploaded banner images on disk ───────────
const uploadDir = path.join(__dirname, '..', '..', 'uploads', 'banners');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, uploadDir),
  filename: (_, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
    const safe = `banner-${Date.now()}-${Math.random().toString(16).slice(2, 14)}${ext}`;
    cb(null, safe);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_, file, cb) => cb(null, /^image\//.test(file.mimetype)),
});

// ─── Public ─────────────────────────────────────────────────
router.get('/', asyncHandler(async (req, res) => {
  const { rows } = await db.query(
    `SELECT * FROM banners WHERE is_active = TRUE ORDER BY sort_order, created_at DESC`
  );
  res.json({ banners: rows });
}));

// ─── Admin ──────────────────────────────────────────────────
router.post('/', requireAdmin, upload.single('image'), asyncHandler(async (req, res) => {
  const { title, subtitle, tint_color, icon, link_type, link_value, sort_order, is_active } = req.body || {};
  if (!title) return res.status(400).json({ error: 'title required' });

  let image_url = req.body.image_url || null;
  if (req.file) image_url = `/uploads/banners/${req.file.filename}`;
  if (!image_url) return res.status(400).json({ error: 'image (file or image_url) required' });

  const { rows } = await db.query(
    `INSERT INTO banners (title, subtitle, image_url, tint_color, icon, link_type, link_value, sort_order, is_active)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, COALESCE($9, TRUE)) RETURNING *`,
    [title, subtitle || null, image_url, tint_color || null, icon || null,
     link_type || 'none', link_value || null, sort_order || 0, is_active]
  );
  res.status(201).json({ banner: rows[0] });
}));

router.put('/:id', requireAdmin, upload.single('image'), asyncHandler(async (req, res) => {
  const { title, subtitle, tint_color, icon, link_type, link_value, sort_order, is_active } = req.body || {};
  let image_url = req.body.image_url;
  if (req.file) image_url = `/uploads/banners/${req.file.filename}`;
  const { rows } = await db.query(
    `UPDATE banners SET
       title       = COALESCE($1, title),
       subtitle    = COALESCE($2, subtitle),
       image_url   = COALESCE($3, image_url),
       tint_color  = COALESCE($4, tint_color),
       icon        = COALESCE($5, icon),
       link_type   = COALESCE($6, link_type),
       link_value  = COALESCE($7, link_value),
       sort_order  = COALESCE($8, sort_order),
       is_active   = COALESCE($9, is_active)
     WHERE id = $10 RETURNING *`,
    [title, subtitle, image_url, tint_color, icon, link_type, link_value, sort_order, is_active, req.params.id]
  );
  if (!rows[0]) return res.status(404).json({ error: 'Banner not found' });
  res.json({ banner: rows[0] });
}));

router.delete('/:id', requireAdmin, asyncHandler(async (req, res) => {
  await db.query(`DELETE FROM banners WHERE id = $1`, [req.params.id]);
  res.json({ ok: true });
}));

module.exports = router;
