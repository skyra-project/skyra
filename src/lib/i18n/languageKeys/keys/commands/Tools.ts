import type { LanguageHelpDisplayOptions } from '#lib/i18n/LanguageHelp';
import { FT, T } from '#lib/types';
import type { Guild, GuildMember, User } from 'discord.js';

export const WikipediaNotFound = T<string>('commands/tools:wikipediaNotfound');
export const YouTubeNotFound = T<string>('commands/tools:youtubeNotfound');
export const DefineDescription = T<string>('commands/tools:defineDescription');
export const DefineExtended = T<LanguageHelpDisplayOptions>('commands/tools:defineExtended');
export const DefineNotFound = T<string>('commands/tools:defineNotfound');
export const DefinePronunciation = T<string>('commands/tools:definePronounciation');
export const DefineUnknown = T<string>('commands/tools:defineUnknown');
export const AvatarDescription = T<string>('commands/tools:avatarDescription');
export const AvatarExtended = T<LanguageHelpDisplayOptions>('commands/tools:avatarExtended');
export const ColorDescription = T<string>('commands/tools:colorDescription');
export const ColorExtended = T<LanguageHelpDisplayOptions>('commands/tools:colorExtended');
export const ContentDescription = T<string>('commands/tools:contentDescription');
export const ContentExtended = T<LanguageHelpDisplayOptions>('commands/tools:contentExtended');
export const EmojiDescription = T<string>('commands/tools:emojiDescription');
export const EmojiExtended = T<LanguageHelpDisplayOptions>('commands/tools:emojiExtended');
export const CountryDescription = T<string>('commands/tools:countryDescription');
export const CountryExtended = T<LanguageHelpDisplayOptions>('commands/tools:countryExtended');
export const CountryTitles = T<{ OVERVIEW: string; LANGUAGES: string; OTHER: string }>('commands/tools:countryTitles');
export const CountryFields = T<{
	overview: { officialName: string; capital: string; population: string };
	other: { demonym: string; area: string; currencies: string };
}>('commands/tools:countryFields');
export const CountryTimezone = T<{ timezone: string[]; count: number }>('commands/tools:countryTimezone');
export const EshopDescription = T<string>('commands/tools:eshopDescription');
export const EshopExtended = T<LanguageHelpDisplayOptions>('commands/tools:eshopExtended');
export const EshopNotInDatabase = T<string>('commands/tools:eshopNotInDatabase');
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
}>('commands/tools:eshopTitles');
export const EshopPricePaid = FT<{ price: number }, string>('commands/tools:eshopPricePaid');
export const EshopPriceFree = T<string>('commands/tools:eshopPriceFree');
export const HoroscopeDescription = T<string>('commands/tools:horoscopeDescription');
export const HoroscopeExtended = T<LanguageHelpDisplayOptions>('commands/tools:horoscopeExtended');
export const HoroscopeInvalidSunsign = FT<{ parameter: string; maybe: string }, string>('commands/tools:horoscopeInvalidSunsign');
export const HoroscopeTitles = FT<
	{ sign: string; intensity: string; keywords: readonly string[]; mood: string; rating: string },
	{ dailyHoroscope: string; metadataTitle: string; metadata: readonly string[] }
