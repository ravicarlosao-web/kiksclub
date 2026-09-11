import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';
import { createClient } from '@libsql/client';

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
    console.log('[Stripe Checkout] STRIPE_SECRET_KEY prefix:', rawKey ? rawKey.substring(0, 8) + '...' : 'UNDEFINED');

    if (!rawKey) {
      return res.status(500).json({
        error: 'STRIPE_SECRET_KEY não está configurada no Vercel. Adicione STRIPE_SECRET_KEY nas Environment Variables de Produção no Vercel.',
      });
    }

    const stripe = new Stripe(rawKey, {
      typescript: true,
    });

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
      subtotal,
      discount = 0,
      shipping = 0,
      total,
    } = req.body || {};

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'O carrinho está vazio.' });
    }

    if (!email || !customerName) {
      return res.status(400).json({ error: 'Nome e email são obrigatórios.' });
    }

    // 1. Gerar ID único da encomenda
    const orderId = `KC-${Math.floor(10000 + Math.random() * 90000)}PT`;

    // 2. Tentar guardar preliminarmente na BD Turso
    const dbUrl = (process.env.TURSO_DATABASE_URL || '').trim();
    const dbToken = (process.env.TURSO_AUTH_TOKEN || '').trim();
    if (dbUrl && dbToken) {
      try {
        const db = createClient({ url: dbUrl, authToken: dbToken });
        await db.execute({
          sql: `INSERT INTO orders
            (id, customer_name, phone, email, address, postal_code, city,
             notes, payment_method, items, subtotal, discount, shipping, total,
             status, tracking_code, created_at)
            VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,datetime('now'))`,
          args: [
            orderId,
            customerName,
            phone || '+351 900 000 000',
            email,
            address || 'Morada em Portugal',
            postalCode || '1000-001',
            city || 'Lisboa',
            notes ?? null,
            paymentMethod,
            JSON.stringify(items),
            subtotal ?? total,
            discount ?? 0,
            shipping ?? 0,
            total,
            'Aguardando Pagamento',
            orderId,
          ],
        });
      } catch (dbErr: any) {
        console.warn('[Stripe Checkout] Erro não-bloqueante na BD Turso:', dbErr.message);
      }
    }

    // 3. Preparar itens para o Stripe
    const line_items = items.map((item: any) => ({
      price_data: {
        currency: 'eur',
        product_data: {
          name: `${item.brand ? `${item.brand} ` : ''}${item.name} (Tam. ${item.size})`,
          images: item.image ? [item.image] : [],
        },
        unit_amount: Math.round(Number(item.price) * 100),
      },
      quantity: Number(item.quantity) || 1,
    }));

    const appUrl = (process.env.VITE_APP_URL || 'https://kiksclub.vercel.app').replace(/\/$/, '');

    // Métodos de pagamento suportados
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
      customer_email: email,
      line_items,
      metadata: {
        orderId,
        customerName,
        phone: phone || '',
        itemsCount: String(items.length),
      },
      success_url: `${appUrl}/?payment=success&orderId=${orderId}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/?payment=cancelled&orderId=${orderId}`,
    };

    let session: Stripe.Checkout.Session;
    try {
      session = await stripe.checkout.sessions.create(sessionParams);
    } catch (stripeErr: any) {
      console.warn('[Stripe Checkout] Tentativa com métodos específicos falhou, a tentar fallback para card:', stripeErr.message);
      // Se mbway ou multibanco não estiverem ativados na conta do Stripe, faz fallback para card
      session = await stripe.checkout.sessions.create({
        ...sessionParams,
        payment_method_types: ['card'],
      });
    }

    return res.status(200).json({
      url: session.url,
      orderId,
      sessionId: session.id,
    });
  } catch (err: any) {
    console.error('[Stripe Checkout Critical Error]:', err);
    return res.status(500).json({
      error: err.message || 'Erro ao processar sessão Stripe',
      details: String(err),
    });
  }
}
