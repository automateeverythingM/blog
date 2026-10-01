import assert from 'node:assert/strict';
import { test } from 'node:test';
import { SITE_DESCRIPTION, SITE_TITLE } from './consts.ts';

test('site title identifies the author', () => {
	assert.equal(SITE_TITLE, 'Marko Pavic');
});

test('site description describes the blog topic', () => {
	assert.equal(SITE_DESCRIPTION, 'Notes on building software with AI agents');
});