>('commands/tools:horoscopeTitles');
export const IgdbDescription = T<string>('commands/tools:igdbDescription');
export const IgdbExtended = T<LanguageHelpDisplayOptions>('commands/tools:igdbExtended');
export const IgdbTitles = T<{
	userScore: string;
	ageRating: string;
	releaseDate: string;
	genres: string;
	developers: string;
	platform: string;
}>('commands/tools:igdbTitles');
export const IgdbData = T<{
	noDevelopers: string;
	noPlatforms: string;
	noReleaseDate: string;
	noRating: string;
	noSummary: string;
	noAgeRatings: string;
	noGenres: string;
}>('commands/tools:igdbData');
export const ITunesDescription = T<string>('commands/tools:itunesDescription');
export const ITunesExtended = T<LanguageHelpDisplayOptions>('commands/tools:itunesExtended');
export const ITunesTitles = T<{
	artist: string;
	collection: string;
	collectionPrice: string;
	trackPrice: string;
	trackReleaseDate: string;
	numberOfTracksInCollection: string;
	primaryGenre: string;
	preview: string;
	previewLabel: string;
}>('commands/tools:itunesTitles');
export const MoviesDescription = T<string>('commands/tools:moviesDescription');
export const MoviesExtended = T<LanguageHelpDisplayOptions>('commands/tools:moviesExtended');
export const MoviesTitles = T<{
	runtime: string;
	userScore: string;
	status: string;
	releaseDate: string;
	imdbPage: string;
	homePage: string;
	collection: string;
	genres: string;
}>('commands/tools:moviesTitles');
export const MoviesData = T<{
	variableRuntime: string;
	movieInProduction: string;
	linkClickHere: string;
	none: string;
	notPartOfCollection: string;
	noGenres: string;
}>('commands/tools:moviesData');
export const ShowsDescription = T<string>('commands/tools:showsDescription');
export const ShowsExtended = T<LanguageHelpDisplayOptions>('commands/tools:showsExtended');
export const ShowsTitles = T<{
	episodeRuntime: string;
	userScore: string;
	status: string;
	firstAirDate: string;
	genres: string;
}>('commands/tools:showsTitles');
export const ShowsData = T<{ variableRuntime: string; unknownUserScore: string; noGenres: string }>('commands/tools:showsData');
export const DuckDuckGoDescription = T<string>('commands/tools:duckDuckGoDescription');
export const DuckDuckGoExtended = T<LanguageHelpDisplayOptions>('commands/tools:duckDuckGoExtended');
export const PriceDescription = T<string>('commands/tools:priceDescription');
export const PriceExtended = T<LanguageHelpDisplayOptions>('commands/tools:priceExtended');
export const QuoteDescription = T<string>('commands/tools:quoteDescription');
export const QuoteExtended = T<LanguageHelpDisplayOptions>('commands/tools:quoteExtended');
export const PollDescription = T<string>('commands/tools:pollDescription');
export const PollExtended = T<LanguageHelpDisplayOptions>('commands/tools:pollExtended');
export const PollReactionLimit = T<string>('commands/tools:pollReactionLimit');
export const VoteDescription = T<string>('commands/tools:voteDescription');
export const VoteExtended = T<LanguageHelpDisplayOptions>('commands/tools:voteExtended');
export const TopInvitesDescription = T<string>('commands/tools:topInvitesDescription');
export const TopInvitesExtended = T<LanguageHelpDisplayOptions>('commands/tools:topInvitesExtended');
export const TopInvitesNoInvites = T<string>('commands/tools:topInvitesNoInvites');
export const TopInvitesTop10InvitesFor = FT<{ guild: Guild }, string>('commands/tools:topInvitesTop10InvitesFor');
export const TopInvitesEmbedData = T<{
	channel: string;
	link: string;
	createdAt: string;
	createdAtUnknown: string;
	expiresIn: string;
	neverExpress: string;
	temporary: string;
	uses: string;
}>('commands/tools:topInvitesEmbedData');
export const UrbanDescription = T<string>('commands/tools:urbanDescription');
export const UrbanExtended = T<LanguageHelpDisplayOptions>('commands/tools:urbanExtended');
export const UrbanNoDefinition = FT<{ parameter: string }, string>('commands/tools:urbanNoDefinition');
export const WhoisDescription = T<string>('commands/tools:whoisDescription');
export const WhoisExtended = T<LanguageHelpDisplayOptions>('commands/tools:whoisExtended');
export const AvatarNone = T<string>('commands/tools:avatarNone');
export const Color = FT<{ hex: string; rgb: string; hsl: string }, string>('commands/tools:color');
export const EmojiCustom = FT<{ emoji: string; id: string }, string>('commands/tools:emojiCustom');
export const EmojiTwemoji = FT<{ emoji: string; id: string }, string>('commands/tools:emojiTwemoji');
export const EmojiInvalid = T<string>('commands/tools:emojiInvalid');
export const EmojiTooLarge = FT<{ emoji: string }, string>('commands/tools:emojiTooLarge');
export const EmotesDescription = T<string>('commands/tools:emotesDescription');
export const EmotesExtended = T<LanguageHelpDisplayOptions>('commands/tools:emotesExtended');
export const EmotesTitle = T<string>('commands/tools:emotesTitle');
export const PriceCurrency = FT<{ fromCurrency: string; fromAmount: number; worths: string[] }, string>('commands/tools:priceCurrency');
export const PriceCurrencyNotFound = T<string>('commands/tools:priceCurrencyNotFound');
export const DuckDuckGoNotFound = T<string>('commands/tools:duckDuckGoNotfound');
export const DuckDuckGoUnknownError = T<string>('commands/tools:duckDuckGoUnknownError');
export const DuckDuckGoLookAlso = T<string>('commands/tools:duckDuckGoLookalso');
export const DuckDuckGoPoweredBy = T<string>('commands/tools:duckDuckGoPoweredBy');
export const WhoisMemberTitles = T<{ joined: string; createdAt: string }>('commands/tools:whoisMemberTitles');
export const WhoisMemberFields = FT<
	{ member: GuildMember; createdTimestampOffset: number; joinedTimestampOffset: number },
	{ joinedUnknown: string; joinedWithTimestamp: string; createdAt: string; footer: string }
>('commands/tools:whoisMemberFields');
export const WhoisMemberRoles = FT<{ count: number }, string>('commands/tools:whoisMemberRoles');
export const WhoisMemberPermissions = T<string>('commands/tools:whoisMemberPermissions');
export const WhoisMemberPermissionsAll = T<string>('commands/tools:whoisMemberPermissionsAll');
export const WhoisUserTitles = T<{
	createdAt: string;
}>('commands/tools:whoisUserTitles');
export const WhoisUserFields = FT<{ user: User; createdTimestampOffset: number }, { createdAt: string; footer: string }>(
	'commands/tools:whoisUserFields'
);
export const WikipediaDescription = T<string>('commands/tools:wikipediaDescription');
export const WikipediaExtended = T<LanguageHelpDisplayOptions>('commands/tools:wikipediaExtended');
export const YouTubeDescription = T<string>('commands/tools:youtubeDescription');
export const YouTubeExtended = T<LanguageHelpDisplayOptions>('commands/tools:youtubeExtended');
