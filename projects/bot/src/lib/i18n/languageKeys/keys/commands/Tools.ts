import type { LanguageHelpDisplayOptions } from '#lib/i18n/LanguageHelp';
import { FT, T } from '#lib/types';
import type { GuildMember, User } from 'discord.js';

export const WikipediaNotFound = T('commands/tools:wikipediaNotfound');
export const YouTubeNotFound = T('commands/tools:youtubeNotfound');
export const DefineDescription = T('commands/tools:defineDescription');
export const DefineExtended = T<LanguageHelpDisplayOptions>('commands/tools:defineExtended');
export const DefineNotFound = T('commands/tools:defineNotfound');
export const DefinePronunciation = T('commands/tools:definePronounciation');
export const DefineUnknown = T('commands/tools:defineUnknown');
export const AvatarDescription = T('commands/tools:avatarDescription');
export const AvatarExtended = T<LanguageHelpDisplayOptions>('commands/tools:avatarExtended');
export const ColorDescription = T('commands/tools:colorDescription');
export const ColorExtended = T<LanguageHelpDisplayOptions>('commands/tools:colorExtended');
export const ContentDescription = T('commands/tools:contentDescription');
export const ContentExtended = T<LanguageHelpDisplayOptions>('commands/tools:contentExtended');
export const ContentEmpty = T('commands/tools:contentEmpty');
export const EmojiDescription = T('commands/tools:emojiDescription');
export const EmojiExtended = T<LanguageHelpDisplayOptions>('commands/tools:emojiExtended');
export const CountryDescription = T('commands/tools:countryDescription');
export const CountryExtended = T<LanguageHelpDisplayOptions>('commands/tools:countryExtended');
export const CountryTitles = T<{ OVERVIEW: string; LANGUAGES: string; OTHER: string }>('commands/tools:countryTitles');
export const CountryFields = T<{
	overview: { officialName: string; capital: string; population: string };
	other: { demonym: string; area: string; currencies: string };
}>('commands/tools:countryFields');
export const CreateEmojiDescription = T('commands/tools:createEmojiDescription');
export const CreateEmojiExtended = T<LanguageHelpDisplayOptions>('commands/tools:createEmojiExtended');
export const CreateEmojisDuplicate = FT<{ name: string }, string>('commands/tools:createEmojiDuplicate');
export const CreateEmojiInvalidDiscordEmoji = FT<{ parameter: string }, string>('commands/tools:createEmojiInvalidDiscordEmoji');
export const CreateEmojiInvalidEmoji = T('commands/tools:createEmojiInvalidEmoji');
export const CreateEmojiSuccess = FT<{ emoji: string }, string>('commands/tools:createEmojiSuccess');
export const CountryTimezone = T<{ timezone: string[]; count: number }>('commands/tools:countryTimezone');
export const EshopDescription = T('commands/tools:eshopDescription');
export const EshopExtended = T<LanguageHelpDisplayOptions>('commands/tools:eshopExtended');
export const EshopNotInDatabase = T('commands/tools:eshopNotInDatabase');
export const EshopTitles = T<{
	price: string;
	availability: string;
	releaseDate: string;
	numberOfPlayers: string;
	platform: string;
	genres: string;
	noGenres: string;
	nsuid: 'NSUID';
	esrb: 'ESRB';
}>('commands/tools:eshopTitles');
export const EshopPricePaid = FT<{ price: number }, string>('commands/tools:eshopPricePaid');
export const EshopPriceFree = T('commands/tools:eshopPriceFree');
export const HoroscopeDescription = T('commands/tools:horoscopeDescription');
export const HoroscopeExtended = T<LanguageHelpDisplayOptions>('commands/tools:horoscopeExtended');
export const HoroscopeInvalidSunsign = FT<{ parameter: string; maybe: string }, string>('commands/tools:horoscopeInvalidSunsign');
export const HoroscopeTitles = FT<
	{ sign: string; intensity: string; keywords: readonly string[]; mood: string; rating: string },
	{ dailyHoroscope: string; metadataTitle: string; metadata: readonly string[] }
