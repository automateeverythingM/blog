import { collection, config, fields } from '@keystatic/core';
import { mark, wrapper } from '@keystatic/core/content-components';
import { createElement } from 'react';

/**
 * Matches every date format `parseFrontmatterDate` (src/lib/parseFrontmatterDate.ts)
 * accepts: a bare ISO calendar date ('2024-06-01'), a full ISO date-time
 * (optionally with seconds, fractional seconds, and a 'Z' or numeric offset),
 * or the "Mon DD YYYY" format already used by the existing posts (e.g.
 * 'Jul 08 2022'). An empty string is also allowed so the optional
 * `updatedDate` field can be left blank.
 *
 * Keeping the CMS input constrained to this pattern means an editor can't
 * save a value that `parseFrontmatterDate`/`z.date()` would reject when the
 * site is built (which would otherwise break `npm run build`).
 */
export const DATE_PATTERN = {
	regex:
		/^(?:|\d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\d|3[01])(?:T(?:[01]\d|2[0-3]):[0-5]\d(?::[0-5]\d)?(?:\.\d{1,3})?(?:Z|[+-][01]\d:[0-5]\d)?)?|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) (?:0[1-9]|[12]\d|3[01]) \d{4})$/,
	message: 'Use YYYY-MM-DD (optionally with a time), or "Mon DD YYYY", e.g. 2024-06-01 or Jun 01 2024',
};

/**
 * `using-mdx.mdx` uses this Astro component. Keystatic's `fields.mdx` editor
 * can't parse a plain ESM `import` statement (there's no AST case for it), so
 * the component can no longer be imported inside the post itself; instead
 * it's declared here and supplied at render time via the `components` prop on
 * `<Content />` in `src/pages/blog/[...slug].astro`. That keeps the rendered
 * page identical to when the component was locally imported, while making
 * the post's `<HeaderLink>` tag something Keystatic knows how to load and
 * edit.
 */
const headerLinkComponent = wrapper({
	label: 'Header link',
	description: 'A link, as used by using-mdx.mdx. Rendered using src/components/HeaderLink.astro.',
	schema: {
		href: fields.text({ label: 'Href', validation: { isRequired: true } }),
		onclick: fields.text({
			label: 'onclick',
			description: 'Raw HTML onclick attribute, e.g. alert(\'clicked!\')',
		}),
	},
});

/**
 * A generic 1x1 placeholder icon. Keystatic requires `fields.mdx`'s "mark"
 * components (see `htmlMark` below) to have an icon for its toolbar, but
 * none of ours need a distinctive one to be usable.
 */
const placeholderIcon = createElement('svg', { viewBox: '0 0 1 1', 'aria-hidden': true });

/**
 * A plain inline HTML tag used only for text styling (no attributes), with
 * no equivalent Markdown syntax. `markdown-style-guide.mdx` uses several of
 * these (`<abbr>`, `<sub>`, `<sup>`, `<kbd>`, `<mark>`) to demonstrate them.
 * Keystatic's `fields.mdx` editor has no built-in support for them, and
 * errors on any JSX tag that isn't declared as a "component" (see
 * `postsContentComponents` below), so each one needs an explicit `mark()`
 * declaration to be loadable.
 */
function htmlMark(
	tag: Extract<Parameters<typeof mark>[0]['tag'], string>,
	schema: Parameters<typeof mark>[0]['schema'] = {},
) {
	return mark({ label: tag, icon: placeholderIcon, tag, schema });
}

/**
 * The components available to the "Posts" collection's `content` field.
 * Exported so keystatic.config.test.ts can exercise the *real* MDX parser
 * (which Keystatic's public entry point stubs out outside of a browser)
 * against these exact component definitions, to confirm every post -
 * including using-mdx.mdx's <HeaderLink> and markdown-style-guide.mdx's
 * inline HTML tags - actually loads in the editor.
 */
export const postsContentComponents = {
	HeaderLink: headerLinkComponent,
	// `<abbr title="...">` (used by markdown-style-guide.mdx) carries a "title" attribute.
	abbr: htmlMark('abbr', { title: fields.text({ label: 'Title' }) }),
	sub: htmlMark('sub'),
	sup: htmlMark('sup'),
	kbd: htmlMark('kbd'),
	mark: htmlMark('mark'),
	// `<cite>` is used inline, wrapping plain text, exactly like the marks
	// above - but `mark()`'s `tag` option doesn't include "cite", so this
	// falls back to the closest generic tag ("span"). That only affects
	// round-tripping through the Keystatic editor (it would save this mark
	// back out as `<span>` instead of `<cite>`); loading and rendering the
	// existing file are unaffected.
	cite: mark({ label: 'cite', icon: placeholderIcon, tag: 'span', schema: {} }),
};

/**
 * The "Posts" collection over src/content/blog. Its fields cover every field
 * of the blog schema in src/content.config.ts (see keystatic.config.test.ts).
 */
export const postsCollection = collection({
	label: 'Posts',
	slugField: 'title',
	path: 'src/content/blog/*',
	format: { contentField: 'content' },
	schema: {
		title: fields.slug({ name: { label: 'Title', validation: { isRequired: true } } }),
		description: fields.text({
			label: 'Description',
			multiline: true,
			validation: { isRequired: true },
		}),
		pubDate: fields.text({
			label: 'Publish Date',
			description: DATE_PATTERN.message,
			validation: { isRequired: true, pattern: DATE_PATTERN },
		}),
		updatedDate: fields.text({
			label: 'Updated Date',
			description: DATE_PATTERN.message,
			validation: { pattern: DATE_PATTERN },
		}),
		heroImage: fields.image({
			label: 'Hero Image',
			directory: 'src/assets',
			publicPath: '../../assets/',
		}),
		content: fields.mdx({
			label: 'Content',
			components: postsContentComponents,
		}),
	},
});

// `import.meta.env` is only ever set when this file is loaded through Astro's
// Vite pipeline (dev server or build); it's undefined when a plain Node
// script (e.g. this file's own test) imports this module directly. Default
// to local storage in that case, same as the dev server.
const isDev = import.meta.env?.DEV ?? true;

export default config({
	ui: {
		brand: { name: 'Blog' },
	},
	storage: isDev
		? { kind: 'local' }
		: {
				kind: 'github',
				// The GitHub App/OAuth login for this repo is configured by hand,
				// outside of source control; nothing secret is needed here.
				repo: 'automateeverythingM/blog',
			},
	collections: {
		posts: postsCollection,
	},
});
