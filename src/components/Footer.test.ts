import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

const source = readFileSync(fileURLToPath(new URL('./Footer.astro', import.meta.url)), 'utf-8');

test('credits Marko Pavic instead of the placeholder name', () => {
	assert.match(source, /Marko Pavic/);
	assert.doesNotMatch(source, /Your name here/i);
});

test('only links out to the GitHub profile', () => {
	const hrefs = [...source.matchAll(/href="([^"]+)"/g)].map((match) => match[1]);
	assert.deepEqual(hrefs, ['https://github.com/automateeverythingM']);
});

test('does not link to Astro-owned social accounts', () => {
	assert.doesNotMatch(source, /astrodotbuild/);
	assert.doesNotMatch(source, /m\.webtoo\.ls\/@astro/);
	assert.doesNotMatch(source, /withastro\/astro/);
});

test('external links open safely with rel="noopener noreferrer"', () => {
	const anchors = [...source.matchAll(/<a\s+[^>]*>/g)].map((match) => match[0]);
	assert.ok(anchors.length > 0, 'expected at least one link in the footer');
	for (const anchor of anchors) {
		if (/target="_blank"/.test(anchor)) {
			assert.match(anchor, /rel="noopener noreferrer"/);
		}
	}
});
