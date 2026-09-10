import Stripe from 'stripe';

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    const key = (process.env.STRIPE_SECRET_KEY || '').trim();
    if (!key) {
      throw new Error('STRIPE_SECRET_KEY não está configurada nas variáveis de ambiente.');
    }
    _stripe = new Stripe(key, {
      typescript: true,
    });
  }
  return _stripe;
}
