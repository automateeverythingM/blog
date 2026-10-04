/**
 * Marks up `highlight` inside `html` the way src/layouts/BlogPost.astro's
 * inline script does when a visitor arrives from search (/search links here
 * with ?highlight=<what was typed>): `highlight` is split on whitespace into
 * words, and each literal occurrence of a word inside the post's text is
 * wrapped in <mark> tags.
 *
 * Matching is restricted to text content - `html` is split into alternating
 * tag/text tokens first, and only text tokens are searched - for two
 * reasons:
 *
 * - Search (see searchMatch.ts) matches a post by its title, description, or
 *   tags - not by its body text - so a word typed into search (e.g. a tag
 *   like "blogging") may never appear in the post body at all. Worse, if the
 *   word happened to appear only inside markup (e.g. "blog" inside
 *   `<a href="/blog/x">`), wrapping it in <mark> there would corrupt the
 *   attribute rather than create a real <mark> element. `matched` reports
 *   whether a word was actually wrapped in the text, so a caller can skip
 *   scrolling to a <mark> that doesn't exist instead of crashing.
 * - `highlight` is attacker-controlled (it comes straight from the URL) and
 *   the result is assigned to `body.innerHTML`. Matching only inside text
 *   tokens means a word can never contain "<" or ">" and still match (those
 *   characters only ever appear inside tag tokens), and the matched text is
 *   HTML-escaped before being re-inserted, so a crafted `?highlight=` value
 *   can't inject markup.
 */
export function highlightMatches(
	html: string,
	highlight: string,
): { html: string; matched: boolean } {
	const words = highlight.trim().split(/\s+/).filter(Boolean);
	if (words.length === 0) return { html, matched: false };

	let matched = false;

	// Split on tags, keeping them as their own tokens (the capture group makes
	// String.split() include the matches in the result) so word matching and
	// <mark> insertion only ever touches text tokens, never a tag or its
	// attributes.
	const tokens = html.split(/(<[^>]*>)/);

	const result = tokens
		.map((token) => {
			if (token.startsWith('<') && token.endsWith('>')) return token;

			let text = token;
			for (const word of words) {
				if (text.includes(word)) {
					matched = true;
					text = text.split(word).join(`<mark>${escapeHtml(word)}</mark>`);
				}
			}
			return text;
		})
		.join('');

	return matched ? { html: result, matched: true } : { html, matched: false };
}

function escapeHtml(value: string): string {
	return value
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#39;');
}
