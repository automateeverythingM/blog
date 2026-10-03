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
		data: {
			title: `Title ${id}`,
			description: `Description ${id}`,
			pubDate: new Date(pubDate),
			...overrides,
		},
	};
}

test('excludes draft posts from the index', () => {
	const posts = [post('published', '2024-01-01'), post('draft', '2024-02-01', { draft: true })];

	const index = buildSearchIndex(posts, now);

	assert.deepEqual(
		index.map((entry) => entry.url),
		['/blog/published/'],
	);
});

test('excludes posts scheduled for the future', () => {
	const posts = [post('past', '2024-01-01'), post('scheduled', '2027-01-01')];

	const index = buildSearchIndex(posts, now);

	assert.deepEqual(
		index.map((entry) => entry.url),
		['/blog/past/'],
	);
});

test('gives a published post a valid ISO date', () => {
	const posts = [post('published', '2024-01-01')];

	const index = buildSearchIndex(posts, now);

	assert.equal(index.length, 1);
	// Must not throw RangeError: Invalid time value (the bug this regression
	// test guards against).
	assert.equal(new Date(index[0].date).toISOString(), index[0].date);
});

test('passes through title, description and tags for a published post', () => {
	const posts = [post('published', '2024-01-01', { tags: ['astro', 'markdown'] })];

	const index = buildSearchIndex(posts, now);

	assert.deepEqual(index[0], {
		title: 'Title published',
		description: 'Description published',
		tags: ['astro', 'markdown'],
		date: new Date('2024-01-01').toISOString(),
		url: '/blog/published/',
	});
});
