import assert from 'node:assert/strict';
import { test } from 'node:test';
import { buildSearchIndex } from './buildSearchIndex.ts';

const now = new Date('2026-09-26T00:00:00Z');

type Post = {
	id: string;
	data: { title: string; description: string; tags?: string[]; pubDate: Date; draft?: boolean };
};

function post(id: string, pubDate: string, overrides: Partial<Post['data']> = {}): Post {
	return {
		id,
		data: { title: id, description: `${id} description`, pubDate: new Date(pubDate), ...overrides },
	};
}

test('includes a published post with a date', () => {
	const result = buildSearchIndex([post('hello-world', '2024-01-01')], now);

	assert.deepEqual(result, [
		{
			title: 'hello-world',
			description: 'hello-world description',
			tags: undefined,
			date: new Date('2024-01-01').toISOString(),
			url: '/blog/hello-world/',
		},
	]);
});

test('excludes draft posts, so they never leak into search results without a date', () => {
	const posts = [post('draft', '2024-01-01', { draft: true })];

	assert.deepEqual(buildSearchIndex(posts, now), []);
});

test('excludes posts scheduled for the future', () => {
	const posts = [post('scheduled', '2027-01-01')];

	assert.deepEqual(buildSearchIndex(posts, now), []);
});

test('every entry returned has a date that Date can parse without throwing', () => {
	// Regression test: before the fix, unpublished posts were included with no
	// `date`, and the search page did `new Date(post.date ?? '').toISOString()`
	// on every entry - which throws `RangeError: Invalid time value` for a
	// missing/empty date. Every entry buildSearchIndex returns must carry a
	// valid date so that code path never sees one.
	const posts = [
		post('published', '2024-01-01'),
		post('draft', '2024-02-01', { draft: true }),
		post('scheduled', '2027-01-01'),
	];

	const result = buildSearchIndex(posts, now);

	for (const entry of result) {
		assert.doesNotThrow(() => new Date(entry.date ?? '').toISOString());
	}
});

test('carries through title, description, and tags', () => {
	const posts = [post('tagged', '2024-01-01', { tags: ['astro', 'blog'] })];

	const result = buildSearchIndex(posts, now);

	assert.deepEqual(result[0]!.tags, ['astro', 'blog']);
});
