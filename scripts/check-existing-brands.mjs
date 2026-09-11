import dotenv from 'dotenv';
import { createClient } from '@libsql/client/http';

dotenv.config();

const rawUrl = (process.env.TURSO_DATABASE_URL || '').trim();
const url = rawUrl.replace(/^libsql:\/\//, 'https://');
const authToken = (process.env.TURSO_AUTH_TOKEN || '').trim();

const db = createClient({ url, authToken });

async function checkBrands() {
  const res = await db.execute("SELECT id, name, brand FROM products");
  console.log(`Total products in Turso: ${res.rows.length}`);
  
  const brandsMap = new Map();
  let withoutBrand = 0;
  
  for (const row of res.rows) {
    const b = (row.brand || '').toString().trim();
    if (!b) {
      withoutBrand++;
    } else {
      brandsMap.set(b, (brandsMap.get(b) || 0) + 1);
    }
  }

  console.log(`Products without brand: ${withoutBrand}`);
  console.log('Unique brands and product counts:');
  for (const [brand, count] of brandsMap.entries()) {
    console.log(`  "${brand}": ${count} products`);
  }
}

checkBrands().catch(console.error);
