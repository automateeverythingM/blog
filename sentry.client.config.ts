import * as Sentry from '@sentry/astro';

// Browser errors. The DSN is inlined at build time; without it Sentry stays off
// (see src/lib/sentryConfig.ts). No performance tracing and no session replay:
// only errors are sent.
const dsn = import.meta.env.PUBLIC_SENTRY_DSN;

Sentry.init({
	dsn,
	enabled: Boolean(dsn),
	tracesSampleRate: 0,
	sendDefaultPii: false,
});
