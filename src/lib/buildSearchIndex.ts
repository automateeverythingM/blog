import { isPostPublished, publishedDate } from './isPostPublished.ts';
import type { SearchablePost } from './searchMatch.ts';

export type SearchIndexEntry = SearchablePost & {
	/** When the post went out, as an ISO date (see publishedDate in isPostPublished.ts). */
	date?: string;
	url: string;
};

/**
 * Builds the search-index entries served by src/pages/search-index.json.ts.
 *
 * `posts` is filtered down to published posts first (see isPostPublished.ts -
 * the same rule the blog index, RSS feed, and 404 "recent posts" list use),
 * so a draft or scheduled-for-later post never leaks into search results. A
 * post that did leak through would carry no `date`, and the search page's
 * client-side script turns `date` into a `Date` unconditionally - `new
 * Date(undefined ?? '').toISOString()` throws `RangeError: Invalid time
 * value` - so this filter is also what keeps that script from crashing.
 */
export function buildSearchIndex<
	Post extends { id: string; data: SearchablePost & { pubDate: Date; draft?: boolean } },
>(posts: Post[], now: Date = new Date()): SearchIndexEntry[] {
	return posts
		.filter((post) => isPostPublished(post.data, now))
		.map((post) => ({
			title: post.data.title,
			description: post.data.description,
			tags: post.data.tags,
			date: publishedDate(post.data, now)?.toISOString(),
			url: `/blog/${post.id}/`,
		}));
}
