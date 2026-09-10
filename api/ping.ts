import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.status(200).json({
    status: 'ok',
    message: 'pong',
    timestamp: new Date().toISOString(),
    node: process.version,
    env_keys: Object.keys(process.env).filter(k => k.startsWith('TURSO') || k.startsWith('CLOUDINARY') || k.startsWith('JWT')),
  });
}
