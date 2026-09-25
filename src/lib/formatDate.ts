/** A post date as shown on the site, e.g. "Sep 25, 2026". Uses UTC, because frontmatter dates are UTC midnight. */
export function formatDate(date: Date): string {
	return date.toLocaleDateString('en-us', {
		year: 'numeric',
		month: 'short',
		day: 'numeric',
		timeZone: 'UTC',
	});
}
