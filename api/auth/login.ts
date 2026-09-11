import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@libsql/client/http';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
function getJwtSecret(): string {
  const secret = (process.env.JWT_SECRET || '').trim();
  if (!secret || secret.length < 32) {
    throw new Error('JWT_SECRET não está configurada ou é insegura (mínimo 32 caracteres).');
  }
  return secret;
}
function setCors(res: VercelResponse): void {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

function handleOptions(req: VercelRequest, res: VercelResponse): boolean {
  setCors(res);
  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return true;
  }
  return false;
}

function jsonError(res: VercelResponse, status: number, message: string): void {
  setCors(res);
  res.status(status).json({ error: message });
}

function getDb() {
  const rawUrl = (process.env.TURSO_DATABASE_URL || '').trim();
  const url = rawUrl.replace(/^libsql:\/\//, 'https://');
  const authToken = (process.env.TURSO_AUTH_TOKEN || '').trim();
  return createClient({ url, authToken });
}

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
      args: [String(email).trim()],
    });

    if (result.rows.length === 0) {
      await new Promise((r) => setTimeout(r, 400));
      return jsonError(res, 401, 'Credenciais inválidas');
    }

    const user = result.rows[0];
    const isValid = await bcrypt.compare(String(password), user.password_hash as string);

    if (!isValid) {
      return jsonError(res, 401, 'Credenciais inválidas');
    }

    // Actualizar last_login
    await db.execute({
      sql: "UPDATE admin_users SET last_login = datetime('now') WHERE id = ?",
      args: [user.id as string],
    });

    // Assinar JWT com HS256 estrito
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

    setCors(res);
    res.status(200).json({
      token,
      user: {
        email: user.email,
        name: user.name,
        role: user.role,
        lastLogin: new Date().toISOString(),
      },
    });
  } catch (err: any) {
    console.error('[POST /api/auth/login]', err);
    jsonError(res, 500, `Erro no servidor de autenticação: ${err.message}`);
  }
}
