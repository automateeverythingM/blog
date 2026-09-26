/**
 * Parses a frontmatter date value, the way `z.coerce.date()` does, except that
 * date-only values (no time-of-day or time zone, e.g. "Jun 01 2024" or
 * "2024-06-01") are treated as UTC midnight instead of local midnight.
 *
 * Without this, a date-only value parses as *local* midnight, so on a server
 * east of UTC (e.g. Asia/Tokyo) it lands on the previous UTC day, and
 * `formatDate` — which always renders in UTC — shows a day earlier than what's
 * written in the frontmatter.
 *
 * Values that already carry a time-of-day (and therefore, optionally, a time
 * zone) are left to `new Date()` as-is, so their exact instant is preserved.
 */
export function parseFrontmatterDate(value: unknown): Date {
	if (typeof value === 'string' && !/\d{1,2}:\d{2}/.test(value)) {
		// No time-of-day component (a "HH:MM" somewhere in the string): treat as a
		// plain calendar date, at UTC midnight.
		return new Date(`${value} UTC`);
	}
	// Date instances, numbers (epoch timestamps), and full date-time strings all
	// parse the same way `z.coerce.date()` (i.e. plain `new Date()`) handles them.
	return new Date(value as string | number | Date);
}
