import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';
import { createClient } from '@libsql/client/http';

export const config = {
  api: {
    bodyParser: false,
  },
};

async function getRawBody(req: any): Promise<Buffer> {
  if (Buffer.isBuffer(req.body)) return req.body;
  if (typeof req.body === 'string') return Buffer.from(req.body);
  if (req.body && typeof req.body === 'object') {
    return Buffer.from(JSON.stringify(req.body));
  }
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).send('Método não permitido');
  }

  const stripeKey = (process.env.STRIPE_SECRET_KEY || '').trim();
  const webhookSecret = (process.env.STRIPE_WEBHOOK_SECRET || '').trim();
  const sig = req.headers['stripe-signature'] as string;

  console.log('[Stripe Webhook] STRIPE_SECRET_KEY prefix:', stripeKey ? stripeKey.substring(0, 8) + '...' : 'UNDEFINED');
  console.log('[Stripe Webhook] STRIPE_WEBHOOK_SECRET prefix:', webhookSecret ? webhookSecret.substring(0, 8) + '...' : 'UNDEFINED');
  console.log('[Stripe Webhook] stripe-signature header present:', Boolean(sig));

  let event: Stripe.Event;

  try {
    const rawBody = await getRawBody(req);

    if (!stripeKey) {
      console.error('[Stripe Webhook] STRIPE_SECRET_KEY ausente.');
      return res.status(500).send('STRIPE_SECRET_KEY não configurada no Vercel.');
    }

    const stripe = new Stripe(stripeKey, { typescript: true });

    if (webhookSecret && sig) {
      event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
      console.log('[Stripe Webhook] Assinatura verificada com sucesso! Evento:', event.type);
    } else {
      // Se webhook secret ainda não estiver configurado
      console.warn('[Stripe Webhook] Atenção: A processar evento sem validação de assinatura (STRIPE_WEBHOOK_SECRET ou assinatura ausente)');
      event = JSON.parse(rawBody.toString('utf8')) as Stripe.Event;
    }
  } catch (err: any) {
    console.error(`[Stripe Webhook Signature Error]: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // ── Evento: Pagamento concluído com sucesso ─────────────────
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const orderId = session.metadata?.orderId;

    console.log(`[Stripe Webhook] checkout.session.completed para orderId: ${orderId}`);

    if (orderId) {
      const dbUrl = (process.env.TURSO_DATABASE_URL || '').trim();
      const dbToken = (process.env.TURSO_AUTH_TOKEN || '').trim();

      if (dbUrl && dbToken) {
        try {
          const db = createClient({ url: dbUrl, authToken: dbToken });

          // 1. Atualizar status da encomenda para 'Confirmada'
          await db.execute({
            sql: `UPDATE orders SET
              status = 'Confirmada',
              updated_at = datetime('now')
              WHERE id = ?`,
            args: [orderId],
          });

          console.log(`[Stripe Webhook] Encomenda ${orderId} atualizada para 'Confirmada' no Turso!`);

          // 2. Decrementar o stock
          const orderRes = await db.execute({
            sql: 'SELECT items FROM orders WHERE id = ?',
            args: [orderId],
          });

          if (orderRes.rows.length > 0) {
            const itemsStr = orderRes.rows[0].items as string;
            try {
              const items = JSON.parse(itemsStr);
              for (const item of items) {
                const prodRes = await db.execute({
                  sql: 'SELECT size_stock FROM products WHERE id = ?',
                  args: [item.productId],
                });

                if (prodRes.rows.length > 0) {
                  const stockMap = JSON.parse((prodRes.rows[0].size_stock as string) || '{}');
                  const sizeKey = String(item.size);
                  stockMap[sizeKey] = Math.max(0, (stockMap[sizeKey] ?? 2) - Number(item.quantity));
                  const totalStock = (Object.values(stockMap) as number[]).reduce((a, b) => Number(a) + Number(b), 0);

                  await db.execute({
                    sql: 'UPDATE products SET size_stock = ?, in_stock = ? WHERE id = ?',
                    args: [JSON.stringify(stockMap), totalStock > 0 ? 1 : 0, item.productId],
                  });
                  console.log(`[Stripe Webhook] Stock decrementado para produto ${item.productId}, tamanho ${sizeKey}`);
                }
              }
            } catch (stockErr: any) {
              console.warn('[Stripe Webhook] Erro ao calcular stock:', stockErr.message);
            }
          }
        } catch (dbErr: any) {
          console.error('[Stripe Webhook] Erro na BD Turso:', dbErr.message);
        }
      }
    }
  }

  return res.status(200).json({ received: true });
}
