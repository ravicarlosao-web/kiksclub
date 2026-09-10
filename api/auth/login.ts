import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb } from '../../lib/db.js';
import { signToken, comparePassword, extractToken } from '../../lib/auth.js';
import { handleOptions, jsonError } from '../../lib/apiHelpers.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleOptions(req, res)) return;

  if (req.method !== 'POST') {
    return jsonError(res, 405, 'Método não suportado');
  }

  const { email, password } = req.body || {};

  if (!email || !password) {
    return jsonError(res, 400, 'Email e password são obrigatórios');
  }

  try {
    const db = getDb();
    // Buscar utilizador admin na BD
    const result = await db.execute({
      sql: 'SELECT * FROM admin_users WHERE LOWER(email) = LOWER(?)',
      args: [email.trim()],
    });

    if (result.rows.length === 0) {
      // Mesmo que não encontre, responder com delay para evitar timing attacks
      await new Promise((r) => setTimeout(r, 400));
      return jsonError(res, 401, 'Credenciais inválidas');
    }

    const user = result.rows[0];
    const isValid = await comparePassword(password, user.password_hash as string);

    if (!isValid) {
      return jsonError(res, 401, 'Credenciais inválidas');
    }

    // Actualizar last_login
    await db.execute({
      sql: "UPDATE admin_users SET last_login = datetime('now') WHERE id = ?",
      args: [user.id as string],
    });

    // Assinar JWT
    const token = signToken({
      id: user.id as string,
      email: user.email as string,
      name: user.name as string,
      role: user.role as 'admin' | 'manager',
    });

    res.status(200).json({
      token,
      user: {
        email: user.email,
        name: user.name,
        role: user.role,
        lastLogin: new Date().toISOString(),
      },
    });
  } catch (err) {
    console.error('[POST /api/auth/login]', err);
    jsonError(res, 500, 'Erro no servidor de autenticação');
  }
}
