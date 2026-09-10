import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getStripe } from '../../lib/stripe';
import { getDb } from '../../lib/db';
import { setCors, handleOptions, jsonError } from '../../lib/apiHelpers';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleOptions(req, res)) return;

  if (req.method !== 'POST') {
    return jsonError(res, 405, 'Método não suportado');
  }

  try {
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
      return jsonError(res, 400, 'O carrinho está vazio.');
    }

    if (!email || !customerName || !phone) {
      return jsonError(res, 400, 'Nome, email e telemóvel são obrigatórios.');
    }

    // 1. Gerar código único da encomenda KC-XXXXXPT
    const orderId = `KC-${Math.floor(10000 + Math.random() * 90000)}PT`;

    // 2. Guardar a encomenda no Turso DB com estado 'Aguardando Pagamento'
    try {
      const db = getDb();
      await db.execute({
        sql: `INSERT INTO orders
          (id, customer_name, phone, email, address, postal_code, city,
           notes, payment_method, items, subtotal, discount, shipping, total,
           status, tracking_code, created_at)
          VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,datetime('now'))`,
        args: [
          orderId,
          customerName,
          phone,
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
    } catch (dbErr) {
      console.warn('[Checkout] Erro ao gravar encomenda preliminar no Turso:', dbErr);
      // Não bloqueia o checkout se a base de dados tiver cold start
    }

    // 3. Preparar Stripe Checkout Session
    const stripe = getStripe();
    const appUrl = (process.env.VITE_APP_URL || 'https://kiksclub.vercel.app').replace(/\/$/, '');

    // Linhas de artigos para o Stripe
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

    // Métodos de pagamento suportados
    let payment_method_types: string[] = ['card', 'multibanco', 'mbway'];
    if (paymentMethod === 'card') {
      payment_method_types = ['card'];
    } else if (paymentMethod === 'mbway') {
      payment_method_types = ['mbway', 'card'];
    } else if (paymentMethod === 'multibanco') {
      payment_method_types = ['multibanco', 'card'];
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: payment_method_types as any,
      mode: 'payment',
      customer_email: email,
      line_items,
      metadata: {
        orderId,
        customerName,
        phone,
        itemsCount: String(items.length),
      },
      success_url: `${appUrl}/?payment=success&orderId=${orderId}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/?payment=cancelled&orderId=${orderId}`,
    });

    return res.status(200).json({
      url: session.url,
      orderId,
      sessionId: session.id,
    });
  } catch (err: any) {
    console.error('[Stripe Checkout Error]:', err);
    return jsonError(res, 500, err.message || 'Erro ao criar sessão de pagamento no Stripe');
  }
}
