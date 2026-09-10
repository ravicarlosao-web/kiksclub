import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  const stripeKey = process.env.STRIPE_SECRET_KEY || '';
  const stripePub = process.env.VITE_STRIPE_PUBLISHABLE_KEY || process.env.STRIPE_PUBLISHABLE_KEY || '';
  const stripeWebhook = process.env.STRIPE_WEBHOOK_SECRET || '';
  const tursoUrl = process.env.TURSO_DATABASE_URL || '';
  const tursoToken = process.env.TURSO_AUTH_TOKEN || '';

  res.status(200).json({
    status: 'ok',
    message: 'pong',
    timestamp: new Date().toISOString(),
    node: process.version,
    all_env_names: Object.keys(process.env).filter(
      k => !k.startsWith('npm_') && !k.startsWith('VERCEL_') && !k.startsWith('_')
    ),
    turso_inspection: {
      url_length: tursoUrl.length,
      url_prefix: tursoUrl.substring(0, 15),
      url_suffix: tursoUrl.slice(-10),
      has_quotes: tursoUrl.startsWith('"') || tursoUrl.endsWith('"') || tursoUrl.startsWith("'"),
      token_length: tursoToken.length,
      token_prefix: tursoToken.substring(0, 15),
      token_has_quotes: tursoToken.startsWith('"') || tursoToken.endsWith('"'),
    },
    stripe_diagnosis: {
      secret_key_present: Boolean(stripeKey),
      secret_key_prefix: stripeKey ? stripeKey.substring(0, 8) + '...' : 'MISSING',
      secret_key_mode: stripeKey.startsWith('sk_test_') ? 'test' : (stripeKey.startsWith('sk_live_') || stripeKey.startsWith('rk_live_')) ? 'live' : 'unknown',
      is_restricted_key: stripeKey.startsWith('rk_'),
      publishable_key_present: Boolean(stripePub),
      publishable_key_prefix: stripePub ? stripePub.substring(0, 8) + '...' : 'MISSING',
      publishable_key_mode: stripePub.startsWith('pk_test_') ? 'test' : stripePub.startsWith('pk_live_') ? 'live' : 'unknown',
      publishable_key_name_in_env: process.env.VITE_STRIPE_PUBLISHABLE_KEY ? 'VITE_STRIPE_PUBLISHABLE_KEY' : (process.env.STRIPE_PUBLISHABLE_KEY ? 'STRIPE_PUBLISHABLE_KEY (Attention: Needs VITE_ prefix to be read in browser)' : 'NOT_SET'),
      webhook_secret_present: Boolean(stripeWebhook),
      webhook_secret_prefix: stripeWebhook ? stripeWebhook.substring(0, 8) + '...' : 'MISSING',
      keys_match_mode: (
        ((stripeKey.startsWith('sk_test_') || stripeKey.startsWith('rk_test_')) && stripePub.startsWith('pk_test_')) ||
        ((stripeKey.startsWith('sk_live_') || stripeKey.startsWith('rk_live_')) && stripePub.startsWith('pk_live_'))
      ) ? 'CONSISTENT ✅' : 'INCONSISTENT ❌ (mismatch between test and live)',
    },
  });
}
