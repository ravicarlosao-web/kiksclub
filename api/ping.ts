import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  const stripeKey = process.env.STRIPE_SECRET_KEY || '';
  const stripePub = process.env.VITE_STRIPE_PUBLISHABLE_KEY || '';
  const stripeWebhook = process.env.STRIPE_WEBHOOK_SECRET || '';

  res.status(200).json({
    status: 'ok',
    message: 'pong',
    timestamp: new Date().toISOString(),
    node: process.version,
    all_env_names: Object.keys(process.env).filter(
      k => !k.startsWith('npm_') && !k.startsWith('VERCEL_') && !k.startsWith('_')
    ),
    stripe_diagnosis: {
      secret_key_present: Boolean(stripeKey),
      secret_key_prefix: stripeKey ? stripeKey.substring(0, 8) + '...' : 'MISSING',
      secret_key_mode: stripeKey.startsWith('sk_test_') ? 'test' : stripeKey.startsWith('sk_live_') ? 'live' : 'unknown',
      publishable_key_present: Boolean(stripePub),
      publishable_key_prefix: stripePub ? stripePub.substring(0, 8) + '...' : 'MISSING',
      publishable_key_mode: stripePub.startsWith('pk_test_') ? 'test' : stripePub.startsWith('pk_live_') ? 'live' : 'unknown',
      webhook_secret_present: Boolean(stripeWebhook),
      webhook_secret_prefix: stripeWebhook ? stripeWebhook.substring(0, 8) + '...' : 'MISSING',
      keys_match_mode: (
        (stripeKey.startsWith('sk_test_') && stripePub.startsWith('pk_test_')) ||
        (stripeKey.startsWith('sk_live_') && stripePub.startsWith('pk_live_'))
      ) ? 'CONSISTENT ✅' : 'INCONSISTENT ❌ (mismatch between test and live)',
    },
  });
}
