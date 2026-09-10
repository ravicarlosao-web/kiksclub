import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@libsql/client/web';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  const url = (process.env.TURSO_DATABASE_URL || '').trim();
  const token = (process.env.TURSO_AUTH_TOKEN || '').trim();
  const stripeKey = (process.env.STRIPE_SECRET_KEY || '').trim();
  const stripePub = (process.env.VITE_STRIPE_PUBLISHABLE_KEY || '').trim();
  const stripeWebhook = (process.env.STRIPE_WEBHOOK_SECRET || '').trim();

  const checks: Record<string, string> = {
    runtime: 'ok',
    timestamp: new Date().toISOString(),
    node: process.version,
    turso_url: url ? '✅ definida' : '❌ em falta',
    turso_token: token ? '✅ definida' : '❌ em falta',
    cloudinary: process.env.CLOUDINARY_CLOUD_NAME ? '✅ definida' : '❌ em falta',
    jwt_secret: process.env.JWT_SECRET ? '✅ definida' : '❌ em falta',
    stripe_secret_key: stripeKey ? `✅ definida (${stripeKey.substring(0, 8)}...)` : '❌ em falta',
    stripe_publishable_key: stripePub ? `✅ definida (${stripePub.substring(0, 8)}...)` : '❌ em falta',
    stripe_webhook_secret: stripeWebhook ? `✅ definida (${stripeWebhook.substring(0, 8)}...)` : '❌ em falta',
  };

  if (url && token) {
    try {
      const db = createClient({ url, authToken: token });
      const result = await db.execute('SELECT COUNT(*) as total FROM products');
      const total = result.rows[0]?.total ?? 0;
      checks.database = `✅ ligada — ${total} produtos`;
    } catch (err: any) {
      checks.database = `❌ erro: ${err.message}`;
    }
  } else {
    checks.database = '❌ credenciais em falta';
  }

  const allOk = !Object.values(checks).some((v) => String(v).startsWith('❌'));
  return res.status(200).json({
    status: allOk ? 'healthy' : 'degraded',
    checks,
  });
}
