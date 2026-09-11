import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@libsql/client/http';
import jwt from 'jsonwebtoken';

function setCors(res: VercelResponse): void {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PATCH, DELETE, OPTIONS');
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

function rowToOrder(row: Record<string, unknown>) {
  return {
    id: row.id as string,
    customerName: row.customer_name as string,
    phone: row.phone as string,
    email: row.email as string,
    address: row.address as string,
    postalCode: row.postal_code as string,
    city: row.city as string,
    notes: row.notes as string | undefined,
    paymentMethod: row.payment_method as string,
    items: safeJson(row.items as string, []),
    subtotal: row.subtotal as number,
    discount: row.discount as number,
    shipping: row.shipping as number,
    total: row.total as number,
    status: row.status as string,
    trackingCode: row.tracking_code as string,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string | undefined,
  };
}

function checkAdmin(req: VercelRequest): any | null {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.slice(7).trim();
  const secret = (process.env.JWT_SECRET || '').trim();
  if (!secret || secret.length < 32) return null;
  try {
    return jwt.verify(token, secret, { algorithms: ['HS256'] });
  } catch {
    return null;
  }
}

function requireAuth(req: VercelRequest, res: VercelResponse) {
  setCors(res);
  const admin = checkAdmin(req);
  if (!admin) {
    res.status(401).json({ error: 'Não autorizado — token de administrador inválido ou ausente' });
    return null;
  }
  return admin;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleOptions(req, res)) return;

  const { id } = req.query as { id: string };

  if (!id) return jsonError(res, 400, 'ID de encomenda em falta');

  const cleanId = String(id).trim().toUpperCase();

  // ── GET /api/orders/:id ────────────────────────────────────────
  if (req.method === 'GET') {
    try {
      const db = getDb();
      const result = await db.execute({
        sql: 'SELECT * FROM orders WHERE UPPER(id) = ? OR UPPER(tracking_code) = ? LIMIT 1',
        args: [cleanId, cleanId],
      });

      if (result.rows.length === 0) return jsonError(res, 404, 'Encomenda não encontrada');

      const fullOrder = rowToOrder(result.rows[0] as Record<string, unknown>);
      const admin = checkAdmin(req);

      setCors(res);

      // 1. Administrador autenticado recebe todos os dados da encomenda
      if (admin) {
        return res.status(200).json(fullOrder);
      }

      // 2. Consulta pública (Anti-IDOR / Proteção RGPD): Remove todos os dados PII privados
      //    (Nome completo, telefone, e-mail, morada exata, código postal, notas e valores monetários)
      const sanitizedTracking = {
        id: fullOrder.id,
        trackingCode: fullOrder.trackingCode,
        status: fullOrder.status,
        city: fullOrder.city,
        createdAt: fullOrder.createdAt,
        items: (fullOrder.items || []).map((it: any) => ({
          name: it.name,
          brand: it.brand,
          size: it.size,
          quantity: it.quantity,
          image: it.image,
        })),
      };

      return res.status(200).json(sanitizedTracking);
    } catch (err: any) {
      console.error('[GET /api/orders/:id]', err);
      jsonError(res, 500, `Erro ao carregar encomenda: ${err.message}`);
    }
    return;
  }

  // ── PATCH /api/orders/:id ──────────────────────────────────────
  if (req.method === 'PATCH' || req.method === 'PUT') {
    const admin = requireAuth(req, res);
    if (!admin) return;

    try {
      const db = getDb();
      const { status, trackingCode } = req.body as { status?: string; trackingCode?: string };

      if (!status && trackingCode === undefined) {
        return jsonError(res, 400, 'Pelo menos status ou trackingCode devem ser fornecidos');
      }

      const sets: string[] = ["updated_at = datetime('now')"];
      const args: (string | number)[] = [];

      if (status) {
        sets.push('status = ?');
        args.push(String(status).trim());
      }
      if (trackingCode !== undefined) {
        sets.push('tracking_code = ?');
        args.push(String(trackingCode).trim());
      }

      args.push(cleanId);

      await db.execute({
        sql: `UPDATE orders SET ${sets.join(', ')} WHERE UPPER(id) = ?`,
        args,
      });

      const updated = await db.execute({ sql: 'SELECT * FROM orders WHERE UPPER(id) = ?', args: [cleanId] });
      if (updated.rows.length === 0) return jsonError(res, 404, 'Encomenda não encontrada');
      setCors(res);
      res.status(200).json(rowToOrder(updated.rows[0] as Record<string, unknown>));
    } catch (err: any) {
      console.error('[PATCH /api/orders/:id]', err);
      jsonError(res, 500, `Erro ao actualizar encomenda: ${err.message}`);
    }
    return;
  }

  // ── DELETE /api/orders/:id ─────────────────────────────────────
  if (req.method === 'DELETE') {
    const admin = requireAuth(req, res);
    if (!admin) return;

    try {
      const db = getDb();
      await db.execute({ sql: 'DELETE FROM orders WHERE UPPER(id) = ?', args: [cleanId] });
      setCors(res);
      res.status(200).json({ message: 'Encomenda eliminada com sucesso' });
    } catch (err: any) {
      console.error('[DELETE /api/orders/:id]', err);
      jsonError(res, 500, `Erro ao eliminar encomenda: ${err.message}`);
    }
    return;
  }

  jsonError(res, 405, `Método ${req.method} não suportado`);
}
