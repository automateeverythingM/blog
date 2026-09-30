import * as Sentry from '@sentry/astro';

// Server errors: only the routes that render on request (the Keystatic editor
// and its API); every other page is prerendered at build time.
const dsn = import.meta.env.PUBLIC_SENTRY_DSN;

Sentry.init({
	dsn,
	enabled: Boolean(dsn),
	tracesSampleRate: 0,
	sendDefaultPii: false,
});
