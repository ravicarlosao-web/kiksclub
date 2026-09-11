import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@libsql/client/http';
import jwt from 'jsonwebtoken';

function setCors(res: VercelResponse): void {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

function handleOptions(req: VercelRequest, res: VercelResponse): boolean {
  setCors(res);
  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return true;
  }
  return false;
}

function jsonError(res: VercelResponse, status: number, message: string): void {
  setCors(res);
  res.status(status).json({ error: message });
}

function getDb() {
  const rawUrl = (process.env.TURSO_DATABASE_URL || '').trim();
  const url = rawUrl.replace(/^libsql:\/\//, 'https://');
  const authToken = (process.env.TURSO_AUTH_TOKEN || '').trim();
  return createClient({ url, authToken });
}

function safeJson<T>(str: string | null | undefined, fallback: T): T {
  if (!str) return fallback;
  try {
    return JSON.parse(str) as T;
  } catch {
    return fallback;
  }
}

function rowToProduct(row: Record<string, unknown>) {
  return {
    id: row.id as string,
    name: row.name as string,
    brand: row.brand as string,
    category: row.category as string,
    department: row.department as string | undefined,
    subcategory: row.subcategory as string | undefined,
    price: row.price as number,
    originalPrice: row.original_price as number,
    discountPercentage: row.discount_percentage as number,
    image: row.image as string,
    gallery: safeJson(row.gallery as string, []),
    sizes: safeJson(row.sizes as string, []),
    sizeStock: safeJson(row.size_stock as string, {}),
    sizeType: row.size_type as string | undefined,
    inStock: Boolean(row.in_stock),
    featured: Boolean(row.featured),
    tag: row.tag as string | undefined,
    description: row.description as string,
    details: safeJson(row.details as string, []),
  };
}

function requireAuth(req: VercelRequest, res: VercelResponse) {
  setCors(res);
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Não autorizado — token em falta' });
    return null;
  }
  const token = authHeader.slice(7).trim();
  const secret = (process.env.JWT_SECRET || '').trim();
  if (!secret || secret.length < 32) {
    res.status(500).json({ error: 'Configuração de segurança JWT ausente no servidor' });
    return null;
  }
  try {
    return jwt.verify(token, secret, { algorithms: ['HS256'] });
  } catch {
    res.status(401).json({ error: 'Não autorizado — token inválido ou expirado' });
    return null;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleOptions(req, res)) return;

  // ── GET /api/products ──────────────────────────────────────────
  if (req.method === 'GET') {
    try {
      const db = getDb();
      const { department, category, search, featured, limit = '100', offset = '0' } = req.query as Record<string, string>;

      let sql = 'SELECT * FROM products WHERE 1=1';
      const args: (string | number)[] = [];

      if (department) {
        sql += ' AND LOWER(department) = LOWER(?)';
        args.push(department);
      }
      if (category) {
        sql += ' AND LOWER(category) = LOWER(?)';
        args.push(category);
      }
      if (search) {
        sql += ' AND (LOWER(name) LIKE ? OR LOWER(brand) LIKE ? OR LOWER(description) LIKE ?)';
        const term = `%${search.toLowerCase()}%`;
        args.push(term, term, term);
      }
      if (featured === 'true') {
        sql += ' AND featured = 1';
      }

      sql += ` ORDER BY featured DESC, created_at DESC LIMIT ? OFFSET ?`;
      args.push(parseInt(limit), parseInt(offset));

      const result = await db.execute({ sql, args });
      const products = result.rows.map(rowToProduct);

      setCors(res);
      res.status(200).json(products);
    } catch (err: any) {
      console.error('[GET /api/products]', err);
      jsonError(res, 500, `Erro ao carregar produtos: ${err.message}`);
    }
    return;
  }

  // ── POST /api/products ─────────────────────────────────────────
  if (req.method === 'POST') {
    const admin = requireAuth(req, res);
    if (!admin) return;

    try {
      const db = getDb();
      const p = req.body;

      if (!p.id || !p.name || !p.brand || !p.category || !p.price || !p.image) {
        return jsonError(res, 400, 'Campos obrigatórios em falta: id, name, brand, category, price, image');
      }

      await db.execute({
        sql: `INSERT INTO products
          (id, name, brand, category, department, subcategory, price, original_price,
           discount_percentage, image, gallery, sizes, size_stock, size_type,
           in_stock, featured, tag, description, details)
          VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        args: [
          p.id, p.name, p.brand, p.category,
          p.department ?? null, p.subcategory ?? null,
          p.price, p.originalPrice ?? p.price, p.discountPercentage ?? 0,
          p.image,
          JSON.stringify(p.gallery ?? []),
          JSON.stringify(p.sizes ?? []),
          JSON.stringify(p.sizeStock ?? {}),
          p.sizeType ?? 'shoes',
          p.inStock !== false ? 1 : 0,
          p.featured ? 1 : 0,
          p.tag ?? null,
          p.description ?? '',
          JSON.stringify(p.details ?? []),
        ],
      });

      const created = await db.execute({ sql: 'SELECT * FROM products WHERE id = ?', args: [p.id] });
      setCors(res);
      res.status(201).json(rowToProduct(created.rows[0] as Record<string, unknown>));
    } catch (err: any) {
      console.error('[POST /api/products]', err);
      if (err.code === 'SQLITE_CONSTRAINT_PRIMARYKEY') {
        return jsonError(res, 409, 'Já existe um produto com este ID');
      }
      jsonError(res, 500, `Erro ao criar produto: ${err.message}`);
    }
    return;
  }

  jsonError(res, 405, `Método ${req.method} não suportado`);
}
