export namespace YarnPkg {
	export interface PackageJson {
		_id: Record<string, string>;
		_rev: string;
		'dist-tags': DistTags;
		author?: Author;
		bugs: Record<'url', string>;
		description?: string;
		homepage: string;
		keywords: string[];
		license: string;
		maintainers: Maintainer[];
		name: string;
		readme: string;
		readmeFilename: string;
		repository: Repository;
		time?: Record<string, Date>;
		versions: Record<string, VersionInfo>;
	}

	export interface Author {
		name: string;
		url?: string;
	}

	export interface DistTags extends Record<string, unknown> {
		latest: string;
	}

	export interface Maintainer {
		name: string;
		email: string;
		url?: string;
	}

	export interface Repository {
		type: RepositoryType;
		url: string;
	}

	export enum RepositoryType {
		Git = 'git',
		Svn = 'svn'
	}

	interface VersionInfo {
		name: string;
		description: string;
		author: Author;
		version: string;
		main: string;
		license: string;
		homepage: string;
		engines: Record<string, string>;
		repository: Repository;
		bugs: Record<'url', string>;
		keywords: string[];
		publishConfig: Record<string, string>;
		gitHead: string;
		dist: Record<string, string>;
		maintainers: Maintainer[];
		directories: Record<string, string>;
		dependencies?: Record<string, string>;
		deprecated?: string;
	}
}
