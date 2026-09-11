import type { VercelRequest, VercelResponse } from '@vercel/node';
import { v2 as cloudinary } from 'cloudinary';
import jwt from 'jsonwebtoken';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

function setCors(res: VercelResponse): void {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
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

function requireAuth(req: VercelRequest, res: VercelResponse) {
  setCors(res);
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Não autorizado — token em falta' });
    return null;
  }
  const token = authHeader.slice(7).trim();
  try {
    const secret = process.env.JWT_SECRET || 'fallback-dev-secret-change-in-production!';
    return jwt.verify(token, secret);
  } catch {
    res.status(401).json({ error: 'Não autorizado — token inválido ou expirado' });
    return null;
  }
}

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

    let base64Data = image;
    if (image.startsWith('data:')) {
      base64Data = image.split(',')[1];
    }

    const buffer = Buffer.from(base64Data, 'base64');

    if (buffer.length > 10 * 1024 * 1024) {
      return jsonError(res, 400, 'Imagem demasiado grande — máximo 10MB');
    }

    const uploadResult = await new Promise<{
      url: string;
      publicId: string;
      width: number;
      height: number;
      format: string;
    }>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: folder || 'kicksclub/products',
          resource_type: 'image',
          transformation: [
            { width: 1200, height: 1200, crop: 'limit' },
            { quality: 'auto:good' },
            { fetch_format: 'auto' },
          ],
          overwrite: false,
          unique_filename: true,
        },
        (error, result) => {
          if (error || !result) {
            reject(error || new Error('Upload falhou sem resultado'));
          } else {
            resolve({
              url: result.secure_url,
              publicId: result.public_id,
              width: result.width,
              height: result.height,
              format: result.format,
            });
          }
        }
      );
      uploadStream.end(buffer);
    });

    setCors(res);
    res.status(200).json(uploadResult);
  } catch (err: any) {
    console.error('[POST /api/upload]', err);
    jsonError(res, 500, `Erro ao fazer upload da imagem: ${err.message}`);
  }
}
