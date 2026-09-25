import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { parseFrontmatterDate } from './lib/parseDate.ts';

// Parse frontmatter date strings so the calendar day shown on the site always matches what's
// written, regardless of the server's time zone. See src/lib/parseDate.ts for details.
const frontmatterDate = z.preprocess((value) => parseFrontmatterDate(value), z.date());

const blog = defineCollection({
	// Load Markdown and MDX files in the `src/content/blog/` directory.
	loader: glob({ base: './src/content/blog', pattern: '**/*.{md,mdx}' }),
	// Type-check frontmatter using a schema
	schema: ({ image }) =>
		z.object({
			title: z.string(),
			description: z.string(),
			// Transform string to Date object
			pubDate: frontmatterDate,
			updatedDate: frontmatterDate.optional(),
			heroImage: z.optional(image()),
		}),
});

export const collections = { blog };
