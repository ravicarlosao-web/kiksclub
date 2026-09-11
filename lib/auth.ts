import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

function getJwtSecret(): string {
  const secret = (process.env.JWT_SECRET || '').trim();
  if (!secret || secret.length < 32) {
    throw new Error('JWT_SECRET não está configurada ou é demasiado curta (mínimo 32 caracteres).');
  }
  return secret;
}

const JWT_EXPIRES_IN = '7d';

export interface JwtPayload {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'manager';
}

/** Assina um JWT com o payload dado usando HS256 estrito */
export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, getJwtSecret(), { algorithm: 'HS256', expiresIn: JWT_EXPIRES_IN });
}

/** Verifica e decodifica um JWT usando HS256 estrito. Lança erro se inválido/expirado. */
export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, getJwtSecret(), { algorithms: ['HS256'] }) as JwtPayload;
}

/** Gera um hash bcrypt da password (salt rounds = 12) */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

/** Compara uma password em texto plano com um hash bcrypt */
export async function comparePassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

/** Extrai o JWT do header Authorization: Bearer <token> */
export function extractToken(authHeader?: string): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  return authHeader.slice(7).trim();
}
