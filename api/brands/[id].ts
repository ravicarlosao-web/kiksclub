import type { VercelRequest, VercelResponse } from '@vercel/node';
import brandCollectionHandler from './index';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Garantir que req.query.id é preenchido a partir da rota dinâmica [id]
  return brandCollectionHandler(req, res);
}
