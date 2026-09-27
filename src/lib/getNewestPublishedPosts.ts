import { isPostPublished } from './isPostPublished.ts';

/**
 * Picks the `count` newest published posts, newest first.
 *
 * `posts` is filtered down to published posts first (see isPostPublished.ts -
 * the same rule the blog index uses), so a draft or scheduled-for-later post
 * never shows up here either. Used by the 404 page to suggest recent posts
 * to a visitor who landed on a broken link.
 */
export function getNewestPublishedPosts<Post extends { data: { pubDate: Date; draft?: boolean } }>(
	posts: Post[],
	count = 3,
	now: Date = new Date(),
): Post[] {
	return posts
		.filter((post) => isPostPublished(post.data, now))
		.sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf())
		.slice(0, count);
}
