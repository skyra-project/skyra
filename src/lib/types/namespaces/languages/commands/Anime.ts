import { FT, T } from '#lib/types/index';
import { LanguageHelpDisplayOptions } from '#utils/LanguageHelp';

export const AnimeDescription = T<string>('commandAnimeDescription');
export const AnimeExtended = T<LanguageHelpDisplayOptions>('commandAnimeExtended');
export const MangaDescription = T<string>('commandMangaDescription');
export const MangaExtended = T<LanguageHelpDisplayOptions>('commandMangaExtended');
export const WaifuDescription = T<string>('commandWaifuDescription');
export const WaifuExtended = T<LanguageHelpDisplayOptions>('commandWaifuExtended');
export const AnimeTypes = T<{
	tv: string;
	movie: string;
	ova: string;
	special: string;
	[index: string]: string;
}>('commandAnimeTypes');
export const AnimeInvalidChoice = T<string>('commandAnimeInvalidChoice');
export const AnimeOutputDescription = FT<{ englishTitle: string; japaneseTitle: string; canonicalTitle: string; synopsis: string }, string>(
	'commandAnimeOutputDescription'
);
export const AnimeNoSynopsis = T<string>('commandAnimeNoSynopsis');
export const AnimeEmbedData = T<{
	type: string;
	score: string;
	episodes: string;
	episodeLength: string;
	ageRating: string;
	firstAirDate: string;
	watchIt: string;
	stillAiring: string;
}>('commandAnimeEmbedData');
export const MangaOutputDescription = FT<{ englishTitle: string; japaneseTitle: string; canonicalTitle: string; synopsis: string }, string>(
	'commandMangaOutputDescription'
);
export const MangaEmbedData = T<{
	type: string;
	score: string;
	ageRating: string;
	firstPublishDate: string;
	readIt: string;
	none: string;
}>('commandMangaEmbedData');
export const MangaTypes = T<{
	manga: string;
	novel: string;
	manhwa: string;
	oneShot: string;
	special: string;
	[index: string]: string;
}>('commandMangaTypes');
export const WaifuFooter = T<string>('commandWaifuFooter');
