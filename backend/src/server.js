require('dotenv').config();

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');

const { errorMiddleware, notFoundHandler } = require('./middleware/error.middleware');
const { init: initFirebase } = require('./services/firebase');

// Eagerly init Firebase Admin so any startup errors surface in logs immediately.
initFirebase();

const app = express();

// ── Core middleware ─────────────────────────────────────────
app.use(cors({
  origin: true,            // allow all origins in dev; tighten in production
  credentials: true,
}));
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Static for uploaded files (banner images, etc.)
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// ── Health ──────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ ok: true, service: 'nandhi-tv-api', time: new Date().toISOString() });
});

// ── Routes ──────────────────────────────────────────────────
app.use('/api/auth',           require('./routes/auth.routes'));
app.use('/api/users',          require('./routes/user.routes'));
app.use('/api/videos',         require('./routes/video.routes'));
app.use('/api/categories',     require('./routes/category.routes'));
app.use('/api/live',           require('./routes/live.routes'));
app.use('/api/temples',        require('./routes/temple.routes'));
app.use('/api/events',         require('./routes/event.routes'));
app.use('/api/banners',        require('./routes/banner.routes'));
app.use('/api/announcements',  require('./routes/announcement.routes'));
app.use('/api/notifications',  require('./routes/notification.routes'));
app.use('/api/donations',      require('./routes/donation.routes'));
app.use('/api/about',          require('./routes/about.routes'));
app.use('/api/ngo-activities', require('./routes/ngo.routes'));

// 404 + error formatter (must be last)
app.use(notFoundHandler);
app.use(errorMiddleware);

const PORT = process.env.PORT || 4000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Nandhi TV API running on :${PORT}`);
});