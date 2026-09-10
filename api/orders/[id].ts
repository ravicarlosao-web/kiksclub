import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb } from '../../lib/db.js';
import { handleOptions, requireAuth, jsonError, rowToOrder } from '../../lib/apiHelpers.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleOptions(req, res)) return;

  const db = getDb();
  const { id } = req.query as { id: string };

  if (!id) return jsonError(res, 400, 'ID em falta');

  // ── GET /api/orders/:id (tracking público) ─────────────────────
  if (req.method === 'GET') {
    try {
      const result = await db.execute({
        sql: `SELECT * FROM orders WHERE
              UPPER(id) = UPPER(?) OR UPPER(tracking_code) = UPPER(?)`,
        args: [id, id],
      });

      if (result.rows.length === 0) {
        return jsonError(res, 404, 'Encomenda não encontrada');
      }

      // Tracking público — ocultar dados sensíveis (email, morada completa)
      const order = rowToOrder(result.rows[0] as Record<string, unknown>);
      const publicOrder = {
        id: order.id,
        customerName: order.customerName,
        status: order.status,
        trackingCode: order.trackingCode,
        items: order.items,
        total: order.total,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        city: order.city,
        paymentMethod: order.paymentMethod,
      };

      res.status(200).json(publicOrder);
    } catch (err) {
      console.error('[GET /api/orders/:id]', err);
      jsonError(res, 500, 'Erro ao carregar encomenda');
    }
    return;
  }

  // ── PUT /api/orders/:id (admin) ────────────────────────────────
  if (req.method === 'PUT') {
    const admin = requireAuth(req, res);
    if (!admin) return;

    try {
      const { status, trackingCode } = req.body;

      const updates: string[] = ["updated_at = datetime('now')"];
      const args: (string | number)[] = [];

      if (status !== undefined) {
        updates.push('status = ?');
        args.push(status);
      }
      if (trackingCode !== undefined) {
        updates.push('tracking_code = ?');
        args.push(trackingCode);
      }

      args.push(id);

      await db.execute({
        sql: `UPDATE orders SET ${updates.join(', ')} WHERE id = ?`,
        args,
      });

      const updated = await db.execute({ sql: 'SELECT * FROM orders WHERE id = ?', args: [id] });
      if (updated.rows.length === 0) return jsonError(res, 404, 'Encomenda não encontrada');
      res.status(200).json(rowToOrder(updated.rows[0] as Record<string, unknown>));
    } catch (err) {
      console.error('[PUT /api/orders/:id]', err);
      jsonError(res, 500, 'Erro ao actualizar encomenda');
    }
    return;
  }

  // ── DELETE /api/orders/:id (admin) ────────────────────────────
  if (req.method === 'DELETE') {
    const admin = requireAuth(req, res);
    if (!admin) return;

    try {
      await db.execute({ sql: 'DELETE FROM orders WHERE id = ?', args: [id] });
      res.status(200).json({ message: 'Encomenda eliminada com sucesso' });
    } catch (err) {
      console.error('[DELETE /api/orders/:id]', err);
      jsonError(res, 500, 'Erro ao eliminar encomenda');
    }
    return;
  }

  jsonError(res, 405, `Método ${req.method} não suportado`);
}
