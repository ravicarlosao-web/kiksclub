import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@libsql/client/http';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

function setCors(req: VercelRequest, res: VercelResponse): void {
  const origin = req.headers.origin || '*';
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

function jsonError(req: VercelRequest, res: VercelResponse, status: number, message: string): void {
  setCors(req, res);
  res.status(status).json({ error: message });
}

function getJwtSecret(): string {
  const secret = (process.env.JWT_SECRET || '').trim();
  if (!secret || secret.length < 32) {
    throw new Error('JWT_SECRET não configurado ou demasiado curto');
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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCors(req, res);

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

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

  const rawUrl = (process.env.TURSO_DATABASE_URL || '').trim();
  const url = rawUrl.replace(/^libsql:\/\//, 'https://');
  const authToken = (process.env.TURSO_AUTH_TOKEN || '').trim();

  if (!url || !authToken) {
    return jsonError(req, res, 500, 'Base de dados não configurada');
  }

  const db = createClient({ url, authToken });

  try {
    // Buscar o admin na BD
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

    // Gerar novo hash com bcrypt (12 rounds de salt)
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
    console.error('[POST /api/auth/change-password]', err);
    return jsonError(req, res, 500, `Erro ao atualizar a palavra-passe: ${err.message}`);
  }
}
