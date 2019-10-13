export namespace Kitsu {

	export interface Result<A extends Attributes> {
		data: Datum<A>[];
		meta: KitsuMeta;
		links: KitsuLinks;
	}

	export interface Datum<A extends Attributes = Attributes> {
		id: string;
		type: Type;
		links: DatumLinks;
		attributes: Attributes;
		relationships: { [key: string]: Relationship };
	}

	export interface Attributes {
		createdAt: Date;
		updatedAt: Date;
		slug: string;
		synopsis: string;
		coverImageTopOffset: number;
		titles: Titles;
		canonicalTitle: string;
		abbreviatedTitles: string[];
		averageRating: string;
		ratingFrequencies: { [key: string]: string };
		userCount: number;
		favoritesCount: number;
		startDate: Date;
		endDate: Date | null;
		nextRelease: null | string;
		popularityRank: number;
		ratingRank: number;
		ageRating: AgeRating;
		ageRatingGuide: AgeRatingGuide;
		subtype: string;
		status: Status;
		tba: null | string;
		posterImage: PosterImage;
		coverImage: CoverImage | null;
	}

	export interface AnimeAttributes extends Attributes {
		episodeCount: number | null;
		episodeLength: number;
		totalLength: number;
		youtubeVideoID: null | string;
		showType: string;
		nsfw: boolean;
	}

	export interface MangaAttributes extends Attributes {
		chapterCount: number | null;
		volumeCount: number | null;
		serialization: null | string;
		mangaType: string;
	}

	export enum AgeRating {
		PG = 'PG',
	}

	export enum AgeRatingGuide {
		Teens13OrOlder = 'Teens 13 or older',
	}

	export interface CoverImage {
		tiny: string;
		small: string;
		large: string;
		original: string;
		meta: CoverImageMeta;
	}

	export interface CoverImageMeta {
		dimensions: PurpleDimensions;
	}

	export interface PurpleDimensions {
		tiny: Large;
		small: Large;
		large: Large;
	}

	export interface Large {
		width: number | null;
		height: number | null;
	}

	export interface PosterImage {
		tiny: string;
		small: string;
		medium: string;
		large: string;
		original: string;
		meta: PosterImageMeta;
	}

	export interface PosterImageMeta {
		dimensions: FluffyDimensions;
	}

	export interface FluffyDimensions {
		tiny: Large;
		small: Large;
		medium: Large;
		large: Large;
	}

	export enum Status {
		Current = 'current',
		Finished = 'finished',
		Tba = 'tba'
	}

	export interface Titles {
		en?: string;
		en_jp?: string;
		en_us?: string;
		ja_jp?: string;
	}

	export interface DatumLinks {
		self: string;
	}

	export interface Relationship {
		links: RelationshipLinks;
	}

	export interface RelationshipLinks {
		self: string;
		related: string;
	}

	export enum Type {
		Anime = 'anime',
		Manga = 'manga'
	}

	export interface KitsuLinks {
		first: string;
		next: string;
		last: string;
	}

	export interface KitsuMeta {
		count: number;
	}

}
