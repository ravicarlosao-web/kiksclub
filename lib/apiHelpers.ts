import type { VercelRequest, VercelResponse } from '@vercel/node';
import { verifyToken, extractToken, type JwtPayload } from './auth';

/** Define os headers CORS na resposta */
export function setCors(res: VercelResponse): void {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

/**
 * Trata CORS preflight. Retorna `true` se a request foi um OPTIONS e já foi respondida.
 * Usar no início de cada handler:
 *   if (handleOptions(req, res)) return;
 */
export function handleOptions(req: VercelRequest, res: VercelResponse): boolean {
  setCors(res);
  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return true;
  }
  return false;
}

/**
 * Middleware de autenticação JWT.
 * Retorna o payload do token se válido, ou escreve 401 e retorna null.
 */
export function requireAuth(req: VercelRequest, res: VercelResponse): JwtPayload | null {
  setCors(res);
  const token = extractToken(req.headers.authorization as string | undefined);

  if (!token) {
    res.status(401).json({ error: 'Não autorizado — token em falta' });
    return null;
  }

  try {
    return verifyToken(token);
  } catch {
    res.status(401).json({ error: 'Não autorizado — token inválido ou expirado' });
    return null;
  }
}

/** Responde com um erro JSON padronizado */
export function jsonError(res: VercelResponse, status: number, message: string): void {
  res.status(status).json({ error: message });
}

/** Converte uma row da BD (snake_case, JSON strings) para Sneaker (camelCase, objectos) */
export function rowToProduct(row: Record<string, unknown>) {
  return {
    id: row.id as string,
    name: row.name as string,
    brand: row.brand as string,
    category: row.category as string,
    department: row.department as string | undefined,
    subcategory: row.subcategory as string | undefined,
    price: row.price as number,
    originalPrice: row.original_price as number,
    discountPercentage: row.discount_percentage as number,
    image: row.image as string,
    gallery: safeJson(row.gallery as string, []),
    sizes: safeJson(row.sizes as string, []),
    sizeStock: safeJson(row.size_stock as string, {}),
    sizeType: row.size_type as string | undefined,
    inStock: Boolean(row.in_stock),
    featured: Boolean(row.featured),
    tag: row.tag as string | undefined,
    description: row.description as string,
    details: safeJson(row.details as string, []),
  };
}

/** Converte uma row da BD para StoreCategory */
export function rowToCategory(row: Record<string, unknown>) {
  return {
    id: row.id as string,
    name: row.name as string,
    slug: row.slug as string,
    description: row.description as string,
    icon: row.icon as string,
    subcategories: safeJson(row.subcategories as string, []),
    bannerImage: row.banner_image as string | undefined,
    bannerTag: row.banner_tag as string | undefined,
    featured: Boolean(row.featured),
    isActive: Boolean(row.is_active),
    sortOrder: row.sort_order as number,
  };
}

/** Converte uma row da BD para Order */
export function rowToOrder(row: Record<string, unknown>) {
  return {
    id: row.id as string,
    customerName: row.customer_name as string,
    phone: row.phone as string,
    email: row.email as string,
    address: row.address as string,
    postalCode: row.postal_code as string,
    city: row.city as string,
    notes: row.notes as string | undefined,
    paymentMethod: row.payment_method as string,
    items: safeJson(row.items as string, []),
    subtotal: row.subtotal as number,
    discount: row.discount as number,
    shipping: row.shipping as number,
    total: row.total as number,
    status: row.status as string,
    trackingCode: row.tracking_code as string,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string | undefined,
  };
}

function safeJson<T>(str: string | null | undefined, fallback: T): T {
  if (!str) return fallback;
  try {
    return JSON.parse(str) as T;
  } catch {
    return fallback;
  }
}
