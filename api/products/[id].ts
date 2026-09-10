import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb } from '../../lib/db.js';
import { handleOptions, requireAuth, jsonError, rowToProduct } from '../../lib/apiHelpers.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleOptions(req, res)) return;

  const db = getDb();
  const { id } = req.query as { id: string };

  if (!id) return jsonError(res, 400, 'ID em falta');

  // ── GET /api/products/:id ──────────────────────────────────────
  if (req.method === 'GET') {
    try {
      const result = await db.execute({ sql: 'SELECT * FROM products WHERE id = ?', args: [id] });
      if (result.rows.length === 0) return jsonError(res, 404, 'Produto não encontrado');
      res.status(200).json(rowToProduct(result.rows[0] as Record<string, unknown>));
    } catch (err) {
      console.error('[GET /api/products/:id]', err);
      jsonError(res, 500, 'Erro ao carregar produto');
    }
    return;
  }

  // ── PUT /api/products/:id ──────────────────────────────────────
  if (req.method === 'PUT') {
    const admin = requireAuth(req, res);
    if (!admin) return;

    try {
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
      res.status(200).json(rowToProduct(updated.rows[0] as Record<string, unknown>));
    } catch (err) {
      console.error('[PUT /api/products/:id]', err);
      jsonError(res, 500, 'Erro ao actualizar produto');
    }
    return;
  }

  // ── DELETE /api/products/:id ───────────────────────────────────
  if (req.method === 'DELETE') {
    const admin = requireAuth(req, res);
    if (!admin) return;

    try {
      await db.execute({ sql: 'DELETE FROM products WHERE id = ?', args: [id] });
      res.status(200).json({ message: 'Produto eliminado com sucesso' });
    } catch (err) {
      console.error('[DELETE /api/products/:id]', err);
      jsonError(res, 500, 'Erro ao eliminar produto');
    }
    return;
  }

  jsonError(res, 405, `Método ${req.method} não suportado`);
}
