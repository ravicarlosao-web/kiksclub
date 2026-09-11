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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleOptions(req, res)) return;

  const { id } = req.query as { id: string };

  if (!id) return jsonError(res, 400, 'ID em falta');

  // ── GET /api/products/:id ──────────────────────────────────────
  if (req.method === 'GET') {
    try {
      const db = getDb();
      const result = await db.execute({ sql: 'SELECT * FROM products WHERE id = ?', args: [id] });
      if (result.rows.length === 0) return jsonError(res, 404, 'Produto não encontrado');
      setCors(res);
      res.status(200).json(rowToProduct(result.rows[0] as Record<string, unknown>));
    } catch (err: any) {
      console.error('[GET /api/products/:id]', err);
      jsonError(res, 500, `Erro ao carregar produto: ${err.message}`);
    }
    return;
  }

  // ── PUT /api/products/:id ──────────────────────────────────────
  if (req.method === 'PUT') {
    const admin = requireAuth(req, res);
    if (!admin) return;

    try {
      const db = getDb();
      const p = req.body;

      await db.execute({
        sql: `UPDATE products SET
          name = ?, brand = ?, category = ?, department = ?, subcategory = ?,
          price = ?, original_price = ?, discount_percentage = ?,
          image = ?, gallery = ?, sizes = ?, size_stock = ?, size_type = ?,
          in_stock = ?, featured = ?, tag = ?, description = ?, details = ?,
          updated_at = datetime('now')
          WHERE id = ?`,
        args: [
          p.name, p.brand, p.category,
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
          id,
        ],
      });

      const updated = await db.execute({ sql: 'SELECT * FROM products WHERE id = ?', args: [id] });
      if (updated.rows.length === 0) return jsonError(res, 404, 'Produto não encontrado');
      setCors(res);
      res.status(200).json(rowToProduct(updated.rows[0] as Record<string, unknown>));
    } catch (err: any) {
      console.error('[PUT /api/products/:id]', err);
      jsonError(res, 500, `Erro ao actualizar produto: ${err.message}`);
    }
    return;
  }

  // ── DELETE /api/products/:id ───────────────────────────────────
  if (req.method === 'DELETE') {
    const admin = requireAuth(req, res);
    if (!admin) return;

    try {
      const db = getDb();
      await db.execute({ sql: 'DELETE FROM products WHERE id = ?', args: [id] });
      setCors(res);
      res.status(200).json({ message: 'Produto eliminado com sucesso' });
    } catch (err: any) {
      console.error('[DELETE /api/products/:id]', err);
      jsonError(res, 500, `Erro ao eliminar produto: ${err.message}`);
    }
    return;
  }

  jsonError(res, 405, `Método ${req.method} não suportado`);
}
