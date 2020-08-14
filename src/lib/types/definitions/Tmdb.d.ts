export namespace Tmdb {
	export interface TmdbCommon {
		id: number;
		adult: boolean;
		backdrop_path: string;
		original_language: string;
		original_title: string;
		overview: string;
		popularity: number;
		poster_path: string;
		release_date: string;
		title: string;
		video: boolean;
		vote_average?: number;
		vote_count?: number;
	}

	export interface TmdbMovieList {
		page: number;
		total_pages: number;
		total_results: number;
		results: (TmdbCommon & { genre_ids: number[] })[];
	}

	export interface TmdbMovie extends TmdbCommon {
		budget: number;
		revenue: number;
		tagline: string;
		status: string;
		homepage?: string;
		runtime?: number;
		imdb_id?: number;
		genres: { id: number; name: string }[];
		spoken_language: { iso_639_1: number; name: string }[];
		production_countries?: { iso_3166_1: string; name: string }[];
		belongs_to_collection?: { id: number; name: string; poster_path: string };
		production_companies?: { id: number; logo_path: string | null; name: string; origin_country: string }[];
	}

	export interface TmdbSeriesList extends TmdbMovieList {
		results: (TmdbCommon & {
			genre_ids: number[];
			first_air_date: string;
			origin_country: string[];
		})[];
	}

	export interface TmdbSerieEpisode {
		id: number;
		air_date: string;
		episode_number: number;
		name: string;
		overview: string;
		production_code: string;
		season_number: number;
		show_id: number;
		still_path: string;
		vote_average: number;
		vote_count: number;
	}

	export interface TmdbSerie extends TmdbCommon {
		created_by: string[];
		episode_run_time: number[];
		first_air_date: string;
		in_production: boolean;
		languages: string[];
		status: string;
		type: string;
		name: string;
		number_of_episodes: number;
		number_of_seasons: number;
		origin_country: string[];
		last_air_date: string;
		last_episode_to_air: TmdbSerieEpisode;
		next_episode_to_air: TmdbSerieEpisode | null;
		homepage?: string;
		seasons: {
			id: number;
			air_date: string;
			episode_count: number;
			name: string;
			overview: string;
			poster_path: string;
			season_number: number;
		}[];
		genres: { id: number; name: string }[];
		networks: { id: number; logo_path: string; name: string; origin_country: string }[];
		production_companies?: { id: number; logo_path: string | null; name: string; origin_country: string }[];
	}
}
