/**
 * Módulo de monitorização Sentry para Serverless Functions da Vercel.
 * Implementação leve e resiliente via Sentry Store HTTP API (sem dependências pesadas
 * que causem falhas de inicialização ou conflitos de OpenTelemetry no runtime serverless).
 */

function parseDsn(dsn: string): { key: string; host: string; projectId: string } | null {
  try {
    const url = new URL(dsn.trim());
    const key = url.username;
    const host = url.host;
    const projectId = url.pathname.replace(/^\//, '');
    if (!key || !host || !projectId) return null;
    return { key, host, projectId };
  } catch {
    return null;
  }
}

function sanitizeData(data: any): any {
  if (!data) return data;
  try {
    const copy = JSON.parse(JSON.stringify(data));
    const redactKeys = ['password', 'password_hash', 'secret', 'authorization', 'token'];
    const traverse = (obj: any) => {
      if (typeof obj !== 'object' || obj === null) return;
      for (const k of Object.keys(obj)) {
        if (redactKeys.some(rk => k.toLowerCase().includes(rk))) {
          obj[k] = '[REDACTED]';
        } else if (typeof obj[k] === 'object') {
          traverse(obj[k]);
        }
      }
    };
    traverse(copy);
    return copy;
  } catch {
    return '[UNABLE_TO_SANITIZE]';
  }
}

async function sendSentryEvent(event: {
  level: 'error' | 'warning' | 'info';
  message: string;
  error?: unknown;
  extra?: Record<string, any>;
}) {
  const dsn = (process.env.SENTRY_DSN || '').trim();
  if (!dsn) return;

  const parsed = parseDsn(dsn);
  if (!parsed) return;

  const eventId = Math.random().toString(36).substring(2, 18) + Math.random().toString(36).substring(2, 18);
  const endpoint = `https://${parsed.host}/api/${parsed.projectId}/store/`;

  const payload: Record<string, any> = {
    event_id: eventId,
    timestamp: new Date().toISOString().replace('Z', ''),
    platform: 'node',
    level: event.level,
    message: event.message,
    environment: process.env.VERCEL_ENV || process.env.NODE_ENV || 'production',
    server_name: 'vercel-serverless',
    extra: sanitizeData(event.extra || {}),
  };

  if (event.error instanceof Error) {
    payload.exception = {
      values: [
        {
          type: event.error.name || 'Error',
          value: event.error.message,
          stacktrace: event.error.stack
            ? {
                frames: event.error.stack
                  .split('\n')
                  .slice(1)
                  .map(line => ({ filename: line.trim() })),
              }
            : undefined,
        },
      ],
    };
  }

  try {
    await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Sentry-Auth': `Sentry sentry_version=7, sentry_client=kicksclub-serverless/1.0, sentry_key=${parsed.key}`,
      },
      body: JSON.stringify(payload),
    });
  } catch (sendErr) {
    // Nunca interrompe o funcionamento da aplicação se o envio falhar
    console.warn('[Sentry HTTP send warning]:', sendErr);
  }
}

/** Captura exceções não tratadas ou erros críticos no backend */
export function captureBackendException(error: unknown, context?: Record<string, any>) {
  console.error('[Backend Error]', error, context);
  sendSentryEvent({
    level: 'error',
    message: error instanceof Error ? error.message : String(error),
    error,
    extra: context,
  }).catch(() => {});
}

/** Captura eventos de segurança (ex: falhas de login, assinaturas inválidas) sem logar passwords */
export function captureSecurityEvent(message: string, context?: Record<string, any>) {
  console.warn('[Security Event]', message, context);
  sendSentryEvent({
    level: 'warning',
    message,
    extra: context,
  }).catch(() => {});
}
