import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@libsql/client/http';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // 1. Proteção de Acesso: Exige header secreto x-debug-token
  const debugToken = (process.env.DEBUG_TOKEN || '').trim();
  const clientToken = (req.headers['x-debug-token'] as string || '').trim();

  // Se o token de debug não estiver configurado ou não coincidir, retorna 404
  // para ocultar totalmente a existência do endpoint de diagnóstico
  if (!debugToken || !clientToken || debugToken !== clientToken) {
    return res.status(404).end();
  }

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  const rawUrl = (process.env.TURSO_DATABASE_URL || '').trim();
  const url = rawUrl.replace(/^libsql:\/\//, 'https://');
  const token = (process.env.TURSO_AUTH_TOKEN || '').trim();

  let databaseConnected = false;
  let productsCount = 0;

  if (url && token) {
    try {
      const db = createClient({ url, authToken: token });
      const result = await db.execute('SELECT COUNT(*) as total FROM products');
      productsCount = Number(result.rows[0]?.total ?? 0);
      databaseConnected = true;
    } catch {
      databaseConnected = false;
    }
  }

  // Resposta higienizada — SEM prefixos de chaves, SEM versões de software, SEM dados sensíveis
  return res.status(200).json({
    status: 'online',
    timestamp: new Date().toISOString(),
    services: {
      database: databaseConnected ? 'connected' : 'disconnected',
      productsInCatalog: productsCount,
      stripeConfigured: Boolean(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_WEBHOOK_SECRET),
      cloudinaryConfigured: Boolean(process.env.CLOUDINARY_CLOUD_NAME),
      jwtConfigured: Boolean(process.env.JWT_SECRET && process.env.JWT_SECRET.length >= 32),
    },
  });
}
