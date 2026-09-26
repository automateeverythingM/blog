import assert from 'node:assert/strict';
import { test } from 'node:test';
import { tagSlug } from './tagSlug.ts';

test('lowercases the tag', () => {
	assert.equal(tagSlug('Astro'), 'astro');
});

test('replaces spaces with dashes', () => {
	assert.equal(tagSlug('web dev'), 'web-dev');
});

test('collapses runs of non-alphanumeric characters into a single dash', () => {
	assert.equal(tagSlug('web   dev!!'), 'web-dev');
});

test('trims leading and trailing dashes', () => {
	assert.equal(tagSlug('  -Astro-  '), 'astro');
});

test('a tag that is already a lowercase dash-separated slug is unchanged', () => {
	assert.equal(tagSlug('web-dev'), 'web-dev');
});

test('keeps digits', () => {
	assert.equal(tagSlug('Web 2.0'), 'web-2-0');
});

test('two differently-formatted tags that mean the same thing slugify identically', () => {
	assert.equal(tagSlug('Web Dev'), tagSlug('web-dev'));
});

test('a tag with no ASCII letters or digits slugifies to an empty string', () => {
	// There's no dash-separated slug to build from a tag like this. Callers
	// are expected to treat an empty string as "this tag has no page" and
	// skip it, rather than link to /tags//.
	assert.equal(tagSlug('!!!'), '');
	assert.equal(tagSlug('日本語'), '');
	assert.equal(tagSlug('++'), '');
});
