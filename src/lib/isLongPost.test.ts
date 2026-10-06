import assert from 'node:assert/strict';
import { test } from 'node:test';
import { isLongPost } from './isLongPost.ts';

test('a short post (well under 2 screen heights) is not long', () => {
	assert.equal(isLongPost(1500, 1000), false);
});

test('a post exactly 2 screen heights tall is not long', () => {
	assert.equal(isLongPost(2000, 1000), false);
});

test('a post taller than 2 screen heights is long', () => {
	assert.equal(isLongPost(2001, 1000), true);
});

test('a post well over 2 screen heights is long', () => {
	assert.equal(isLongPost(5000, 1000), true);
});
