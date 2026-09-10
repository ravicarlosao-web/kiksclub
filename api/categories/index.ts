import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb } from '../../lib/db';
import { handleOptions, requireAuth, jsonError, rowToCategory } from '../../lib/apiHelpers';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleOptions(req, res)) return;

  // ── GET /api/categories ────────────────────────────────────────
  if (req.method === 'GET') {
    try {
      const db = getDb();
      const { activeOnly } = req.query as { activeOnly?: string };
      let sql = 'SELECT * FROM categories';
      if (activeOnly === 'true') sql += ' WHERE is_active = 1';
      sql += ' ORDER BY sort_order ASC, name ASC';

      const result = await db.execute(sql);
      res.status(200).json(result.rows.map(rowToCategory));
    } catch (err) {
      console.error('[GET /api/categories]', err);
      jsonError(res, 500, 'Erro ao carregar categorias');
    }
    return;
  }

  // ── POST /api/categories ───────────────────────────────────────
  if (req.method === 'POST') {
    const admin = requireAuth(req, res);
    if (!admin) return;

    try {
      const db = getDb();
      const c = req.body;
      if (!c.id || !c.name || !c.slug) {
        return jsonError(res, 400, 'Campos obrigatórios em falta: id, name, slug');
      }

      await db.execute({
        sql: `INSERT INTO categories
          (id, name, slug, description, icon, subcategories,
           banner_image, banner_tag, featured, is_active, sort_order)
          VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
        args: [
          c.id, c.name, c.slug, c.description ?? '',
          c.icon ?? 'Package',
          JSON.stringify(c.subcategories ?? []),
          c.bannerImage ?? null, c.bannerTag ?? null,
          c.featured ? 1 : 0,
          c.isActive !== false ? 1 : 0,
          c.sortOrder ?? 99,
        ],
      });

      const created = await db.execute({ sql: 'SELECT * FROM categories WHERE id = ?', args: [c.id] });
      res.status(201).json(rowToCategory(created.rows[0] as Record<string, unknown>));
    } catch (err: unknown) {
      console.error('[POST /api/categories]', err);
      if ((err as { code?: string }).code === 'SQLITE_CONSTRAINT_UNIQUE') {
        return jsonError(res, 409, 'Já existe uma categoria com este ID ou slug');
      }
      jsonError(res, 500, 'Erro ao criar categoria');
    }
    return;
  }

  jsonError(res, 405, `Método ${req.method} não suportado`);
}
