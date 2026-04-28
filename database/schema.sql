-- ============================================================
-- Nandhi TV — Postgres schema
-- ============================================================
-- Run with:    npm run migrate
-- Seed with:   npm run seed
-- ============================================================

-- Drop in dependency order (safe to re-run)
DROP TABLE IF EXISTS event_registrations CASCADE;
DROP TABLE IF EXISTS donations CASCADE;
DROP TABLE IF EXISTS device_tokens CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS announcements CASCADE;
DROP TABLE IF EXISTS banners CASCADE;
DROP TABLE IF EXISTS ngo_activities CASCADE;
DROP TABLE IF EXISTS events CASCADE;
DROP TABLE IF EXISTS temples CASCADE;
DROP TABLE IF EXISTS live_streams CASCADE;
DROP TABLE IF EXISTS videos CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS about_content CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ─── Users ──────────────────────────────────────────────────
CREATE TABLE users (
  id                SERIAL PRIMARY KEY,
  -- Mobile users authenticate via Firebase phone OTP
  firebase_uid      TEXT UNIQUE,
  phone             TEXT UNIQUE,
  -- Admin users authenticate via email/password
  email             TEXT UNIQUE,
  password_hash     TEXT,
  -- Profile
  name              TEXT,
  city              TEXT,
  profile_complete  BOOLEAN NOT NULL DEFAULT FALSE,
  role              TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_firebase_uid ON users(firebase_uid);
CREATE INDEX idx_users_email ON users(email);

-- ─── Categories ─────────────────────────────────────────────
CREATE TABLE categories (
  id           SERIAL PRIMARY KEY,
  slug         TEXT UNIQUE NOT NULL,
  name         TEXT NOT NULL,
  sort_order   INTEGER NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Videos ─────────────────────────────────────────────────
CREATE TABLE videos (
  id              SERIAL PRIMARY KEY,
  title           TEXT NOT NULL,
  description     TEXT,
  youtube_id      TEXT NOT NULL,
  youtube_url     TEXT NOT NULL,
  thumbnail_url   TEXT,
  category_id     INTEGER REFERENCES categories(id) ON DELETE SET NULL,
  is_featured     BOOLEAN NOT NULL DEFAULT FALSE,
  is_published    BOOLEAN NOT NULL DEFAULT TRUE,
  view_count      INTEGER NOT NULL DEFAULT 0,
  duration_seconds INTEGER,
  published_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_videos_category ON videos(category_id);
CREATE INDEX idx_videos_published ON videos(is_published, published_at DESC);
CREATE INDEX idx_videos_featured ON videos(is_featured) WHERE is_featured = TRUE;

-- ─── Live streams ───────────────────────────────────────────
CREATE TABLE live_streams (
  id            SERIAL PRIMARY KEY,
  title         TEXT NOT NULL,
  description   TEXT,
  youtube_id    TEXT,
  youtube_url   TEXT,
  thumbnail_url TEXT,
  is_live       BOOLEAN NOT NULL DEFAULT FALSE,
  started_at    TIMESTAMPTZ,
  ended_at      TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_live_streams_active ON live_streams(is_live) WHERE is_live = TRUE;

-- ─── Temples (108 Divya Desam) ──────────────────────────────
CREATE TABLE temples (
  id              SERIAL PRIMARY KEY,
  name            TEXT NOT NULL,
  alt_name        TEXT,
  deity           TEXT,
  location        TEXT,
  city            TEXT,
  state           TEXT,
  country         TEXT DEFAULT 'India',
  latitude        NUMERIC(9, 6),
  longitude       NUMERIC(9, 6),
  image_url       TEXT,
  description     TEXT,
  sthala_puranam  TEXT,
  sort_order      INTEGER NOT NULL DEFAULT 0,
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_temples_active ON temples(is_active);

-- ─── Events ─────────────────────────────────────────────────
CREATE TABLE events (
  id                    SERIAL PRIMARY KEY,
  title                 TEXT NOT NULL,
  description           TEXT,
  image_url             TEXT,
  start_date            TIMESTAMPTZ NOT NULL,
  end_date              TIMESTAMPTZ,
  location              TEXT,
  is_published          BOOLEAN NOT NULL DEFAULT TRUE,
  registration_required BOOLEAN NOT NULL DEFAULT FALSE,
  registration_link     TEXT,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_events_start ON events(start_date);

CREATE TABLE event_registrations (
  id          SERIAL PRIMARY KEY,
  event_id    INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id     INTEGER REFERENCES users(id) ON DELETE SET NULL,
  name        TEXT NOT NULL,
  email       TEXT,
  phone       TEXT,
  message     TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_event_registrations_event ON event_registrations(event_id);

-- ─── Banners (home carousel) ────────────────────────────────
CREATE TABLE banners (
  id           SERIAL PRIMARY KEY,
  title        TEXT NOT NULL,
  subtitle     TEXT,
  image_url    TEXT NOT NULL,
  tint_color   TEXT,
  icon         TEXT,
  link_type    TEXT CHECK (link_type IN ('video', 'live', 'temple', 'category', 'url', 'none')),
  link_value   TEXT,
  sort_order   INTEGER NOT NULL DEFAULT 0,
  is_active    BOOLEAN NOT NULL DEFAULT TRUE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Announcements ──────────────────────────────────────────
CREATE TABLE announcements (
  id          SERIAL PRIMARY KEY,
  title       TEXT NOT NULL,
  body        TEXT,
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Notifications ──────────────────────────────────────────
CREATE TABLE notifications (
  id              SERIAL PRIMARY KEY,
  title           TEXT NOT NULL,
  body            TEXT,
  image_url       TEXT,
  link_type       TEXT,
  link_value      TEXT,
  target_user_id  INTEGER REFERENCES users(id) ON DELETE CASCADE,
  sent_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_notifications_target ON notifications(target_user_id);

CREATE TABLE device_tokens (
  id          SERIAL PRIMARY KEY,
  user_id     INTEGER REFERENCES users(id) ON DELETE CASCADE,
  token       TEXT NOT NULL,
  platform    TEXT CHECK (platform IN ('android', 'ios', 'web')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(token)
);

-- ─── Donations ──────────────────────────────────────────────
CREATE TABLE donations (
  id                   SERIAL PRIMARY KEY,
  user_id              INTEGER REFERENCES users(id) ON DELETE SET NULL,
  amount               NUMERIC(12, 2) NOT NULL,
  donor_name           TEXT,
  donor_email          TEXT,
  donor_phone          TEXT,
  message              TEXT,
  payment_method       TEXT NOT NULL CHECK (payment_method IN ('razorpay', 'upi', 'manual')),
  razorpay_order_id    TEXT,
  razorpay_payment_id  TEXT,
  razorpay_signature   TEXT,
  status               TEXT NOT NULL DEFAULT 'pending'
                          CHECK (status IN ('pending', 'success', 'failed', 'refunded')),
  receipt_no           TEXT,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_donations_status ON donations(status);
CREATE INDEX idx_donations_user ON donations(user_id);

-- ─── NGO / Uzhavara Pani activities ─────────────────────────
CREATE TABLE ngo_activities (
  id           SERIAL PRIMARY KEY,
  title        TEXT NOT NULL,
  description  TEXT,
  image_url    TEXT,
  date         DATE,
  location     TEXT,
  sort_order   INTEGER NOT NULL DEFAULT 0,
  is_active    BOOLEAN NOT NULL DEFAULT TRUE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── About content (single-row CMS-ish) ─────────────────────
CREATE TABLE about_content (
  id            INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  title         TEXT,
  body          TEXT,
  vision        TEXT,
  mission       TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  contact_address TEXT,
  website       TEXT,
  facebook      TEXT,
  instagram     TEXT,
  youtube       TEXT,
  twitter       TEXT,
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── App-wide settings (UPI, Razorpay key id, etc.) ─────────
CREATE TABLE app_settings (
  key          TEXT PRIMARY KEY,
  value        TEXT,
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
