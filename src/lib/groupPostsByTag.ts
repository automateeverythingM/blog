import { tagSlug } from './tagSlug.ts';

export type TagGroup<Post> = {
	/** The lowercase, dash-separated slug used in the tag's URL (/tags/<slug>/). */
	slug: string;
	/** The tag as originally written on the first post that used it, for display. */
	tag: string;
	/** This tag's posts, newest first. */
	posts: Post[];
	/** posts.length, kept alongside it so callers don't need to recompute it. */
	count: number;
};

/**
 * Groups posts by tag slug (see tagSlug.ts), so two differently formatted
 * tags that mean the same thing (e.g. "Web Dev" and "web-dev") share one
 * entry instead of splitting the count. Tags that slugify to an empty string
 * (e.g. "!!!") have no usable URL, so they're dropped entirely - a post with
 * only such tags contributes nothing here. Within a single post, repeated
 * tags (or tags that merely slugify the same way, e.g. ["Astro", "astro"])
 * only count that post once. Each group's posts are sorted newest first.
 *
 * Used by both src/pages/tags/index.astro (all tags, with counts) and
 * src/pages/tags/[tag]/index.astro (one tag's posts), so the grouping,
 * deduplication, and sort order stay in one place.
 */
export function groupPostsByTag<Post extends { data: { tags: string[]; pubDate: Date } }>(
	posts: Post[],
): TagGroup<Post>[] {
	const bySlug = new Map<string, { tag: string; posts: Post[] }>();
	for (const post of posts) {
		const slugsOnThisPost = new Set<string>();
		for (const tag of post.data.tags) {
			const slug = tagSlug(tag);
			if (slug === '' || slugsOnThisPost.has(slug)) continue;
			slugsOnThisPost.add(slug);

			const entry = bySlug.get(slug);
			if (entry) {
				entry.posts.push(post);
			} else {
				bySlug.set(slug, { tag, posts: [post] });
			}
		}
	}

	return [...bySlug.entries()].map(([slug, { tag, posts }]) => ({
		slug,
		tag,
		posts: [...posts].sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf()),
		count: posts.length,
	}));
}
