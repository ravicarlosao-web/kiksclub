import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb } from '../../lib/db.js';
import { handleOptions, requireAuth, jsonError, rowToCategory } from '../../lib/apiHelpers.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleOptions(req, res)) return;

  const { id } = req.query as { id: string };

  if (!id) return jsonError(res, 400, 'ID em falta');

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
          c.name, c.slug, c.description ?? '',
          c.icon ?? 'Package',
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
      res.status(200).json(rowToCategory(updated.rows[0] as Record<string, unknown>));
    } catch (err) {
      console.error('[PUT /api/categories/:id]', err);
      jsonError(res, 500, 'Erro ao actualizar categoria');
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
      res.status(200).json({ message: 'Categoria eliminada com sucesso' });
    } catch (err) {
      console.error('[DELETE /api/categories/:id]', err);
      jsonError(res, 500, 'Erro ao eliminar categoria');
    }
    return;
  }

  jsonError(res, 405, `Método ${req.method} não suportado`);
}
