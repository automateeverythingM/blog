import assert from 'node:assert/strict';
import { test } from 'node:test';
import { shouldEnableVercelWebAnalytics } from './vercelWebAnalytics.ts';

test('is disabled when running the dev server', () => {
	assert.equal(shouldEnableVercelWebAnalytics(['node', '/path/to/astro', 'dev']), false);
});

test('is enabled when building for production', () => {
	assert.equal(shouldEnableVercelWebAnalytics(['node', '/path/to/astro', 'build']), true);
});

test('is enabled when running preview', () => {
	assert.equal(shouldEnableVercelWebAnalytics(['node', '/path/to/astro', 'preview']), true);
});

test('is enabled for commands other than dev, e.g. astro check', () => {
	assert.equal(shouldEnableVercelWebAnalytics(['node', '/path/to/astro', 'check']), true);
});

test('defaults to process.argv when no argv is given', () => {
	// Under `node --test`, argv[2] is the test file path, never 'dev'.
	assert.equal(shouldEnableVercelWebAnalytics(), true);
});
