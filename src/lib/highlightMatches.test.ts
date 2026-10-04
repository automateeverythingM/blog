import assert from 'node:assert/strict';
import { test } from 'node:test';
import { highlightMatches } from './highlightMatches.ts';

// Regression test: reproduces the reported crash. Search matches posts by
// title/description/tags (see searchMatch.ts), not body text, so a tag like
// "blogging" can reach /blog/first-post/?highlight=blogging even though the
// word never appears in that post's Lorem-ipsum body. Without the fix, the
// equivalent inline script logic would find no <mark> and
// marks[0].scrollIntoView() would throw.
test('a highlight word absent from the body (matched only via a tag) leaves the html untouched and reports no match', () => {
	assert.deepEqual(highlightMatches('<p>Lorem ipsum</p>', 'blogging'), {
		html: '<p>Lorem ipsum</p>',
		matched: false,
	});
});

// Regression test: reproduces the crash that survives the first fix. A word
// can appear inside markup (e.g. a URL in an href) with no corresponding
// visible text. Wrapping it there would corrupt the attribute rather than
// create a real <mark> element, so getElementsByTagName('mark')[0] would
// still be undefined and .scrollIntoView() would still throw.
test('a highlight word that only appears inside markup (e.g. an href) is left alone and reports no match', () => {
	assert.deepEqual(highlightMatches('<a href="/blog/x">Lorem</a>', 'blog'), {
		html: '<a href="/blog/x">Lorem</a>',
		matched: false,
	});
});

// Regression test: `highlight` comes straight from the URL and the result is
// assigned to body.innerHTML, so a crafted value must not be able to inject
// markup. A word containing "<"/">" can never match (those characters only
// ever appear inside tag tokens, never in text), and any other HTML-special
// characters in a matched word are escaped before being re-inserted.
test('HTML-special characters in a matched highlight word are escaped, not injected', () => {
	assert.deepEqual(highlightMatches('<p>a &amp; b</p>', '&amp;'), {
		html: '<p>a <mark>&amp;amp;</mark> b</p>',
		matched: true,
	});
});

test('a highlight word containing markup characters never matches', () => {
	assert.deepEqual(highlightMatches('<p>Lorem ipsum</p>', '<script>'), {
		html: '<p>Lorem ipsum</p>',
		matched: false,
	});
});

test('a highlight word present in the body gets wrapped in <mark> and reports a match', () => {
	assert.deepEqual(highlightMatches('<p>Lorem ipsum</p>', 'ipsum'), {
		html: '<p>Lorem <mark>ipsum</mark></p>',
		matched: true,
	});
});

test('a multi-word highlight wraps every matching word and reports a match', () => {
	assert.deepEqual(highlightMatches('<p>lorem ipsum</p>', 'lorem ipsum'), {
		html: '<p><mark>lorem</mark> <mark>ipsum</mark></p>',
		matched: true,
	});
});

test('extra whitespace between highlight words is ignored', () => {
	const result = highlightMatches('<p>Lorem ipsum</p>', '  ipsum  ');
	assert.equal(result.matched, true);
	assert.equal(result.html, '<p>Lorem <mark>ipsum</mark></p>');
});

test('an empty highlight matches nothing and leaves the html untouched', () => {
	assert.deepEqual(highlightMatches('<p>Lorem ipsum</p>', ''), {
		html: '<p>Lorem ipsum</p>',
		matched: false,
	});
});
