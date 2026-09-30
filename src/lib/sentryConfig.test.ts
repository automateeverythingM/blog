import assert from 'node:assert/strict';
import { test } from 'node:test';
import { sentryBuildSettings } from './sentryConfig.ts';

const DSN = 'https://abc123@o1.ingest.de.sentry.io/42';

test('is off when no DSN is set', () => {
	assert.deepEqual(sentryBuildSettings({}), { dsn: undefined, uploadSourceMaps: false });
});

test('uses a DSN that is set, trimmed', () => {
	assert.equal(sentryBuildSettings({ PUBLIC_SENTRY_DSN: `  ${DSN} ` }).dsn, DSN);
});

test('ignores a DSN that is not https', () => {
	assert.equal(
		sentryBuildSettings({ PUBLIC_SENTRY_DSN: 'http://abc@example.com/1' }).dsn,
		undefined,
	);
	assert.equal(sentryBuildSettings({ PUBLIC_SENTRY_DSN: '   ' }).dsn, undefined);
});

test('uploads source maps only when an auth token is set', () => {
	assert.equal(sentryBuildSettings({ PUBLIC_SENTRY_DSN: DSN }).uploadSourceMaps, false);
	assert.equal(
		sentryBuildSettings({ PUBLIC_SENTRY_DSN: DSN, SENTRY_AUTH_TOKEN: 'secret' }).uploadSourceMaps,
		true,
	);
	assert.equal(sentryBuildSettings({ SENTRY_AUTH_TOKEN: '  ' }).uploadSourceMaps, false);
});

test('defaults to process.env', () => {
	assert.equal(typeof sentryBuildSettings().uploadSourceMaps, 'boolean');
});
