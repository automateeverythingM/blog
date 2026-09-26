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
