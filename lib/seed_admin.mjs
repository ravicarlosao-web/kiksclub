/**
 * Script rápido para criar/atualizar o utilizador admin na BD Turso.
 * Não precisa de tsx nem de importar dados estáticos.
 *
 * Executar com:  node lib/seed_admin.mjs
 */

import { createClient } from '@libsql/client';
import { createHmac } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

// ── Carregar .env manualmente ──────────────────────────────────────
const __dir = dirname(fileURLToPath(import.meta.url));
const envPath = join(__dir, '..', '.env');

function loadEnv(filePath) {
  try {
    const content = readFileSync(filePath, 'utf-8');
    for (const line of content.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx < 0) continue;
      const key = trimmed.slice(0, eqIdx).trim();
      const val = trimmed.slice(eqIdx + 1).trim();
      if (!process.env[key]) process.env[key] = val;
    }
  } catch (e) {
    console.warn('⚠️  Não foi possível ler .env:', e.message);
  }
}
loadEnv(envPath);

// ── bcryptjs puro em JS (sem compilação nativa) ────────────────────
// Usamos bcryptjs que é puro JS – se já está instalado usa-o directamente
async function hashPasswordBcrypt(password) {
  // Tenta importar bcryptjs
  try {
    const bcrypt = await import('bcryptjs');
    return bcrypt.default.hash(password, 12);
  } catch {
    // fallback: SHA-256 com salt (apenas para emergência – não produção)
    console.warn('⚠️  bcryptjs não encontrado, a usar SHA-256 como fallback.');
    const salt = Math.random().toString(36).slice(2, 18);
    const hash = createHmac('sha256', salt).update(password).digest('hex');
    return `sha256:${salt}:${hash}`;
  }
}

// ── Configuração ───────────────────────────────────────────────────
const TURSO_URL   = (process.env.TURSO_DATABASE_URL || '').trim();
const TURSO_TOKEN = (process.env.TURSO_AUTH_TOKEN   || '').trim();
const ADMIN_EMAIL = (process.env.ADMIN_EMAIL        || 'admin@kicksclub.pt').trim();
const ADMIN_PASS  = (process.env.ADMIN_PASSWORD     || 'KicksAdmin2024!').trim();
const ADMIN_NAME  = (process.env.ADMIN_NAME         || 'Administrador KicksClub').trim();

console.log('\n🔧 Seed Admin — KicksClub.pt');
console.log('─'.repeat(40));
console.log('📌 TURSO_DATABASE_URL:', TURSO_URL || '❌ EM FALTA');
console.log('📌 TURSO_AUTH_TOKEN  :', TURSO_TOKEN ? '✅ presente' : '❌ EM FALTA');
console.log('📌 ADMIN_EMAIL       :', ADMIN_EMAIL);
console.log('─'.repeat(40));

if (!TURSO_URL || !TURSO_TOKEN) {
  console.error('\n❌ TURSO_DATABASE_URL e TURSO_AUTH_TOKEN são obrigatórios!');
  console.error('   Verifica o ficheiro .env\n');
  process.exit(1);
}

const db = createClient({ url: TURSO_URL, authToken: TURSO_TOKEN });

async function run() {
  // 1. Garantir que a tabela existe
  console.log('\n📋 A verificar/criar tabela admin_users...');
  await db.execute(`
    CREATE TABLE IF NOT EXISTS admin_users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'admin',
      last_login TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);
  console.log('   ✅ Tabela pronta.');

  // 2. Verificar se admin já existe
  const existing = await db.execute({
    sql: 'SELECT id, email FROM admin_users WHERE LOWER(email) = LOWER(?)',
    args: [ADMIN_EMAIL],
  });

  const passwordHash = await hashPasswordBcrypt(ADMIN_PASS);

  if (existing.rows.length > 0) {
    // Atualizar password
    console.log(`\n🔄 Admin "${ADMIN_EMAIL}" já existe — a atualizar password...`);
    await db.execute({
      sql: 'UPDATE admin_users SET password_hash = ?, name = ? WHERE LOWER(email) = LOWER(?)',
      args: [passwordHash, ADMIN_NAME, ADMIN_EMAIL],
    });
    console.log('   ✅ Password atualizada!');
  } else {
    // Criar novo admin
    console.log(`\n👤 A criar admin "${ADMIN_EMAIL}"...`);
    await db.execute({
      sql: `INSERT INTO admin_users (id, email, password_hash, name, role)
            VALUES (?, ?, ?, ?, 'admin')`,
      args: ['admin-1', ADMIN_EMAIL, passwordHash, ADMIN_NAME],
    });
    console.log('   ✅ Admin criado!');
  }

  // 3. Confirmar
  const check = await db.execute({
    sql: 'SELECT id, email, name, role, created_at FROM admin_users',
    args: [],
  });
  console.log('\n📊 Utilizadores admin na BD:');
  for (const row of check.rows) {
    console.log(`   • [${row.role}] ${row.name} <${row.email}>`);
  }

  console.log('\n🎉 Concluído! Podes fazer login com:');
  console.log(`   Email   : ${ADMIN_EMAIL}`);
  console.log(`   Password: ${ADMIN_PASS}`);
  console.log('');
}

run().catch((err) => {
  console.error('\n❌ Erro:', err.message || err);
  process.exit(1);
});
