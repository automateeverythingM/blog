import assert from 'node:assert/strict';
import { afterEach, test } from 'node:test';
import { formatDate } from './formatDate.ts';
import { parseFrontmatterDate } from './parseFrontmatterDate.ts';

const originalTz = process.env.TZ;

afterEach(() => {
	process.env.TZ = originalTz;
});

test('parses a non-ISO date-only string as UTC midnight, not local midnight', () => {
	process.env.TZ = 'Asia/Tokyo';
	assert.equal(parseFrontmatterDate('Jun 01 2024').toISOString(), '2024-06-01T00:00:00.000Z');
});

test('parses a bare ISO date string as UTC midnight', () => {
	process.env.TZ = 'Asia/Tokyo';
	assert.equal(parseFrontmatterDate('2024-06-01').toISOString(), '2024-06-01T00:00:00.000Z');
});

test('a bare ISO date string shows the written day in Asia/Tokyo', () => {
	process.env.TZ = 'Asia/Tokyo';
	assert.equal(formatDate(parseFrontmatterDate('2024-06-01')), 'Jun 1, 2024');
});

test('a bare ISO date string shows the written day in America/New_York', () => {
	process.env.TZ = 'America/New_York';
	assert.equal(formatDate(parseFrontmatterDate('2024-06-01')), 'Jun 1, 2024');
});

test('keeps the exact instant of a full ISO date-time with a "Z" offset', () => {
	assert.equal(
		parseFrontmatterDate('2024-06-01T10:00:00Z').toISOString(),
		'2024-06-01T10:00:00.000Z',
	);
});

test('keeps the exact instant of a full ISO date-time with a numeric offset', () => {
	assert.equal(
		parseFrontmatterDate('2024-06-01T10:00:00+02:00').toISOString(),
		'2024-06-01T08:00:00.000Z',
	);
});

test('keeps the exact instant of a numeric epoch timestamp', () => {
	assert.equal(parseFrontmatterDate(1717200000000).toISOString(), '2024-06-01T00:00:00.000Z');
});

test('passes a Date instance through unchanged', () => {
	const date = new Date('2024-06-01T10:00:00Z');
	assert.equal(parseFrontmatterDate(date).toISOString(), date.toISOString());
});
