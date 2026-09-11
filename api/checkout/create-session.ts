import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';
import { createClient } from '@libsql/client/http';
import crypto from 'node:crypto';

function setCors(res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCors(res);
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const rawKey = (process.env.STRIPE_SECRET_KEY || '').trim();
    if (!rawKey) {
      return res.status(500).json({
        error: 'STRIPE_SECRET_KEY não está configurada no servidor.',
      });
    }

    const dbUrl = (process.env.TURSO_DATABASE_URL || '').trim().replace(/^libsql:\/\//, 'https://');
    const dbToken = (process.env.TURSO_AUTH_TOKEN || '').trim();
    if (!dbUrl || !dbToken) {
      return res.status(500).json({
        error: 'Base de dados não está configurada no servidor.',
      });
    }

    const db = createClient({ url: dbUrl, authToken: dbToken });
    const stripe = new Stripe(rawKey, { typescript: true });

    const {
      customerName,
      email,
      phone,
      address,
      postalCode,
      city,
      notes,
      paymentMethod = 'card',
      items,
    } = req.body || {};

    // 1. Validação estrita de inputs
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'O carrinho está vazio.' });
    }

    if (items.length > 50) {
      return res.status(400).json({ error: 'Demasiados itens no carrinho (máximo 50).' });
    }

    const cleanName = String(customerName || '').trim();
    const cleanEmail = String(email || '').trim().toLowerCase();
    const cleanPhone = String(phone || '').trim();
    const cleanAddress = String(address || '').trim();
    const cleanPostal = String(postalCode || '').trim();
    const cleanCity = String(city || '').trim();

    if (!cleanName || cleanName.length < 2 || cleanName.length > 120) {
      return res.status(400).json({ error: 'Nome do cliente inválido (2-120 caracteres).' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!cleanEmail || !emailRegex.test(cleanEmail) || cleanEmail.length > 150) {
      return res.status(400).json({ error: 'Endereço de e-mail inválido.' });
    }

    // 2. Validação e cálculo seguro de preços no backend a partir da BD Turso (Anti-Tampering)
    const verifiedItems: Array<{
      productId: string;
      name: string;
      brand: string;
      image: string;
      size: string;
      quantity: number;
      price: number;
    }> = [];

    let calculatedSubtotal = 0;

    for (const rawItem of items) {
      const pId = String(rawItem.productId || rawItem.id || '').trim();
      const rawQty = Number(rawItem.quantity);
      const sizeStr = String(rawItem.size || 'Único').trim();

      if (!pId) {
        return res.status(400).json({ error: 'Identificador de produto em falta no item.' });
      }

      if (!Number.isInteger(rawQty) || rawQty < 1 || rawQty > 10) {
        return res.status(400).json({ error: `Quantidade inválida para o produto (${rawQty}). Permitido: 1 a 10.` });
      }

      // Consulta oficial à base de dados para garantir preço e stock genuínos
      const prodRes = await db.execute({
        sql: 'SELECT id, name, brand, price, image, in_stock, size_stock FROM products WHERE id = ?',
        args: [pId],
      });

      if (prodRes.rows.length === 0) {
        return res.status(400).json({ error: `Produto não encontrado no catálogo: ${pId}` });
      }

      const prod = prodRes.rows[0];
      if (!prod.in_stock) {
        return res.status(400).json({ error: `O produto "${prod.name}" encontra-se esgotado.` });
      }

      const verifiedPrice = Number(prod.price);
      if (isNaN(verifiedPrice) || verifiedPrice <= 0) {
        return res.status(400).json({ error: `Preço inválido na base de dados para ${prod.name}` });
      }

      // Validar stock específico do tamanho
      try {
        const stockMap = JSON.parse((prod.size_stock as string) || '{}');
        if (stockMap[sizeStr] !== undefined && Number(stockMap[sizeStr]) < rawQty) {
          return res.status(400).json({
            error: `Stock insuficiente para o tamanho ${sizeStr} de "${prod.name}" (disponível: ${stockMap[sizeStr]}).`,
          });
        }
      } catch {
        // parsing não bloqueante
      }

      verifiedItems.push({
        productId: String(prod.id),
        name: String(prod.name),
        brand: String(prod.brand || ''),
        image: String(prod.image || ''),
        size: sizeStr,
        quantity: rawQty,
        price: verifiedPrice,
      });

      calculatedSubtotal += verifiedPrice * rawQty;
    }

    const calculatedShipping = 0; // Envio gratuito nacional
    const calculatedTotal = calculatedSubtotal + calculatedShipping;

    // 3. Gerar ID de encomenda criptograficamente imprevisível (Anti-Enumeração / Anti-IDOR)
    const randomSuffix = crypto.randomBytes(4).toString('hex').toUpperCase();
    const orderId = `KC-${Date.now().toString(36).toUpperCase()}-${randomSuffix}`;

    // 4. Guardar preliminarmente na BD Turso com estado 'Aguardando Pagamento'
    await db.execute({
      sql: `INSERT INTO orders
        (id, customer_name, phone, email, address, postal_code, city,
         notes, payment_method, items, subtotal, discount, shipping, total,
         status, tracking_code, created_at)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,datetime('now'))`,
      args: [
        orderId,
        cleanName,
        cleanPhone || '+351 900 000 000',
        cleanEmail,
        cleanAddress || 'Morada a confirmar',
        cleanPostal || '1000-001',
        cleanCity || 'Portugal',
        notes ? String(notes).slice(0, 500) : null,
        paymentMethod,
        JSON.stringify(verifiedItems),
        calculatedSubtotal,
        0,
        calculatedShipping,
        calculatedTotal,
        'Aguardando Pagamento',
        orderId,
      ],
    });

    // 5. Preparar line_items para o Stripe com preços validados pelo servidor
    const line_items = verifiedItems.map((item) => ({
      price_data: {
        currency: 'eur',
        product_data: {
          name: `${item.brand ? `${item.brand} ` : ''}${item.name} (Tam. ${item.size})`,
          images: item.image ? [item.image] : [],
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    }));

    const appUrl = (process.env.VITE_APP_URL || 'https://www.kicksclub.pt').replace(/\/$/, '');

    let preferredMethods: string[] = ['card'];
    if (paymentMethod === 'mbway') {
      preferredMethods = ['mbway', 'card'];
    } else if (paymentMethod === 'multibanco') {
      preferredMethods = ['multibanco', 'card'];
    } else {
      preferredMethods = ['card'];
    }

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      payment_method_types: preferredMethods as any,
      mode: 'payment',
      customer_email: cleanEmail,
      line_items,
      metadata: {
        orderId,
        customerName: cleanName,
        phone: cleanPhone || '',
        itemsCount: String(verifiedItems.length),
      },
      success_url: `${appUrl}/?payment=success&orderId=${orderId}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/?payment=cancelled&orderId=${orderId}`,
    };

    let session: Stripe.Checkout.Session;
    try {
      session = await stripe.checkout.sessions.create(sessionParams);
    } catch (stripeErr: any) {
      console.warn('[Stripe Checkout] Tentativa com métodos alternativos falhou, fallback para card:', stripeErr.message);
      session = await stripe.checkout.sessions.create({
        ...sessionParams,
        payment_method_types: ['card'],
      });
    }

    return res.status(200).json({
      url: session.url,
      orderId,
      sessionId: session.id,
      total: calculatedTotal,
    });
  } catch (err: any) {
    console.error('[Stripe Checkout Error]:', err);
    return res.status(500).json({
      error: 'Erro ao processar sessão de pagamento',
      details: err.message,
    });
  }
}
