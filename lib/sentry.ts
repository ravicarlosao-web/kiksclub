import * as Sentry from '@sentry/node';

let isInitialized = false;

export function initBackendSentry() {
  if (isInitialized) return Sentry;
  const dsn = (process.env.SENTRY_DSN || '').trim();
  if (dsn) {
    Sentry.init({
      dsn,
      tracesSampleRate: 0.1,
      environment: process.env.VERCEL_ENV || process.env.NODE_ENV || 'production',
      beforeSend(event) {
        // Garantir que passwords nunca são logadas no Sentry
        if (event.request?.data) {
          try {
            if (typeof event.request.data === 'string') {
              const parsed = JSON.parse(event.request.data);
              if (parsed.password) parsed.password = '[REDACTED]';
              event.request.data = JSON.stringify(parsed);
            } else if (typeof event.request.data === 'object' && event.request.data !== null) {
              if ('password' in event.request.data) {
                (event.request.data as any).password = '[REDACTED]';
              }
            }
          } catch {
            // ignore
          }
        }
        return event;
      },
    });
    isInitialized = true;
  }
  return Sentry;
}

/** Captura exceções não tratadas ou erros críticos no backend */
export function captureBackendException(error: unknown, context?: Record<string, any>) {
  console.error('[Backend Error]', error, context);
  const dsn = (process.env.SENTRY_DSN || '').trim();
  if (dsn) {
    const s = initBackendSentry();
    s.captureException(error, { extra: context });
  }
}

/** Captura eventos de segurança (ex: falhas repetidas de login, tentativas suspeitas) sem logar passwords */
export function captureSecurityEvent(message: string, context?: Record<string, any>) {
  console.warn('[Security Event]', message, context);
  const dsn = (process.env.SENTRY_DSN || '').trim();
  if (dsn) {
    const s = initBackendSentry();
    s.captureMessage(message, { level: 'warning', extra: context });
  }
}

export { Sentry };
