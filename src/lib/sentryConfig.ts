/**
 * Sentry error tracking settings, read from the environment at build time.
 *
 * `PUBLIC_SENTRY_DSN` is Sentry's public client key: it is safe to ship to
 * browsers, which is why it carries Astro's `PUBLIC_` prefix. Without it (local
 * builds, CI, forks) Sentry stays off and nothing is sent anywhere.
 *
 * `SENTRY_AUTH_TOKEN` is a secret and only ever lives in the build environment.
 * When it is set, the build uploads source maps so Sentry can show stack
 * traces with the original file names and lines instead of minified bundles.
 */
export interface SentryBuildSettings {
	dsn: string | undefined;
	uploadSourceMaps: boolean;
}

export function sentryBuildSettings(
	env: Record<string, string | undefined> = process.env,
): SentryBuildSettings {
	const dsn = env.PUBLIC_SENTRY_DSN?.trim();
	return {
		dsn: dsn && dsn.startsWith('https://') ? dsn : undefined,
		uploadSourceMaps: Boolean(env.SENTRY_AUTH_TOKEN?.trim()),
	};
}
