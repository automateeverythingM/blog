import { isPostPublished } from './isPostPublished.ts';

export type AdjacentPosts<Post> = {
	/** The next-older published post, or undefined if `currentId` is the oldest. */
	previous?: Post;
	/** The next-newer published post, or undefined if `currentId` is the newest. */
	next?: Post;
};

/**
 * Finds the posts immediately before (older) and after (newer) the post
 * identified by `currentId`, for the "previous post" / "next post" links at
 * the end of a blog post page.
 *
 * `posts` is filtered down to published posts first (see isPostPublished.ts -
 * same rule the blog index uses), so a draft or scheduled-for-later post is
 * never linked to and never counted when deciding whether the current post
 * is the oldest or newest. If `currentId` doesn't match any published post
 * (e.g. it's itself a draft), both `previous` and `next` are undefined.
 */
export function getAdjacentPosts<
	Post extends { id: string; data: { pubDate: Date; draft?: boolean } },
>(posts: Post[], currentId: string, now: Date = new Date()): AdjacentPosts<Post> {
	const oldestFirst = posts
		.filter((post) => isPostPublished(post.data, now))
		.sort((a, b) => a.data.pubDate.valueOf() - b.data.pubDate.valueOf());

	const index = oldestFirst.findIndex((post) => post.id === currentId);
	if (index === -1) return {};

	return {
		previous: oldestFirst[index - 1],
		next: oldestFirst[index + 1],
	};
}
