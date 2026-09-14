import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@libsql/client/http';
import jwt from 'jsonwebtoken';

function setCors(res: VercelResponse, req?: VercelRequest): void {
  const origin = req?.headers?.origin || '*';
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

function handleOptions(req: VercelRequest, res: VercelResponse): boolean {
  setCors(res, req);
  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return true;
  }
  return false;
}

function jsonError(res: VercelResponse, status: number, message: string): void {
  res.status(status).json({ error: message });
}

function extractToken(req: VercelRequest): string | null {
  if (req.headers.cookie) {
    const match = req.headers.cookie.match(/(?:^|;\s*)kicksclub_admin_token=([^;]+)/);
    if (match) return decodeURIComponent(match[1].trim());
  }
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) return authHeader.slice(7).trim();
  return null;
}

function requireAuth(req: VercelRequest, res: VercelResponse) {
  setCors(res, req);
  const token = extractToken(req);
  if (!token) {
    res.status(401).json({ error: 'Não autorizado — token em falta' });
    return null;
  }
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
    brand: (row.brand_name || row.brand) as string,
    brandId: (row.brand_id as string) || undefined,
    brandLogo: (row.brand_logo as string) || undefined,
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
    colors: safeJson(row.colors as string, undefined),
  };
}



export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleOptions(req, res)) return;

  // ── GET /api/products ──────────────────────────────────────────
  if (req.method === 'GET') {
    try {
      const db = getDb();
      const { department, category, search, featured, brand, brandId, limit = '100', offset = '0' } = req.query as Record<string, string>;

      let sql = `
        SELECT p.*, b.name as brand_name, b.logo_url as brand_logo
        FROM products p
        LEFT JOIN brands b ON p.brand_id = b.id
        WHERE 1=1
      `;
      const args: (string | number)[] = [];

      if (department) {
        sql += ' AND LOWER(p.department) = LOWER(?)';
        args.push(department);
      }
      if (category) {
        sql += ' AND LOWER(p.category) = LOWER(?)';
        args.push(category);
      }
      if (brandId) {
        sql += ' AND p.brand_id = ?';
        args.push(brandId);
      } else if (brand) {
        sql += ' AND (LOWER(p.brand) = LOWER(?) OR LOWER(b.name) = LOWER(?) OR p.brand_id = ?)';
        args.push(brand, brand, brand);
      }
      if (search) {
        sql += ' AND (LOWER(p.name) LIKE ? OR LOWER(p.brand) LIKE ? OR LOWER(b.name) LIKE ? OR LOWER(p.description) LIKE ?)';
        const term = `%${search.toLowerCase()}%`;
        args.push(term, term, term, term);
      }
      if (featured === 'true') {
        sql += ' AND p.featured = 1';
      }

      sql += ` ORDER BY p.featured DESC, p.created_at DESC LIMIT ? OFFSET ?`;
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

      if (!p.id || !p.name || (!p.brand && !p.brandId) || !p.category || !p.price || !p.image) {
        return jsonError(res, 400, 'Campos obrigatórios em falta: id, name, brand/brandId, category, price, image');
      }

      let brandId = p.brandId || p.brand_id || null;
      let brandName = p.brand || '';

      // Se brandId for passado, buscar nome da marca se não veio
      if (brandId && !brandName) {
        const bRes = await db.execute({ sql: 'SELECT name FROM brands WHERE id = ?', args: [brandId] });
        if (bRes.rows.length > 0) {
          brandName = bRes.rows[0].name as string;
        }
      } else if (!brandId && brandName) {
        // Tentar resolver brandId a partir do nome
        const bRes = await db.execute({ sql: 'SELECT id FROM brands WHERE LOWER(name) = LOWER(?)', args: [brandName] });
        if (bRes.rows.length > 0) {
          brandId = bRes.rows[0].id as string;
        }
      }

      await db.execute({
        sql: `INSERT INTO products
          (id, name, brand, brand_id, category, department, subcategory, price, original_price,
           discount_percentage, image, gallery, sizes, size_stock, size_type,
           in_stock, featured, tag, description, details)
          VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        args: [
          p.id, p.name, brandName, brandId, p.category,
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

      const created = await db.execute({
        sql: `SELECT p.*, b.name as brand_name, b.logo_url as brand_logo
              FROM products p
              LEFT JOIN brands b ON p.brand_id = b.id
              WHERE p.id = ?`,
        args: [p.id],
      });
      setCors(res);
      res.status(201).json(rowToProduct(created.rows[0] as Record<string, unknown>));
    } catch (err: any) {
      console.error('[POST /api/products]', err);
      if (err.code === 'SQLITE_CONSTRAINT_PRIMARYKEY' || err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        return jsonError(res, 409, 'Já existe um produto com este ID');
      }
      jsonError(res, 500, `Erro ao criar produto: ${err.message}`);
    }
    return;
  }

  jsonError(res, 405, `Método ${req.method} não suportado`);
}
