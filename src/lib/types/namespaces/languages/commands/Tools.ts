import { FT, T } from '#lib/types';
import { LanguageHelpDisplayOptions } from '#utils/LanguageHelp';
import { Guild, GuildMember, User } from 'discord.js';

export const WikipediaNotfound = T<string>('commandWikipediaNotfound');
export const YoutubeNotfound = T<string>('commandYoutubeNotfound');
export const YoutubeIndexNotfound = T<string>('commandYoutubeIndexNotfound');
export const DefineDescription = T<string>('commandDefineDescription');
export const DefineExtended = T<LanguageHelpDisplayOptions>('commandDefineExtended');
export const DefineNotfound = T<string>('commandDefineNotfound');
export const DefinePronounciation = T<string>('commandDefinePronounciation');
export const DefineUnknown = T<string>('commandDefineUnknown');
export const AvatarDescription = T<string>('commandAvatarDescription');
export const AvatarExtended = T<LanguageHelpDisplayOptions>('commandAvatarExtended');
export const ColorDescription = T<string>('commandColorDescription');
export const ColorExtended = T<LanguageHelpDisplayOptions>('commandColorExtended');
export const ContentDescription = T<string>('commandContentDescription');
export const ContentExtended = T<LanguageHelpDisplayOptions>('commandContentExtended');
export const EmojiDescription = T<string>('commandEmojiDescription');
export const EmojiExtended = T<LanguageHelpDisplayOptions>('commandEmojiExtended');
export const CountryDescription = T<string>('commandCountryDescription');
export const CountryExtended = T<LanguageHelpDisplayOptions>('commandCountryExtended');
export const CountryTitles = T<{
	OVERVIEW: string;
	LANGUAGES: string;
	OTHER: string;
}>('commandCountryTitles');
export const CountryFields = T<{
	overview: {
		officialName: string;
		capital: string;
		population: string;
	};
	other: {
		demonym: string;
		area: string;
		currencies: string;
	};
}>('commandCountryFields');
export const EshopDescription = T<string>('commandEshopDescription');
export const EshopExtended = T<LanguageHelpDisplayOptions>('commandEshopExtended');
export const EshopNotInDatabase = T<string>('commandEshopNotInDatabase');
export const EshopTitles = T<{
	price: string;
	availability: string;
	releaseDate: string;
	numberOfPlayers: string;
	platform: string;
	categories: string;
	noCategories: string;
	nsuid: 'NSUID';
	esrb: 'ESRB';
}>('commandEshopTitles');
export const EshopPricePaid = FT<{ price: number }, string>('commandEshopPricePaid');
export const EshopPriceFree = T<string>('commandEshopPriceFree');
export const HoroscopeDescription = T<string>('commandHoroscopeDescription');
export const HoroscopeExtended = T<LanguageHelpDisplayOptions>('commandHoroscopeExtended');
export const HoroscopeInvalidSunsign = FT<{ sign: string; maybe: string }, string>('commandHoroscopeInvalidSunsign');
export const HoroscopeTitles = FT<
	{
		sign: string;
		intensity: string;
		keywords: readonly string[];
		mood: string;
		rating: string;
	},
	{
		dailyHoroscope: string;
		metadataTitle: string;
		metadata: readonly string[];
	}
