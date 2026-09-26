// @ts-check

import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';
import keystatic from '@keystatic/astro';
import { defineConfig, fontProviders } from 'astro/config';
import { shouldEnableVercelWebAnalytics } from './src/lib/vercelWebAnalytics.ts';

// https://astro.build/config
export default defineConfig({
	site: 'https://example.com',
	// The site itself stays static (prerendered at build time). The Vercel
	// adapter only turns on server rendering for the routes Keystatic injects
	// for its browser editor at /keystatic (and its /api/keystatic backend),
	// which opt into `prerender: false` themselves; every other route keeps
	// prerendering as before.
	adapter: vercel({
		// Vercel Web Analytics: a cookie-free page view counter served from
		// Vercel's own edge, enabled here via the adapter's built-in option
		// rather than the @vercel/analytics package. It's turned off while
		// running the dev server (see shouldEnableVercelWebAnalytics) so local
		// page loads never get counted as visits; flipping it on in the
		// Vercel dashboard is a separate, manual step.
		webAnalytics: { enabled: shouldEnableVercelWebAnalytics() },
	}),
	// `react()` must come before `keystatic()`: Keystatic's admin UI is a React
	// app and relies on the React integration being registered first.
	integrations: [mdx(), sitemap(), react(), keystatic()],
	fonts: [
		{
			provider: fontProviders.local(),
			name: 'Atkinson',
			cssVariable: '--font-atkinson',
			fallbacks: ['sans-serif'],
			options: {
				variants: [
					{
						src: ['./src/assets/fonts/atkinson-regular.woff'],
						weight: 400,
						style: 'normal',
						display: 'swap',
					},
					{
						src: ['./src/assets/fonts/atkinson-bold.woff'],
						weight: 700,
						style: 'normal',
						display: 'swap',
					},
				],
			},
		},
	],
});
