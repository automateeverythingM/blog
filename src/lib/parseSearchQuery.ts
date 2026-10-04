/**
 * Splits what a visitor typed in the search box into plain words and tag
 * filters. A word written as `tag:<name>` (e.g. `tag:astro`) narrows the
 * results to posts with that tag; every other word is searched for in the
 * title, description and tags as before (see searchMatch.ts).
 *
 *   "markdown tag:astro" → { words: ['markdown'], tags: ['astro'] }
 */
export type ParsedSearchQuery = {
	words: string[];
	tags: string[];
};

const TAG_PREFIX = 'tag:';

export function parseSearchQuery(query: string): ParsedSearchQuery {
	const words: string[] = [];
	const tags: string[] = [];
	for (const token of query.trim().split(/\s+/).filter(Boolean)) {
		if (token.toLowerCase().startsWith(TAG_PREFIX)) {
			tags.push(token.match(/^tag:(\S+)/i)?.[1] as string);
		} else {
			words.push(token);
		}
	}
	return { words, tags };
}
