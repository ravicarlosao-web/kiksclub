import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb } from '../../lib/db';
import { handleOptions, requireAuth, jsonError, rowToOrder } from '../../lib/apiHelpers';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleOptions(req, res)) return;

  // ── GET /api/orders (admin only) ───────────────────────────────
  if (req.method === 'GET') {
    const admin = requireAuth(req, res);
    if (!admin) return;

    try {
      const db = getDb();
      const { status, limit = '200', offset = '0' } = req.query as Record<string, string>;

      let sql = 'SELECT * FROM orders WHERE 1=1';
      const args: (string | number)[] = [];

      if (status) {
        sql += ' AND status = ?';
        args.push(status);
      }

      sql += ` ORDER BY created_at DESC LIMIT ? OFFSET ?`;
      args.push(parseInt(limit), parseInt(offset));

      const result = await db.execute({ sql, args });
      res.status(200).json(result.rows.map(rowToOrder));
    } catch (err) {
      console.error('[GET /api/orders]', err);
      jsonError(res, 500, 'Erro ao carregar encomendas');
    }
    return;
  }

  // ── POST /api/orders (checkout público) ───────────────────────
  if (req.method === 'POST') {
    try {
      const db = getDb();
      const o = req.body;

      // Validação básica
      if (!o.customerName || !o.phone || !o.email || !o.address || !o.postalCode || !o.city) {
        return jsonError(res, 400, 'Campos obrigatórios em falta nos dados do cliente');
      }
      if (!Array.isArray(o.items) || o.items.length === 0) {
        return jsonError(res, 400, 'A encomenda deve ter pelo menos 1 artigo');
      }

      // Gerar código único KC-XXXXXPT
      const code = o.id || `KC-${Math.floor(10000 + Math.random() * 90000)}PT`;

      await db.execute({
        sql: `INSERT INTO orders
          (id, customer_name, phone, email, address, postal_code, city,
           notes, payment_method, items, subtotal, discount, shipping, total,
           status, tracking_code, created_at)
          VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,datetime('now'))`,
        args: [
          code, o.customerName, o.phone, o.email,
          o.address, o.postalCode, o.city,
          o.notes ?? null, o.paymentMethod ?? 'mbway',
          JSON.stringify(o.items),
          o.subtotal ?? 0, o.discount ?? 0, o.shipping ?? 0, o.total ?? 0,
          'Pendente', code,
        ],
      });

      // Decrementar stock dos produtos comprados
      for (const item of o.items) {
        const productResult = await db.execute({
          sql: 'SELECT size_stock, in_stock FROM products WHERE id = ?',
          args: [item.productId],
        });

        if (productResult.rows.length > 0) {
          const row = productResult.rows[0];
          const sizeStock: Record<string, number> = JSON.parse((row.size_stock as string) || '{}');
          const key = String(item.size);
          if (sizeStock[key] !== undefined) {
            sizeStock[key] = Math.max(0, (sizeStock[key] ?? 2) - (item.quantity ?? 1));
          }
          const totalRemaining = Object.values(sizeStock).reduce((s: number, q) => s + (q as number), 0);

          await db.execute({
            sql: 'UPDATE products SET size_stock = ?, in_stock = ? WHERE id = ?',
            args: [JSON.stringify(sizeStock), totalRemaining > 0 ? 1 : 0, item.productId],
          });
        }
      }

      const created = await db.execute({ sql: 'SELECT * FROM orders WHERE id = ?', args: [code] });
      res.status(201).json(rowToOrder(created.rows[0] as Record<string, unknown>));
    } catch (err: unknown) {
      console.error('[POST /api/orders]', err);
      if ((err as { code?: string }).code === 'SQLITE_CONSTRAINT_PRIMARYKEY') {
        return jsonError(res, 409, 'ID de encomenda duplicado, tenta novamente');
      }
      jsonError(res, 500, 'Erro ao criar encomenda');
    }
    return;
  }

  jsonError(res, 405, `Método ${req.method} não suportado`);
}
