import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';
import keystaticConfig, {
	DATE_PATTERN,
	postsCollection,
	postsContentComponents,
} from './keystatic.config.ts';
import { parseFrontmatterDate } from './src/lib/parseFrontmatterDate.ts';

const BLOG_DIR = path.resolve(import.meta.dirname, 'src/content/blog');
const BLOG_SCHEMA_FIELDS = ['title', 'description', 'pubDate', 'updatedDate', 'heroImage', 'draft'];

function blogPostFiles() {
	return fs.readdirSync(BLOG_DIR).filter((file) => file.endsWith('.mdx'));
}

/** Splits a post file into its frontmatter block and its body, the way Keystatic itself does. */
function splitFrontmatter(data: Buffer) {
	const text = data.toString('utf8');
	const match = text.match(/^---(?:\r?\n([^]*?))?\r?\n---\r?\n?/);
	assert.ok(match, 'expected the post to start with a frontmatter block');
	return {
		frontmatter: match[1] ?? '',
		body: data.subarray(Buffer.byteLength(match[0], 'utf8')),
	};
}

test('the editor is branded "Blog" instead of the default "Keystatic"', () => {
	assert.equal(keystaticConfig.ui?.brand?.name, 'Blog');
});

test('the "Posts" collection has a field for every field of the blog schema', () => {
	for (const key of BLOG_SCHEMA_FIELDS) {
		assert.ok(key in postsCollection.schema, `missing a field for "${key}"`);
	}
	// Plus one more field for the post body itself.
	assert.ok('content' in postsCollection.schema, 'missing a field for the post body');
	assert.equal(Object.keys(postsCollection.schema).length, BLOG_SCHEMA_FIELDS.length + 1);
});

test('description is a required, multiline text field, per the ticket', () => {
	const description = postsCollection.schema.description;
	// `Input` normally takes live editor props (value/onChange/...); passing
	// none is enough here since we only want to inspect what it renders with.
	const element = (description.Input as (props: object) => { props: { multiline: boolean } })({});
	assert.equal(element.props.multiline, true);
	assert.throws(() => description.validate('', undefined));
});

test('pubDate is required, matching the blog schema', () => {
	assert.throws(() => postsCollection.schema.pubDate.validate('', undefined));
});

test('updatedDate is optional, matching the blog schema', () => {
	assert.doesNotThrow(() => postsCollection.schema.updatedDate.validate('', undefined));
});

test('heroImage is optional, matching the blog schema', () => {
	assert.doesNotThrow(() => postsCollection.schema.heroImage.validate(null));
});

test('draft is a checkbox that defaults to false, matching the blog schema', () => {
	const draft = postsCollection.schema.draft;
	assert.equal(draft.defaultValue(), false);
	assert.doesNotThrow(() => draft.validate(false));
	assert.doesNotThrow(() => draft.validate(true));
});

test('the content field stores the post body as a single .mdx file', () => {
	assert.equal(postsCollection.schema.content.contentExtension, '.mdx');
});

test('DATE_PATTERN accepts every pubDate/updatedDate already used in src/content/blog', () => {
	const files = blogPostFiles();
	assert.ok(files.length > 0, 'expected at least one post');
	for (const file of files) {
		const { frontmatter } = splitFrontmatter(fs.readFileSync(path.join(BLOG_DIR, file)));
		for (const key of ['pubDate', 'updatedDate']) {
			const value = frontmatter.match(new RegExp(`^${key}: '([^']*)'`, 'm'))?.[1] ?? '';
			assert.match(
				value,
				DATE_PATTERN.regex,
				`${file}'s ${key} (${JSON.stringify(value)}) should match DATE_PATTERN`,
			);
		}
	}
});

test('DATE_PATTERN only accepts values parseFrontmatterDate turns into a valid date', () => {
	for (const value of [
		'2024-06-01',
		'2024-06-01T10:00:00Z',
		'2024-06-01T10:00:00+02:00',
		'2024-06-01T10:00:00.123Z',
		'Jul 08 2022',
	]) {
		assert.match(value, DATE_PATTERN.regex);
		assert.ok(
			!Number.isNaN(parseFrontmatterDate(value).getTime()),
			`${value} should be a valid date`,
		);
	}
	// An empty string is allowed (for the optional updatedDate field being left blank).
	assert.match('', DATE_PATTERN.regex);
});

test('DATE_PATTERN rejects values that are not a supported date format', () => {
	for (const value of ['not-a-date', '2024/06/01', '06-01-2024', 'tomorrow', 'Jul 8 2022']) {
		assert.doesNotMatch(value, DATE_PATTERN.regex);
	}
});

test("every post in src/content/blog, including using-mdx.mdx, parses with the collection's content field", async () => {
	// Keystatic's public entry point stubs out the real MDX-to-editor-state
	// parser when it's not bundled for a browser (see the "this is used in
	// react-server environments to avoid bundling UI when the reader API is
	// used" comment in @keystatic/core's dist/index-*.node.js): calling
	// `fields.mdx(...).parse` through the normal `@keystatic/core` import
	// throws "unexpected call to function that shouldn't be called in React
	// server component environment" instead of actually parsing anything.
	//
	// To genuinely exercise the parser the Keystatic browser UI runs - and
	// catch things it can't load, such as a post using a component that isn't
	// declared in `postsContentComponents` (as happened with using-mdx.mdx's
	// <HeaderLink> before it was added there) - this test reaches for the
	// browser bundle file directly, passing it the exact same
	// `postsContentComponents` the real collection is configured with.
	const coreBrowserBundlePath = path.resolve(
		import.meta.dirname,
		'node_modules/@keystatic/core/dist/keystatic-core.js',
	);
	const { fields: realFields } = await import(coreBrowserBundlePath);
	const realContentField = realFields.mdx({ label: 'Content', components: postsContentComponents });

	const files = blogPostFiles();
	assert.ok(files.includes('using-mdx.mdx'), 'expected using-mdx.mdx to be one of the posts');

	for (const file of files) {
		const { body } = splitFrontmatter(fs.readFileSync(path.join(BLOG_DIR, file)));
		assert.doesNotThrow(
			() =>
				realContentField.parse(undefined, {
					content: body,
					other: new Map(),
					external: new Map(),
					slug: undefined,
				}),
			`${file} failed to parse in the Keystatic editor`,
		);
	}
});

test('using-mdx.mdx\'s <HeaderLink> parses into the declared "HeaderLink" component with its attributes', async () => {
	const coreBrowserBundlePath = path.resolve(
		import.meta.dirname,
		'node_modules/@keystatic/core/dist/keystatic-core.js',
	);
	const { fields: realFields } = await import(coreBrowserBundlePath);
	const realContentField = realFields.mdx({ label: 'Content', components: postsContentComponents });

	const { body } = splitFrontmatter(fs.readFileSync(path.join(BLOG_DIR, 'using-mdx.mdx')));
	const parsed = realContentField.parse(undefined, {
		content: body,
		other: new Map(),
		external: new Map(),
		slug: undefined,
	});
	const nodes: { type: string; attrs?: Record<string, unknown> }[] = parsed.doc.toJSON().content;
	const headerLink = nodes.find((node) => node.type === 'HeaderLink');
	assert.ok(headerLink, 'expected a HeaderLink node in the parsed document');
	const props = (headerLink!.attrs as { props: { value: Record<string, unknown> } }).props.value;
	assert.deepEqual(props, { href: '#', onclick: "alert('clicked!')" });
});
