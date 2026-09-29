import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

// The post page template renders as plain markup (no branching logic to
// extract into a testable function), so this checks the source directly
// rather than adding a src/lib helper just for a static link.
const postPageSource = readFileSync(
	fileURLToPath(new URL('./[...slug].astro', import.meta.url)),
	'utf8',
);

test('a post page has a "Back to top" link after the content and before the previous/next links', () => {
	const contentIndex = postPageSource.indexOf('<Content');
	const backToTopIndex = postPageSource.indexOf('href="#top"');
	const navigationIndex = postPageSource.indexOf('<PostNavigation');

	assert.notEqual(contentIndex, -1);
	assert.notEqual(backToTopIndex, -1);
	assert.notEqual(navigationIndex, -1);
	assert.ok(
		contentIndex < backToTopIndex && backToTopIndex < navigationIndex,
		'expected the "Back to top" link to sit between the post content and the previous/next links',
	);
	assert.match(postPageSource.slice(backToTopIndex - 200, backToTopIndex + 200), /Back to top/);
});

for (const [page, path] of Object.entries({
	'home page': '../index.astro',
	'blog index page': './index.astro',
	'tags index page': '../tags/index.astro',
	'tag page': '../tags/[tag]/index.astro',
})) {
	test(`the ${page} has no "Back to top" link`, () => {
		const source = readFileSync(fileURLToPath(new URL(path, import.meta.url)), 'utf8');
		assert.doesNotMatch(source, /Back to top/);
	});
}
