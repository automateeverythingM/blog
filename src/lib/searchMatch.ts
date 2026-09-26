/**
 * The single place the "does this post match this search query" rule lives.
 * Used both to build the search-index entries' shape (see
 * src/pages/search-index.json.ts) and, client-side, to filter them on the
 * search page (see src/pages/search/index.astro) - so the query box and any
 * future search UI stay consistent with the index used to build them.
 */
export type SearchablePost = {
	title: string;
	description: string;
	tags: string[];
};

/**
 * Normalizes text for diacritic-insensitive matching, the same rule
 * tagSlug.ts uses for URLs: maps đ/Đ to "dj" (it doesn't decompose under
 * NFD, since it's not a base letter plus a combining mark), then decomposes
 * remaining accented characters with NFD and strips the resulting combining
 * marks, then lowercases. This lets a visitor who types without Serbian
 * diacritics ("zivot", "cas", "djak") still find posts that use them
 * ("Život", "Čas", "Đak").
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
 * matches a post titled "Markdown Style Guide" tagged "astro".
 *
 * An empty (or whitespace-only) query matches every post, so the search page
 * can show the full list before the visitor has typed anything.
 */
export function matchesSearchQuery(post: SearchablePost, query: string): boolean {
	const words = normalize(query.trim()).split(/\s+/).filter(Boolean);
	if (words.length === 0) return true;

	const haystack = normalize([post.title, post.description, ...post.tags].join(' '));
	return words.every((word) => haystack.includes(word));
}
