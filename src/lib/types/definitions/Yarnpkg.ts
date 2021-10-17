import type { AlgoliaResult } from './AlgoliaSearch';

export namespace YarnPkg {
	export type YarnPkgResult = AlgoliaResult<PackageData>;

	export interface PackageData {
		bin: {
			[key: string]: string;
		};

		changelogFilename: string;

		computedKeywords: string[];

		computedMetadata: unknown;

		created: number;

		dependencies: {
			[key: string]: string;
		};

		dependents: number;

		deprecated: boolean;

		deprecatedReason: string | null;

		description: string;

		devDependencies: {
			[key: string]: string;
		};

		downloadsLast30Days: number;

		downloadsRatio: number;

		gitHead: string;

		githubRepo?: Partial<{
			head: string;
			path: string;
			project: string;
			user: string;
		}>;

		homage: string;

		humanDependents: string;

		humanDownloadsLast30Days: string;

		isDeprecated: boolean;

		jsDelivrHits: number;

		keywords: string[];

		lastCrawl: `${number}${number}${number}${number}-${number}${number}-${number}${number}T${number}${number}:${number}${number}:${number}${number}.${number}${number}${number}Z`;

		lastPublisher: NpmPackageAuthor;

		license: string;

		modified: number;

		moduleTypes: ('esm' | 'cjs')[];

		name: string;

		objectID: string;

		originalAuthor: {
			name: string;
		};

		owner: NpmPackageAuthor;

		owners: NpmPackageAuthor[];

		popular: boolean;

		readme: string;

		repository?: Partial<{
			branch: string;
			head: string;
			host: string;
			path: string;
			project: string;
			type: 'git' | 'svn';
			url: string;
			user: string;
		}>;

		styleTypes: string[];

		tags: {
			[key: string]: string;
		};

		types: {
			ts: string;
		};

		version: string;

		versions: {
			latest: string;
			[key: string]: string;
		};
	}

	export interface NpmPackageAuthor {
		avatar: string;

		email?: string;

		link: string;

		name: string;
	}
}