>('commands/tools:horoscopeTitles');
export const IgdbDescription = T('commands/tools:igdbDescription');
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
export const ITunesDescription = T('commands/tools:itunesDescription');
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
export const MoviesDescription = T('commands/tools:moviesDescription');
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
export const ShowsDescription = T('commands/tools:showsDescription');
export const ShowsExtended = T<LanguageHelpDisplayOptions>('commands/tools:showsExtended');
export const ShowsTitles = T<{
	episodeRuntime: string;
	userScore: string;
	status: string;
	firstAirDate: string;
	genres: string;
}>('commands/tools:showsTitles');
export const ShowsData = T<{ variableRuntime: string; unknownUserScore: string; noGenres: string }>('commands/tools:showsData');
export const PriceDescription = T('commands/tools:priceDescription');
export const PriceExtended = T<LanguageHelpDisplayOptions>('commands/tools:priceExtended');
export const PollDescription = T('commands/tools:pollDescription');
export const PollExtended = T<LanguageHelpDisplayOptions>('commands/tools:pollExtended');
export const PollReactionLimit = T('commands/tools:pollReactionLimit');
export const VoteDescription = T('commands/tools:voteDescription');
export const VoteExtended = T<LanguageHelpDisplayOptions>('commands/tools:voteExtended');
export const VoteContentNeeded = T('commands/tools:voteContentNeeded');
export const VoteReactionBlocked = T('commands/tools:voteReactionBlocked');
export const UrbanDescription = T('commands/tools:urbanDescription');
export const UrbanExtended = T<LanguageHelpDisplayOptions>('commands/tools:urbanExtended');
export const UrbanNoDefinition = FT<{ parameter: string }, string>('commands/tools:urbanNoDefinition');
export const WhoisDescription = T('commands/tools:whoisDescription');
export const WhoisExtended = T<LanguageHelpDisplayOptions>('commands/tools:whoisExtended');
export const AvatarNone = T('commands/tools:avatarNone');
export const Color = FT<{ hex: string; rgb: string; hsl: string }, string>('commands/tools:color');
export const EmojiCustom = FT<{ emoji: string; id: string }, string>('commands/tools:emojiCustom');
export const EmojiTwemoji = FT<{ emoji: string; id: string }, string>('commands/tools:emojiTwemoji');
export const EmojiInvalid = T('commands/tools:emojiInvalid');
export const EmojiTooLarge = FT<{ emoji: string }, string>('commands/tools:emojiTooLarge');
export const PriceCurrency = FT<{ fromCurrency: string; fromAmount: number; worths: string[] }, string>('commands/tools:priceCurrency');
export const PriceCurrencyNotFound = T('commands/tools:priceCurrencyNotFound');
export const WhoisMemberTitles = T<{ joined: string; createdAt: string }>('commands/tools:whoisMemberTitles');
export const WhoisMemberFields = FT<
	{
		member: GuildMember;
		memberCreatedAt: string;
		memberCreatedAtOffset: string;
		memberJoinedAt: string;
		memberJoinedAtOffset: string;
	},
	{
		joinedUnknown: string;
		joinedWithTimestamp: string;
		createdAt: string;
		footer: string;
	}
>('commands/tools:whoisMemberFields');
export const WhoisMemberRoles = FT<{ count: number }, string>('commands/tools:whoisMemberRoles');
export const WhoisMemberRoleListAndMore = FT<{ count: number }, string>('commands/tools:whoisMemberRoleListAndMore');
export const WhoisMemberPermissions = T('commands/tools:whoisMemberPermissions');
export const WhoisMemberPermissionsAll = T('commands/tools:whoisMemberPermissionsAll');
export const WhoisUserTitles = T<{
	createdAt: string;
}>('commands/tools:whoisUserTitles');
export const WhoisUserFields = FT<
	{
		user: User;
		userCreatedAt: string;
		userCreatedAtOffset: string;
	},
	{
		createdAt: string;
		footer: string;
	}
>('commands/tools:whoisUserFields');
export const WikipediaDescription = T('commands/tools:wikipediaDescription');
export const WikipediaExtended = T<LanguageHelpDisplayOptions>('commands/tools:wikipediaExtended');
export const YouTubeDescription = T('commands/tools:youtubeDescription');
export const YouTubeExtended = T<LanguageHelpDisplayOptions>('commands/tools:youtubeExtended');
