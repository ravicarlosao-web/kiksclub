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

function jsonError(res: VercelResponse, status: number, message: string, extra?: Record<string, unknown>): void {
  res.status(status).json({ error: message, ...extra });
}

function getDb() {
  const rawUrl = (process.env.TURSO_DATABASE_URL || '').trim();
  const url = rawUrl.replace(/^libsql:\/\//, 'https://');
  const authToken = (process.env.TURSO_AUTH_TOKEN || '').trim();
  return createClient({ url, authToken });
}

function rowToBrand(row: Record<string, unknown>) {
  return {
    id: row.id as string,
    name: row.name as string,
    logoUrl: (row.logo_url as string) || undefined,
    description: (row.description as string) || '',
    createdAt: (row.created_at as string) || undefined,
    productCount: Number(row.product_count ?? 0),
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

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleOptions(req, res)) return;

  const rawId = req.query.id;
  const id = Array.isArray(rawId) ? rawId[0] : rawId;

  // ── Se houver id (via rewrite /api/brands/:id ou query ?id=) ────
  if (id) {
    // GET /api/brands/:id
    if (req.method === 'GET') {
      try {
        const db = getDb();
        const sql = `
          SELECT b.*, COUNT(p.id) as product_count
          FROM brands b
          LEFT JOIN products p ON p.brand_id = b.id
          WHERE b.id = ?
          GROUP BY b.id
        `;
        const result = await db.execute({ sql, args: [id] });
        if (result.rows.length === 0) return jsonError(res, 404, 'Marca não encontrada');
        setCors(res);
        return res.status(200).json(rowToBrand(result.rows[0] as Record<string, unknown>));
      } catch (err: any) {
        console.error('[GET /api/brands/:id]', err);
        return jsonError(res, 500, `Erro ao obter marca: ${err.message}`);
      }
    }

    // PUT /api/brands/:id
    if (req.method === 'PUT') {
      const admin = requireAuth(req, res);
      if (!admin) return;

      try {
        const db = getDb();
        const b = req.body || {};
        if (!b.name || !b.name.trim()) {
          return jsonError(res, 400, 'O nome da marca é obrigatório');
        }

        const trimmedName = b.name.trim();

        // Verificar duplicidade de nome em outra marca
        const existing = await db.execute({
          sql: 'SELECT id FROM brands WHERE LOWER(name) = LOWER(?) AND id != ?',
          args: [trimmedName, id],
        });
        if (existing.rows.length > 0) {
          return jsonError(res, 409, `Já existe outra marca registada com o nome "${trimmedName}"`);
        }

        await db.execute({
          sql: `UPDATE brands SET
            name = ?,
            logo_url = ?,
            description = ?
            WHERE id = ?`,
          args: [
            trimmedName,
            b.logoUrl ?? b.logo_url ?? null,
            b.description ?? '',
            id,
          ],
        });

        // Também atualizar o campo textual 'brand' nos produtos para manter sincronia
        await db.execute({
          sql: 'UPDATE products SET brand = ? WHERE brand_id = ?',
          args: [trimmedName, id],
        });

        const updated = await db.execute({
          sql: `SELECT b.*, COUNT(p.id) as product_count
                FROM brands b
                LEFT JOIN products p ON p.brand_id = b.id
                WHERE b.id = ?
                GROUP BY b.id`,
          args: [id],
        });
        if (updated.rows.length === 0) return jsonError(res, 404, 'Marca não encontrada');
        setCors(res);
        return res.status(200).json(rowToBrand(updated.rows[0] as Record<string, unknown>));
      } catch (err: any) {
        console.error('[PUT /api/brands/:id]', err);
        return jsonError(res, 500, `Erro ao atualizar marca: ${err.message}`);
      }
    }

    // DELETE /api/brands/:id
    if (req.method === 'DELETE') {
      const admin = requireAuth(req, res);
      if (!admin) return;

      try {
        const db = getDb();
        const reassignTo = (req.query.reassignTo as string) || req.body?.reassignTo;
        const force = req.query.force === 'true' || req.body?.force === true;

        // Verificar produtos associados
        const countRes = await db.execute({
          sql: 'SELECT COUNT(*) as count FROM products WHERE brand_id = ?',
          args: [id],
        });
        const productCount = Number(countRes.rows[0]?.count ?? 0);

        if (productCount > 0) {
          if (reassignTo) {
            // Validar se marca de destino existe
            const destBrand = await db.execute({
              sql: 'SELECT id, name FROM brands WHERE id = ?',
              args: [reassignTo],
            });
            if (destBrand.rows.length === 0) {
              return jsonError(res, 400, 'A marca de destino especificada para reatribuição não existe');
            }
            const newBrandName = destBrand.rows[0].name as string;
            await db.execute({
              sql: 'UPDATE products SET brand_id = ?, brand = ? WHERE brand_id = ?',
              args: [reassignTo, newBrandName, id],
            });
          } else if (force) {
            await db.execute({
              sql: 'UPDATE products SET brand_id = NULL WHERE brand_id = ?',
              args: [id],
            });
          } else {
            return jsonError(
              res,
              400,
              `Não é possível remover: existem ${productCount} produtos associados a esta marca. Reatribua os produtos ou utilize a opção de desassociação forçada.`,
              { productCount }
            );
          }
        }

        await db.execute({ sql: 'DELETE FROM brands WHERE id = ?', args: [id] });
        setCors(res);
        return res.status(200).json({ message: 'Marca eliminada com sucesso' });
      } catch (err: any) {
        console.error('[DELETE /api/brands/:id]', err);
        return jsonError(res, 500, `Erro ao eliminar marca: ${err.message}`);
      }
    }

    return jsonError(res, 405, `Método ${req.method} não suportado`);
  }

  // ── GET /api/brands (Listagem pública com contagem de produtos) ──
  if (req.method === 'GET') {
    try {
      const db = getDb();
      const sql = `
        SELECT b.*, COUNT(p.id) as product_count
        FROM brands b
        LEFT JOIN products p ON p.brand_id = b.id
        GROUP BY b.id
        ORDER BY b.name ASC
      `;
      const result = await db.execute(sql);
      setCors(res);
      return res.status(200).json(result.rows.map(rowToBrand));
    } catch (err: any) {
      console.error('[GET /api/brands]', err);
      return jsonError(res, 500, `Erro ao listar marcas: ${err.message}`);
    }
  }

  // ── POST /api/brands (Criar nova marca - protegido por admin) ───
  if (req.method === 'POST') {
    const admin = requireAuth(req, res);
    if (!admin) return;

    try {
      const db = getDb();
      const b = req.body || {};
      if (!b.name || !b.name.trim()) {
        return jsonError(res, 400, 'O nome da marca é obrigatório');
      }

      const trimmedName = b.name.trim();
      const brandId = (b.id && b.id.trim()) ? slugify(b.id) : slugify(trimmedName);

      if (!brandId) {
        return jsonError(res, 400, 'ID de marca inválido gerado a partir do nome');
      }

      // Verificar duplicidade de ID ou Nome
      const existing = await db.execute({
        sql: 'SELECT id, name FROM brands WHERE id = ? OR LOWER(name) = LOWER(?)',
        args: [brandId, trimmedName],
      });
      if (existing.rows.length > 0) {
        return jsonError(res, 409, `Já existe uma marca registada com o nome "${trimmedName}" ou identificador "${brandId}"`);
      }

      await db.execute({
        sql: `INSERT INTO brands (id, name, logo_url, description)
              VALUES (?, ?, ?, ?)`,
        args: [
          brandId,
          trimmedName,
          b.logoUrl ?? b.logo_url ?? null,
          b.description ?? '',
        ],
      });

      const created = await db.execute({
        sql: `SELECT b.*, 0 as product_count
              FROM brands b
              WHERE b.id = ?`,
        args: [brandId],
      });

      setCors(res);
      return res.status(201).json(rowToBrand(created.rows[0] as Record<string, unknown>));
    } catch (err: any) {
      console.error('[POST /api/brands]', err);
      if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        return jsonError(res, 409, 'Já existe uma marca registada com este nome');
      }
      return jsonError(res, 500, `Erro ao criar marca: ${err.message}`);
    }
  }

  jsonError(res, 405, `Método ${req.method} não suportado`);
}
