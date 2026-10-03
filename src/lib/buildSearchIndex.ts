import { isPostPublished } from './isPostPublished.ts';
import type { SearchablePost } from './searchMatch.ts';

export type SearchIndexEntry = SearchablePost & {
	/** When the post went out, as an ISO date string. */
	date: string;
	url: string;
};

/**
 * Builds the search index entries consumed by src/pages/search/index.astro
 * from the raw `blog` collection.
 *
 * Posts are filtered with isPostPublished (the same rule every other
 * consumer of the collection uses) *before* mapping, so every entry here has
 * a real `pubDate` and `date` is always a valid ISO string - unlike the
 * previous version, which kept drafts/future posts in the index with a
 * missing `date`, crashing the client's `.toISOString()` call when rendering
 * such an entry's `<time>` element.
 */
export function buildSearchIndex<
	Post extends {
		id: string;
		data: { title: string; description: string; tags?: string[]; pubDate: Date; draft?: boolean };
	},
>(posts: Post[], now: Date = new Date()): SearchIndexEntry[] {
	return posts
		.filter((post) => isPostPublished(post.data, now))
		.map((post) => ({
			title: post.data.title,
			description: post.data.description,
			tags: post.data.tags,
			date: post.data.pubDate.toISOString(),
			url: `/blog/${post.id}/`,
		}));
}
