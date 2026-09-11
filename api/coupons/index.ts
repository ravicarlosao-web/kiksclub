import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@libsql/client/http';
import jwt from 'jsonwebtoken';

function setCors(res: VercelResponse, req?: VercelRequest): void {
  const origin = req?.headers?.origin || '*';
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
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

async function ensureTable(db: any) {
  await db.execute({
    sql: `CREATE TABLE IF NOT EXISTS coupons (
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
  });
}

function rowToCoupon(row: Record<string, unknown>) {
  return {
    id: row.id as string,
    code: (row.code as string).toUpperCase(),
    discountPercent: Number(row.discount_percent) || 0,
    discountAmount: Number(row.discount_amount) || 0,
    minOrderValue: Number(row.min_order_value) || 0,
    maxUses: row.max_uses !== null ? Number(row.max_uses) : null,
    usedCount: Number(row.used_count) || 0,
    isActive: Boolean(row.is_active),
    expiresAt: (row.expires_at as string) || null,
    createdAt: row.created_at as string,
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleOptions(req, res)) return;
  setCors(res, req);

  const db = getDb();

  try {
    await ensureTable(db);

    // 1. GET: Validação pública (com ?code=...) OU Listagem Admin (sem code)
    if (req.method === 'GET') {
      const codeQuery = typeof req.query.code === 'string' ? req.query.code.trim().toUpperCase() : null;

      if (codeQuery) {
        // Validação no checkout (pública)
        const result = await db.execute({
          sql: 'SELECT * FROM coupons WHERE UPPER(code) = ? LIMIT 1',
          args: [codeQuery],
        });

        if (result.rows.length === 0) {
          return res.status(200).json({ valid: false, message: 'Cupão inválido ou inexistente.' });
        }

        const coupon = rowToCoupon(result.rows[0] as Record<string, unknown>);

        if (!coupon.isActive) {
          return res.status(200).json({ valid: false, message: 'Este cupão já não está ativo.' });
        }

        if (coupon.expiresAt) {
          const expDate = new Date(coupon.expiresAt);
          if (expDate.getTime() < Date.now()) {
            return res.status(200).json({ valid: false, message: 'Este cupão expirou.' });
          }
        }

        if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) {
          return res.status(200).json({ valid: false, message: 'Este cupão atingiu o limite de utilizações.' });
        }

        return res.status(200).json({
          valid: true,
          code: coupon.code,
          discountPercent: coupon.discountPercent,
          minOrderValue: coupon.minOrderValue,
        });
      }

      // Se não há ?code, requer autenticação admin para listar
      const admin = requireAuth(req, res);
      if (!admin) return;

      const result = await db.execute({
        sql: 'SELECT * FROM coupons ORDER BY created_at DESC',
      });

      const coupons = result.rows.map((row) => rowToCoupon(row as Record<string, unknown>));
      return res.status(200).json({ coupons });
    }

    // 2. POST: Criar novo cupão (Requer Admin)
    if (req.method === 'POST') {
      const admin = requireAuth(req, res);
      if (!admin) return;

      const { code, discountPercent, maxUses, expiresAt, minOrderValue } = req.body || {};

      if (!code || typeof code !== 'string' || code.trim().length < 2) {
        return jsonError(res, 400, 'Código de cupão inválido (mínimo 2 caracteres)');
      }

      const percent = Number(discountPercent);
      if (isNaN(percent) || percent < 1 || percent > 100) {
        return jsonError(res, 400, 'A percentagem de desconto deve ser entre 1% e 100%');
      }

      const cleanCode = code.trim().toUpperCase().replace(/[^A-Z0-9_-]/g, '');
      const cleanMaxUses = maxUses !== undefined && maxUses !== null && maxUses !== '' ? Math.max(1, parseInt(maxUses, 10)) : null;
      const cleanExpires = expiresAt && typeof expiresAt === 'string' && expiresAt.trim() ? expiresAt.trim() : null;
      const cleanMinOrder = minOrderValue ? Math.max(0, parseFloat(minOrderValue)) : 0;
      const id = `cp-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;

      try {
        await db.execute({
          sql: `INSERT INTO coupons 
                (id, code, discount_percent, min_order_value, max_uses, used_count, is_active, expires_at)
                VALUES (?, ?, ?, ?, ?, 0, 1, ?)`,
          args: [id, cleanCode, percent, cleanMinOrder, cleanMaxUses, cleanExpires],
        });

        return res.status(201).json({
          success: true,
          coupon: {
            id,
            code: cleanCode,
            discountPercent: percent,
            minOrderValue: cleanMinOrder,
            maxUses: cleanMaxUses,
            usedCount: 0,
            isActive: true,
            expiresAt: cleanExpires,
            createdAt: new Date().toISOString(),
          },
        });
      } catch (insertErr: any) {
        if (insertErr?.message?.includes('UNIQUE') || insertErr?.message?.includes('constraint')) {
          return jsonError(res, 409, `Já existe um cupão com o código "${cleanCode}"`);
        }
        throw insertErr;
      }
    }

    // 3. PATCH: Ativar/Desativar cupão
    if (req.method === 'PATCH') {
      const admin = requireAuth(req, res);
      if (!admin) return;

      const { id, isActive } = req.body || {};
      if (!id) return jsonError(res, 400, 'ID do cupão em falta');

      await db.execute({
        sql: 'UPDATE coupons SET is_active = ? WHERE id = ?',
        args: [isActive ? 1 : 0, id],
      });

      return res.status(200).json({ success: true, id, isActive: Boolean(isActive) });
    }

    // 4. DELETE: Remover cupão
    if (req.method === 'DELETE') {
      const admin = requireAuth(req, res);
      if (!admin) return;

      const id = (typeof req.query.id === 'string' ? req.query.id : req.body?.id) as string;
      if (!id) return jsonError(res, 400, 'ID do cupão em falta');

      await db.execute({
        sql: 'DELETE FROM coupons WHERE id = ?',
        args: [id],
      });

      return res.status(200).json({ success: true, deletedId: id });
    }

    return jsonError(res, 405, 'Método não suportado');
  } catch (err: any) {
    console.error('[API /api/coupons]', err);
    return jsonError(res, 500, `Erro de base de dados: ${err.message}`);
  }
}
