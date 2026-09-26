export interface GiscusConfig {
	repo: string;
	repoId: string;
	category: string;
	categoryId: string;
}

/**
 * Whether every Giscus setting has been filled in. GISCUS_REPO_ID,
 * GISCUS_CATEGORY and GISCUS_CATEGORY_ID (see src/consts.ts) start out as
 * empty strings and are filled in by hand later, once the giscus.app setup
 * wizard has generated them for the repo; rendering the comment script with
 * any of them missing would produce a broken embed, so the comment box is
 * hidden entirely until all four settings are non-empty.
 */
export function isGiscusConfigured(config: GiscusConfig): boolean {
	return (
		config.repo !== '' && config.repoId !== '' && config.category !== '' && config.categoryId !== ''
	);
}
