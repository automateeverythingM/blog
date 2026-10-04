import assert from 'node:assert/strict';
import { test } from 'node:test';
import { parseSearchQuery } from './parseSearchQuery.ts';

test('plain words stay words', () => {
	assert.deepEqual(parseSearchQuery('markdown style'), { words: ['markdown', 'style'], tags: [] });
});

test('tag:<name> becomes a tag filter', () => {
	assert.deepEqual(parseSearchQuery('tag:astro'), { words: [], tags: ['astro'] });
});

test('words and tag filters mix, in any order', () => {
	assert.deepEqual(parseSearchQuery('tag:travel zeppelin tag:astro'), {
		words: ['zeppelin'],
		tags: ['travel', 'astro'],
	});
});

test('the tag: prefix is case-insensitive', () => {
	assert.deepEqual(parseSearchQuery('TAG:Astro'), { words: [], tags: ['Astro'] });
});

test('an empty query has no words and no tags', () => {
	assert.deepEqual(parseSearchQuery('   '), { words: [], tags: [] });
});
