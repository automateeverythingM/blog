import assert from 'node:assert/strict';
import { test } from 'node:test';
import { groupPostsByTag } from './groupPostsByTag.ts';

type Post = { id: string; data: { tags: string[]; pubDate: Date } };

function post(id: string, tags: string[], pubDate: string): Post {
	return { id, data: { tags, pubDate: new Date(pubDate) } };
}

test('groups tags that mean the same thing by slug', () => {
	const posts = [post('a', ['Web Dev'], '2024-01-01'), post('b', ['web-dev'], '2024-02-01')];

	const groups = groupPostsByTag(posts);

	assert.equal(groups.length, 1);
	assert.equal(groups[0].slug, 'web-dev');
	assert.deepEqual(
		groups[0].posts.map((p) => p.id),
		['b', 'a'],
	);
});

test('sorts each tag group newest first', () => {
	const posts = [
		post('oldest', ['astro'], '2024-01-01'),
		post('newest', ['astro'], '2024-03-01'),
		post('middle', ['astro'], '2024-02-01'),
	];

	const groups = groupPostsByTag(posts);

	assert.deepEqual(
		groups[0].posts.map((p) => p.id),
		['newest', 'middle', 'oldest'],
	);
});

test('counts posts per tag correctly', () => {
	const posts = [post('a', ['astro', 'web-dev'], '2024-01-01'), post('b', ['astro'], '2024-01-02')];

	const groups = groupPostsByTag(posts);

	const astro = groups.find((g) => g.slug === 'astro');
	const webDev = groups.find((g) => g.slug === 'web-dev');
	assert.equal(astro?.count, 2);
	assert.equal(webDev?.count, 1);
});

test('a post with the same tag twice only counts once for that tag', () => {
	const posts = [post('a', ['astro', 'astro'], '2024-01-01')];

	const groups = groupPostsByTag(posts);

	assert.equal(groups.length, 1);
	assert.equal(groups[0].count, 1);
	assert.deepEqual(
		groups[0].posts.map((p) => p.id),
		['a'],
	);
});

test('a post with two tags that slugify the same way only counts once for that tag', () => {
	const posts = [post('a', ['Astro', 'astro'], '2024-01-01')];

	const groups = groupPostsByTag(posts);

	assert.equal(groups.length, 1);
	assert.equal(groups[0].count, 1);
});

test('tags that slugify to an empty string are dropped', () => {
	const posts = [post('a', ['!!!', 'astro'], '2024-01-01')];

	const groups = groupPostsByTag(posts);

	assert.equal(groups.length, 1);
	assert.equal(groups[0].slug, 'astro');
});

test('a post whose only tag slugifies to an empty string contributes no group', () => {
	const posts = [post('a', ['!!!'], '2024-01-01')];

	const groups = groupPostsByTag(posts);

	assert.equal(groups.length, 0);
});

test('returns no groups for posts with no tags', () => {
	assert.deepEqual(groupPostsByTag([post('a', [], '2024-01-01')]), []);
});
