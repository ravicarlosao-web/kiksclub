import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb } from '../../lib/db.js';
import { handleOptions, requireAuth, jsonError, rowToProduct } from '../../lib/apiHelpers.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleOptions(req, res)) return;

  // ── GET /api/products ──────────────────────────────────────────
  if (req.method === 'GET') {
    try {
      const db = getDb();
      const { department, category, search, featured, limit = '100', offset = '0' } = req.query as Record<string, string>;

      let sql = 'SELECT * FROM products WHERE 1=1';
      const args: (string | number)[] = [];

      if (department) {
        sql += ' AND LOWER(department) = LOWER(?)';
        args.push(department);
      }
      if (category) {
        sql += ' AND LOWER(category) = LOWER(?)';
        args.push(category);
      }
      if (search) {
        sql += ' AND (LOWER(name) LIKE ? OR LOWER(brand) LIKE ? OR LOWER(description) LIKE ?)';
        const term = `%${search.toLowerCase()}%`;
        args.push(term, term, term);
      }
      if (featured === 'true') {
        sql += ' AND featured = 1';
      }

      sql += ` ORDER BY featured DESC, created_at DESC LIMIT ? OFFSET ?`;
      args.push(parseInt(limit), parseInt(offset));

      const result = await db.execute({ sql, args });
      const products = result.rows.map(rowToProduct);

      res.status(200).json(products);
    } catch (err) {
      console.error('[GET /api/products]', err);
      jsonError(res, 500, 'Erro ao carregar produtos');
    }
    return;
  }

  // ── POST /api/products ─────────────────────────────────────────
  if (req.method === 'POST') {
    const admin = requireAuth(req, res);
    if (!admin) return;

    try {
      const db = getDb();
      const p = req.body;

      if (!p.id || !p.name || !p.brand || !p.category || !p.price || !p.image) {
        return jsonError(res, 400, 'Campos obrigatórios em falta: id, name, brand, category, price, image');
      }

      await db.execute({
        sql: `INSERT INTO products
          (id, name, brand, category, department, subcategory, price, original_price,
           discount_percentage, image, gallery, sizes, size_stock, size_type,
           in_stock, featured, tag, description, details)
          VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        args: [
          p.id, p.name, p.brand, p.category,
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
        ],
      });

      const created = await db.execute({ sql: 'SELECT * FROM products WHERE id = ?', args: [p.id] });
      res.status(201).json(rowToProduct(created.rows[0] as Record<string, unknown>));
    } catch (err: unknown) {
      console.error('[POST /api/products]', err);
      if ((err as { code?: string }).code === 'SQLITE_CONSTRAINT_PRIMARYKEY') {
        return jsonError(res, 409, 'Já existe um produto com este ID');
      }
      jsonError(res, 500, 'Erro ao criar produto');
    }
    return;
  }

  jsonError(res, 405, `Método ${req.method} não suportado`);
}
