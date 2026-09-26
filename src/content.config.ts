import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { parseFrontmatterDate } from './lib/parseFrontmatterDate.ts';

const blog = defineCollection({
	// Load Markdown and MDX files in the `src/content/blog/` directory.
	loader: glob({ base: './src/content/blog', pattern: '**/*.{md,mdx}' }),
	// Type-check frontmatter using a schema
	schema: ({ image }) =>
		z.object({
			title: z.string(),
			description: z.string(),
			// Transform string to Date object. Unlike `z.coerce.date()`, date-only
			// values are treated as UTC midnight rather than local midnight, so the
			// site always shows the exact day written in the frontmatter.
			pubDate: z.preprocess(parseFrontmatterDate, z.date()),
			updatedDate: z.preprocess(parseFrontmatterDate, z.date()).optional(),
			heroImage: z.optional(image()),
			// Hides the post from the built site (see src/lib/isPostPublished.ts)
			// until this is unchecked.
			draft: z.boolean().default(false),
			// Shown on the post page, each linking to /tags/<slug>/ (see
			// src/lib/tagSlug.ts). Optional; a post can have no tags.
			tags: z.array(z.string()).default([]),
		}),
});

export const collections = { blog };
