import { getCollection } from 'astro:content';
import { buildSearchIndex } from '../lib/buildSearchIndex.ts';

/**
 * The search index consumed by src/pages/search/index.astro: one entry per
 * post, generated once at build time rather than shipping a search library.
 * The page's script fetches this file, filters it with matchesSearchQuery
 * (searchMatch.ts) as the visitor types, and shows the matches newest first.
 */
export async function GET() {
	const posts = await getCollection('blog');

	const index = buildSearchIndex(posts);

	// Keep the file small: empty lists (a post with no tags) are left out.
	const body = JSON.stringify(index, (_key, value) =>
		Array.isArray(value) && value.length === 0 ? undefined : value,
	);

	return new Response(body, {
		headers: { 'Content-Type': 'application/json' },
	});
}
