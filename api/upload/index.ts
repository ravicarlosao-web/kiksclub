import type { VercelRequest, VercelResponse } from '@vercel/node';
import { uploadImage } from '../../lib/cloudinary.js';
import { requireAuth, jsonError, handleOptions } from '../../lib/apiHelpers.js';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleOptions(req, res)) return;

  if (req.method !== 'POST') {
    return jsonError(res, 405, 'Método não suportado');
  }

  // Upload requer autenticação admin
  const admin = requireAuth(req, res);
  if (!admin) return;

  try {
    const { image, folder } = req.body as { image?: string; folder?: string };

    if (!image) {
      return jsonError(res, 400, 'Campo "image" em falta — enviar base64 da imagem');
    }

    // Suporta Data URL (data:image/jpeg;base64,...) ou base64 puro
    let base64Data = image;
    if (image.startsWith('data:')) {
      base64Data = image.split(',')[1];
    }

    const buffer = Buffer.from(base64Data, 'base64');

    if (buffer.length > 10 * 1024 * 1024) {
      return jsonError(res, 400, 'Imagem demasiado grande — máximo 10MB');
    }

    const result = await uploadImage(buffer, folder || 'kicksclub/products');

    res.status(200).json({
      url: result.url,
      publicId: result.publicId,
      width: result.width,
      height: result.height,
      format: result.format,
    });
  } catch (err) {
    console.error('[POST /api/upload]', err);
    jsonError(res, 500, 'Erro ao fazer upload da imagem para o Cloudinary');
  }
}
