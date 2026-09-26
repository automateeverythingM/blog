/**
 * Whether the Vercel adapter's built-in Web Analytics should be turned on.
 *
 * Analytics must only run against real visitors on the deployed site: the
 * local dev server isn't deployed and its page loads aren't real visits, so
 * counting them would skew the numbers for no benefit. Astro's CLI puts the
 * subcommand (`dev`, `build`, `preview`, ...) at `process.argv[2]`, so that's
 * all it takes to tell the dev server apart from every other way the config
 * gets loaded (build, preview, `astro check`, etc.), all of which keep
 * analytics on.
 */
export function shouldEnableVercelWebAnalytics(argv: readonly string[] = process.argv): boolean {
	return argv[2] !== 'dev';
}
