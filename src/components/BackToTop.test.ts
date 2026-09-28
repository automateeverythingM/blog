import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';

const BACK_TO_TOP_SOURCE = fs.readFileSync(
	path.resolve(import.meta.dirname, './BackToTop.astro'),
	'utf8',
);
const POST_PAGE_SOURCE = fs.readFileSync(
	path.resolve(import.meta.dirname, '../pages/blog/[...slug].astro'),
	'utf8',
);
const BLOG_POST_LAYOUT_SOURCE = fs.readFileSync(
	path.resolve(import.meta.dirname, '../layouts/BlogPost.astro'),
	'utf8',
);

test('links to the #top anchor and is labelled "Back to top"', () => {
	assert.match(BACK_TO_TOP_SOURCE, /<a href="#top">Back to top<\/a>/);
});

test("BlogPost layout's <body> provides the #top anchor the link scrolls to", () => {
	assert.match(BLOG_POST_LAYOUT_SOURCE, /<body id="top">/);
});

test('a post page renders <BackToTop /> after the post content and before the previous/next navigation', () => {
	const contentIndex = POST_PAGE_SOURCE.indexOf('<Content');
	const backToTopIndex = POST_PAGE_SOURCE.indexOf('<BackToTop');
	const navigationIndex = POST_PAGE_SOURCE.indexOf('<PostNavigation');

	assert.ok(contentIndex !== -1, 'expected the post page to render <Content />');
	assert.ok(backToTopIndex !== -1, 'expected the post page to render <BackToTop />');
	assert.ok(navigationIndex !== -1, 'expected the post page to render <PostNavigation />');
	assert.ok(
		contentIndex < backToTopIndex && backToTopIndex < navigationIndex,
		'expected <BackToTop /> between <Content /> and <PostNavigation />',
	);
});

test('the home page and tag pages do not render a "back to top" link', () => {
	const otherPages = [
		path.resolve(import.meta.dirname, '../pages/index.astro'),
		path.resolve(import.meta.dirname, '../pages/blog/index.astro'),
		path.resolve(import.meta.dirname, '../pages/tags/index.astro'),
		path.resolve(import.meta.dirname, '../pages/tags/[tag]/index.astro'),
	];
	for (const pagePath of otherPages) {
		const source = fs.readFileSync(pagePath, 'utf8');
		assert.doesNotMatch(
			source,
			/BackToTop/,
			`expected ${path.basename(pagePath)} not to render BackToTop`,
		);
	}
});
