import type { AlgoliaResult } from './AlgoliaSearch';

export namespace Kitsu {
	export type KitsuResult = AlgoliaResult<KitsuHit>;

	export interface KitsuHit {
		abbreviatedTitles: string[];
		ageRating: 'PG' | 'G' | string;
		averageRating: number;
		canonicalTitle: string;
		description?: Description;
		endDate: number;
		episodeCount: number;
		episodeLength: number;
		favoritesCount: number;
		id: number;
		kind: 'anime' | string;
		objectID: string;
		season: 'spring' | 'summer' | 'autumn' | 'winter' | string;
		seasonYear: number;
		slug: string;
		startDate: number;
		subtype: 'TV' | 'movie' | 'special' | string;
		synopsis?: string;
		totalLength: number;
		userCount: number;
		year: number;
		posterImage: KitsuPosterImage;
		titles: Titles;
		_tags: string[];
	}

	export interface KitsuPosterImageDimensions {
		width: number | null;
		height: number | null;
	}

	export interface KitsuPosterImage {
		tiny?: string;
		small?: string;
		medium?: string;
		large?: string;
		original?: string;
		meta: {
			dimensions: {
				large: KitsuPosterImageDimensions;
				medium: KitsuPosterImageDimensions;
				small: KitsuPosterImageDimensions;
				tiny: KitsuPosterImageDimensions;
			};
		};
	}

	export interface Titles {
		en?: string;
		en_jp?: string;
		en_us?: string;
		ja_jp?: string;
	}

	export interface Description {
		en: string;
		en_jp: string;
		en_us: string;
		ja_jp: string;
		[key: string]: string;
	}
}
