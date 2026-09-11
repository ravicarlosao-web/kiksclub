import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';
import { createClient } from '@libsql/client/http';
import { captureBackendException, captureSecurityEvent } from '../../lib/sentry';

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

  if (!stripeKey) {
    console.error('[Stripe Webhook] STRIPE_SECRET_KEY não configurada no servidor.');
    captureBackendException(new Error('STRIPE_SECRET_KEY não configurada no servidor'));
    return res.status(500).send('STRIPE_SECRET_KEY não configurada no servidor.');
  }

  // 1. Assinatura e Segredo OBRIGATÓRIOS (Prevenção de Falsificação de Eventos / Spoofing)
  if (!webhookSecret) {
    console.error('[Stripe Webhook] STRIPE_WEBHOOK_SECRET ausente. Não é seguro processar sem validação de assinatura.');
    captureBackendException(new Error('STRIPE_WEBHOOK_SECRET ausente no servidor'));
    return res.status(500).send('STRIPE_WEBHOOK_SECRET não configurada no servidor.');
  }

  if (!sig) {
    console.warn('[Stripe Webhook] Rejeitado: Cabeçalho stripe-signature ausente.');
    captureSecurityEvent('Webhook Stripe recebido sem cabeçalho stripe-signature');
    return res.status(400).send('Assinatura de webhook ausente.');
  }

  let event: Stripe.Event;

  try {
    const rawBody = await getRawBody(req);
    const stripe = new Stripe(stripeKey, { typescript: true });

    // Validação criptográfica rigorosa com tolerância padrão da Stripe
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
    console.log('[Stripe Webhook] Assinatura verificada com sucesso! Evento:', event.type);
  } catch (err: any) {
    console.error(`[Stripe Webhook Signature Error]: ${err.message}`);
    captureSecurityEvent('Falha de verificação da assinatura criptográfica Stripe', { error: err.message });
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // 2. Evento: Pagamento concluído com sucesso
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const orderId = session.metadata?.orderId;

    console.log(`[Stripe Webhook] checkout.session.completed para orderId: ${orderId}`);

    if (orderId) {
      const dbUrl = (process.env.TURSO_DATABASE_URL || '').trim().replace(/^libsql:\/\//, 'https://');
      const dbToken = (process.env.TURSO_AUTH_TOKEN || '').trim();

      if (dbUrl && dbToken) {
        try {
          const db = createClient({ url: dbUrl, authToken: dbToken });

          // 3. Verificação de Idempotência (Prevenção de Duplo Processamento / Replay)
          const checkRes = await db.execute({
            sql: 'SELECT status, items FROM orders WHERE id = ?',
            args: [orderId],
          });

          if (checkRes.rows.length === 0) {
            console.warn(`[Stripe Webhook] Encomenda ${orderId} não encontrada na BD.`);
            return res.status(200).json({ received: true, warning: 'Encomenda não encontrada' });
          }

          const currentStatus = String(checkRes.rows[0].status || '');
          if (currentStatus === 'Confirmada' || currentStatus === 'Pago' || currentStatus === 'Concluído') {
            console.log(`[Stripe Webhook] Idempotência: Encomenda ${orderId} já se encontra paga (${currentStatus}).`);
            return res.status(200).json({ received: true, already_processed: true });
          }

          // 4. Atualizar status da encomenda para 'Confirmada'
          await db.execute({
            sql: `UPDATE orders SET
              status = 'Confirmada',
              updated_at = datetime('now')
              WHERE id = ?`,
            args: [orderId],
          });

          console.log(`[Stripe Webhook] Encomenda ${orderId} atualizada para 'Confirmada' no Turso.`);

          // 5. Decrementar o stock com segurança
          const itemsStr = checkRes.rows[0].items as string;
          if (itemsStr) {
            try {
              const items = JSON.parse(itemsStr);
              for (const item of items) {
                const pId = item.productId || item.id;
                if (!pId) continue;

                const prodRes = await db.execute({
                  sql: 'SELECT size_stock FROM products WHERE id = ?',
                  args: [pId],
                });

                if (prodRes.rows.length > 0) {
                  const stockMap = JSON.parse((prodRes.rows[0].size_stock as string) || '{}');
                  const sizeKey = String(item.size);
                  const currentItemStock = Number(stockMap[sizeKey] ?? 0);
                  const qtyToDeduct = Number(item.quantity || 1);

                  stockMap[sizeKey] = Math.max(0, currentItemStock - qtyToDeduct);
                  const totalStock = (Object.values(stockMap) as number[]).reduce((a, b) => Number(a) + Number(b), 0);

                  await db.execute({
                    sql: 'UPDATE products SET size_stock = ?, in_stock = ? WHERE id = ?',
                    args: [JSON.stringify(stockMap), totalStock > 0 ? 1 : 0, pId],
                  });

                  console.log(`[Stripe Webhook] Stock decrementado para produto ${pId}, tamanho ${sizeKey}`);
                }
              }
            } catch (stockErr: any) {
              console.warn('[Stripe Webhook] Erro ao decrementar stock:', stockErr.message);
            }
          }
        } catch (dbErr: any) {
          console.error('[Stripe Webhook] Erro na BD Turso:', dbErr.message);
          captureBackendException(dbErr, { endpoint: '/api/webhooks/stripe', orderId });
          return res.status(500).json({ error: 'Erro de base de dados no webhook' });
        }
      }
    }
  }

  return res.status(200).json({ received: true });
}
