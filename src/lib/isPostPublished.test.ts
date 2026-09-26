import assert from 'node:assert/strict';
import { test } from 'node:test';
import { isPostPublished } from './isPostPublished.ts';

const now = new Date('2026-09-26T00:00:00Z');

test('a non-draft post published in the past is published', () => {
	assert.equal(isPostPublished({ draft: false, pubDate: new Date('2026-09-25') }, now), true);
});

test('a non-draft post published exactly now is published', () => {
	assert.equal(isPostPublished({ draft: false, pubDate: now }, now), true);
});

test('a post with no draft field set (defaults to not-a-draft) is published', () => {
	assert.equal(isPostPublished({ pubDate: new Date('2026-09-25') }, now), true);
});

test('a draft post is not published even if its pubDate is in the past', () => {
	assert.equal(isPostPublished({ draft: true, pubDate: new Date('2026-09-25') }, now), false);
});

test('a scheduled (future pubDate) post is not published yet', () => {
	assert.equal(isPostPublished({ draft: false, pubDate: new Date('2026-09-27') }, now), false);
});

test('a scheduled post becomes published once its pubDate has passed', () => {
	const scheduled = { draft: false, pubDate: new Date('2026-09-27') };
	assert.equal(isPostPublished(scheduled, new Date('2026-09-26')), false);
	assert.equal(isPostPublished(scheduled, new Date('2026-09-28')), true);
});

test('a draft post with a future pubDate is not published', () => {
	assert.equal(isPostPublished({ draft: true, pubDate: new Date('2026-09-27') }, now), false);
});

test('defaults "now" to the current time when not given', () => {
	assert.equal(isPostPublished({ draft: false, pubDate: new Date('2000-01-01') }), true);
	assert.equal(isPostPublished({ draft: false, pubDate: new Date('2999-01-01') }), false);
});
