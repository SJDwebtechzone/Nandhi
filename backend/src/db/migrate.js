// Runs database/schema.sql, then any *.sql files in database/migrations/
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const db = require('./pool');

async function run() {
  const schemaPath = path.join(__dirname, '..', '..', '..', 'database', 'schema.sql');
  if (!fs.existsSync(schemaPath)) {
    console.error('[migrate] schema.sql not found at', schemaPath);
    process.exit(1);
  }
  const schema = fs.readFileSync(schemaPath, 'utf8');
  console.log('[migrate] applying schema.sql...');
  await db.query(schema);
  console.log('[migrate] schema applied');

  const migrationsDir = path.join(__dirname, '..', '..', '..', 'database', 'migrations');
  if (fs.existsSync(migrationsDir)) {
    const files = fs.readdirSync(migrationsDir).filter((f) => f.endsWith('.sql')).sort();
    for (const f of files) {
      const sql = fs.readFileSync(path.join(migrationsDir, f), 'utf8');
      console.log(`[migrate] applying ${f}...`);
      await db.query(sql);
    }
  }

  console.log('[migrate] done');
  process.exit(0);
}

run().catch((e) => {
  console.error('[migrate] failed:', e);
  process.exit(1);
});
