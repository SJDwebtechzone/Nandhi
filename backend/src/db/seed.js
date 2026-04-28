// Seeds initial data: admin user, categories, sample banners, about content.
require('dotenv').config();
const bcrypt = require('bcryptjs');
const db = require('./pool');

async function run() {
  console.log('[seed] starting...');

  // ── Admin user ───────────────────────────────────────────
  const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@nandhitv.com';
  const adminPass  = process.env.SEED_ADMIN_PASSWORD || 'changeme123';
  const adminName  = process.env.SEED_ADMIN_NAME || 'Nandhi Admin';
  const hash = await bcrypt.hash(adminPass, 10);
  await db.query(
    `INSERT INTO users (email, password_hash, name, role, profile_complete)
     VALUES ($1, $2, $3, 'admin', TRUE)
     ON CONFLICT (email) DO UPDATE
       SET password_hash = EXCLUDED.password_hash,
           name = EXCLUDED.name,
           role = 'admin'`,
    [adminEmail, hash, adminName]
  );
  console.log(`[seed] admin user: ${adminEmail} / ${adminPass}`);

  // ── Categories ───────────────────────────────────────────
  const cats = [
    { slug: 'latest',         name: 'Latest',           sort_order: 1 },
    { slug: 'divya-desam',    name: 'Divya Desam',      sort_order: 2 },
    { slug: 'music-bhajans',  name: 'Music & Bhajans',  sort_order: 3 },
    { slug: 'devotional',     name: 'Devotional',       sort_order: 4 },
    { slug: 'temple-events',  name: 'Temple Events',    sort_order: 5 },
  ];
  for (const c of cats) {
    await db.query(
      `INSERT INTO categories (slug, name, sort_order) VALUES ($1, $2, $3)
       ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, sort_order = EXCLUDED.sort_order`,
      [c.slug, c.name, c.sort_order]
    );
  }
  console.log('[seed] categories ready');

  // ── About content (single row) ───────────────────────────
  await db.query(
    `INSERT INTO about_content (id, title, body, vision, mission, contact_email, contact_phone)
     VALUES (1, $1, $2, $3, $4, $5, $6)
     ON CONFLICT (id) DO NOTHING`,
    [
      'About Nandhi TV',
      'Nandhi TV is a 24/7 online channel dedicated to preserving and sharing Indian spiritual and cultural traditions, with a special focus on Carnatic music.',
      'To preserve traditional values, encourage future generations, and serve the community.',
      'A global platform for Indian culture, Carnatic music, and timeless heritage.',
      'info@nandhitv.org',
      '+91 89393 53454',
    ]
  );

  // ── App settings (Razorpay / UPI placeholders) ───────────
  const settings = [
    ['upi_id', process.env.UPI_ID || 'nandhitv@upi'],
    ['upi_name', 'Nandhi Foundation'],
    ['razorpay_key_id', process.env.RAZORPAY_KEY_ID || ''],
  ];
  for (const [k, v] of settings) {
    await db.query(
      `INSERT INTO app_settings (key, value) VALUES ($1, $2)
       ON CONFLICT (key) DO NOTHING`,
      [k, v]
    );
  }

  // ── Sample announcement ──────────────────────────────────
  await db.query(
    `INSERT INTO announcements (title, body)
     SELECT 'Welcome to Nandhi TV', 'Daily darshan, devotional music, and live aarti — straight to your phone.'
     WHERE NOT EXISTS (SELECT 1 FROM announcements)`
  );

  console.log('[seed] done');
  process.exit(0);
}

run().catch((e) => {
  console.error('[seed] failed:', e);
  process.exit(1);
});
