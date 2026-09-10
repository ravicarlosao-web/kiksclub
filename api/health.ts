import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb } from '../lib/db.js';
import { setCors } from '../lib/apiHelpers.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCors(res);
  if (req.method === 'OPTIONS') { res.status(204).end(); return; }

  const checks: Record<string, string> = {
    runtime: 'ok',
    timestamp: new Date().toISOString(),
    node: process.version,
    turso_url: process.env.TURSO_DATABASE_URL ? '✅ definida' : '❌ em falta',
    turso_token: process.env.TURSO_AUTH_TOKEN ? '✅ definida' : '❌ em falta',
    cloudinary: process.env.CLOUDINARY_CLOUD_NAME ? '✅ definida' : '❌ em falta',
    jwt_secret: process.env.JWT_SECRET ? '✅ definida' : '❌ em falta',
  };

  // Testar ligação à BD
  try {
    const db = getDb();
    const result = await db.execute('SELECT COUNT(*) as total FROM products');
    const total = result.rows[0]?.total ?? 0;
    checks.database = `✅ ligada — ${total} produtos`;
  } catch (err: unknown) {
    checks.database = `❌ erro: ${err instanceof Error ? err.message : String(err)}`;
  }

  const allOk = !Object.values(checks).some((v) => String(v).startsWith('❌'));

  res.status(allOk ? 200 : 500).json({
    status: allOk ? 'healthy' : 'degraded',
    checks,
  });
}
