/**
 * The single place the "does this post match this search query" rule lives.
 * Used both to build the search-index entries' shape (see
 * src/pages/search-index.json.ts) and, client-side, to filter them on the
 * search page (see src/pages/search/index.astro) - so the query box and any
 * future search UI stay consistent with the index used to build them.
 */
import { parseSearchQuery } from './parseSearchQuery.ts';

export type SearchablePost = {
	title: string;
	description: string;
	// Optional because the search index (src/pages/search-index.json.ts) omits
	// this field entirely for posts with no tags, to keep the JSON file small.
	tags?: string[];
};

/**
 * Normalizes text for diacritic-insensitive matching, the same rule
 * tagSlug.ts uses for URLs: maps đ/Đ to "dj" (it doesn't decompose under
 * NFD, since it's not a base letter plus a combining mark), then decomposes
 * remaining accented characters with NFD and strips the resulting combining
 * marks, then lowercases. This lets a visitor who types without Serbian
 * diacritics ("zivot", "cas", "djak") still find posts that use them
 * ("Život", "Čas", "Đak").
 *
 * This operates on plain text (post titles/descriptions/tags and the raw
 * search query), not URI-encoded strings, so it must not run the text
 * through decodeURIComponent: a query like "50%" isn't valid percent-encoding
 * and would throw a URIError ("URI malformed").
 */
function normalize(text: string): string {
	return text
		.replace(/đ/g, 'dj')
		.replace(/Đ/g, 'dj')
		.normalize('NFD')
		.replace(/\p{M}+/gu, '')
		.toLowerCase();
}

/**
 * Whether `post` matches `query`: the query is split on whitespace into
 * words, and every word must appear (case- and diacritic-insensitively, as a
 * substring) somewhere in the post's title, description, or tags. Word order
 * and which field each word matches in don't matter, so "astro markdown"
 * matches a post titled "Markdown Style Guide" tagged "astro". A word may
 * use simple pattern syntax ("colou?r") to match spelling variants.
 *
 * A word written as `tag:<name>` (see parseSearchQuery.ts) is a filter
 * instead: the post must have exactly that tag (case- and
 * diacritic-insensitively), so "tag:astro markdown" finds Markdown posts
 * tagged astro.
 *
 * An empty (or whitespace-only) query matches every post, so the search page
 * can show the full list before the visitor has typed anything.
 */
export function matchesSearchQuery(post: SearchablePost, query: string): boolean {
	const parsed = parseSearchQuery(query);
	const words = parsed.words.map(normalize);
	if (words.length === 0 && parsed.tags.length === 0) return true;

	const postTags = (post.tags ?? []).map(normalize);
	if (!parsed.tags.every((tag) => postTags.some((postTag) => postTag === normalize(tag))))
		return false;

	const haystack = normalize([post.title, post.description, ...(post.tags ?? [])].join(' '));
	// Each word is read as a pattern, so a visitor can type "colou?r" or "post(s)"
	// to catch both spellings. A word that isn't a valid pattern (e.g. "c++",
	// where "++" has nothing to repeat) would otherwise throw a SyntaxError and
	// break the whole search; fall back to matching it as a literal substring.
	return words.every((word) => {
		try {
			return new RegExp(word, 'i').test(haystack);
		} catch {
			return haystack.includes(word);
		}
	});
}
