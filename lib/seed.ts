/**
 * Script de seed: migra os dados TS estáticos para a base de dados Turso.
 * Executar UMA VEZ após criar a BD:
 *   npm run seed
 */

import 'dotenv/config';
import { createClient } from '@libsql/client';
import { hashPassword } from './auth.js';

// ── Importar dados estáticos ──────────────────────────────────────
// Nota: usamos importação directa dos ficheiros .ts via tsx
const { SNEAKERS } = await import('../src/data/sneakers.js');
const { INITIAL_CATEGORIES } = await import('../src/data/categories.js');
const { INITIAL_ORDERS } = await import('../src/data/initialOrders.js');

// ── Cliente Turso ─────────────────────────────────────────────────
const db = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

async function seed() {
  console.log('🌱 A iniciar seed da base de dados Turso...\n');

  // 1. Criar tabelas
  console.log('📋 A criar tabelas...');
  await db.batch([
    `CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      brand TEXT NOT NULL,
      category TEXT NOT NULL,
      department TEXT,
      subcategory TEXT,
      price REAL NOT NULL,
      original_price REAL NOT NULL,
      discount_percentage REAL NOT NULL,
      image TEXT NOT NULL,
      gallery TEXT NOT NULL DEFAULT '[]',
      sizes TEXT NOT NULL DEFAULT '[]',
      size_stock TEXT NOT NULL DEFAULT '{}',
      size_type TEXT DEFAULT 'shoes',
      in_stock INTEGER NOT NULL DEFAULT 1,
      featured INTEGER NOT NULL DEFAULT 0,
      tag TEXT,
      description TEXT NOT NULL,
      details TEXT NOT NULL DEFAULT '[]',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      description TEXT DEFAULT '',
      icon TEXT DEFAULT 'Package',
      subcategories TEXT NOT NULL DEFAULT '[]',
      banner_image TEXT,
      banner_tag TEXT,
      featured INTEGER NOT NULL DEFAULT 0,
      is_active INTEGER NOT NULL DEFAULT 1,
      sort_order INTEGER NOT NULL DEFAULT 0
    )`,
    `CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      customer_name TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT NOT NULL,
      address TEXT NOT NULL,
      postal_code TEXT NOT NULL,
      city TEXT NOT NULL,
      notes TEXT,
      payment_method TEXT NOT NULL,
      items TEXT NOT NULL DEFAULT '[]',
      subtotal REAL NOT NULL DEFAULT 0,
      discount REAL NOT NULL DEFAULT 0,
      shipping REAL NOT NULL DEFAULT 0,
      total REAL NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'Pendente',
      tracking_code TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS admin_users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'admin',
      last_login TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS coupons (
      id TEXT PRIMARY KEY,
      code TEXT UNIQUE NOT NULL,
      discount_percent INTEGER NOT NULL,
      discount_amount REAL DEFAULT 0,
      min_order_value REAL DEFAULT 0,
      max_uses INTEGER DEFAULT NULL,
      used_count INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      expires_at TEXT DEFAULT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )`,
  ], 'write');
  console.log('  ✅ Tabelas criadas.\n');

  // 2. Seed de Produtos
  console.log(`🛍️  A inserir ${SNEAKERS.length} produtos...`);
  for (const p of SNEAKERS) {
    await db.execute({
      sql: `INSERT OR IGNORE INTO products
        (id, name, brand, category, department, subcategory, price, original_price,
         discount_percentage, image, gallery, sizes, size_stock, size_type,
         in_stock, featured, tag, description, details)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      args: [
        p.id, p.name, p.brand, p.category,
        p.department ?? null, p.subcategory ?? null,
        p.price, p.originalPrice, p.discountPercentage,
        p.image,
        JSON.stringify(p.gallery ?? []),
        JSON.stringify(p.sizes ?? []),
        JSON.stringify(p.sizeStock ?? {}),
        p.sizeType ?? 'shoes',
        p.inStock ? 1 : 0,
        p.featured ? 1 : 0,
        p.tag ?? null,
        p.description,
        JSON.stringify(p.details ?? []),
      ],
    });
  }
  console.log(`  ✅ ${SNEAKERS.length} produtos inseridos.\n`);

  // 3. Seed de Categorias
  console.log(`📁 A inserir ${INITIAL_CATEGORIES.length} categorias...`);
  for (let i = 0; i < INITIAL_CATEGORIES.length; i++) {
    const c = INITIAL_CATEGORIES[i];
    await db.execute({
      sql: `INSERT OR IGNORE INTO categories
        (id, name, slug, description, icon, subcategories, banner_image,
         banner_tag, featured, is_active, sort_order)
        VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
      args: [
        c.id, c.name, c.slug, c.description ?? '',
        c.icon ?? 'Package',
        JSON.stringify(c.subcategories ?? []),
        c.bannerImage ?? null,
        c.bannerTag ?? null,
        c.featured ? 1 : 0,
        c.isActive !== false ? 1 : 0,
        i,
      ],
    });
  }
  console.log(`  ✅ ${INITIAL_CATEGORIES.length} categorias inseridas.\n`);

  // 4. Seed de Encomendas iniciais
  console.log(`📦 A inserir ${INITIAL_ORDERS.length} encomendas de exemplo...`);
  for (const o of INITIAL_ORDERS) {
    await db.execute({
      sql: `INSERT OR IGNORE INTO orders
        (id, customer_name, phone, email, address, postal_code, city,
         notes, payment_method, items, subtotal, discount, shipping, total,
         status, tracking_code, created_at)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      args: [
        o.id, o.customerName, o.phone, o.email,
        o.address, o.postalCode, o.city,
        o.notes ?? null, o.paymentMethod,
        JSON.stringify(o.items ?? []),
        o.subtotal, o.discount, o.shipping, o.total,
        o.status, o.trackingCode,
        o.createdAt,
      ],
    });
  }
  console.log(`  ✅ ${INITIAL_ORDERS.length} encomendas inseridas.\n`);

  // 5. Criar utilizador Admin inicial
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@kicksclub.pt';
  const adminPassword = process.env.ADMIN_PASSWORD || 'KicksAdmin2024!';
  const adminName = process.env.ADMIN_NAME || 'Administrador KicksClub';

  console.log(`👤 A criar utilizador admin: ${adminEmail}...`);
  const passwordHash = await hashPassword(adminPassword);
  await db.execute({
    sql: `INSERT OR IGNORE INTO admin_users (id, email, password_hash, name, role)
          VALUES (?, ?, ?, ?, 'admin')`,
    args: ['admin-1', adminEmail, passwordHash, adminName],
  });
  console.log('  ✅ Utilizador admin criado.\n');

  // 6. Seed de Cupões Iniciais
  console.log('🎟️  A inserir cupões iniciais...');
  const initialCoupons = [
    { id: 'cp-kicks10', code: 'KICKS10', discount_percent: 10 },
    { id: 'cp-step10', code: 'STEP10', discount_percent: 10 },
    { id: 'cp-club10', code: 'CLUB10', discount_percent: 10 },
  ];
  for (const c of initialCoupons) {
    await db.execute({
      sql: `INSERT OR IGNORE INTO coupons (id, code, discount_percent, is_active)
            VALUES (?, ?, ?, 1)`,
      args: [c.id, c.code, c.discount_percent],
    });
  }
  console.log('  ✅ Cupões inseridos.\n');

  console.log('🎉 Seed concluído com sucesso!');
  console.log(`\n📊 Resumo:`);
  console.log(`   Produtos: ${SNEAKERS.length}`);
  console.log(`   Categorias: ${INITIAL_CATEGORIES.length}`);
  console.log(`   Encomendas: ${INITIAL_ORDERS.length}`);
  console.log(`   Admin: ${adminEmail}`);
  console.log('\n✨ A tua base de dados Turso está pronta!');

  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Erro no seed:', err);
  process.exit(1);
});
