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
  const secret = (process.env.JWT_SECRET || '').trim();
  if (!secret || secret.length < 32) {
    res.status(500).json({ error: 'Configuração de segurança JWT ausente no servidor' });
    return null;
  }
  try {
    return jwt.verify(token, secret, { algorithms: ['HS256'] });
  } catch {
    res.status(401).json({ error: 'Não autorizado — token inválido ou expirado' });
    return null;
  }
}

/** Validação estrita de magic bytes para garantir ficheiros de imagem genuínos */
function isValidImageBuffer(buf: Buffer): boolean {
  if (!buf || buf.length < 12) return false;
  // JPEG: FF D8 FF
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return true;
  // PNG: 89 50 4E 47
  if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) return true;
  // GIF: 47 49 46 38
  if (buf[0] === 0x47 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x38) return true;
  // WEBP: RIFF...WEBP
  if (buf.toString('ascii', 0, 4) === 'RIFF' && buf.toString('ascii', 8, 12) === 'WEBP') return true;
  return false;
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

  // Upload requer autenticação admin estrita
  const admin = requireAuth(req, res);
  if (!admin) return;

  try {
    const { image, folder } = req.body as { image?: string; folder?: string };

    if (!image) {
      return jsonError(res, 400, 'Campo "image" em falta — enviar base64 da imagem');
    }

    let base64Data = image;
    if (image.startsWith('data:')) {
      const match = image.match(/^data:image\/(png|jpeg|jpg|webp|gif);base64,/);
      if (!match) {
        return jsonError(res, 400, 'Formato MIME de imagem não suportado. Use JPEG, PNG, WEBP ou GIF.');
      }
      base64Data = image.split(',')[1];
    }

    const buffer = Buffer.from(base64Data, 'base64');

    if (buffer.length > 10 * 1024 * 1024) {
      return jsonError(res, 400, 'Imagem demasiado grande — máximo 10MB permitido');
    }

    if (!isValidImageBuffer(buffer)) {
      return jsonError(res, 400, 'Ficheiro inválido: o conteúdo não corresponde a uma imagem válida (JPEG/PNG/WEBP/GIF).');
    }

    // Sanitizar folder para evitar path traversal no Cloudinary
    const safeFolder = folder === 'kicksclub/categories' ? 'kicksclub/categories' : 'kicksclub/products';

    const uploadResult = await new Promise<{
      url: string;
      publicId: string;
      width: number;
      height: number;
      format: string;
    }>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: safeFolder,
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
