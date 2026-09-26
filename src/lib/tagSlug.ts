/**
 * Converts a tag into the lowercase, dash-separated slug used for its URL
 * (/tags/<slug>/). Runs of characters that aren't letters or digits collapse
 * into a single dash, and leading/trailing dashes are trimmed, so e.g. "Web
 * Dev!" and "web-dev" both slugify to "web-dev" and land on the same page.
 */
export function tagSlug(tag: string): string {
	return tag
		.trim()
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '');
}
