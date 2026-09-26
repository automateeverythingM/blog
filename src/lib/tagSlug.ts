/**
 * Converts a tag into the lowercase, dash-separated slug used for its URL
 * (/tags/<slug>/). Runs of characters that aren't letters or digits collapse
 * into a single dash, and leading/trailing dashes are trimmed, so e.g. "Web
 * Dev!" and "web-dev" both slugify to "web-dev" and land on the same page.
 *
 * The blog is written in Serbian (Latin script), so diacritics are removed
 * rather than dropped along with their letter: "č", "ć" and "s with caron"
 * fold to "c"/"s", etc. (normalize to NFD and strip the combining marks),
 * and "đ"/"Đ" - which don't decompose that way - are mapped to "dj" by
 * hand. Any other Unicode letters or digits (e.g. Cyrillic) are kept as-is.
 */
export function tagSlug(tag: string): string {
	return tag
		.replace(/đ/g, 'dj')
		.replace(/Đ/g, 'Dj')
		.normalize('NFD')
		.replace(/\p{M}+/gu, '')
		.trim()
		.toLowerCase()
		.replace(/[^\p{L}\p{N}]+/gu, '-')
		.replace(/^-+|-+$/g, '');
}
