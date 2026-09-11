import dotenv from 'dotenv';
import { createClient } from '@libsql/client/http';

dotenv.config();

const rawUrl = (process.env.TURSO_DATABASE_URL || '').trim();
const url = rawUrl.replace(/^libsql:\/\//, 'https://');
const authToken = (process.env.TURSO_AUTH_TOKEN || '').trim();

console.log('Testing Turso connection...');
console.log('URL defined:', Boolean(url), 'Token defined:', Boolean(authToken));

const db = createClient({ url, authToken });

async function run() {
  const res = await db.execute("SELECT name FROM sqlite_master WHERE type='table'");
  console.log('Tables found in Turso:');
  console.log(res.rows.map(r => r.name));

  // Check schema of categories
  const catSql = await db.execute("SELECT sql FROM sqlite_master WHERE type='table' AND name='categories'");
  console.log('Categories table schema:');
  console.log(catSql.rows[0].sql);

  const sampleCats = await db.execute("SELECT id, name, slug FROM categories LIMIT 5");
  console.log('Sample categories:');
  console.log(sampleCats.rows);
}

run().catch(console.error);
