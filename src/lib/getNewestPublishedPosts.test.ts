import assert from 'node:assert/strict';
import { test } from 'node:test';
import { getNewestPublishedPosts } from './getNewestPublishedPosts.ts';

const now = new Date('2026-09-26T00:00:00Z');

type Post = { id: string; data: { pubDate: Date; draft?: boolean } };

function post(id: string, pubDate: string, draft = false): Post {
	return { id, data: { pubDate: new Date(pubDate), draft } };
}

test('returns the newest posts first', () => {
	const posts = [
		post('oldest', '2024-01-01'),
		post('newest', '2024-03-01'),
		post('middle', '2024-02-01'),
	];

	const result = getNewestPublishedPosts(posts, 3, now);

	assert.deepEqual(
		result.map((p) => p.id),
		['newest', 'middle', 'oldest'],
	);
});

test('limits the result to `count` posts', () => {
	const posts = [
		post('oldest', '2024-01-01'),
		post('middle', '2024-02-01'),
		post('newest', '2024-03-01'),
	];

	const result = getNewestPublishedPosts(posts, 2, now);

	assert.deepEqual(
		result.map((p) => p.id),
		['newest', 'middle'],
	);
});

test('defaults to 3 posts when `count` is not given', () => {
	const posts = [
		post('a', '2024-01-01'),
		post('b', '2024-02-01'),
		post('c', '2024-03-01'),
		post('d', '2024-04-01'),
	];

	const result = getNewestPublishedPosts(posts, undefined, now);

	assert.deepEqual(
		result.map((p) => p.id),
		['d', 'c', 'b'],
	);
});

test('excludes draft posts', () => {
	const posts = [post('published', '2024-01-01'), post('draft', '2024-03-01', true)];

	const result = getNewestPublishedPosts(posts, 3, now);

	assert.deepEqual(
		result.map((p) => p.id),
		['published'],
	);
});

test('excludes posts scheduled for the future', () => {
	const posts = [post('past', '2024-01-01'), post('scheduled', '2027-01-01')];

	const result = getNewestPublishedPosts(posts, 3, now);

	assert.deepEqual(
		result.map((p) => p.id),
		['past'],
	);
});

test('returns fewer than `count` posts when there are not enough published posts', () => {
	const posts = [post('only', '2024-01-01')];

	const result = getNewestPublishedPosts(posts, 3, now);

	assert.deepEqual(
		result.map((p) => p.id),
		['only'],
	);
});

test('returns an empty array when there are no published posts', () => {
	assert.deepEqual(getNewestPublishedPosts([], 3, now), []);
});

test('defaults "now" to the current time when not given', () => {
	const posts = [post('past', '2000-01-01'), post('future', '2999-01-01')];

	const result = getNewestPublishedPosts(posts);

	assert.deepEqual(
		result.map((p) => p.id),
		['past'],
	);
});
