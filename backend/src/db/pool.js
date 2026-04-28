const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

pool.on('error', (err) => {
  console.error('[pg] unexpected error on idle client', err);
});

// pool already has a .query method that delegates to a connection — no wrapper needed.
module.exports = pool;
