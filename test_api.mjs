// Test all API endpoints
const BASE = 'https://www.kicksclub.pt';

async function test(label, url, options = {}) {
  try {
    const r = await fetch(url, options);
    const text = await r.text();
    let body;
    try { body = JSON.parse(text); } catch { body = text.slice(0, 200); }
    console.log(`\n[${r.status}] ${label}`);
    console.log('  →', typeof body === 'string' ? body : JSON.stringify(body).slice(0, 200));
  } catch (e) {
    console.log(`\n[ERR] ${label}: ${e.message}`);
  }
}

await test('GET /api/health', `${BASE}/api/health`);
await test('GET /api/products', `${BASE}/api/products?limit=1`);
await test('GET /api/categories', `${BASE}/api/categories`);
await test('POST /api/auth/login (wrong creds)', `${BASE}/api/auth/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'test@test.com', password: 'wrong' })
});
await test('POST /api/auth/login (real creds)', `${BASE}/api/auth/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'admin@kicksclub.pt', password: 'password_segura_aqui_123!' })
});

console.log('\nDone.');
