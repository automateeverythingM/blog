import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

// These pages don't render as Astro components in this test (that would
// require the full Astro/Vite pipeline), so the source text is inspected
// directly for the wiring the ticket asks for: a "Back to top" link shown
// only on rendered blog post pages, after the post content and before the
// previous/next navigation.

function readSource(relativePath: string): string {
	return readFileSync(fileURLToPath(new URL(relativePath, import.meta.url)), 'utf-8');
}

test('BackToTop links to #top, a plain anchor that needs no JavaScript', () => {
	const source = readSource('./BackToTop.astro');

	assert.match(source, /href="#top"/);
	assert.match(source, /Back to top/);
});

test('a rendered blog post shows Back to top after the content and before post navigation', () => {
	const source = readSource('../pages/blog/[...slug].astro');

	assert.match(source, /import BackToTop from '..\/..\/components\/BackToTop.astro'/);

	const contentIndex = source.indexOf('<Content');
	const backToTopIndex = source.indexOf('<BackToTop');
	const postNavigationIndex = source.indexOf('<PostNavigation');

	assert.ok(contentIndex !== -1, 'expected <Content /> to be rendered');
	assert.ok(backToTopIndex !== -1, 'expected <BackToTop /> to be rendered');
	assert.ok(postNavigationIndex !== -1, 'expected <PostNavigation /> to be rendered');
	assert.ok(contentIndex < backToTopIndex, '<BackToTop /> should come after the post content');
	assert.ok(
		backToTopIndex < postNavigationIndex,
		'<BackToTop /> should come before the previous/next post links',
	);
});

test('the home page, blog index, and tag pages do not show Back to top', () => {
	const pagesWithoutBackToTop = [
		'../pages/index.astro',
		'../pages/blog/index.astro',
		'../pages/tags/index.astro',
		'../pages/tags/[tag]/index.astro',
	];

	for (const page of pagesWithoutBackToTop) {
		const source = readSource(page);
		assert.doesNotMatch(source, /BackToTop/, `expected ${page} not to use BackToTop`);
	}
});
