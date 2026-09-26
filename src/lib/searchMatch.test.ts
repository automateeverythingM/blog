import assert from 'node:assert/strict';
import { test } from 'node:test';
import { matchesSearchQuery } from './searchMatch.ts';

const post = {
	title: 'Markdown Style Guide',
	description: 'Everything you need to know about Markdown syntax.',
	tags: ['markdown', 'Astro'],
};

test('an empty query matches every post', () => {
	assert.equal(matchesSearchQuery(post, ''), true);
});

test('a whitespace-only query matches every post', () => {
	assert.equal(matchesSearchQuery(post, '   '), true);
});

test('matches a word found in the title', () => {
	assert.equal(matchesSearchQuery(post, 'style'), true);
});

test('matches a word found in the description', () => {
	assert.equal(matchesSearchQuery(post, 'syntax'), true);
});

test('matches a word found in a tag', () => {
	assert.equal(matchesSearchQuery(post, 'astro'), true);
});

test('matching is case-insensitive', () => {
	assert.equal(matchesSearchQuery(post, 'MARKDOWN'), true);
});

test('matches a substring within a word', () => {
	assert.equal(matchesSearchQuery(post, 'mark'), true);
});

test('does not match a word absent from every field', () => {
	assert.equal(matchesSearchQuery(post, 'javascript'), false);
});

test('requires every word to match, possibly in different fields', () => {
	assert.equal(matchesSearchQuery(post, 'markdown astro'), true);
});

test('fails if any one word has no match anywhere', () => {
	assert.equal(matchesSearchQuery(post, 'markdown javascript'), false);
});

test('extra whitespace between words is ignored', () => {
	assert.equal(matchesSearchQuery(post, '  markdown   astro  '), true);
});

test('a post with no tags can still match on title or description', () => {
	const untagged = { title: 'First Post', description: 'Welcome to my blog.', tags: [] };
	assert.equal(matchesSearchQuery(untagged, 'welcome'), true);
	assert.equal(matchesSearchQuery(untagged, 'astro'), false);
});

test('a query without diacritics matches a post title with them ("zivot" finds "Zivot")', () => {
	const zivot = { title: 'Život na selu', description: '', tags: [] };
	assert.equal(matchesSearchQuery(zivot, 'zivot'), true);
});

test('a query without diacritics matches a post title with them ("cas" finds "Cas")', () => {
	const cas = { title: 'Čas fizike', description: '', tags: [] };
	assert.equal(matchesSearchQuery(cas, 'cas'), true);
});

test('a query without diacritics matches a post tag with dj for đ ("djak" finds "Đak")', () => {
	const djak = { title: 'Naslov', description: '', tags: ['Đak'] };
	assert.equal(matchesSearchQuery(djak, 'djak'), true);
});
