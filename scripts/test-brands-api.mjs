import dotenv from 'dotenv';
import { createClient } from '@libsql/client/http';

dotenv.config();

const rawUrl = (process.env.TURSO_DATABASE_URL || '').trim();
const url = rawUrl.replace(/^libsql:\/\//, 'https://');
const authToken = (process.env.TURSO_AUTH_TOKEN || '').trim();

const db = createClient({ url, authToken });

async function test() {
  console.log('--- Testando consulta de marcas com contagem de produtos ---');
  const sql = `
    SELECT b.*, COUNT(p.id) as product_count
    FROM brands b
    LEFT JOIN products p ON p.brand_id = b.id
    GROUP BY b.id
    ORDER BY b.name ASC
  `;
  const res = await db.execute(sql);
  console.log(`Total de marcas encontradas: ${res.rows.length}`);
  console.log('Top 5 marcas com produtos:');
  console.log(res.rows.slice(0, 5).map(r => ({ id: r.id, name: r.name, count: r.product_count })));

  console.log('--- Testando consulta de produto com join de marca ---');
  const prodSql = `
    SELECT p.id, p.name, p.brand, p.brand_id, b.name as brand_name, b.logo_url as brand_logo
    FROM products p
    LEFT JOIN brands b ON p.brand_id = b.id
    LIMIT 3
  `;
  const prodRes = await db.execute(prodSql);
  console.log('Amostra de produtos com dados da marca:');
  console.log(prodRes.rows);
}

test().catch(console.error);
