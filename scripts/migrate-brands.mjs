import dotenv from 'dotenv';
import { createClient } from '@libsql/client/http';

dotenv.config();

const rawUrl = (process.env.TURSO_DATABASE_URL || '').trim();
const url = rawUrl.replace(/^libsql:\/\//, 'https://');
const authToken = (process.env.TURSO_AUTH_TOKEN || '').trim();

if (!url || !authToken) {
  console.error('ERRO: TURSO_DATABASE_URL ou TURSO_AUTH_TOKEN em falta no .env');
  process.exit(1);
}

const db = createClient({ url, authToken });

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove acentos
    .replace(/[^a-z0-9]+/g, '-')     // substitui caracteres especiais por hífen
    .replace(/^-+|-+$/g, '');        // remove hífens no início e fim
}

function normalizeBrandName(raw) {
  const trimmed = raw.trim();
  // Mapa de nomes oficiais harmonizados
  const overrides = {
    'LOUIS VUITTON': 'Louis Vuitton',
    'NIKE': 'Nike',
    'YEEZY': 'Yeezy',
    'ADIDAS': 'Adidas',
    'JORDAN': 'Jordan',
    'BALENCIAGA': 'Balenciaga',
    'PRADA': 'Prada',
    'LORO PIANA': 'Loro Piana',
    'TRAPSTAR': 'Trapstar',
    'ESSENTIALS': 'Essentials',
    'ERIC EMANUEL': 'Eric Emanuel',
    'GUCCI': 'Gucci',
    'KICKS CLUB JEWELRY': 'Kicks Club Jewelry',
    'NEW ERA': 'New Era',
    'DIOR': 'Dior',
    'ROLEX': 'Rolex',
    'AUDEMARS PIGUET': 'Audemars Piguet',
    'PATEK PHILIPPE': 'Patek Philippe',
    'APPLE': 'Apple',
    'BEATS': 'Beats',
    'SONY': 'Sony',
    'STÜSSY': 'Stüssy',
    'BAPE': 'Bape',
    'CARHARTT WIP': 'Carhartt WIP',
    'CHROME HEARTS': 'Chrome Hearts',
    'CARTIER': 'Cartier',
  };

  if (overrides[trimmed.toUpperCase()]) {
    return overrides[trimmed.toUpperCase()];
  }

  // Capitalização de cada palavra caso não esteja no mapa
  return trimmed
    .split(' ')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}

async function runMigration() {
  console.log('--- 1. Criando tabela brands (se não existir) ---');
  await db.execute(`
    CREATE TABLE IF NOT EXISTS brands (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      logo_url TEXT,
      description TEXT DEFAULT '',
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);
  console.log('✓ Tabela brands pronta.');

  console.log('--- 2. Verificando coluna brand_id na tabela products ---');
  const tableInfo = await db.execute("PRAGMA table_info(products)");
  const cols = tableInfo.rows.map(r => r.name);
  if (!cols.includes('brand_id')) {
    console.log('Adicionando coluna brand_id à tabela products...');
    await db.execute("ALTER TABLE products ADD COLUMN brand_id TEXT REFERENCES brands(id)");
    console.log('✓ Coluna brand_id adicionada.');
  } else {
    console.log('✓ Coluna brand_id já existe na tabela products.');
  }

  console.log('--- 3. Lendo todos os produtos existentes ---');
  const prodRes = await db.execute("SELECT id, name, brand, brand_id FROM products");
  console.log(`Total de produtos lidos: ${prodRes.rows.length}`);

  // Agrupar produtos por marca em texto livre
  const brandGroups = new Map();
  for (const row of prodRes.rows) {
    const rawBrand = (row.brand || '').toString().trim();
    if (!rawBrand) continue;

    const normName = normalizeBrandName(rawBrand);
    const id = slugify(normName);

    if (!brandGroups.has(id)) {
      brandGroups.set(id, {
        id,
        name: normName,
        productIds: []
      });
    }
    brandGroups.get(id).productIds.push(row.id);
  }

  console.log(`--- 4. Inserindo ${brandGroups.size} marcas únicas ---`);
  let brandsCreated = 0;
  for (const [id, info] of brandGroups.entries()) {
    try {
      await db.execute({
        sql: `INSERT INTO brands (id, name, description) 
              VALUES (?, ?, ?) 
              ON CONFLICT(id) DO UPDATE SET name = excluded.name`,
        args: [info.id, info.name, `Coleção oficial ${info.name}`]
      });
      brandsCreated++;
      console.log(`  + [${info.id}] ${info.name} (${info.productIds.length} produtos)`);
    } catch (e) {
      console.error(`Erro ao inserir marca ${info.id}:`, e.message);
    }
  }

  console.log(`✓ Marcas processadas: ${brandsCreated}`);

  console.log('--- 5. Atualizando brand_id em cada produto ---');
  let productsUpdated = 0;
  for (const [id, info] of brandGroups.entries()) {
    for (const prodId of info.productIds) {
      await db.execute({
        sql: "UPDATE products SET brand_id = ? WHERE id = ?",
        args: [id, prodId]
      });
      productsUpdated++;
    }
  }
  console.log(`✓ Produtos atualizados com brand_id: ${productsUpdated}`);

  console.log('--- 6. Verificação final de integridade ---');
  const unassigned = await db.execute("SELECT count(*) as count FROM products WHERE brand_id IS NULL");
  const unassignedCount = Number(unassigned.rows[0].count);
  console.log(`Produtos sem brand_id: ${unassignedCount}`);

  const totalBrands = await db.execute("SELECT count(*) as count FROM brands");
  console.log(`Total de marcas registadas na base de dados: ${totalBrands.rows[0].count}`);

  if (unassignedCount === 0) {
    console.log('🎉 MIGRAÇÃO CONCLUÍDA COM 100% DE SUCESSO!');
  } else {
    console.warn(`Atenção: sobraram ${unassignedCount} produtos sem marca associada.`);
  }
}

runMigration().catch(err => {
  console.error('Falha na migração:', err);
  process.exit(1);
});
