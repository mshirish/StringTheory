import 'dotenv/config';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import pg from 'pg';

const { Pool } = pg;
const __dirname = dirname(fileURLToPath(import.meta.url));

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT, 10),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

import { readdirSync } from 'fs';
const migrations = readdirSync(join(__dirname, '../migrations'))
  .filter((f) => f.endsWith('.sql'))
  .sort();

async function run() {
  for (const file of migrations) {
    const sql = readFileSync(join(__dirname, '../migrations', file), 'utf8');
    console.log(`Running migration: ${file}`);
    await pool.query(sql);
    console.log(`  done.`);
  }
  await pool.end();
  console.log('All migrations complete.');
}

run().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
