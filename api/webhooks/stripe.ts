import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getStripe } from '../../lib/stripe';
import { getDb } from '../../lib/db';

// Desabilita body parsing automático do Vercel se necessário
export const config = {
  api: {
    bodyParser: false,
  },
};

async function buffer(readable: any): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of readable) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Método não permitido');
  }

  const sig = req.headers['stripe-signature'] as string;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event: any;

  try {
    const buf = await buffer(req);
    const stripe = getStripe();

    if (webhookSecret && sig) {
      event = stripe.webhooks.constructEvent(buf, sig, webhookSecret);
    } else {
      // Se ainda não tiver webhook secret configurado em desenvolvimento
      event = JSON.parse(buf.toString('utf8'));
      console.warn('[Stripe Webhook] A processar evento sem verificação de assinatura (STRIPE_WEBHOOK_SECRET ausente)');
    }
  } catch (err: any) {
    console.error(`[Stripe Webhook Error]: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Processar evento de checkout concluído
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as any;
    const orderId = session.metadata?.orderId;

    if (orderId) {
      try {
        const db = getDb();

        // 1. Atualizar status da encomenda para 'Confirmada'
        await db.execute({
          sql: `UPDATE orders SET
            status = 'Confirmada',
            updated_at = datetime('now')
            WHERE id = ?`,
          args: [orderId],
        });

        console.log(`[Stripe Webhook] Encomenda ${orderId} confirmada com sucesso via Stripe!`);

        // 2. Decrementar stock dos artigos
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
              }
            }
          } catch (itemErr) {
            console.warn('[Stripe Webhook] Erro ao atualizar stock pós-pagamento:', itemErr);
          }
        }
      } catch (dbErr) {
        console.error('[Stripe Webhook] Erro ao atualizar BD:', dbErr);
      }
    }
  }

  return res.status(200).json({ received: true });
}
