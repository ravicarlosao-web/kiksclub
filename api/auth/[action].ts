import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@libsql/client/http';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

function setCors(req: VercelRequest, res: VercelResponse): void {
  const origin = req.headers.origin || '*';
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

function jsonError(req: VercelRequest, res: VercelResponse, status: number, message: string): void {
  setCors(req, res);
  res.status(status).json({ error: message });
}

function getJwtSecret(): string {
  const secret = (process.env.JWT_SECRET || '').trim();
  if (!secret || secret.length < 32) {
    throw new Error('Configuração de segurança JWT ausente ou insuficiente no servidor');
  }
  return secret;
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

function getDb() {
  const rawUrl = (process.env.TURSO_DATABASE_URL || '').trim();
  const url = rawUrl.replace(/^libsql:\/\//, 'https://');
  const authToken = (process.env.TURSO_AUTH_TOKEN || '').trim();
  if (!url || !authToken) {
    throw new Error('Base de dados Turso não configurada no servidor');
  }
  return createClient({ url, authToken });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCors(req, res);

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  // Identificar ação solicitada
  let action = (typeof req.query.action === 'string' ? req.query.action : '').toLowerCase();
  if (!action) {
    const parts = (req.url || '').split('?')[0].split('/');
    action = parts[parts.length - 1]?.toLowerCase() || '';
  }

  // 1. LOGOUT: /api/auth/logout
  if (action === 'logout') {
    res.setHeader(
      'Set-Cookie',
      'kicksclub_admin_token=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT'
    );
    return res.status(200).json({ success: true, message: 'Sessão terminada com sucesso' });
  }

  // 2. CHANGE PASSWORD: /api/auth/change-password
  if (action === 'change-password') {
    if (req.method !== 'POST') {
      return jsonError(req, res, 405, 'Método não permitido');
    }

    const token = extractToken(req);
    if (!token) {
      return jsonError(req, res, 401, 'Não autorizado — sessão expirada ou em falta');
    }

    let adminUser: { id: string; email: string; name: string };
    try {
      adminUser = jwt.verify(token, getJwtSecret(), { algorithms: ['HS256'] }) as any;
    } catch {
      return jsonError(req, res, 401, 'Sessão inválida ou expirada. Por favor faça login novamente.');
    }

    const { currentPassword, newPassword } = req.body || {};

    if (!currentPassword || typeof currentPassword !== 'string') {
      return jsonError(req, res, 400, 'Por favor introduza a sua palavra-passe atual');
    }

    if (!newPassword || typeof newPassword !== 'string' || newPassword.length < 8) {
      return jsonError(req, res, 400, 'A nova palavra-passe deve ter pelo menos 8 caracteres');
    }

    try {
      const db = getDb();
      const result = await db.execute({
        sql: 'SELECT * FROM admin_users WHERE id = ? OR LOWER(email) = LOWER(?) LIMIT 1',
        args: [adminUser.id, adminUser.email],
      });

      if (result.rows.length === 0) {
        return jsonError(req, res, 404, 'Utilizador administrador não encontrado na base de dados');
      }

      const userRow = result.rows[0];
      const passwordHash = userRow.password_hash as string;

      const isMatch = await bcrypt.compare(currentPassword, passwordHash);
      if (!isMatch) {
        return jsonError(req, res, 400, 'A palavra-passe atual está incorreta');
      }

      const newHash = await bcrypt.hash(newPassword, 12);

      await db.execute({
        sql: 'UPDATE admin_users SET password_hash = ? WHERE id = ?',
        args: [newHash, userRow.id as string],
      });

      return res.status(200).json({
        success: true,
        message: 'Palavra-passe de administrador atualizada com sucesso!',
      });
    } catch (err: any) {
      console.error('[Change Password Error]', err);
      return jsonError(req, res, 500, `Erro ao atualizar a palavra-passe: ${err.message}`);
    }
  }

  // 3. LOGIN: /api/auth/login
  if (action === 'login' || !action) {
    if (req.method !== 'POST') {
      return jsonError(req, res, 405, 'Método não permitido');
    }

    const { email, password } = req.body || {};

    if (!email || !password) {
      return jsonError(req, res, 400, 'Email e password são obrigatórios');
    }

    try {
      const db = getDb();
      const result = await db.execute({
        sql: 'SELECT * FROM admin_users WHERE LOWER(email) = LOWER(?)',
        args: [String(email).trim().toLowerCase()],
      });

      if (result.rows.length === 0) {
        await new Promise((r) => setTimeout(r, 400));
        return jsonError(req, res, 401, 'Credenciais inválidas');
      }

      const user = result.rows[0];
      const isValid = await bcrypt.compare(String(password), user.password_hash as string);

      if (!isValid) {
        return jsonError(req, res, 401, 'Credenciais inválidas');
      }

      await db.execute({
        sql: "UPDATE admin_users SET last_login = datetime('now') WHERE id = ?",
        args: [user.id as string],
      });

      const token = jwt.sign(
        {
          id: user.id as string,
          email: user.email as string,
          name: user.name as string,
          role: (user.role as string) || 'admin',
        },
        getJwtSecret(),
        { algorithm: 'HS256', expiresIn: '7d' }
      );

      res.setHeader(
        'Set-Cookie',
        `kicksclub_admin_token=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=604800`
      );

      return res.status(200).json({
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      });
    } catch (err: any) {
      console.error('[Login Error]', err);
      return jsonError(req, res, 500, `Erro no servidor de autenticação: ${err.message}`);
    }
  }

  return jsonError(req, res, 404, 'Endpoint de autenticação não encontrado');
}
