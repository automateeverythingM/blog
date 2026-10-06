/**
 * Decides whether a post is "long" enough to show the floating back-to-top
 * button (see BackToTop.astro) - the inline text link at the bottom of the
 * post always shows regardless of length.
 *
 * A post counts as long when scrolling from top to bottom covers more than
 * two screen heights' worth of distance, i.e. the document is taller than
 * twice the viewport. At exactly 2x the floating button stays hidden -
 * "taller than about 2 screen heights" is read as a strict `>`.
 */
export function isLongPost(scrollHeight: number, viewportHeight: number): boolean {
	return scrollHeight > viewportHeight * 2;
}
