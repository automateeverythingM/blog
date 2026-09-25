/** Matches a bare ISO calendar date such as "2024-06-01", with no time-of-day part. */
const ISO_DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

/** Matches strings that carry an explicit time-of-day (e.g. "2024-06-01T05:00:00Z"). */
const HAS_TIME_COMPONENT = /T\d/;

/**
 * Parses a frontmatter date value into a `Date` that represents the calendar day exactly as
 * written, regardless of the server's local time zone.
 *
 * - Bare ISO dates ("2024-06-01") are already parsed as UTC midnight by the `Date` constructor,
 *   so they're passed through unchanged.
 * - Strings with an explicit time-of-day or offset ("2024-06-01T05:00:00Z") represent a specific
 *   instant; they're also passed through unchanged, since `formatDate` renders in UTC regardless
 *   of the server's time zone.
 * - Other date-only formats (e.g. "Jun 01 2024") are parsed by the `Date` constructor as local
 *   midnight, which shifts to a different UTC calendar day depending on the server's time zone.
 *   For these, the year/month/day are read back out in local time and re-anchored to UTC
 *   midnight, so the resulting day always matches what was written.
 *
 * Invalid input produces an invalid `Date` (`getTime()` is `NaN`), matching the behaviour of the
 * `Date` constructor so callers (e.g. a zod schema) can detect and reject it.
 */
export function parseFrontmatterDate(value: unknown): Date {
	if (value instanceof Date) {
		return value;
	}
	if (typeof value !== 'string') {
		return new Date(value as never);
	}

	const trimmed = value.trim();
	if (HAS_TIME_COMPONENT.test(trimmed) || ISO_DATE_ONLY.test(trimmed)) {
		return new Date(trimmed);
	}

	const local = new Date(trimmed);
	if (isNaN(local.getTime())) {
		return local;
	}
	return new Date(Date.UTC(local.getFullYear(), local.getMonth(), local.getDate()));
}
