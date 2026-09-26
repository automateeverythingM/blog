/** Estimated reading time for a post body, in whole minutes. Assumes 200 words per minute, rounded up, minimum 1. */
export function getReadingTimeMinutes(text: string): number {
	const wordCount = text.split(/\s+/).filter((word) => word.length > 0).length;
	return Math.max(1, Math.ceil(wordCount / 200));
}
