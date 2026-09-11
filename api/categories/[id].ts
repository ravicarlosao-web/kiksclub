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

function rowToCategory(row: Record<string, unknown>) {
  return {
    id: row.id as string,
    name: row.name as string,
    slug: row.slug as string,
    description: row.description as string,
    icon: row.icon as string,
    subcategories: safeJson(row.subcategories as string, []),
    bannerImage: row.banner_image as string | undefined,
    bannerTag: row.banner_tag as string | undefined,
    featured: Boolean(row.featured),
    isActive: Boolean(row.is_active),
    sortOrder: row.sort_order as number,
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

  // ── GET /api/categories/:id ────────────────────────────────────
  if (req.method === 'GET') {
    try {
      const db = getDb();
      const result = await db.execute({ sql: 'SELECT * FROM categories WHERE id = ?', args: [id] });
      if (result.rows.length === 0) return jsonError(res, 404, 'Categoria não encontrada');
      setCors(res);
      res.status(200).json(rowToCategory(result.rows[0] as Record<string, unknown>));
    } catch (err: any) {
      console.error('[GET /api/categories/:id]', err);
      jsonError(res, 500, `Erro ao carregar categoria: ${err.message}`);
    }
    return;
  }

  // ── PUT /api/categories/:id ────────────────────────────────────
  if (req.method === 'PUT') {
    const admin = requireAuth(req, res);
    if (!admin) return;

    try {
      const db = getDb();
      const c = req.body;

      await db.execute({
        sql: `UPDATE categories SET
          name = ?, slug = ?, description = ?, icon = ?, subcategories = ?,
          banner_image = ?, banner_tag = ?, featured = ?, is_active = ?, sort_order = ?
          WHERE id = ?`,
        args: [
          c.name, c.slug, c.description ?? '', c.icon ?? 'Package',
          JSON.stringify(c.subcategories ?? []),
          c.bannerImage ?? null, c.bannerTag ?? null,
          c.featured ? 1 : 0,
          c.isActive !== false ? 1 : 0,
          c.sortOrder ?? 99,
          id,
        ],
      });

      const updated = await db.execute({ sql: 'SELECT * FROM categories WHERE id = ?', args: [id] });
      if (updated.rows.length === 0) return jsonError(res, 404, 'Categoria não encontrada');
      setCors(res);
      res.status(200).json(rowToCategory(updated.rows[0] as Record<string, unknown>));
    } catch (err: any) {
      console.error('[PUT /api/categories/:id]', err);
      jsonError(res, 500, `Erro ao actualizar categoria: ${err.message}`);
    }
    return;
  }

  // ── DELETE /api/categories/:id ─────────────────────────────────
  if (req.method === 'DELETE') {
    const admin = requireAuth(req, res);
    if (!admin) return;

    try {
      const db = getDb();
      await db.execute({ sql: 'DELETE FROM categories WHERE id = ?', args: [id] });
      setCors(res);
      res.status(200).json({ message: 'Categoria eliminada com sucesso' });
    } catch (err: any) {
      console.error('[DELETE /api/categories/:id]', err);
      jsonError(res, 500, `Erro ao eliminar categoria: ${err.message}`);
    }
    return;
  }

  jsonError(res, 405, `Método ${req.method} não suportado`);
}
