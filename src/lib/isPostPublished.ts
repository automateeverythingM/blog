/**
 * Whether a post should be shown on the built site: it isn't marked as a
 * draft, and its `pubDate` isn't in the future (relative to `now`, which
 * defaults to the current time but can be overridden for tests).
 *
 * This is the single place the "is this post published" rule lives; every
 * place posts appear (the blog list, the home page, individual post pages,
 * the RSS feed, and the sitemap - which only sees the pages actually built)
 * uses it, so a draft or scheduled-for-the-future post never leaks out.
 */
export function isPostPublished(
	post: { draft?: boolean; pubDate: Date },
	now: Date = new Date(),
): boolean {
	const isScheduledForLater = post.pubDate.getTime() > now.getTime();
	return !post.draft && !isScheduledForLater;
}
