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

function requireAuth(req: VercelRequest, res: VercelResponse) {
  setCors(res);
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Não autorizado — token em falta' });
    return null;
  }
  const token = authHeader.slice(7).trim();
  try {
    const secret = process.env.JWT_SECRET || 'fallback-dev-secret-change-in-production!';
    return jwt.verify(token, secret);
  } catch {
    res.status(401).json({ error: 'Não autorizado — token inválido ou expirado' });
    return null;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleOptions(req, res)) return;

  // ── GET /api/orders ────────────────────────────────────────────
  if (req.method === 'GET') {
    const admin = requireAuth(req, res);
    if (!admin) return;

    try {
      const db = getDb();
      const { status, limit = '50', offset = '0' } = req.query as Record<string, string>;

      let sql = 'SELECT * FROM orders WHERE 1=1';
      const args: (string | number)[] = [];

      if (status) {
        sql += ' AND status = ?';
        args.push(status);
      }

      sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
      args.push(parseInt(limit), parseInt(offset));

      const result = await db.execute({ sql, args });
      setCors(res);
      res.status(200).json(result.rows.map(rowToOrder));
    } catch (err: any) {
      console.error('[GET /api/orders]', err);
      jsonError(res, 500, `Erro ao carregar encomendas: ${err.message}`);
    }
    return;
  }

  // ── POST /api/orders ───────────────────────────────────────────
  if (req.method === 'POST') {
    try {
      const db = getDb();
      const o = req.body;

      if (!o.customerName || !o.email || !o.address || !o.items || !o.total) {
        return jsonError(res, 400, 'Campos obrigatórios em falta: customerName, email, address, items, total');
      }

      const id = o.id || `KC-${Date.now().toString(36).toUpperCase()}`;
      const trackingCode = o.trackingCode || `TRK${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

      await db.execute({
        sql: `INSERT INTO orders
          (id, customer_name, phone, email, address, postal_code, city, notes,
           payment_method, items, subtotal, discount, shipping, total, status,
           tracking_code)
          VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        args: [
          id, o.customerName, o.phone || '', o.email, o.address,
          o.postalCode || '', o.city || '', o.notes ?? null,
          o.paymentMethod || 'card',
          JSON.stringify(o.items),
          o.subtotal || o.total,
          o.discount || 0,
          o.shipping || 0,
          o.total,
          o.status || 'Pendente',
          trackingCode,
        ],
      });

      const created = await db.execute({ sql: 'SELECT * FROM orders WHERE id = ?', args: [id] });
      setCors(res);
      res.status(201).json(rowToOrder(created.rows[0] as Record<string, unknown>));
    } catch (err: any) {
      console.error('[POST /api/orders]', err);
      jsonError(res, 500, `Erro ao criar encomenda: ${err.message}`);
    }
    return;
  }

  jsonError(res, 405, `Método ${req.method} não suportado`);
}
