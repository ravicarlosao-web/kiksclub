import { createClient, type Client } from '@libsql/client/http';

let _client: Client | null = null;

export function getDb(): Client {
  if (!_client) {
    const rawUrl = (process.env.TURSO_DATABASE_URL || '').trim();
    const url = rawUrl.replace(/^libsql:\/\//, 'https://');
    const authToken = (process.env.TURSO_AUTH_TOKEN || '').trim();

    if (!url || !authToken) {
      console.error('[DB] Variáveis de ambiente em falta: TURSO_DATABASE_URL ou TURSO_AUTH_TOKEN');
      throw new Error(
        'Variáveis de ambiente em falta: TURSO_DATABASE_URL e TURSO_AUTH_TOKEN são obrigatórias.'
      );
    }

    _client = createClient({ url, authToken });
  }
  return _client;
}

/**
 * Executa o schema SQL (criação de tabelas) se ainda não existirem.
 * Chamar uma vez no startup ou script de seed.
 */
export async function runMigrations(): Promise<void> {
  const db = getDb();

  await db.batch([
    // Produtos
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

    // Categorias
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

    // Encomendas
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

    // Utilizadores Admin
    `CREATE TABLE IF NOT EXISTS admin_users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'admin',
      last_login TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )`,
  ], 'write');
}
