import { getCollection } from 'astro:content';
import { publishedDate } from '../lib/isPostPublished.ts';
import type { SearchablePost } from '../lib/searchMatch.ts';

export type SearchIndexEntry = SearchablePost & {
	/** When the post went out, as an ISO date (see publishedDate in isPostPublished.ts). */
	date?: string;
	url: string;
};

/**
 * The search index consumed by src/pages/search/index.astro: one entry per
 * post, generated once at build time rather than shipping a search library.
 * The page's script fetches this file, filters it with matchesSearchQuery
 * (searchMatch.ts) as the visitor types, and shows the matches newest first.
 */
export async function GET() {
	const posts = await getCollection('blog');

	const index: SearchIndexEntry[] = posts.map((post) => ({
		title: post.data.title,
		description: post.data.description,
		tags: post.data.tags,
		date: publishedDate(post.data)?.toISOString(),
		url: `/blog/${post.id}/`,
	}));

	// Keep the file small: empty lists (a post with no tags) are left out.
	const body = JSON.stringify(index, (_key, value) =>
		Array.isArray(value) && value.length === 0 ? undefined : value,
	);

	return new Response(body, {
		headers: { 'Content-Type': 'application/json' },
	});
}
