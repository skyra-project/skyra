import { FT, T } from '#lib/types';
import { LanguageHelpDisplayOptions } from '#lib/i18n/LanguageHelp';

export const AnimeDescription = T<string>('commands/anime:animeDescription');
export const AnimeExtended = T<LanguageHelpDisplayOptions>('commands/anime:animeExtended');
export const MangaDescription = T<string>('commands/anime:mangaDescription');
export const MangaExtended = T<LanguageHelpDisplayOptions>('commands/anime:mangaExtended');
export const WaifuDescription = T<string>('commands/anime:waifuDescription');
export const WaifuExtended = T<LanguageHelpDisplayOptions>('commands/anime:waifuExtended');
export const AnimeTypes = T<{
	tv: string;
	movie: string;
	ova: string;
	special: string;
	[index: string]: string;
}>('commands/anime:animeTypes');
export const AnimeInvalidChoice = T<string>('commands/anime:animeInvalidChoice');
export const AnimeOutputDescription = FT<{ englishTitle: string; japaneseTitle: string; canonicalTitle: string; synopsis: string }, string>(
	'commands/anime:animeOutputDescription'
);
export const AnimeNoSynopsis = T<string>('commands/anime:animeNoSynopsis');
export const AnimeEmbedData = T<{
	type: string;
	score: string;
	episodes: string;
	episodeLength: string;
	ageRating: string;
	firstAirDate: string;
	watchIt: string;
	stillAiring: string;
}>('commands/anime:animeEmbedData');
export const MangaOutputDescription = FT<{ englishTitle: string; japaneseTitle: string; canonicalTitle: string; synopsis: string }, string>(
	'commands/anime:mangaOutputDescription'
);
export const MangaEmbedData = T<{
	type: string;
	score: string;
	ageRating: string;
	firstPublishDate: string;
	readIt: string;
	none: string;
}>('commands/anime:mangaEmbedData');
export const MangaTypes = T<{
	manga: string;
	novel: string;
	manhwa: string;
	oneShot: string;
	special: string;
	[index: string]: string;
}>('commands/anime:mangaTypes');
export const WaifuFooter = T<string>('commands/anime:waifuFooter');