>('commandHoroscopeTitles');
export const IgdbDescription = T<string>('commandIgdbDescription');
export const IgdbExtended = T<LanguageHelpDisplayOptions>('commandIgdbExtended');
export const IgdbTitles = T<{
	userScore: string;
	ageRating: string;
	releaseDate: string;
	genres: string;
	developers: string;
	platform: string;
}>('commandIgdbTitles');
export const IgdbData = T<{
	noDevelopers: string;
	noPlatforms: string;
	noReleaseDate: string;
	noRating: string;
	noSummary: string;
	noAgeRatings: string;
	noGenres: string;
}>('commandIgdbData');
export const ItunesDescription = T<string>('commandItunesDescription');
export const ItunesExtended = T<LanguageHelpDisplayOptions>('commandItunesExtended');
export const ItunesTitles = T<{
	artist: string;
	collection: string;
	collectionPrice: string;
	trackPrice: string;
	trackReleaseDate: string;
	numberOfTracksInCollection: string;
	primaryGenre: string;
	preview: string;
	previewLabel: string;
}>('commandItunesTitles');
export const MoviesDescription = T<string>('commandMoviesDescription');
export const MoviesExtended = T<LanguageHelpDisplayOptions>('commandMoviesExtended');
export const MoviesTitles = T<{
	runtime: string;
	userScore: string;
	status: string;
	releaseDate: string;
	imdbPage: string;
	homePage: string;
	collection: string;
	genres: string;
}>('commandMoviesTitles');
export const MoviesData = T<{
	variableRuntime: string;
	movieInProduction: string;
	linkClickHere: string;
	none: string;
	notPartOfCollection: string;
	noGenres: string;
}>('commandMoviesData');
export const ShowsDescription = T<string>('commandShowsDescription');
export const ShowsExtended = T<LanguageHelpDisplayOptions>('commandShowsExtended');
export const ShowsTitles = T<{
	episodeRuntime: string;
	userScore: string;
	status: string;
	firstAirDate: string;
	genres: string;
}>('commandShowsTitles');
export const ShowsData = T<{
	variableRuntime: string;
	unknownUserScore: string;
	noGenres: string;
}>('commandShowsData');
export const DuckDuckGoDescription = T<string>('commandDuckDuckGoDescription');
export const DuckDuckGoExtended = T<LanguageHelpDisplayOptions>('commandDuckDuckGoExtended');
export const PriceDescription = T<string>('commandPriceDescription');
export const PriceExtended = T<LanguageHelpDisplayOptions>('commandPriceExtended');
export const QuoteDescription = T<string>('commandQuoteDescription');
export const QuoteExtended = T<LanguageHelpDisplayOptions>('commandQuoteExtended');
export const PollDescription = T<string>('commandPollDescription');
export const PollExtended = T<LanguageHelpDisplayOptions>('commandPollExtended');
export const PollReactionLimit = T<string>('commandPollReactionLimit');
export const VoteDescription = T<string>('commandVoteDescription');
export const VoteExtended = T<LanguageHelpDisplayOptions>('commandVoteExtended');
export const TopInvitesDescription = T<string>('commandTopInvitesDescription');
export const TopInvitesExtended = T<LanguageHelpDisplayOptions>('commandTopInvitesExtended');
export const TopInvitesNoInvites = T<string>('commandTopInvitesNoInvites');
export const TopInvitesTop10InvitesFor = FT<{ guild: Guild }, string>('commandTopInvitesTop10InvitesFor');
export const TopInvitesEmbedData = T<{
	channel: string;
	link: string;
	createdAt: string;
	createdAtUnknown: string;
	expiresIn: string;
	neverExpress: string;
	temporary: string;
	uses: string;
}>('commandTopInvitesEmbedData');
export const UrbanDescription = T<string>('commandUrbanDescription');
export const UrbanExtended = T<LanguageHelpDisplayOptions>('commandUrbanExtended');
export const WhoisDescription = T<string>('commandWhoisDescription');
export const WhoisExtended = T<LanguageHelpDisplayOptions>('commandWhoisExtended');
export const AvatarNone = T<string>('commandAvatarNone');
export const Color = FT<{ hex: string; rgb: string; hsl: string }, string[]>('commandColor');
export const EmojiCustom = FT<{ emoji: string; id: string }, string[]>('commandEmojiCustom');
export const EmojiTwemoji = FT<{ emoji: string; id: string }, string[]>('commandEmojiTwemoji');
export const EmojiInvalid = T<string>('commandEmojiInvalid');
export const EmojiTooLarge = FT<{ emoji: string }, string>('commandEmojiTooLarge');
export const EmotesDescription = T<string>('commandEmotesDescription');
export const EmotesExtended = T<LanguageHelpDisplayOptions>('commandEmotesExtended');
export const EmotesTitle = T<string>('commandEmotesTitle');
export const PriceCurrency = FT<{ fromCurrency: string; fromAmount: number; worths: string[] }, string>('commandPriceCurrency');
export const PriceCurrencyNotFound = T<string>('commandPriceCurrencyNotFound');
export const QuoteMessage = T<string>('commandQuoteMessage');
export const DuckDuckGoNotfound = T<string>('commandDuckDuckGoNotfound');
export const DuckDuckGoLookalso = T<string>('commandDuckDuckGoLookalso');
export const UrbanNotFound = T<string>('commandUrbanNotFound');
export const UrbanIndexNotfound = T<string>('commandUrbanIndexNotfound');
export const WhoisMemberTitles = T<{
	joined: string;
	createdAt: string;
}>('commandWhoisMemberTitles');
export const WhoisMemberFields = FT<
	{
		member: GuildMember;
	},
	{
		joinedUnknown: string;
		joinedWithTimestamp: string;
		createdAt: string;
		footer: string;
	}
>('commandWhoisMemberFields');
export const WhoisMemberRoles = FT<{ count: number }, string>('commandWhoisMemberRoles');
export const WhoisMemberRolesPlural = FT<{ count: number }, string>('commandWhoisMemberRolesPlural');
export const WhoisMemberPermissions = T<string>('commandWhoisMemberPermissions');
export const WhoisMemberPermissionsAll = T<string>('commandWhoisMemberPermissionsAll');
export const WhoisUserTitles = T<{
	createdAt: string;
}>('commandWhoisUserTitles');
export const WhoisUserFields = FT<
	{
		user: User;
	},
	{
		createdAt: string;
		footer: string;
	}
>('commandWhoisUserFields');
export const WikipediaDescription = T<string>('commandWikipediaDescription');
export const WikipediaExtended = T<LanguageHelpDisplayOptions>('commandWikipediaExtended');
export const YoutubeDescription = T<string>('commandYoutubeDescription');
export const YoutubeExtended = T<LanguageHelpDisplayOptions>('commandYoutubeExtended');
