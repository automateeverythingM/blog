import assert from 'node:assert/strict';
import { test } from 'node:test';
import { formatDate } from './formatDate.ts';

test('formats a post date as "Mon D, YYYY"', () => {
	assert.equal(formatDate(new Date('2026-09-25')), 'Sep 25, 2026');
});

test('keeps the UTC date whatever the local time zone', () => {
	assert.equal(formatDate(new Date('2026-01-01T00:00:00Z')), 'Jan 1, 2026');
});
