import { getCollection } from 'astro:content';
import { isPostPublished } from '../lib/isPostPublished.ts';
import type { SearchablePost } from '../lib/searchMatch.ts';

export type SearchIndexEntry = SearchablePost & {
	date: string;
	url: string;
};

/**
 * The search index consumed by src/pages/search/index.astro: one entry per
 * published post (drafts and posts scheduled for the future are excluded,
 * same rule as everywhere else - see isPostPublished.ts), generated once at
 * build time rather than shipping a search library. The page's script fetches
 * this file and filters it with matchesSearchQuery (searchMatch.ts) as the
 * visitor types.
 */
export async function GET() {
	const posts = await getCollection('blog', (post) => isPostPublished(post.data));

	const index: SearchIndexEntry[] = posts
		.map((post) => ({
			title: post.data.title,
			description: post.data.description,
			tags: post.data.tags,
			date: post.data.pubDate.toISOString(),
			url: `/blog/${post.id}/`,
		}))
		.sort((a, b) => new Date(b.date).valueOf() - new Date(a.date).valueOf());

	return new Response(JSON.stringify(index), {
		headers: { 'Content-Type': 'application/json' },
	});
}
