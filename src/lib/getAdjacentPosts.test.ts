import assert from 'node:assert/strict';
import { test } from 'node:test';
import { getAdjacentPosts } from './getAdjacentPosts.ts';

const now = new Date('2026-09-26T00:00:00Z');

type Post = { id: string; data: { pubDate: Date; draft?: boolean } };

function post(id: string, pubDate: string, draft = false): Post {
	return { id, data: { pubDate: new Date(pubDate), draft } };
}

test('a middle post has both a previous (older) and next (newer) post', () => {
	const posts = [
		post('oldest', '2024-01-01'),
		post('middle', '2024-02-01'),
		post('newest', '2024-03-01'),
	];

	const { previous, next } = getAdjacentPosts(posts, 'middle', now);

	assert.equal(previous?.id, 'oldest');
	assert.equal(next?.id, 'newest');
});

test('the oldest post has no previous post', () => {
	const posts = [post('oldest', '2024-01-01'), post('newest', '2024-02-01')];

	const { previous, next } = getAdjacentPosts(posts, 'oldest', now);

	assert.equal(previous, undefined);
	assert.equal(next?.id, 'newest');
});

test('the newest post has no next post', () => {
	const posts = [post('oldest', '2024-01-01'), post('newest', '2024-02-01')];

	const { previous, next } = getAdjacentPosts(posts, 'newest', now);

	assert.equal(previous?.id, 'oldest');
	assert.equal(next, undefined);
});

test('a lone published post has neither a previous nor a next post', () => {
	const posts = [post('only', '2024-01-01')];

	const { previous, next } = getAdjacentPosts(posts, 'only', now);

	assert.equal(previous, undefined);
	assert.equal(next, undefined);
});

test('draft posts are skipped, even if they sit between two published posts by date', () => {
	const posts = [
		post('oldest', '2024-01-01'),
		post('draft', '2024-02-01', true),
		post('newest', '2024-03-01'),
	];

	const { previous, next } = getAdjacentPosts(posts, 'oldest', now);

	assert.equal(previous, undefined);
	assert.equal(next?.id, 'newest');
});

test('scheduled (future pubDate) posts are skipped', () => {
	const posts = [post('oldest', '2024-01-01'), post('scheduled', '2027-01-01')];

	const { previous, next } = getAdjacentPosts(posts, 'oldest', now);

	assert.equal(previous, undefined);
	assert.equal(next, undefined);
});

test('a post that is not found among the published posts (e.g. a draft) has neither previous nor next', () => {
	const posts = [post('oldest', '2024-01-01'), post('draft', '2024-02-01', true)];

	const { previous, next } = getAdjacentPosts(posts, 'draft', now);

	assert.equal(previous, undefined);
	assert.equal(next, undefined);
});

test('defaults "now" to the current time when not given', () => {
	const posts = [post('past', '2000-01-01'), post('future', '2999-01-01')];

	const { next } = getAdjacentPosts(posts, 'past');

	assert.equal(next, undefined);
});
