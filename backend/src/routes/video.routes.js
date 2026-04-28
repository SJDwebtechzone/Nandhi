const router = require('express').Router();
const db = require('../db/pool');
const { asyncHandler } = require('../middleware/error.middleware');
const { requireAdmin } = require('../middleware/auth.middleware');

// Helper: derive youtube_id / thumbnail from full URL if needed.
// Handles every reasonable YouTube format:
//   https://www.youtube.com/watch?v=ID
//   https://youtu.be/ID
//   https://www.youtube.com/shorts/ID
//   https://www.youtube.com/embed/ID
//   https://www.youtube.com/live/ID
//   https://m.youtube.com/watch?v=ID
//   https://music.youtube.com/watch?v=ID
//   ...with or without &t=, ?si=, &feature=, etc.
//   ...and bare 11-character video IDs (e.g. "dQw4w9WgXcQ")
function parseYouTube(input) {
  if (!input) return {};
  const cleaned = String(input).trim();

  // Bare 11-char ID
  if (/^[A-Za-z0-9_-]{11}$/.test(cleaned)) {
    return {
      youtube_id: cleaned,
      youtube_url: `https://www.youtube.com/watch?v=${cleaned}`,
      thumbnail_url: `https://img.youtube.com/vi/${cleaned}/hqdefault.jpg`,
    };
  }

  const patterns = [
    /[?&]v=([A-Za-z0-9_-]{11})/,
    /\/shorts\/([A-Za-z0-9_-]{11})/,
    /\/embed\/([A-Za-z0-9_-]{11})/,
    /\/live\/([A-Za-z0-9_-]{11})/,
    /youtu\.be\/([A-Za-z0-9_-]{11})/,
    /\/v\/([A-Za-z0-9_-]{11})/,
  ];
  let id = null;
  for (const re of patterns) {
    const m = cleaned.match(re);
    if (m) { id = m[1]; break; }
  }

  return {
    youtube_id: id,
    youtube_url: cleaned,
    thumbnail_url: id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null,
  };
}

// GET /api/videos?category=slug&featured=1&sort=views&limit=20
router.get('/', asyncHandler(async (req, res) => {
  const { category, featured, sort, limit = 50 } = req.query;
  const params = [];
  let sql = `
    SELECT v.*, c.slug as category_slug, c.name as category_name
    FROM videos v
    LEFT JOIN categories c ON c.id = v.category_id
    WHERE v.is_published = TRUE
  `;
  if (category) {
    params.push(category);
    sql += ` AND c.slug = $${params.length}`;
  }
  if (featured === '1' || featured === 'true') {
    sql += ` AND v.is_featured = TRUE`;
  }
  const orderBy = sort === 'views'
    ? `ORDER BY v.view_count DESC, v.published_at DESC`
    : `ORDER BY v.published_at DESC`;
  params.push(Number(limit));
  sql += ` ${orderBy} LIMIT $${params.length}`;

  const { rows } = await db.query(sql, params);
  res.json({ videos: rows });
}));

// GET /api/videos/:id
router.get('/:id', asyncHandler(async (req, res) => {
  const { rows } = await db.query(
    `SELECT v.*, c.slug as category_slug, c.name as category_name
     FROM videos v LEFT JOIN categories c ON c.id = v.category_id
     WHERE v.id = $1`,
    [req.params.id]
  );
  if (!rows[0]) return res.status(404).json({ error: 'Video not found' });
  // increment view count (fire and forget)
  db.query(`UPDATE videos SET view_count = view_count + 1 WHERE id = $1`, [req.params.id]).catch(() => {});
  res.json({ video: rows[0] });
}));

// ─── Admin ──────────────────────────────────────────────────
router.post('/', requireAdmin, asyncHandler(async (req, res) => {
  const { title, description, youtube_url, category_id, is_featured } = req.body || {};
  const cleanTitle = (title || '').trim();
  const cleanUrl   = (youtube_url || '').trim();

  if (!cleanTitle && !cleanUrl) return res.status(400).json({ error: 'Title and YouTube URL are both required.' });
  if (!cleanTitle) return res.status(400).json({ error: 'Title is required.' });
  if (!cleanUrl)   return res.status(400).json({ error: 'YouTube URL is required.' });

  const parsed = parseYouTube(cleanUrl);
  if (!parsed.youtube_id) {
    return res.status(400).json({
      error: `Could not extract a YouTube video ID from "${cleanUrl}". Please paste a full watch / shorts / live / embed URL, or just the 11-character video ID.`,
    });
  }

  const { rows } = await db.query(
    `INSERT INTO videos (title, description, youtube_id, youtube_url, thumbnail_url, category_id, is_featured, is_published)
     VALUES ($1,$2,$3,$4,$5,$6,$7,TRUE) RETURNING *`,
    [cleanTitle, description || null, parsed.youtube_id, parsed.youtube_url, parsed.thumbnail_url, category_id || null, !!is_featured]
  );
  res.status(201).json({ video: rows[0] });
}));

router.put('/:id', requireAdmin, asyncHandler(async (req, res) => {
  const { title, description, youtube_url, category_id, is_featured, is_published } = req.body || {};
  const parsed = youtube_url ? parseYouTube(youtube_url) : {};
  const { rows } = await db.query(
    `UPDATE videos SET
      title         = COALESCE($1, title),
      description   = COALESCE($2, description),
      youtube_id    = COALESCE($3, youtube_id),
      youtube_url   = COALESCE($4, youtube_url),
      thumbnail_url = COALESCE($5, thumbnail_url),
      category_id   = COALESCE($6, category_id),
      is_featured   = COALESCE($7, is_featured),
      is_published  = COALESCE($8, is_published)
     WHERE id = $9 RETURNING *`,
    [title, description, parsed.youtube_id, parsed.youtube_url, parsed.thumbnail_url,
     category_id ?? null, is_featured, is_published, req.params.id]
  );
  if (!rows[0]) return res.status(404).json({ error: 'Video not found' });
  res.json({ video: rows[0] });
}));

router.delete('/:id', requireAdmin, asyncHandler(async (req, res) => {
  await db.query(`DELETE FROM videos WHERE id = $1`, [req.params.id]);
  res.json({ ok: true });
}));

module.exports = router;
