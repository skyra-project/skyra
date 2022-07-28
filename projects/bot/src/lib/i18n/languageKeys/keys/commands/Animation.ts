import type { LanguageHelpDisplayOptions } from '#lib/i18n/LanguageHelp';
import { FT, T } from '#lib/types';

export const AniListAnimeDescription = T('commands/animation:aniListAnimeDescription');
export const AniListAnimeExtended = T<LanguageHelpDisplayOptions>('commands/animation:aniListAnimeExtended');
export const AniListAnimeQueryFail = FT<{ search: string }, string>('commands/animation:aniListAnimeQueryFail');
export const AniListMangaDescription = T('commands/animation:aniListMangaDescription');
export const AniListMangaExtended = T<LanguageHelpDisplayOptions>('commands/animation:aniListMangaExtended');
export const AniListMangaQueryFail = FT<{ search: string }, string>('commands/animation:aniListMangaQueryFail');
export const AniListQueryOnlyNsfw = FT<{ search: string }, string>('commands/animation:aniListQueryOnlyNsfw');
export const AniListEmbedTitles = T<{
	adultContent: string;
	countryOfOrigin: string;
	englishName: string;
	episodeLength: string;
	episodes: string;
	chapters: string;
	volumes: string;
	externalLinks: string;
	nativeName: string;
	romajiName: string;
}>('commands/animation:aniListEmbedTitles');
export const KitsuAnimeOutputDescription = FT<{ englishTitle: string; japaneseTitle: string; canonicalTitle: string; synopsis: string }, string>(
	'commands/animation:kitsuAnimeOutputDescription'
);
export const KitsuAnimeTypes = T<{ tv: string; movie: string; ova: string; special: string; [index: string]: string }>(
	'commands/animation:kitsuAnimeTypes'
);
export const KitsuAnimeDescription = T('commands/animation:kitsuAnimeDescription');
export const KitsuAnimeEmbedData = T<{
	type: string;
	score: string;
	episodes: string;
	episodeLength: string;
	ageRating: string;
	firstAirDate: string;
	watchIt: string;
	stillAiring: string;
}>('commands/animation:kitsuAnimeEmbedData');
export const KitsuAnimeExtended = T<LanguageHelpDisplayOptions>('commands/animation:kitsuAnimeExtended');
export const KitsuAnimeNoSynopsis = T('commands/animation:kitsuAnimeNoSynopsis');
export const KitsuMangaDescription = T('commands/animation:kitsuMangaDescription');
export const KitsuMangaEmbedData = T<{ type: string; score: string; ageRating: string; firstPublishDate: string; readIt: string; none: string }>(
	'commands/animation:kitsuMangaEmbedData'
);
export const KitsuMangaExtended = T<LanguageHelpDisplayOptions>('commands/animation:kitsuMangaExtended');
export const KitsuMangaOutputDescription = FT<{ englishTitle: string; japaneseTitle: string; canonicalTitle: string; synopsis: string }, string>(
	'commands/animation:kitsuMangaOutputDescription'
);
export const KitsuMangaTypes = T<{ manga: string; novel: string; manhwa: string; oneShot: string; special: string; [index: string]: string }>(
	'commands/animation:kitsuMangaTypes'
);
export const WaifuDescription = T('commands/animation:waifuDescription');
export const WaifuExtended = T<LanguageHelpDisplayOptions>('commands/animation:waifuExtended');
export const WaifuFooter = T('commands/animation:waifuFooter');
