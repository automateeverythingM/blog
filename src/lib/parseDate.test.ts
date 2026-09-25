import assert from 'node:assert/strict';
import { test } from 'node:test';
import { parseFrontmatterDate } from './parseDate.ts';

/** Runs `fn` with `process.env.TZ` pinned to `tz`, restoring the previous value afterwards. */
function withTimeZone<T>(tz: string, fn: () => T): T {
	const previous = process.env.TZ;
	process.env.TZ = tz;
	try {
		return fn();
	} finally {
		if (previous === undefined) {
			delete process.env.TZ;
		} else {
			process.env.TZ = previous;
		}
	}
}

// A time zone well ahead of UTC and one well behind, so a bug that reinterprets a date in the
// server's local time zone shows up as an off-by-one day in at least one of them.
const AHEAD_OF_UTC = 'Pacific/Kiritimati'; // UTC+14
const BEHIND_UTC = 'Etc/GMT+12'; // UTC-12

test('a bare ISO date is read as the exact UTC day, in any time zone', () => {
	for (const tz of [AHEAD_OF_UTC, BEHIND_UTC]) {
		withTimeZone(tz, () => {
			const result = parseFrontmatterDate('2024-06-01');
			assert.equal(result.toISOString(), '2024-06-01T00:00:00.000Z');
		});
	}
});

test('a non-ISO date-only string is read as the exact day written, in any time zone', () => {
	for (const tz of [AHEAD_OF_UTC, BEHIND_UTC]) {
		withTimeZone(tz, () => {
			const result = parseFrontmatterDate('Jun 01 2024');
			assert.equal(result.toISOString(), '2024-06-01T00:00:00.000Z');
		});
	}
});

test('an ISO datetime with an explicit offset is left as the exact instant written, in any time zone', () => {
	for (const tz of [AHEAD_OF_UTC, BEHIND_UTC]) {
		withTimeZone(tz, () => {
			const result = parseFrontmatterDate('2024-06-01T05:00:00Z');
			assert.equal(result.toISOString(), '2024-06-01T05:00:00.000Z');
		});
	}
});

test('a Date instance is passed through unchanged', () => {
	const date = new Date('2024-06-01T00:00:00.000Z');
	assert.equal(parseFrontmatterDate(date), date);
});

test('an unparseable string produces an invalid date', () => {
	const result = parseFrontmatterDate('not a date');
	assert.equal(isNaN(result.getTime()), true);
});
