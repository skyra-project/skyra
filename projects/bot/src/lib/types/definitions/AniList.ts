/**
 * AUTO GENERATED FROM ANILIST API ENDPOINT. DO NOT MODIFY
 */

import type { NonNullObject } from '@sapphire/utilities';
import type { GraphQLResolveInfo, GraphQLScalarType, GraphQLScalarTypeConfig } from 'graphql';
export type Maybe<T> = T | null;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
export type RequireFields<T, K extends keyof T> = { [X in Exclude<keyof T, K>]?: T[X] } & { [P in K]-?: NonNullable<T[P]> };
/** All built-in and custom scalars, mapped to their actual values */
export interface Scalars {
	ID: string;
	String: string;
	Boolean: boolean;
	Int: number;
	Float: number;
	/** ISO 3166-1 alpha-2 country code */
	CountryCode: string;
	/** 8 digit long date integer (YYYYMMDD). Unknown dates represented by 0. E.g. 2016: 20160000, May 1976: 19760500 */
	FuzzyDateInt: number;
	Json: Record<PropertyKey, unknown>;
}

/** Notification for when a activity is liked */
export interface ActivityLikeNotification {
	readonly __typename?: 'ActivityLikeNotification';
	/** The id of the Notification */
	readonly id: Scalars['Int'];
	/** The id of the user who liked to the activity */
	readonly userId: Scalars['Int'];
	/** The type of notification */
	readonly type?: Maybe<NotificationType>;
	/** The id of the activity which was liked */
	readonly activityId: Scalars['Int'];
	/** The notification context text */
	readonly context?: Maybe<Scalars['String']>;
	/** The time the notification was created at */
	readonly createdAt?: Maybe<Scalars['Int']>;
	/** The liked activity */
	readonly activity?: Maybe<ActivityUnion>;
	/** The user who liked the activity */
	readonly user?: Maybe<User>;
}

/** Notification for when authenticated user is @ mentioned in activity or reply */
export interface ActivityMentionNotification {
	readonly __typename?: 'ActivityMentionNotification';
	/** The id of the Notification */
	readonly id: Scalars['Int'];
	/** The id of the user who mentioned the authenticated user */
	readonly userId: Scalars['Int'];
	/** The type of notification */
	readonly type?: Maybe<NotificationType>;
	/** The id of the activity where mentioned */
	readonly activityId: Scalars['Int'];
	/** The notification context text */
	readonly context?: Maybe<Scalars['String']>;
	/** The time the notification was created at */
	readonly createdAt?: Maybe<Scalars['Int']>;
	/** The liked activity */
	readonly activity?: Maybe<ActivityUnion>;
	/** The user who mentioned the authenticated user */
	readonly user?: Maybe<User>;
}

/** Notification for when a user is send an activity message */
export interface ActivityMessageNotification {
	readonly __typename?: 'ActivityMessageNotification';
	/** The id of the Notification */
	readonly id: Scalars['Int'];
	/** The if of the user who send the message */
	readonly userId: Scalars['Int'];
	/** The type of notification */
	readonly type?: Maybe<NotificationType>;
	/** The id of the activity message */
	readonly activityId: Scalars['Int'];
	/** The notification context text */
	readonly context?: Maybe<Scalars['String']>;
	/** The time the notification was created at */
	readonly createdAt?: Maybe<Scalars['Int']>;
	/** The message activity */
	readonly message?: Maybe<MessageActivity>;
	/** The user who sent the message */
	readonly user?: Maybe<User>;
}

/** Replay to an activity item */
export interface ActivityReply {
	readonly __typename?: 'ActivityReply';
	/** The id of the reply */
	readonly id: Scalars['Int'];
	/** The id of the replies creator */
	readonly userId?: Maybe<Scalars['Int']>;
	/** The id of the parent activity */
	readonly activityId?: Maybe<Scalars['Int']>;
	/** The reply text */
	readonly text?: Maybe<Scalars['String']>;
	/** The amount of likes the reply has */
	readonly likeCount: Scalars['Int'];
	/** If the currently authenticated user liked the reply */
	readonly isLiked?: Maybe<Scalars['Boolean']>;
	/** The time the reply was created at */
	readonly createdAt: Scalars['Int'];
	/** The user who created reply */
	readonly user?: Maybe<User>;
	/** The users who liked the reply */
	readonly likes?: Maybe<ReadonlyArray<Maybe<User>>>;
}

/** Replay to an activity item */
export interface ActivityReplyTextArgs {
	asHtml?: Maybe<Scalars['Boolean']>;
}

/** Notification for when a activity reply is liked */
export interface ActivityReplyLikeNotification {
	readonly __typename?: 'ActivityReplyLikeNotification';
	/** The id of the Notification */
	readonly id: Scalars['Int'];
	/** The id of the user who liked to the activity reply */
	readonly userId: Scalars['Int'];
	/** The type of notification */
	readonly type?: Maybe<NotificationType>;
	/** The id of the activity where the reply which was liked */
	readonly activityId: Scalars['Int'];
	/** The notification context text */
	readonly context?: Maybe<Scalars['String']>;
	/** The time the notification was created at */
	readonly createdAt?: Maybe<Scalars['Int']>;
	/** The liked activity */
	readonly activity?: Maybe<ActivityUnion>;
	/** The user who liked the activity reply */
	readonly user?: Maybe<User>;
}

/** Notification for when a user replies to the authenticated users activity */
export interface ActivityReplyNotification {
	readonly __typename?: 'ActivityReplyNotification';
	/** The id of the Notification */
	readonly id: Scalars['Int'];
	/** The id of the user who replied to the activity */
	readonly userId: Scalars['Int'];
	/** The type of notification */
	readonly type?: Maybe<NotificationType>;
	/** The id of the activity which was replied too */
	readonly activityId: Scalars['Int'];
	/** The notification context text */
	readonly context?: Maybe<Scalars['String']>;
	/** The time the notification was created at */
	readonly createdAt?: Maybe<Scalars['Int']>;
	/** The liked activity */
	readonly activity?: Maybe<ActivityUnion>;
	/** The user who replied to the activity */
	readonly user?: Maybe<User>;
}

/** Notification for when a user replies to activity the authenticated user has replied to */
export interface ActivityReplySubscribedNotification {
	readonly __typename?: 'ActivityReplySubscribedNotification';
	/** The id of the Notification */
	readonly id: Scalars['Int'];
	/** The id of the user who replied to the activity */
	readonly userId: Scalars['Int'];
	/** The type of notification */
	readonly type?: Maybe<NotificationType>;
	/** The id of the activity which was replied too */
	readonly activityId: Scalars['Int'];
	/** The notification context text */
	readonly context?: Maybe<Scalars['String']>;
	/** The time the notification was created at */
	readonly createdAt?: Maybe<Scalars['Int']>;
	/** The liked activity */
	readonly activity?: Maybe<ActivityUnion>;
	/** The user who replied to the activity */
	readonly user?: Maybe<User>;
}

/** Activity sort enums */
export const enum ActivitySort {
	Id = 'ID',
	IdDesc = 'ID_DESC'
}

/** Activity type enum. */
export const enum ActivityType {
	/** A text activity */
	Text = 'TEXT',
	/** A anime list update activity */
	AnimeList = 'ANIME_LIST',
	/** A manga list update activity */
	MangaList = 'MANGA_LIST',
	/** A text message activity sent to another user */
	Message = 'MESSAGE',
	/** Anime & Manga list update, only used in query arguments */
	MediaList = 'MEDIA_LIST'
}

/** Activity union type */
export type ActivityUnion = TextActivity | ListActivity | MessageActivity;

/** Notification for when an episode of anime airs */
export interface AiringNotification {
	readonly __typename?: 'AiringNotification';
	/** The id of the Notification */
	readonly id: Scalars['Int'];
	/** The type of notification */
	readonly type?: Maybe<NotificationType>;
	/** The id of the aired anime */
	readonly animeId: Scalars['Int'];
	/** The episode number that just aired */
	readonly episode: Scalars['Int'];
	/** The notification context text */
	readonly contexts?: Maybe<ReadonlyArray<Maybe<Scalars['String']>>>;
	/** The time the notification was created at */
	readonly createdAt?: Maybe<Scalars['Int']>;
	/** The associated media of the airing schedule */
	readonly media?: Maybe<Media>;
}

/** Score & Watcher stats for airing anime by episode and mid-week */
export interface AiringProgression {
	readonly __typename?: 'AiringProgression';
	/** The episode the stats were recorded at. .5 is the mid point between 2 episodes airing dates. */
	readonly episode?: Maybe<Scalars['Float']>;
	/** The average score for the media */
	readonly score?: Maybe<Scalars['Float']>;
	/** The amount of users watching the anime */
	readonly watching?: Maybe<Scalars['Int']>;
}

/** Media Airing Schedule. NOTE: We only aim to guarantee that FUTURE airing data is present and accurate. */
export interface AiringSchedule {
	readonly __typename?: 'AiringSchedule';
	/** The id of the airing schedule item */
	readonly id: Scalars['Int'];
	/** The time the episode airs at */
	readonly airingAt: Scalars['Int'];
	/** Seconds until episode starts airing */
	readonly timeUntilAiring: Scalars['Int'];
	/** The airing episode number */
	readonly episode: Scalars['Int'];
	/** The associate media id of the airing episode */
	readonly mediaId: Scalars['Int'];
	/** The associate media of the airing episode */
	readonly media?: Maybe<Media>;
}

export interface AiringScheduleConnection {
	readonly __typename?: 'AiringScheduleConnection';
	readonly edges?: Maybe<ReadonlyArray<Maybe<AiringScheduleEdge>>>;
	readonly nodes?: Maybe<ReadonlyArray<Maybe<AiringSchedule>>>;
	/** The pagination information */
	readonly pageInfo?: Maybe<PageInfo>;
}

/** AiringSchedule connection edge */
export interface AiringScheduleEdge {
	readonly __typename?: 'AiringScheduleEdge';
	readonly node?: Maybe<AiringSchedule>;
	/** The id of the connection */
	readonly id?: Maybe<Scalars['Int']>;
}

export interface AiringScheduleInput {
	readonly airingAt?: Maybe<Scalars['Int']>;
	readonly episode?: Maybe<Scalars['Int']>;
	readonly timeUntilAiring?: Maybe<Scalars['Int']>;
}

/** Airing schedule sort enums */
export const enum AiringSort {
	Id = 'ID',
	IdDesc = 'ID_DESC',
	MediaId = 'MEDIA_ID',
	MediaIdDesc = 'MEDIA_ID_DESC',
	Time = 'TIME',
	TimeDesc = 'TIME_DESC',
	Episode = 'EPISODE',
	EpisodeDesc = 'EPISODE_DESC'
}

export interface AniChartHighlightInput {
	readonly mediaId?: Maybe<Scalars['Int']>;
	readonly highlight?: Maybe<Scalars['String']>;
}

export interface AniChartUser {
	readonly __typename?: 'AniChartUser';
	readonly user?: Maybe<User>;
	readonly settings?: Maybe<Scalars['Json']>;
	readonly highlights?: Maybe<Scalars['Json']>;
}

/** A character that features in an anime or manga */
export interface Character {
	readonly __typename?: 'Character';
	/** The id of the character */
	readonly id: Scalars['Int'];
	/** The names of the character */
	readonly name?: Maybe<CharacterName>;
	/** Character images */
	readonly image?: Maybe<CharacterImage>;
	/** A general description of the character */
	readonly description?: Maybe<Scalars['String']>;
	/** The character's gender. Usually Male, Female, or Non-binary but can be any string. */
	readonly gender?: Maybe<Scalars['String']>;
	/** The character's birth date */
	readonly dateOfBirth?: Maybe<FuzzyDate>;
	/** The character's age. Note this is a string, not an int, it may contain further text and additional ages. */
	readonly age?: Maybe<Scalars['String']>;
	/** The characters blood type */
	readonly bloodType?: Maybe<Scalars['String']>;
	/** If the character is marked as favourite by the currently authenticated user */
	readonly isFavourite: Scalars['Boolean'];
	/** If the character is blocked from being added to favourites */
	readonly isFavouriteBlocked: Scalars['Boolean'];
	/** The url for the character page on the AniList website */
	readonly siteUrl?: Maybe<Scalars['String']>;
	/** Media that includes the character */
	readonly media?: Maybe<MediaConnection>;
	/** @deprecated No data available */
	readonly updatedAt?: Maybe<Scalars['Int']>;
	/** The amount of user's who have favourited the character */
	readonly favourites?: Maybe<Scalars['Int']>;
	/** Notes for site moderators */
	readonly modNotes?: Maybe<Scalars['String']>;
}

/** A character that features in an anime or manga */
export interface CharacterDescriptionArgs {
	asHtml?: Maybe<Scalars['Boolean']>;
}

/** A character that features in an anime or manga */
export interface CharacterMediaArgs {
	sort?: Maybe<ReadonlyArray<Maybe<MediaSort>>>;
	type?: Maybe<MediaType>;
	onList?: Maybe<Scalars['Boolean']>;
	page?: Maybe<Scalars['Int']>;
	perPage?: Maybe<Scalars['Int']>;
}

export interface CharacterConnection {
	readonly __typename?: 'CharacterConnection';
	readonly edges?: Maybe<ReadonlyArray<Maybe<CharacterEdge>>>;
	readonly nodes?: Maybe<ReadonlyArray<Maybe<Character>>>;
	/** The pagination information */
	readonly pageInfo?: Maybe<PageInfo>;
}

/** Character connection edge */
export interface CharacterEdge {
	readonly __typename?: 'CharacterEdge';
	readonly node?: Maybe<Character>;
	/** The id of the connection */
	readonly id?: Maybe<Scalars['Int']>;
	/** The characters role in the media */
	readonly role?: Maybe<CharacterRole>;
	/** Media specific character name */
	readonly name?: Maybe<Scalars['String']>;
	/** The voice actors of the character */
	readonly voiceActors?: Maybe<ReadonlyArray<Maybe<Staff>>>;
	/** The voice actors of the character with role date */
	readonly voiceActorRoles?: Maybe<ReadonlyArray<Maybe<StaffRoleType>>>;
	/** The media the character is in */
	readonly media?: Maybe<ReadonlyArray<Maybe<Media>>>;
	/** The order the character should be displayed from the users favourites */
	readonly favouriteOrder?: Maybe<Scalars['Int']>;
}

/** Character connection edge */
export interface CharacterEdgeVoiceActorsArgs {
	language?: Maybe<StaffLanguage>;
	sort?: Maybe<ReadonlyArray<Maybe<StaffSort>>>;
}

/** Character connection edge */
export interface CharacterEdgeVoiceActorRolesArgs {
	language?: Maybe<StaffLanguage>;
	sort?: Maybe<ReadonlyArray<Maybe<StaffSort>>>;
}

export interface CharacterImage {
	readonly __typename?: 'CharacterImage';
	/** The character's image of media at its largest size */
	readonly large?: Maybe<Scalars['String']>;
	/** The character's image of media at medium size */
	readonly medium?: Maybe<Scalars['String']>;
}

/** The names of the character */
export interface CharacterName {
	readonly __typename?: 'CharacterName';
	/** The character's given name */
	readonly first?: Maybe<Scalars['String']>;
	/** The character's middle name */
	readonly middle?: Maybe<Scalars['String']>;
	/** The character's surname */
	readonly last?: Maybe<Scalars['String']>;
	/** The character's first and last name */
	readonly full?: Maybe<Scalars['String']>;
	/** The character's full name in their native language */
	readonly native?: Maybe<Scalars['String']>;
	/** Other names the character might be referred to as */
	readonly alternative?: Maybe<ReadonlyArray<Maybe<Scalars['String']>>>;
	/** Other names the character might be referred to as but are spoilers */
	readonly alternativeSpoiler?: Maybe<ReadonlyArray<Maybe<Scalars['String']>>>;
	/** The currently authenticated users preferred name language. Default romaji for non-authenticated */
	readonly userPreferred?: Maybe<Scalars['String']>;
}

/** The names of the character */
export interface CharacterNameInput {
	/** The character's given name */
	readonly first?: Maybe<Scalars['String']>;
	/** The character's middle name */
	readonly middle?: Maybe<Scalars['String']>;
	/** The character's surname */
	readonly last?: Maybe<Scalars['String']>;
	/** The character's full name in their native language */
	readonly native?: Maybe<Scalars['String']>;
	/** Other names the character might be referred by */
	readonly alternative?: Maybe<ReadonlyArray<Maybe<Scalars['String']>>>;
	/** Other names the character might be referred to as but are spoilers */
	readonly alternativeSpoiler?: Maybe<ReadonlyArray<Maybe<Scalars['String']>>>;
}

/** The role the character plays in the media */
export const enum CharacterRole {
	/** A primary character role in the media */
	Main = 'MAIN',
	/** A supporting character role in the media */
	Supporting = 'SUPPORTING',
	/** A background character in the media */
	Background = 'BACKGROUND'
}

/** Character sort enums */
export const enum CharacterSort {
	Id = 'ID',
	IdDesc = 'ID_DESC',
	Role = 'ROLE',
	RoleDesc = 'ROLE_DESC',
	SearchMatch = 'SEARCH_MATCH',
	Favourites = 'FAVOURITES',
	FavouritesDesc = 'FAVOURITES_DESC',
	/** Order manually decided by moderators */
	Relevance = 'RELEVANCE'
}

/** A submission for a character that features in an anime or manga */
export interface CharacterSubmission {
	readonly __typename?: 'CharacterSubmission';
	/** The id of the submission */
	readonly id: Scalars['Int'];
	/** Character that the submission is referencing */
	readonly character?: Maybe<Character>;
	/** The character submission changes */
	readonly submission?: Maybe<Character>;
	/** Submitter for the submission */
	readonly submitter?: Maybe<User>;
	/** Status of the submission */
	readonly status?: Maybe<SubmissionStatus>;
	/** Inner details of submission status */
	readonly notes?: Maybe<Scalars['String']>;
	readonly source?: Maybe<Scalars['String']>;
	readonly createdAt?: Maybe<Scalars['Int']>;
}

export interface CharacterSubmissionConnection {
	readonly __typename?: 'CharacterSubmissionConnection';
	readonly edges?: Maybe<ReadonlyArray<Maybe<CharacterSubmissionEdge>>>;
	readonly nodes?: Maybe<ReadonlyArray<Maybe<CharacterSubmission>>>;
	/** The pagination information */
	readonly pageInfo?: Maybe<PageInfo>;
}

/** CharacterSubmission connection edge */
export interface CharacterSubmissionEdge {
	readonly __typename?: 'CharacterSubmissionEdge';
	readonly node?: Maybe<CharacterSubmission>;
	/** The characters role in the media */
	readonly role?: Maybe<CharacterRole>;
	/** The voice actors of the character */
	readonly voiceActors?: Maybe<ReadonlyArray<Maybe<Staff>>>;
	/** The submitted voice actors of the character */
	readonly submittedVoiceActors?: Maybe<ReadonlyArray<Maybe<StaffSubmission>>>;
}

/** Deleted data type */
export interface Deleted {
	readonly __typename?: 'Deleted';
	/** If an item has been successfully deleted */
	readonly deleted?: Maybe<Scalars['Boolean']>;
}

/** User's favourite anime, manga, characters, staff & studios */
export interface Favourites {
	readonly __typename?: 'Favourites';
	/** Favourite anime */
	readonly anime?: Maybe<MediaConnection>;
	/** Favourite manga */
	readonly manga?: Maybe<MediaConnection>;
	/** Favourite characters */
	readonly characters?: Maybe<CharacterConnection>;
	/** Favourite staff */
	readonly staff?: Maybe<StaffConnection>;
	/** Favourite studios */
	readonly studios?: Maybe<StudioConnection>;
}

/** User's favourite anime, manga, characters, staff & studios */
export interface FavouritesAnimeArgs {
	page?: Maybe<Scalars['Int']>;
	perPage?: Maybe<Scalars['Int']>;
}

/** User's favourite anime, manga, characters, staff & studios */
export interface FavouritesMangaArgs {
	page?: Maybe<Scalars['Int']>;
	perPage?: Maybe<Scalars['Int']>;
}

/** User's favourite anime, manga, characters, staff & studios */
export interface FavouritesCharactersArgs {
	page?: Maybe<Scalars['Int']>;
	perPage?: Maybe<Scalars['Int']>;
}

/** User's favourite anime, manga, characters, staff & studios */
export interface FavouritesStaffArgs {
	page?: Maybe<Scalars['Int']>;
	perPage?: Maybe<Scalars['Int']>;
}

/** User's favourite anime, manga, characters, staff & studios */
export interface FavouritesStudiosArgs {
	page?: Maybe<Scalars['Int']>;
	perPage?: Maybe<Scalars['Int']>;
}

/** Notification for when the authenticated user is followed by another user */
export interface FollowingNotification {
	readonly __typename?: 'FollowingNotification';
	/** The id of the Notification */
	readonly id: Scalars['Int'];
	/** The id of the user who followed the authenticated user */
	readonly userId: Scalars['Int'];
	/** The type of notification */
	readonly type?: Maybe<NotificationType>;
	/** The notification context text */
	readonly context?: Maybe<Scalars['String']>;
	/** The time the notification was created at */
	readonly createdAt?: Maybe<Scalars['Int']>;
	/** The liked activity */
	readonly user?: Maybe<User>;
}

/** User's format statistics */
export interface FormatStats {
	readonly __typename?: 'FormatStats';
	readonly format?: Maybe<MediaFormat>;
	readonly amount?: Maybe<Scalars['Int']>;
}

/** Date object that allows for incomplete date values (fuzzy) */
export interface FuzzyDate {
	readonly __typename?: 'FuzzyDate';
	/** Numeric Year (2017) */
	readonly year?: Maybe<Scalars['Int']>;
	/** Numeric Month (3) */
	readonly month?: Maybe<Scalars['Int']>;
	/** Numeric Day (24) */
	readonly day?: Maybe<Scalars['Int']>;
}

/** Date object that allows for incomplete date values (fuzzy) */
export interface FuzzyDateInput {
	/** Numeric Year (2017) */
	readonly year?: Maybe<Scalars['Int']>;
	/** Numeric Month (3) */
	readonly month?: Maybe<Scalars['Int']>;
	/** Numeric Day (24) */
	readonly day?: Maybe<Scalars['Int']>;
}

/** User's genre statistics */
export interface GenreStats {
	readonly __typename?: 'GenreStats';
	readonly genre?: Maybe<Scalars['String']>;
	readonly amount?: Maybe<Scalars['Int']>;
	readonly meanScore?: Maybe<Scalars['Int']>;
	/** The amount of time in minutes the genre has been watched by the user */
	readonly timeWatched?: Maybe<Scalars['Int']>;
}

/** Page of data (Used for internal use only) */
export interface InternalPage {
	readonly __typename?: 'InternalPage';
	readonly mediaSubmissions?: Maybe<ReadonlyArray<Maybe<MediaSubmission>>>;
	readonly characterSubmissions?: Maybe<ReadonlyArray<Maybe<CharacterSubmission>>>;
	readonly staffSubmissions?: Maybe<ReadonlyArray<Maybe<StaffSubmission>>>;
	readonly revisionHistory?: Maybe<ReadonlyArray<Maybe<RevisionHistory>>>;
	readonly reports?: Maybe<ReadonlyArray<Maybe<Report>>>;
	readonly modActions?: Maybe<ReadonlyArray<Maybe<ModAction>>>;
	/** The pagination information */
	readonly pageInfo?: Maybe<PageInfo>;
	readonly users?: Maybe<ReadonlyArray<Maybe<User>>>;
	readonly media?: Maybe<ReadonlyArray<Maybe<Media>>>;
	readonly characters?: Maybe<ReadonlyArray<Maybe<Character>>>;
	readonly staff?: Maybe<ReadonlyArray<Maybe<Staff>>>;
	readonly studios?: Maybe<ReadonlyArray<Maybe<Studio>>>;
	readonly mediaList?: Maybe<ReadonlyArray<Maybe<MediaList>>>;
	readonly airingSchedules?: Maybe<ReadonlyArray<Maybe<AiringSchedule>>>;
	readonly mediaTrends?: Maybe<ReadonlyArray<Maybe<MediaTrend>>>;
	readonly notifications?: Maybe<ReadonlyArray<Maybe<NotificationUnion>>>;
	readonly followers?: Maybe<ReadonlyArray<Maybe<User>>>;
	readonly following?: Maybe<ReadonlyArray<Maybe<User>>>;
	readonly activities?: Maybe<ReadonlyArray<Maybe<ActivityUnion>>>;
	readonly activityReplies?: Maybe<ReadonlyArray<Maybe<ActivityReply>>>;
	readonly threads?: Maybe<ReadonlyArray<Maybe<Thread>>>;
	readonly threadComments?: Maybe<ReadonlyArray<Maybe<ThreadComment>>>;
	readonly reviews?: Maybe<ReadonlyArray<Maybe<Review>>>;
	readonly recommendations?: Maybe<ReadonlyArray<Maybe<Recommendation>>>;
	readonly likes?: Maybe<ReadonlyArray<Maybe<User>>>;
}

/** Page of data (Used for internal use only) */
export interface InternalPageMediaSubmissionsArgs {
	mediaId?: Maybe<Scalars['Int']>;
	submissionId?: Maybe<Scalars['Int']>;
	userId?: Maybe<Scalars['Int']>;
	status?: Maybe<SubmissionStatus>;
	type?: Maybe<MediaType>;
	sort?: Maybe<ReadonlyArray<Maybe<SubmissionSort>>>;
}

/** Page of data (Used for internal use only) */
export interface InternalPageCharacterSubmissionsArgs {
	characterId?: Maybe<Scalars['Int']>;
	userId?: Maybe<Scalars['Int']>;
	status?: Maybe<SubmissionStatus>;
	sort?: Maybe<ReadonlyArray<Maybe<SubmissionSort>>>;
}

/** Page of data (Used for internal use only) */
export interface InternalPageStaffSubmissionsArgs {
	staffId?: Maybe<Scalars['Int']>;
	userId?: Maybe<Scalars['Int']>;
	status?: Maybe<SubmissionStatus>;
	sort?: Maybe<ReadonlyArray<Maybe<SubmissionSort>>>;
}

/** Page of data (Used for internal use only) */
export interface InternalPageRevisionHistoryArgs {
	userId?: Maybe<Scalars['Int']>;
	mediaId?: Maybe<Scalars['Int']>;
	characterId?: Maybe<Scalars['Int']>;
	staffId?: Maybe<Scalars['Int']>;
	studioId?: Maybe<Scalars['Int']>;
}

/** Page of data (Used for internal use only) */
export interface InternalPageReportsArgs {
	reporterId?: Maybe<Scalars['Int']>;
	reportedId?: Maybe<Scalars['Int']>;
}

/** Page of data (Used for internal use only) */
export interface InternalPageModActionsArgs {
	userId?: Maybe<Scalars['Int']>;
	modId?: Maybe<Scalars['Int']>;
}

/** Page of data (Used for internal use only) */
export interface InternalPageUsersArgs {
	id?: Maybe<Scalars['Int']>;
	name?: Maybe<Scalars['String']>;
	isModerator?: Maybe<Scalars['Boolean']>;
	search?: Maybe<Scalars['String']>;
	sort?: Maybe<ReadonlyArray<Maybe<UserSort>>>;
}

/** Page of data (Used for internal use only) */
export interface InternalPageMediaArgs {
	id?: Maybe<Scalars['Int']>;
	idMal?: Maybe<Scalars['Int']>;
	startDate?: Maybe<Scalars['FuzzyDateInt']>;
	endDate?: Maybe<Scalars['FuzzyDateInt']>;
	season?: Maybe<MediaSeason>;
	seasonYear?: Maybe<Scalars['Int']>;
	type?: Maybe<MediaType>;
	format?: Maybe<MediaFormat>;
	status?: Maybe<MediaStatus>;
	episodes?: Maybe<Scalars['Int']>;
	duration?: Maybe<Scalars['Int']>;
	chapters?: Maybe<Scalars['Int']>;
	volumes?: Maybe<Scalars['Int']>;
	isAdult?: Maybe<Scalars['Boolean']>;
	genre?: Maybe<Scalars['String']>;
	tag?: Maybe<Scalars['String']>;
	minimumTagRank?: Maybe<Scalars['Int']>;
	tagCategory?: Maybe<Scalars['String']>;
	onList?: Maybe<Scalars['Boolean']>;
	licensedBy?: Maybe<Scalars['String']>;
	averageScore?: Maybe<Scalars['Int']>;
	popularity?: Maybe<Scalars['Int']>;
	source?: Maybe<MediaSource>;
	countryOfOrigin?: Maybe<Scalars['CountryCode']>;
	search?: Maybe<Scalars['String']>;
	id_not?: Maybe<Scalars['Int']>;
	id_in?: Maybe<ReadonlyArray<Maybe<Scalars['Int']>>>;
	id_not_in?: Maybe<ReadonlyArray<Maybe<Scalars['Int']>>>;
	idMal_not?: Maybe<Scalars['Int']>;
	idMal_in?: Maybe<ReadonlyArray<Maybe<Scalars['Int']>>>;
	idMal_not_in?: Maybe<ReadonlyArray<Maybe<Scalars['Int']>>>;
	startDate_greater?: Maybe<Scalars['FuzzyDateInt']>;
	startDate_lesser?: Maybe<Scalars['FuzzyDateInt']>;
	startDate_like?: Maybe<Scalars['String']>;
	endDate_greater?: Maybe<Scalars['FuzzyDateInt']>;
	endDate_lesser?: Maybe<Scalars['FuzzyDateInt']>;
	endDate_like?: Maybe<Scalars['String']>;
	format_in?: Maybe<ReadonlyArray<Maybe<MediaFormat>>>;
	format_not?: Maybe<MediaFormat>;
	format_not_in?: Maybe<ReadonlyArray<Maybe<MediaFormat>>>;
	status_in?: Maybe<ReadonlyArray<Maybe<MediaStatus>>>;
	status_not?: Maybe<MediaStatus>;
	status_not_in?: Maybe<ReadonlyArray<Maybe<MediaStatus>>>;
	episodes_greater?: Maybe<Scalars['Int']>;
	episodes_lesser?: Maybe<Scalars['Int']>;
	duration_greater?: Maybe<Scalars['Int']>;
	duration_lesser?: Maybe<Scalars['Int']>;
	chapters_greater?: Maybe<Scalars['Int']>;
	chapters_lesser?: Maybe<Scalars['Int']>;
	volumes_greater?: Maybe<Scalars['Int']>;
	volumes_lesser?: Maybe<Scalars['Int']>;
	genre_in?: Maybe<ReadonlyArray<Maybe<Scalars['String']>>>;
	genre_not_in?: Maybe<ReadonlyArray<Maybe<Scalars['String']>>>;
	tag_in?: Maybe<ReadonlyArray<Maybe<Scalars['String']>>>;
	tag_not_in?: Maybe<ReadonlyArray<Maybe<Scalars['String']>>>;
	tagCategory_in?: Maybe<ReadonlyArray<Maybe<Scalars['String']>>>;
	tagCategory_not_in?: Maybe<ReadonlyArray<Maybe<Scalars['String']>>>;
	licensedBy_in?: Maybe<ReadonlyArray<Maybe<Scalars['String']>>>;
	averageScore_not?: Maybe<Scalars['Int']>;
	averageScore_greater?: Maybe<Scalars['Int']>;
	averageScore_lesser?: Maybe<Scalars['Int']>;
	popularity_not?: Maybe<Scalars['Int']>;
	popularity_greater?: Maybe<Scalars['Int']>;
	popularity_lesser?: Maybe<Scalars['Int']>;
	source_in?: Maybe<ReadonlyArray<Maybe<MediaSource>>>;
	sort?: Maybe<ReadonlyArray<Maybe<MediaSort>>>;
}

/** Page of data (Used for internal use only) */
export interface InternalPageCharactersArgs {
	id?: Maybe<Scalars['Int']>;
	isBirthday?: Maybe<Scalars['Boolean']>;
	search?: Maybe<Scalars['String']>;
	id_not?: Maybe<Scalars['Int']>;
	id_in?: Maybe<ReadonlyArray<Maybe<Scalars['Int']>>>;
	id_not_in?: Maybe<ReadonlyArray<Maybe<Scalars['Int']>>>;
	sort?: Maybe<ReadonlyArray<Maybe<CharacterSort>>>;
}

/** Page of data (Used for internal use only) */
export interface InternalPageStaffArgs {
	id?: Maybe<Scalars['Int']>;
	isBirthday?: Maybe<Scalars['Boolean']>;
	search?: Maybe<Scalars['String']>;
	id_not?: Maybe<Scalars['Int']>;
	id_in?: Maybe<ReadonlyArray<Maybe<Scalars['Int']>>>;
	id_not_in?: Maybe<ReadonlyArray<Maybe<Scalars['Int']>>>;
	sort?: Maybe<ReadonlyArray<Maybe<StaffSort>>>;
}

/** Page of data (Used for internal use only) */
export interface InternalPageStudiosArgs {
	id?: Maybe<Scalars['Int']>;
	search?: Maybe<Scalars['String']>;
	id_not?: Maybe<Scalars['Int']>;
	id_in?: Maybe<ReadonlyArray<Maybe<Scalars['Int']>>>;
	id_not_in?: Maybe<ReadonlyArray<Maybe<Scalars['Int']>>>;
	sort?: Maybe<ReadonlyArray<Maybe<StudioSort>>>;
}

/** Page of data (Used for internal use only) */
export interface InternalPageMediaListArgs {
	id?: Maybe<Scalars['Int']>;
	userId?: Maybe<Scalars['Int']>;
	userName?: Maybe<Scalars['String']>;
	type?: Maybe<MediaType>;
	status?: Maybe<MediaListStatus>;
	mediaId?: Maybe<Scalars['Int']>;
	isFollowing?: Maybe<Scalars['Boolean']>;
	notes?: Maybe<Scalars['String']>;
	startedAt?: Maybe<Scalars['FuzzyDateInt']>;
	completedAt?: Maybe<Scalars['FuzzyDateInt']>;
	compareWithAuthList?: Maybe<Scalars['Boolean']>;
	userId_in?: Maybe<ReadonlyArray<Maybe<Scalars['Int']>>>;
	status_in?: Maybe<ReadonlyArray<Maybe<MediaListStatus>>>;
	status_not_in?: Maybe<ReadonlyArray<Maybe<MediaListStatus>>>;
	status_not?: Maybe<MediaListStatus>;
	mediaId_in?: Maybe<ReadonlyArray<Maybe<Scalars['Int']>>>;
	mediaId_not_in?: Maybe<ReadonlyArray<Maybe<Scalars['Int']>>>;
	notes_like?: Maybe<Scalars['String']>;
	startedAt_greater?: Maybe<Scalars['FuzzyDateInt']>;
	startedAt_lesser?: Maybe<Scalars['FuzzyDateInt']>;
	startedAt_like?: Maybe<Scalars['String']>;
	completedAt_greater?: Maybe<Scalars['FuzzyDateInt']>;
	completedAt_lesser?: Maybe<Scalars['FuzzyDateInt']>;
	completedAt_like?: Maybe<Scalars['String']>;
	sort?: Maybe<ReadonlyArray<Maybe<MediaListSort>>>;
}

/** Page of data (Used for internal use only) */
export interface InternalPageAiringSchedulesArgs {
	id?: Maybe<Scalars['Int']>;
	mediaId?: Maybe<Scalars['Int']>;
	episode?: Maybe<Scalars['Int']>;
	airingAt?: Maybe<Scalars['Int']>;
	notYetAired?: Maybe<Scalars['Boolean']>;
	id_not?: Maybe<Scalars['Int']>;
	id_in?: Maybe<ReadonlyArray<Maybe<Scalars['Int']>>>;
	id_not_in?: Maybe<ReadonlyArray<Maybe<Scalars['Int']>>>;
	mediaId_not?: Maybe<Scalars['Int']>;
	mediaId_in?: Maybe<ReadonlyArray<Maybe<Scalars['Int']>>>;
	mediaId_not_in?: Maybe<ReadonlyArray<Maybe<Scalars['Int']>>>;
	episode_not?: Maybe<Scalars['Int']>;
	episode_in?: Maybe<ReadonlyArray<Maybe<Scalars['Int']>>>;
	episode_not_in?: Maybe<ReadonlyArray<Maybe<Scalars['Int']>>>;
	episode_greater?: Maybe<Scalars['Int']>;
	episode_lesser?: Maybe<Scalars['Int']>;
	airingAt_greater?: Maybe<Scalars['Int']>;
	airingAt_lesser?: Maybe<Scalars['Int']>;
	sort?: Maybe<ReadonlyArray<Maybe<AiringSort>>>;
}

/** Page of data (Used for internal use only) */
export interface InternalPageMediaTrendsArgs {
	mediaId?: Maybe<Scalars['Int']>;
	date?: Maybe<Scalars['Int']>;
	trending?: Maybe<Scalars['Int']>;
	averageScore?: Maybe<Scalars['Int']>;
	popularity?: Maybe<Scalars['Int']>;
	episode?: Maybe<Scalars['Int']>;
	releasing?: Maybe<Scalars['Boolean']>;
	mediaId_not?: Maybe<Scalars['Int']>;
	mediaId_in?: Maybe<ReadonlyArray<Maybe<Scalars['Int']>>>;
	mediaId_not_in?: Maybe<ReadonlyArray<Maybe<Scalars['Int']>>>;
	date_greater?: Maybe<Scalars['Int']>;
	date_lesser?: Maybe<Scalars['Int']>;
	trending_greater?: Maybe<Scalars['Int']>;
	trending_lesser?: Maybe<Scalars['Int']>;
	trending_not?: Maybe<Scalars['Int']>;
	averageScore_greater?: Maybe<Scalars['Int']>;
	averageScore_lesser?: Maybe<Scalars['Int']>;
	averageScore_not?: Maybe<Scalars['Int']>;
	popularity_greater?: Maybe<Scalars['Int']>;
	popularity_lesser?: Maybe<Scalars['Int']>;
	popularity_not?: Maybe<Scalars['Int']>;
	episode_greater?: Maybe<Scalars['Int']>;
	episode_lesser?: Maybe<Scalars['Int']>;
	episode_not?: Maybe<Scalars['Int']>;
	sort?: Maybe<ReadonlyArray<Maybe<MediaTrendSort>>>;
}

/** Page of data (Used for internal use only) */
export interface InternalPageNotificationsArgs {
	type?: Maybe<NotificationType>;
	resetNotificationCount?: Maybe<Scalars['Boolean']>;
	type_in?: Maybe<ReadonlyArray<Maybe<NotificationType>>>;
}

/** Page of data (Used for internal use only) */
export interface InternalPageFollowersArgs {
	userId: Scalars['Int'];
	sort?: Maybe<ReadonlyArray<Maybe<UserSort>>>;
}

/** Page of data (Used for internal use only) */
export interface InternalPageFollowingArgs {
	userId: Scalars['Int'];
	sort?: Maybe<ReadonlyArray<Maybe<UserSort>>>;
}

/** Page of data (Used for internal use only) */
export interface InternalPageActivitiesArgs {
	id?: Maybe<Scalars['Int']>;
	userId?: Maybe<Scalars['Int']>;
	messengerId?: Maybe<Scalars['Int']>;
	mediaId?: Maybe<Scalars['Int']>;
	type?: Maybe<ActivityType>;
	isFollowing?: Maybe<Scalars['Boolean']>;
	hasReplies?: Maybe<Scalars['Boolean']>;
	hasRepliesOrTypeText?: Maybe<Scalars['Boolean']>;
	createdAt?: Maybe<Scalars['Int']>;
	id_not?: Maybe<Scalars['Int']>;
	id_in?: Maybe<ReadonlyArray<Maybe<Scalars['Int']>>>;
	id_not_in?: Maybe<ReadonlyArray<Maybe<Scalars['Int']>>>;
	userId_not?: Maybe<Scalars['Int']>;
	userId_in?: Maybe<ReadonlyArray<Maybe<Scalars['Int']>>>;
	userId_not_in?: Maybe<ReadonlyArray<Maybe<Scalars['Int']>>>;
	messengerId_not?: Maybe<Scalars['Int']>;
	messengerId_in?: Maybe<ReadonlyArray<Maybe<Scalars['Int']>>>;
	messengerId_not_in?: Maybe<ReadonlyArray<Maybe<Scalars['Int']>>>;
	mediaId_not?: Maybe<Scalars['Int']>;
	mediaId_in?: Maybe<ReadonlyArray<Maybe<Scalars['Int']>>>;
	mediaId_not_in?: Maybe<ReadonlyArray<Maybe<Scalars['Int']>>>;
	type_not?: Maybe<ActivityType>;
	type_in?: Maybe<ReadonlyArray<Maybe<ActivityType>>>;
	type_not_in?: Maybe<ReadonlyArray<Maybe<ActivityType>>>;
	createdAt_greater?: Maybe<Scalars['Int']>;
	createdAt_lesser?: Maybe<Scalars['Int']>;
	sort?: Maybe<ReadonlyArray<Maybe<ActivitySort>>>;
}

/** Page of data (Used for internal use only) */
export interface InternalPageActivityRepliesArgs {
	id?: Maybe<Scalars['Int']>;
	activityId?: Maybe<Scalars['Int']>;
}

/** Page of data (Used for internal use only) */
export interface InternalPageThreadsArgs {
	id?: Maybe<Scalars['Int']>;
	userId?: Maybe<Scalars['Int']>;
	replyUserId?: Maybe<Scalars['Int']>;
	subscribed?: Maybe<Scalars['Boolean']>;
	categoryId?: Maybe<Scalars['Int']>;
	mediaCategoryId?: Maybe<Scalars['Int']>;
	search?: Maybe<Scalars['String']>;
	id_in?: Maybe<ReadonlyArray<Maybe<Scalars['Int']>>>;
	sort?: Maybe<ReadonlyArray<Maybe<ThreadSort>>>;
}

/** Page of data (Used for internal use only) */
export interface InternalPageThreadCommentsArgs {
	id?: Maybe<Scalars['Int']>;
	threadId?: Maybe<Scalars['Int']>;
	userId?: Maybe<Scalars['Int']>;
	sort?: Maybe<ReadonlyArray<Maybe<ThreadCommentSort>>>;
}

/** Page of data (Used for internal use only) */
export interface InternalPageReviewsArgs {
	id?: Maybe<Scalars['Int']>;
	mediaId?: Maybe<Scalars['Int']>;
	userId?: Maybe<Scalars['Int']>;
	mediaType?: Maybe<MediaType>;
	sort?: Maybe<ReadonlyArray<Maybe<ReviewSort>>>;
}

/** Page of data (Used for internal use only) */
export interface InternalPageRecommendationsArgs {
	id?: Maybe<Scalars['Int']>;
	mediaId?: Maybe<Scalars['Int']>;
	mediaRecommendationId?: Maybe<Scalars['Int']>;
	userId?: Maybe<Scalars['Int']>;
	rating?: Maybe<Scalars['Int']>;
	onList?: Maybe<Scalars['Boolean']>;
	rating_greater?: Maybe<Scalars['Int']>;
	rating_lesser?: Maybe<Scalars['Int']>;
	sort?: Maybe<ReadonlyArray<Maybe<RecommendationSort>>>;
}

/** Page of data (Used for internal use only) */
export interface InternalPageLikesArgs {
	likeableId?: Maybe<Scalars['Int']>;
	type?: Maybe<LikeableType>;
}

/** Types that can be liked */
export const enum LikeableType {
	Thread = 'THREAD',
	ThreadComment = 'THREAD_COMMENT',
	Activity = 'ACTIVITY',
	ActivityReply = 'ACTIVITY_REPLY'
}

/** Likeable union type */
export type LikeableUnion = ListActivity | TextActivity | MessageActivity | ActivityReply | Thread | ThreadComment;

/** User list activity (anime & manga updates) */
export interface ListActivity {
	readonly __typename?: 'ListActivity';
	/** The id of the activity */
	readonly id: Scalars['Int'];
	/** The user id of the activity's creator */
	readonly userId?: Maybe<Scalars['Int']>;
	/** The type of activity */
	readonly type?: Maybe<ActivityType>;
	/** The number of activity replies */
	readonly replyCount: Scalars['Int'];
	/** The list item's textual status */
	readonly status?: Maybe<Scalars['String']>;
	/** The list progress made */
	readonly progress?: Maybe<Scalars['String']>;
	/** If the activity is locked and can receive replies */
	readonly isLocked?: Maybe<Scalars['Boolean']>;
	/** If the currently authenticated user is subscribed to the activity */
	readonly isSubscribed?: Maybe<Scalars['Boolean']>;
	/** The amount of likes the activity has */
	readonly likeCount: Scalars['Int'];
	/** If the currently authenticated user liked the activity */
	readonly isLiked?: Maybe<Scalars['Boolean']>;
	/** The url for the activity page on the AniList website */
	readonly siteUrl?: Maybe<Scalars['String']>;
	/** The time the activity was created at */
	readonly createdAt: Scalars['Int'];
	/** The owner of the activity */
	readonly user?: Maybe<User>;
	/** The associated media to the activity update */
	readonly media?: Maybe<Media>;
	/** The written replies to the activity */
	readonly replies?: Maybe<ReadonlyArray<Maybe<ActivityReply>>>;
	/** The users who liked the activity */
	readonly likes?: Maybe<ReadonlyArray<Maybe<User>>>;
}

/** User's list score statistics */
export interface ListScoreStats {
	readonly __typename?: 'ListScoreStats';
	readonly meanScore?: Maybe<Scalars['Int']>;
	readonly standardDeviation?: Maybe<Scalars['Int']>;
}

/** Anime or Manga */
export interface Media {
	readonly __typename?: 'Media';
	/** The id of the media */
	readonly id: Scalars['Int'];
	/** The mal id of the media */
	readonly idMal?: Maybe<Scalars['Int']>;
	/** The official titles of the media in various languages */
	readonly title?: Maybe<MediaTitle>;
	/** The type of the media; anime or manga */
	readonly type?: Maybe<MediaType>;
	/** The format the media was released in */
	readonly format?: Maybe<MediaFormat>;
	/** The current releasing status of the media */
	readonly status?: Maybe<MediaStatus>;
	/** Short description of the media's story and characters */
	readonly description?: Maybe<Scalars['String']>;
	/** The first official release date of the media */
	readonly startDate?: Maybe<FuzzyDate>;
	/** The last official release date of the media */
	readonly endDate?: Maybe<FuzzyDate>;
	/** The season the media was initially released in */
	readonly season?: Maybe<MediaSeason>;
	/** The season year the media was initially released in */
	readonly seasonYear?: Maybe<Scalars['Int']>;
	/**
	 * The year & season the media was initially released in
	 * @deprecated
	 */
	readonly seasonInt?: Maybe<Scalars['Int']>;
	/** The amount of episodes the anime has when complete */
	readonly episodes?: Maybe<Scalars['Int']>;
	/** The general length of each anime episode in minutes */
	readonly duration?: Maybe<Scalars['Int']>;
	/** The amount of chapters the manga has when complete */
	readonly chapters?: Maybe<Scalars['Int']>;
	/** The amount of volumes the manga has when complete */
	readonly volumes?: Maybe<Scalars['Int']>;
	/** Where the media was created. (ISO 3166-1 alpha-2) */
	readonly countryOfOrigin?: Maybe<Scalars['CountryCode']>;
	/** If the media is officially licensed or a self-published doujin release */
	readonly isLicensed?: Maybe<Scalars['Boolean']>;
	/** Source type the media was adapted from. */
	readonly source?: Maybe<MediaSource>;
	/** Official Twitter hashtags for the media */
	readonly hashtag?: Maybe<Scalars['String']>;
	/** Media trailer or advertisement */
	readonly trailer?: Maybe<MediaTrailer>;
	/** When the media's data was last updated */
	readonly updatedAt?: Maybe<Scalars['Int']>;
	/** The cover images of the media */
	readonly coverImage?: Maybe<MediaCoverImage>;
	/** The banner image of the media */
	readonly bannerImage?: Maybe<Scalars['String']>;
	/** The genres of the media */
	readonly genres?: Maybe<ReadonlyArray<Maybe<Scalars['String']>>>;
	/** Alternative titles of the media */
	readonly synonyms?: Maybe<ReadonlyArray<Maybe<Scalars['String']>>>;
	/** A weighted average score of all the user's scores of the media */
	readonly averageScore?: Maybe<Scalars['Int']>;
	/** Mean score of all the user's scores of the media */
	readonly meanScore?: Maybe<Scalars['Int']>;
	/** The number of users with the media on their list */
	readonly popularity?: Maybe<Scalars['Int']>;
	/** Locked media may not be added to lists our favorited. This may be due to the entry pending for deletion or other reasons. */
	readonly isLocked?: Maybe<Scalars['Boolean']>;
	/** The amount of related activity in the past hour */
	readonly trending?: Maybe<Scalars['Int']>;
	/** The amount of user's who have favourited the media */
	readonly favourites?: Maybe<Scalars['Int']>;
	/** List of tags that describes elements and themes of the media */
	readonly tags?: Maybe<ReadonlyArray<Maybe<MediaTag>>>;
	/** Other media in the same or connecting franchise */
	readonly relations?: Maybe<MediaConnection>;
	/** The characters in the media */
	readonly characters?: Maybe<CharacterConnection>;
	/** The staff who produced the media */
	readonly staff?: Maybe<StaffConnection>;
	/** The companies who produced the media */
	readonly studios?: Maybe<StudioConnection>;
	/** If the media is marked as favourite by the current authenticated user */
	readonly isFavourite: Scalars['Boolean'];
	/** If the media is intended only for 18+ adult audiences */
	readonly isAdult?: Maybe<Scalars['Boolean']>;
	/** The media's next episode airing schedule */
	readonly nextAiringEpisode?: Maybe<AiringSchedule>;
	/** The media's entire airing schedule */
	readonly airingSchedule?: Maybe<AiringScheduleConnection>;
	/** The media's daily trend stats */
	readonly trends?: Maybe<MediaTrendConnection>;
	/** External links to another site related to the media */
	readonly externalLinks?: Maybe<ReadonlyArray<Maybe<MediaExternalLink>>>;
	/** Data and links to legal streaming episodes on external sites */
	readonly streamingEpisodes?: Maybe<ReadonlyArray<Maybe<MediaStreamingEpisode>>>;
	/** The ranking of the media in a particular time span and format compared to other media */
	readonly rankings?: Maybe<ReadonlyArray<Maybe<MediaRank>>>;
	/** The authenticated user's media list entry for the media */
	readonly mediaListEntry?: Maybe<MediaList>;
	/** User reviews of the media */
	readonly reviews?: Maybe<ReviewConnection>;
	/** User recommendations for similar media */
	readonly recommendations?: Maybe<RecommendationConnection>;
	readonly stats?: Maybe<MediaStats>;
	/** The url for the media page on the AniList website */
	readonly siteUrl?: Maybe<Scalars['String']>;
	/** If the media should have forum thread automatically created for it on airing episode release */
	readonly autoCreateForumThread?: Maybe<Scalars['Boolean']>;
	/** If the media is blocked from being recommended to/from */
	readonly isRecommendationBlocked?: Maybe<Scalars['Boolean']>;
	/** Notes for site moderators */
	readonly modNotes?: Maybe<Scalars['String']>;
}

/** Anime or Manga */
export interface MediaStatusArgs {
	version?: Maybe<Scalars['Int']>;
}

/** Anime or Manga */
export interface MediaDescriptionArgs {
	asHtml?: Maybe<Scalars['Boolean']>;
}

/** Anime or Manga */
export interface MediaSourceArgs {
	version?: Maybe<Scalars['Int']>;
}

/** Anime or Manga */
export interface MediaCharactersArgs {
	sort?: Maybe<ReadonlyArray<Maybe<CharacterSort>>>;
	role?: Maybe<CharacterRole>;
	page?: Maybe<Scalars['Int']>;
	perPage?: Maybe<Scalars['Int']>;
}

/** Anime or Manga */
export interface MediaStaffArgs {
	sort?: Maybe<ReadonlyArray<Maybe<StaffSort>>>;
	page?: Maybe<Scalars['Int']>;
	perPage?: Maybe<Scalars['Int']>;
}

/** Anime or Manga */
export interface MediaStudiosArgs {
	sort?: Maybe<ReadonlyArray<Maybe<StudioSort>>>;
	isMain?: Maybe<Scalars['Boolean']>;
}

/** Anime or Manga */
export interface MediaAiringScheduleArgs {
	notYetAired?: Maybe<Scalars['Boolean']>;
	page?: Maybe<Scalars['Int']>;
	perPage?: Maybe<Scalars['Int']>;
}

/** Anime or Manga */
export interface MediaTrendsArgs {
	sort?: Maybe<ReadonlyArray<Maybe<MediaTrendSort>>>;
	releasing?: Maybe<Scalars['Boolean']>;
	page?: Maybe<Scalars['Int']>;
	perPage?: Maybe<Scalars['Int']>;
}

/** Anime or Manga */
export interface MediaReviewsArgs {
	limit?: Maybe<Scalars['Int']>;
	sort?: Maybe<ReadonlyArray<Maybe<ReviewSort>>>;
	page?: Maybe<Scalars['Int']>;
	perPage?: Maybe<Scalars['Int']>;
}

/** Anime or Manga */
export interface MediaRecommendationsArgs {
	sort?: Maybe<ReadonlyArray<Maybe<RecommendationSort>>>;
	page?: Maybe<Scalars['Int']>;
	perPage?: Maybe<Scalars['Int']>;
}

/** Internal - Media characters separated */
export interface MediaCharacter {
	readonly __typename?: 'MediaCharacter';
	/** The id of the connection */
	readonly id?: Maybe<Scalars['Int']>;
	/** The characters role in the media */
	readonly role?: Maybe<CharacterRole>;
	readonly roleNotes?: Maybe<Scalars['String']>;
	readonly dubGroup?: Maybe<Scalars['String']>;
	/** Media specific character name */
	readonly characterName?: Maybe<Scalars['String']>;
	/** The characters in the media voiced by the parent actor */
	readonly character?: Maybe<Character>;
	/** The voice actor of the character */
	readonly voiceActor?: Maybe<Staff>;
}

export interface MediaConnection {
	readonly __typename?: 'MediaConnection';
	readonly edges?: Maybe<ReadonlyArray<Maybe<MediaEdge>>>;
	readonly nodes?: Maybe<ReadonlyArray<Maybe<Media>>>;
	/** The pagination information */
	readonly pageInfo?: Maybe<PageInfo>;
}

export interface MediaCoverImage {
	readonly __typename?: 'MediaCoverImage';
	/** The cover image url of the media at its largest size. If this size isn't available, large will be provided instead. */
	readonly extraLarge?: Maybe<Scalars['String']>;
	/** The cover image url of the media at a large size */
	readonly large?: Maybe<Scalars['String']>;
	/** The cover image url of the media at medium size */
	readonly medium?: Maybe<Scalars['String']>;
	/** Average #hex color of cover image */
	readonly color?: Maybe<Scalars['String']>;
}

/** Media connection edge */
export interface MediaEdge {
	readonly __typename?: 'MediaEdge';
	readonly node?: Maybe<Media>;
	/** The id of the connection */
	readonly id?: Maybe<Scalars['Int']>;
	/** The type of relation to the parent model */
	readonly relationType?: Maybe<MediaRelation>;
	/** If the studio is the main animation studio of the media (For Studio->MediaConnection field only) */
	readonly isMainStudio: Scalars['Boolean'];
	/** The characters in the media voiced by the parent actor */
	readonly characters?: Maybe<ReadonlyArray<Maybe<Character>>>;
	/** The characters role in the media */
	readonly characterRole?: Maybe<CharacterRole>;
	/** Media specific character name */
	readonly characterName?: Maybe<Scalars['String']>;
	/** Notes regarding the VA's role for the character */
	readonly roleNotes?: Maybe<Scalars['String']>;
	/** Used for grouping roles where multiple dubs exist for the same language. Either dubbing company name or language variant. */
	readonly dubGroup?: Maybe<Scalars['String']>;
	/** The role of the staff member in the production of the media */
	readonly staffRole?: Maybe<Scalars['String']>;
	/** The voice actors of the character */
	readonly voiceActors?: Maybe<ReadonlyArray<Maybe<Staff>>>;
	/** The voice actors of the character with role date */
	readonly voiceActorRoles?: Maybe<ReadonlyArray<Maybe<StaffRoleType>>>;
	/** The order the media should be displayed from the users favourites */
	readonly favouriteOrder?: Maybe<Scalars['Int']>;
}

/** Media connection edge */
export interface MediaEdgeRelationTypeArgs {
	version?: Maybe<Scalars['Int']>;
}

/** Media connection edge */
export interface MediaEdgeVoiceActorsArgs {
	language?: Maybe<StaffLanguage>;
	sort?: Maybe<ReadonlyArray<Maybe<StaffSort>>>;
}

/** Media connection edge */
export interface MediaEdgeVoiceActorRolesArgs {
	language?: Maybe<StaffLanguage>;
	sort?: Maybe<ReadonlyArray<Maybe<StaffSort>>>;
}

/** An external link to another site related to the media */
export interface MediaExternalLink {
	readonly __typename?: 'MediaExternalLink';
	/** The id of the external link */
	readonly id: Scalars['Int'];
	/** The url of the external link */
	readonly url: Scalars['String'];
	/** The site location of the external link */
	readonly site: Scalars['String'];
}

/** An external link to another site related to the media */
export interface MediaExternalLinkInput {
	/** The id of the external link */
	readonly id: Scalars['Int'];
	/** The url of the external link */
	readonly url: Scalars['String'];
	/** The site location of the external link */
	readonly site: Scalars['String'];
}

/** The format the media was released in */
export const enum MediaFormat {
	/** Anime broadcast on television */
	Tv = 'TV',
	/** Anime which are under 15 minutes in length and broadcast on television */
	TvShort = 'TV_SHORT',
	/** Anime movies with a theatrical release */
	Movie = 'MOVIE',
	/** Special episodes that have been included in DVD/Blu-ray releases, picture dramas, pilots, etc */
	Special = 'SPECIAL',
	/** (Original Video Animation) Anime that have been released directly on DVD/Blu-ray without originally going through a theatrical release or television broadcast */
	Ova = 'OVA',
	/** (Original Net Animation) Anime that have been originally released online or are only available through streaming services. */
	Ona = 'ONA',
	/** Short anime released as a music video */
	Music = 'MUSIC',
	/** Professionally published manga with more than one chapter */
	Manga = 'MANGA',
	/** Written books released as a series of light novels */
	Novel = 'NOVEL',
	/** Manga with just one chapter */
	OneShot = 'ONE_SHOT'
}

/** List of anime or manga */
export interface MediaList {
	readonly __typename?: 'MediaList';
	/** The id of the list entry */
	readonly id: Scalars['Int'];
	/** The id of the user owner of the list entry */
	readonly userId: Scalars['Int'];
	/** The id of the media */
	readonly mediaId: Scalars['Int'];
	/** The watching/reading status */
	readonly status?: Maybe<MediaListStatus>;
	/** The score of the entry */
	readonly score?: Maybe<Scalars['Float']>;
	/** The amount of episodes/chapters consumed by the user */
	readonly progress?: Maybe<Scalars['Int']>;
	/** The amount of volumes read by the user */
	readonly progressVolumes?: Maybe<Scalars['Int']>;
	/** The amount of times the user has rewatched/read the media */
	readonly repeat?: Maybe<Scalars['Int']>;
	/** Priority of planning */
	readonly priority?: Maybe<Scalars['Int']>;
	/** If the entry should only be visible to authenticated user */
	readonly private?: Maybe<Scalars['Boolean']>;
	/** Text notes */
	readonly notes?: Maybe<Scalars['String']>;
	/** If the entry shown be hidden from non-custom lists */
	readonly hiddenFromStatusLists?: Maybe<Scalars['Boolean']>;
	/** Map of booleans for which custom lists the entry are in */
	readonly customLists?: Maybe<Scalars['Json']>;
	/** Map of advanced scores with name keys */
	readonly advancedScores?: Maybe<Scalars['Json']>;
	/** When the entry was started by the user */
	readonly startedAt?: Maybe<FuzzyDate>;
	/** When the entry was completed by the user */
	readonly completedAt?: Maybe<FuzzyDate>;
	/** When the entry data was last updated */
	readonly updatedAt?: Maybe<Scalars['Int']>;
	/** When the entry data was created */
	readonly createdAt?: Maybe<Scalars['Int']>;
	readonly media?: Maybe<Media>;
	readonly user?: Maybe<User>;
}

/** List of anime or manga */
export interface MediaListScoreArgs {
	format?: Maybe<ScoreFormat>;
}

/** List of anime or manga */
export interface MediaListCustomListsArgs {
	asArray?: Maybe<Scalars['Boolean']>;
}

/** List of anime or manga */
export interface MediaListCollection {
	readonly __typename?: 'MediaListCollection';
	/** Grouped media list entries */
	readonly lists?: Maybe<ReadonlyArray<Maybe<MediaListGroup>>>;
	/** The owner of the list */
	readonly user?: Maybe<User>;
	/** If there is another chunk */
	readonly hasNextChunk?: Maybe<Scalars['Boolean']>;
	/**
	 * A map of media list entry arrays grouped by status
	 * @deprecated Not GraphQL spec compliant, use lists field instead.
	 */
	readonly statusLists?: Maybe<ReadonlyArray<Maybe<ReadonlyArray<Maybe<MediaList>>>>>;
	/**
	 * A map of media list entry arrays grouped by custom lists
	 * @deprecated Not GraphQL spec compliant, use lists field instead.
	 */
	readonly customLists?: Maybe<ReadonlyArray<Maybe<ReadonlyArray<Maybe<MediaList>>>>>;
}

/** List of anime or manga */
export interface MediaListCollectionStatusListsArgs {
	asArray?: Maybe<Scalars['Boolean']>;
}

/** List of anime or manga */
export interface MediaListCollectionCustomListsArgs {
	asArray?: Maybe<Scalars['Boolean']>;
}

/** List group of anime or manga entries */
export interface MediaListGroup {
	readonly __typename?: 'MediaListGroup';
	/** Media list entries */
	readonly entries?: Maybe<ReadonlyArray<Maybe<MediaList>>>;
	readonly name?: Maybe<Scalars['String']>;
	readonly isCustomList?: Maybe<Scalars['Boolean']>;
	readonly isSplitCompletedList?: Maybe<Scalars['Boolean']>;
	readonly status?: Maybe<MediaListStatus>;
}

/** A user's list options */
export interface MediaListOptions {
	readonly __typename?: 'MediaListOptions';
	/** The score format the user is using for media lists */
	readonly scoreFormat?: Maybe<ScoreFormat>;
	/** The default order list rows should be displayed in */
	readonly rowOrder?: Maybe<Scalars['String']>;
	/** @deprecated No longer used */
	readonly useLegacyLists?: Maybe<Scalars['Boolean']>;
	/** The user's anime list options */
	readonly animeList?: Maybe<MediaListTypeOptions>;
	/** The user's manga list options */
	readonly mangaList?: Maybe<MediaListTypeOptions>;
	/**
	 * The list theme options for both lists
	 * @deprecated No longer used
	 */
	readonly sharedTheme?: Maybe<Scalars['Json']>;
	/**
	 * If the shared theme should be used instead of the individual list themes
	 * @deprecated No longer used
	 */
	readonly sharedThemeEnabled?: Maybe<Scalars['Boolean']>;
}

/** A user's list options for anime or manga lists */
export interface MediaListOptionsInput {
	/** The order each list should be displayed in */
	readonly sectionOrder?: Maybe<ReadonlyArray<Maybe<Scalars['String']>>>;
	/** If the completed sections of the list should be separated by format */
	readonly splitCompletedSectionByFormat?: Maybe<Scalars['Boolean']>;
	/** The names of the user's custom lists */
	readonly customLists?: Maybe<ReadonlyArray<Maybe<Scalars['String']>>>;
	/** The names of the user's advanced scoring sections */
	readonly advancedScoring?: Maybe<ReadonlyArray<Maybe<Scalars['String']>>>;
	/** If advanced scoring is enabled */
	readonly advancedScoringEnabled?: Maybe<Scalars['Boolean']>;
	/** list theme */
	readonly theme?: Maybe<Scalars['String']>;
}

/** Media list sort enums */
export const enum MediaListSort {
	MediaId = 'MEDIA_ID',
	MediaIdDesc = 'MEDIA_ID_DESC',
	Score = 'SCORE',
	ScoreDesc = 'SCORE_DESC',
	Status = 'STATUS',
	StatusDesc = 'STATUS_DESC',
	Progress = 'PROGRESS',
	ProgressDesc = 'PROGRESS_DESC',
	ProgressVolumes = 'PROGRESS_VOLUMES',
	ProgressVolumesDesc = 'PROGRESS_VOLUMES_DESC',
	Repeat = 'REPEAT',
	RepeatDesc = 'REPEAT_DESC',
	Priority = 'PRIORITY',
	PriorityDesc = 'PRIORITY_DESC',
	StartedOn = 'STARTED_ON',
	StartedOnDesc = 'STARTED_ON_DESC',
	FinishedOn = 'FINISHED_ON',
	FinishedOnDesc = 'FINISHED_ON_DESC',
	AddedTime = 'ADDED_TIME',
	AddedTimeDesc = 'ADDED_TIME_DESC',
	UpdatedTime = 'UPDATED_TIME',
	UpdatedTimeDesc = 'UPDATED_TIME_DESC',
	MediaTitleRomaji = 'MEDIA_TITLE_ROMAJI',
	MediaTitleRomajiDesc = 'MEDIA_TITLE_ROMAJI_DESC',
	MediaTitleEnglish = 'MEDIA_TITLE_ENGLISH',
	MediaTitleEnglishDesc = 'MEDIA_TITLE_ENGLISH_DESC',
	MediaTitleNative = 'MEDIA_TITLE_NATIVE',
	MediaTitleNativeDesc = 'MEDIA_TITLE_NATIVE_DESC',
	MediaPopularity = 'MEDIA_POPULARITY',
	MediaPopularityDesc = 'MEDIA_POPULARITY_DESC'
}

/** Media list watching/reading status enum. */
export const enum MediaListStatus {
	/** Currently watching/reading */
	Current = 'CURRENT',
	/** Planning to watch/read */
	Planning = 'PLANNING',
	/** Finished watching/reading */
	Completed = 'COMPLETED',
	/** Stopped watching/reading before completing */
	Dropped = 'DROPPED',
	/** Paused watching/reading */
	Paused = 'PAUSED',
	/** Re-watching/reading */
	Repeating = 'REPEATING'
}

/** A user's list options for anime or manga lists */
export interface MediaListTypeOptions {
	readonly __typename?: 'MediaListTypeOptions';
	/** The order each list should be displayed in */
	readonly sectionOrder?: Maybe<ReadonlyArray<Maybe<Scalars['String']>>>;
	/** If the completed sections of the list should be separated by format */
	readonly splitCompletedSectionByFormat?: Maybe<Scalars['Boolean']>;
	/**
	 * The list theme options
	 * @deprecated This field has not yet been fully implemented and may change without warning
	 */
	readonly theme?: Maybe<Scalars['Json']>;
	/** The names of the user's custom lists */
	readonly customLists?: Maybe<ReadonlyArray<Maybe<Scalars['String']>>>;
	/** The names of the user's advanced scoring sections */
	readonly advancedScoring?: Maybe<ReadonlyArray<Maybe<Scalars['String']>>>;
	/** If advanced scoring is enabled */
	readonly advancedScoringEnabled?: Maybe<Scalars['Boolean']>;
}

/** The ranking of a media in a particular time span and format compared to other media */
export interface MediaRank {
	readonly __typename?: 'MediaRank';
	/** The id of the rank */
	readonly id: Scalars['Int'];
	/** The numerical rank of the media */
	readonly rank: Scalars['Int'];
	/** The type of ranking */
	readonly type: MediaRankType;
	/** The format the media is ranked within */
	readonly format: MediaFormat;
	/** The year the media is ranked within */
	readonly year?: Maybe<Scalars['Int']>;
	/** The season the media is ranked within */
	readonly season?: Maybe<MediaSeason>;
	/** If the ranking is based on all time instead of a season/year */
	readonly allTime?: Maybe<Scalars['Boolean']>;
	/** String that gives context to the ranking type and time span */
	readonly context: Scalars['String'];
}

/** The type of ranking */
export const enum MediaRankType {
	/** Ranking is based on the media's ratings/score */
	Rated = 'RATED',
	/** Ranking is based on the media's popularity */
	Popular = 'POPULAR'
}

/** Type of relation media has to its parent. */
export const enum MediaRelation {
	/** An adaption of this media into a different format */
	Adaptation = 'ADAPTATION',
	/** Released before the relation */
	Prequel = 'PREQUEL',
	/** Released after the relation */
	Sequel = 'SEQUEL',
	/** The media a side story is from */
	Parent = 'PARENT',
	/** A side story of the parent media */
	SideStory = 'SIDE_STORY',
	/** Shares at least 1 character */
	Character = 'CHARACTER',
	/** A shortened and summarized version */
	Summary = 'SUMMARY',
	/** An alternative version of the same media */
	Alternative = 'ALTERNATIVE',
	/** An alternative version of the media with a different primary focus */
	SpinOff = 'SPIN_OFF',
	/** Other */
	Other = 'OTHER',
	/** Version 2 only. The source material the media was adapted from */
	Source = 'SOURCE',
	/** Version 2 only. */
	Compilation = 'COMPILATION',
	/** Version 2 only. */
	Contains = 'CONTAINS'
}

export const enum MediaSeason {
	/** Months December to February */
	Winter = 'WINTER',
	/** Months March to May */
	Spring = 'SPRING',
	/** Months June to August */
	Summer = 'SUMMER',
	/** Months September to November */
	Fall = 'FALL'
}

/** Media sort enums */
export const enum MediaSort {
	Id = 'ID',
	IdDesc = 'ID_DESC',
	TitleRomaji = 'TITLE_ROMAJI',
	TitleRomajiDesc = 'TITLE_ROMAJI_DESC',
	TitleEnglish = 'TITLE_ENGLISH',
	TitleEnglishDesc = 'TITLE_ENGLISH_DESC',
	TitleNative = 'TITLE_NATIVE',
	TitleNativeDesc = 'TITLE_NATIVE_DESC',
	Type = 'TYPE',
	TypeDesc = 'TYPE_DESC',
	Format = 'FORMAT',
	FormatDesc = 'FORMAT_DESC',
	StartDate = 'START_DATE',
	StartDateDesc = 'START_DATE_DESC',
	EndDate = 'END_DATE',
	EndDateDesc = 'END_DATE_DESC',
	Score = 'SCORE',
	ScoreDesc = 'SCORE_DESC',
	Popularity = 'POPULARITY',
	PopularityDesc = 'POPULARITY_DESC',
	Trending = 'TRENDING',
	TrendingDesc = 'TRENDING_DESC',
	Episodes = 'EPISODES',
	EpisodesDesc = 'EPISODES_DESC',
	Duration = 'DURATION',
	DurationDesc = 'DURATION_DESC',
	Status = 'STATUS',
	StatusDesc = 'STATUS_DESC',
	Chapters = 'CHAPTERS',
	ChaptersDesc = 'CHAPTERS_DESC',
	Volumes = 'VOLUMES',
	VolumesDesc = 'VOLUMES_DESC',
	UpdatedAt = 'UPDATED_AT',
	UpdatedAtDesc = 'UPDATED_AT_DESC',
	SearchMatch = 'SEARCH_MATCH',
	Favourites = 'FAVOURITES',
	FavouritesDesc = 'FAVOURITES_DESC'
}

/** Source type the media was adapted from */
export const enum MediaSource {
	/** An original production not based of another work */
	Original = 'ORIGINAL',
	/** Asian comic book */
	Manga = 'MANGA',
	/** Written work published in volumes */
	LightNovel = 'LIGHT_NOVEL',
	/** Video game driven primary by text and narrative */
	VisualNovel = 'VISUAL_NOVEL',
	/** Video game */
	VideoGame = 'VIDEO_GAME',
	/** Other */
	Other = 'OTHER',
	/** Version 2 only. Written works not published in volumes */
	Novel = 'NOVEL',
	/** Version 2 only. Self-published works */
	Doujinshi = 'DOUJINSHI',
	/** Version 2 only. Japanese Anime */
	Anime = 'ANIME'
}

/** A media's statistics */
export interface MediaStats {
	readonly __typename?: 'MediaStats';
	readonly scoreDistribution?: Maybe<ReadonlyArray<Maybe<ScoreDistribution>>>;
	readonly statusDistribution?: Maybe<ReadonlyArray<Maybe<StatusDistribution>>>;
	/** @deprecated Replaced by MediaTrends */
	readonly airingProgression?: Maybe<ReadonlyArray<Maybe<AiringProgression>>>;
}

/** The current releasing status of the media */
export const enum MediaStatus {
	/** Has completed and is no longer being released */
	Finished = 'FINISHED',
	/** Currently releasing */
	Releasing = 'RELEASING',
	/** To be released at a later date */
	NotYetReleased = 'NOT_YET_RELEASED',
	/** Ended before the work could be finished */
	Cancelled = 'CANCELLED',
	/** Version 2 only. Is currently paused from releasing and will resume at a later date */
	Hiatus = 'HIATUS'
}

/** Data and links to legal streaming episodes on external sites */
export interface MediaStreamingEpisode {
	readonly __typename?: 'MediaStreamingEpisode';
	/** Title of the episode */
	readonly title?: Maybe<Scalars['String']>;
	/** Url of episode image thumbnail */
	readonly thumbnail?: Maybe<Scalars['String']>;
	/** The url of the episode */
	readonly url?: Maybe<Scalars['String']>;
	/** The site location of the streaming episodes */
	readonly site?: Maybe<Scalars['String']>;
}

/** Media submission */
export interface MediaSubmission {
	readonly __typename?: 'MediaSubmission';
	/** The id of the submission */
	readonly id: Scalars['Int'];
	/** User submitter of the submission */
	readonly submitter?: Maybe<User>;
	/** Status of the submission */
	readonly status?: Maybe<SubmissionStatus>;
	readonly submitterStats?: Maybe<Scalars['Json']>;
	readonly notes?: Maybe<Scalars['String']>;
	readonly source?: Maybe<Scalars['String']>;
	readonly changes?: Maybe<ReadonlyArray<Maybe<Scalars['String']>>>;
	readonly media?: Maybe<Media>;
	readonly submission?: Maybe<Media>;
	readonly characters?: Maybe<ReadonlyArray<Maybe<MediaSubmissionComparison>>>;
	readonly staff?: Maybe<ReadonlyArray<Maybe<MediaSubmissionComparison>>>;
	readonly studios?: Maybe<ReadonlyArray<Maybe<MediaSubmissionComparison>>>;
	readonly relations?: Maybe<ReadonlyArray<Maybe<MediaEdge>>>;
	readonly externalLinks?: Maybe<ReadonlyArray<Maybe<MediaExternalLink>>>;
	readonly createdAt?: Maybe<Scalars['Int']>;
}

/** Media submission with comparison to current data */
export interface MediaSubmissionComparison {
	readonly __typename?: 'MediaSubmissionComparison';
	readonly submission?: Maybe<MediaSubmissionEdge>;
	readonly character?: Maybe<MediaCharacter>;
	readonly staff?: Maybe<StaffEdge>;
	readonly studio?: Maybe<StudioEdge>;
}

export interface MediaSubmissionEdge {
	readonly __typename?: 'MediaSubmissionEdge';
	/** The id of the direct submission */
	readonly id?: Maybe<Scalars['Int']>;
	readonly characterRole?: Maybe<CharacterRole>;
	readonly staffRole?: Maybe<Scalars['String']>;
	readonly roleNotes?: Maybe<Scalars['String']>;
	readonly dubGroup?: Maybe<Scalars['String']>;
	readonly characterName?: Maybe<Scalars['String']>;
	readonly isMain?: Maybe<Scalars['Boolean']>;
	readonly character?: Maybe<Character>;
	readonly characterSubmission?: Maybe<Character>;
	readonly voiceActor?: Maybe<Staff>;
	readonly voiceActorSubmission?: Maybe<Staff>;
	readonly staff?: Maybe<Staff>;
	readonly staffSubmission?: Maybe<Staff>;
	readonly studio?: Maybe<Studio>;
	readonly media?: Maybe<Media>;
}

/** A tag that describes a theme or element of the media */
export interface MediaTag {
	readonly __typename?: 'MediaTag';
	/** The id of the tag */
	readonly id: Scalars['Int'];
	/** The name of the tag */
	readonly name: Scalars['String'];
	/** A general description of the tag */
	readonly description?: Maybe<Scalars['String']>;
	/** The categories of tags this tag belongs to */
	readonly category?: Maybe<Scalars['String']>;
	/** The relevance ranking of the tag out of the 100 for this media */
	readonly rank?: Maybe<Scalars['Int']>;
	/** If the tag could be a spoiler for any media */
	readonly isGeneralSpoiler?: Maybe<Scalars['Boolean']>;
	/** If the tag is a spoiler for this media */
	readonly isMediaSpoiler?: Maybe<Scalars['Boolean']>;
	/** If the tag is only for adult 18+ media */
	readonly isAdult?: Maybe<Scalars['Boolean']>;
}

/** The official titles of the media in various languages */
export interface MediaTitle {
	readonly __typename?: 'MediaTitle';
	/** The romanization of the native language title */
	readonly romaji?: Maybe<Scalars['String']>;
	/** The official english title */
	readonly english?: Maybe<Scalars['String']>;
	/** Official title in it's native language */
	readonly native?: Maybe<Scalars['String']>;
	/** The currently authenticated users preferred title language. Default romaji for non-authenticated */
	readonly userPreferred?: Maybe<Scalars['String']>;
}

/** The official titles of the media in various languages */
export interface MediaTitleRomajiArgs {
	stylised?: Maybe<Scalars['Boolean']>;
}

/** The official titles of the media in various languages */
export interface MediaTitleEnglishArgs {
	stylised?: Maybe<Scalars['Boolean']>;
}

/** The official titles of the media in various languages */
export interface MediaTitleNativeArgs {
	stylised?: Maybe<Scalars['Boolean']>;
}

/** The official titles of the media in various languages */
export interface MediaTitleInput {
	/** The romanization of the native language title */
	readonly romaji?: Maybe<Scalars['String']>;
	/** The official english title */
	readonly english?: Maybe<Scalars['String']>;
	/** Official title in it's native language */
	readonly native?: Maybe<Scalars['String']>;
}

/** Media trailer or advertisement */
export interface MediaTrailer {
	readonly __typename?: 'MediaTrailer';
	/** The trailer video id */
	readonly id?: Maybe<Scalars['String']>;
	/** The site the video is hosted by (Currently either youtube or dailymotion) */
	readonly site?: Maybe<Scalars['String']>;
	/** The url for the thumbnail image of the video */
	readonly thumbnail?: Maybe<Scalars['String']>;
}

/** Daily media statistics */
export interface MediaTrend {
	readonly __typename?: 'MediaTrend';
	/** The id of the tag */
	readonly mediaId: Scalars['Int'];
	/** The day the data was recorded (timestamp) */
	readonly date: Scalars['Int'];
	/** The amount of media activity on the day */
	readonly trending: Scalars['Int'];
	/** A weighted average score of all the user's scores of the media */
	readonly averageScore?: Maybe<Scalars['Int']>;
	/** The number of users with the media on their list */
	readonly popularity?: Maybe<Scalars['Int']>;
	/** The number of users with watching/reading the media */
	readonly inProgress?: Maybe<Scalars['Int']>;
	/** If the media was being released at this time */
	readonly releasing: Scalars['Boolean'];
	/** The episode number of the anime released on this day */
	readonly episode?: Maybe<Scalars['Int']>;
	/** The related media */
	readonly media?: Maybe<Media>;
}

export interface MediaTrendConnection {
	readonly __typename?: 'MediaTrendConnection';
	readonly edges?: Maybe<ReadonlyArray<Maybe<MediaTrendEdge>>>;
	readonly nodes?: Maybe<ReadonlyArray<Maybe<MediaTrend>>>;
	/** The pagination information */
	readonly pageInfo?: Maybe<PageInfo>;
}

/** Media trend connection edge */
export interface MediaTrendEdge {
	readonly __typename?: 'MediaTrendEdge';
	readonly node?: Maybe<MediaTrend>;
}

/** Media trend sort enums */
export const enum MediaTrendSort {
	Id = 'ID',
	IdDesc = 'ID_DESC',
	MediaId = 'MEDIA_ID',
	MediaIdDesc = 'MEDIA_ID_DESC',
	Date = 'DATE',
	DateDesc = 'DATE_DESC',
	Score = 'SCORE',
	ScoreDesc = 'SCORE_DESC',
	Popularity = 'POPULARITY',
	PopularityDesc = 'POPULARITY_DESC',
	Trending = 'TRENDING',
	TrendingDesc = 'TRENDING_DESC',
	Episode = 'EPISODE',
	EpisodeDesc = 'EPISODE_DESC'
}

/** Media type enum, anime or manga. */
export const enum MediaType {
	/** Japanese Anime */
	Anime = 'ANIME',
	/** Asian comic */
	Manga = 'MANGA'
}

/** User message activity */
export interface MessageActivity {
	readonly __typename?: 'MessageActivity';
	/** The id of the activity */
	readonly id: Scalars['Int'];
	/** The user id of the activity's recipient */
	readonly recipientId?: Maybe<Scalars['Int']>;
	/** The user id of the activity's sender */
	readonly messengerId?: Maybe<Scalars['Int']>;
	/** The type of the activity */
	readonly type?: Maybe<ActivityType>;
	/** The number of activity replies */
	readonly replyCount: Scalars['Int'];
	/** The message text (Markdown) */
	readonly message?: Maybe<Scalars['String']>;
	/** If the activity is locked and can receive replies */
	readonly isLocked?: Maybe<Scalars['Boolean']>;
	/** If the currently authenticated user is subscribed to the activity */
	readonly isSubscribed?: Maybe<Scalars['Boolean']>;
	/** The amount of likes the activity has */
	readonly likeCount: Scalars['Int'];
	/** If the currently authenticated user liked the activity */
	readonly isLiked?: Maybe<Scalars['Boolean']>;
	/** If the message is private and only viewable to the sender and recipients */
	readonly isPrivate?: Maybe<Scalars['Boolean']>;
	/** The url for the activity page on the AniList website */
	readonly siteUrl?: Maybe<Scalars['String']>;
	/** The time the activity was created at */
	readonly createdAt: Scalars['Int'];
	/** The user who the activity message was sent to */
	readonly recipient?: Maybe<User>;
	/** The user who sent the activity message */
	readonly messenger?: Maybe<User>;
	/** The written replies to the activity */
	readonly replies?: Maybe<ReadonlyArray<Maybe<ActivityReply>>>;
	/** The users who liked the activity */
	readonly likes?: Maybe<ReadonlyArray<Maybe<User>>>;
}

/** User message activity */
export interface MessageActivityMessageArgs {
	asHtml?: Maybe<Scalars['Boolean']>;
}

export interface ModAction {
	readonly __typename?: 'ModAction';
	/** The id of the action */
	readonly id: Scalars['Int'];
	readonly user?: Maybe<User>;
	readonly mod?: Maybe<User>;
	readonly type?: Maybe<ModActionType>;
	readonly objectId?: Maybe<Scalars['Int']>;
	readonly objectType?: Maybe<Scalars['String']>;
	readonly data?: Maybe<Scalars['String']>;
	readonly createdAt: Scalars['Int'];
}

export const enum ModActionType {
	Note = 'NOTE',
	Ban = 'BAN',
	Delete = 'DELETE',
	Edit = 'EDIT',
	Expire = 'EXPIRE',
	Report = 'REPORT',
	Reset = 'RESET',
	Anon = 'ANON'
}

/** Mod role enums */
export const enum ModRole {
	/** An AniList administrator */
	Admin = 'ADMIN',
	/** A head developer of AniList */
	LeadDeveloper = 'LEAD_DEVELOPER',
	/** An AniList developer */
	Developer = 'DEVELOPER',
	/** A lead community moderator */
	LeadCommunity = 'LEAD_COMMUNITY',
	/** A community moderator */
	Community = 'COMMUNITY',
	/** A discord community moderator */
	DiscordCommunity = 'DISCORD_COMMUNITY',
	/** A lead anime data moderator */
	LeadAnimeData = 'LEAD_ANIME_DATA',
	/** An anime data moderator */
	AnimeData = 'ANIME_DATA',
	/** A lead manga data moderator */
	LeadMangaData = 'LEAD_MANGA_DATA',
	/** A manga data moderator */
	MangaData = 'MANGA_DATA',
	/** A lead social media moderator */
	LeadSocialMedia = 'LEAD_SOCIAL_MEDIA',
	/** A social media moderator */
	SocialMedia = 'SOCIAL_MEDIA',
	/** A retired moderator */
	Retired = 'RETIRED'
}

export interface Mutation {
	readonly __typename?: 'Mutation';
	readonly UpdateUser?: Maybe<User>;
	/** Create or update a media list entry */
	readonly SaveMediaListEntry?: Maybe<MediaList>;
	/** Update multiple media list entries to the same values */
	readonly UpdateMediaListEntries?: Maybe<ReadonlyArray<Maybe<MediaList>>>;
	/** Delete a media list entry */
	readonly DeleteMediaListEntry?: Maybe<Deleted>;
	/** Delete a custom list and remove the list entries from it */
	readonly DeleteCustomList?: Maybe<Deleted>;
	/** Create or update text activity for the currently authenticated user */
	readonly SaveTextActivity?: Maybe<TextActivity>;
	/** Create or update message activity for the currently authenticated user */
	readonly SaveMessageActivity?: Maybe<MessageActivity>;
	/** Update list activity (Mod Only) */
	readonly SaveListActivity?: Maybe<ListActivity>;
	/** Delete an activity item of the authenticated users */
	readonly DeleteActivity?: Maybe<Deleted>;
	/** Toggle the subscription of an activity item */
	readonly ToggleActivitySubscription?: Maybe<ActivityUnion>;
	/** Create or update an activity reply */
	readonly SaveActivityReply?: Maybe<ActivityReply>;
	/** Delete an activity reply of the authenticated users */
	readonly DeleteActivityReply?: Maybe<Deleted>;
	/**
	 * Add or remove a like from a likeable type.
	 *                           Returns all the users who liked the same model
	 */
	readonly ToggleLike?: Maybe<ReadonlyArray<Maybe<User>>>;
	/** Add or remove a like from a likeable type. */
	readonly ToggleLikeV2?: Maybe<LikeableUnion>;
	/** Toggle the un/following of a user */
	readonly ToggleFollow?: Maybe<User>;
	/** Favourite or unfavourite an anime, manga, character, staff member, or studio */
	readonly ToggleFavourite?: Maybe<Favourites>;
	/** Update the order favourites are displayed in */
	readonly UpdateFavouriteOrder?: Maybe<Favourites>;
	/** Create or update a review */
	readonly SaveReview?: Maybe<Review>;
	/** Delete a review */
	readonly DeleteReview?: Maybe<Deleted>;
	/** Rate a review */
	readonly RateReview?: Maybe<Review>;
	/** Recommendation a media */
	readonly SaveRecommendation?: Maybe<Recommendation>;
	/** Create or update a forum thread */
	readonly SaveThread?: Maybe<Thread>;
	/** Delete a thread */
	readonly DeleteThread?: Maybe<Deleted>;
	/** Toggle the subscription of a forum thread */
	readonly ToggleThreadSubscription?: Maybe<Thread>;
	/** Create or update a thread comment */
	readonly SaveThreadComment?: Maybe<ThreadComment>;
	/** Delete a thread comment */
	readonly DeleteThreadComment?: Maybe<Deleted>;
	readonly UpdateAniChartSettings?: Maybe<Scalars['Json']>;
	readonly UpdateAniChartHighlights?: Maybe<Scalars['Json']>;
}

export interface MutationUpdateUserArgs {
	about?: Maybe<Scalars['String']>;
	titleLanguage?: Maybe<UserTitleLanguage>;
	displayAdultContent?: Maybe<Scalars['Boolean']>;
	airingNotifications?: Maybe<Scalars['Boolean']>;
	scoreFormat?: Maybe<ScoreFormat>;
	rowOrder?: Maybe<Scalars['String']>;
	profileColor?: Maybe<Scalars['String']>;
	donatorBadge?: Maybe<Scalars['String']>;
	notificationOptions?: Maybe<ReadonlyArray<Maybe<NotificationOptionInput>>>;
	timezone?: Maybe<Scalars['String']>;
	activityMergeTime?: Maybe<Scalars['Int']>;
	animeListOptions?: Maybe<MediaListOptionsInput>;
	mangaListOptions?: Maybe<MediaListOptionsInput>;
	staffNameLanguage?: Maybe<UserStaffNameLanguage>;
}

export interface MutationSaveMediaListEntryArgs {
	id?: Maybe<Scalars['Int']>;
	mediaId?: Maybe<Scalars['Int']>;
	status?: Maybe<MediaListStatus>;
	score?: Maybe<Scalars['Float']>;
	scoreRaw?: Maybe<Scalars['Int']>;
	progress?: Maybe<Scalars['Int']>;
	progressVolumes?: Maybe<Scalars['Int']>;
	repeat?: Maybe<Scalars['Int']>;
	priority?: Maybe<Scalars['Int']>;
	private?: Maybe<Scalars['Boolean']>;
	notes?: Maybe<Scalars['String']>;
	hiddenFromStatusLists?: Maybe<Scalars['Boolean']>;
	customLists?: Maybe<ReadonlyArray<Maybe<Scalars['String']>>>;
	advancedScores?: Maybe<ReadonlyArray<Maybe<Scalars['Float']>>>;
	startedAt?: Maybe<FuzzyDateInput>;
	completedAt?: Maybe<FuzzyDateInput>;
}

export interface MutationUpdateMediaListEntriesArgs {
	status?: Maybe<MediaListStatus>;
	score?: Maybe<Scalars['Float']>;
	scoreRaw?: Maybe<Scalars['Int']>;
	progress?: Maybe<Scalars['Int']>;
	progressVolumes?: Maybe<Scalars['Int']>;
	repeat?: Maybe<Scalars['Int']>;
	priority?: Maybe<Scalars['Int']>;
	private?: Maybe<Scalars['Boolean']>;
	notes?: Maybe<Scalars['String']>;
	hiddenFromStatusLists?: Maybe<Scalars['Boolean']>;
	advancedScores?: Maybe<ReadonlyArray<Maybe<Scalars['Float']>>>;
	startedAt?: Maybe<FuzzyDateInput>;
	completedAt?: Maybe<FuzzyDateInput>;
	ids?: Maybe<ReadonlyArray<Maybe<Scalars['Int']>>>;
}

export interface MutationDeleteMediaListEntryArgs {
	id?: Maybe<Scalars['Int']>;
}

export interface MutationDeleteCustomListArgs {
	customList?: Maybe<Scalars['String']>;
	type?: Maybe<MediaType>;
}

export interface MutationSaveTextActivityArgs {
	id?: Maybe<Scalars['Int']>;
	text?: Maybe<Scalars['String']>;
	locked?: Maybe<Scalars['Boolean']>;
}

export interface MutationSaveMessageActivityArgs {
	id?: Maybe<Scalars['Int']>;
	message?: Maybe<Scalars['String']>;
	recipientId?: Maybe<Scalars['Int']>;
	private?: Maybe<Scalars['Boolean']>;
	locked?: Maybe<Scalars['Boolean']>;
	asMod?: Maybe<Scalars['Boolean']>;
}

export interface MutationSaveListActivityArgs {
	id?: Maybe<Scalars['Int']>;
	locked?: Maybe<Scalars['Boolean']>;
}

export interface MutationDeleteActivityArgs {
	id?: Maybe<Scalars['Int']>;
}

export interface MutationToggleActivitySubscriptionArgs {
	activityId?: Maybe<Scalars['Int']>;
	subscribe?: Maybe<Scalars['Boolean']>;
}

export interface MutationSaveActivityReplyArgs {
	id?: Maybe<Scalars['Int']>;
	activityId?: Maybe<Scalars['Int']>;
	text?: Maybe<Scalars['String']>;
	asMod?: Maybe<Scalars['Boolean']>;
}

export interface MutationDeleteActivityReplyArgs {
	id?: Maybe<Scalars['Int']>;
}

export interface MutationToggleLikeArgs {
	id?: Maybe<Scalars['Int']>;
	type?: Maybe<LikeableType>;
}

export interface MutationToggleLikeV2Args {
	id?: Maybe<Scalars['Int']>;
	type?: Maybe<LikeableType>;
}

export interface MutationToggleFollowArgs {
	userId?: Maybe<Scalars['Int']>;
}

export interface MutationToggleFavouriteArgs {
	animeId?: Maybe<Scalars['Int']>;
	mangaId?: Maybe<Scalars['Int']>;
	characterId?: Maybe<Scalars['Int']>;
	staffId?: Maybe<Scalars['Int']>;
	studioId?: Maybe<Scalars['Int']>;
}

export interface MutationUpdateFavouriteOrderArgs {
	animeIds?: Maybe<ReadonlyArray<Maybe<Scalars['Int']>>>;
	mangaIds?: Maybe<ReadonlyArray<Maybe<Scalars['Int']>>>;
	characterIds?: Maybe<ReadonlyArray<Maybe<Scalars['Int']>>>;
	staffIds?: Maybe<ReadonlyArray<Maybe<Scalars['Int']>>>;
	studioIds?: Maybe<ReadonlyArray<Maybe<Scalars['Int']>>>;
	animeOrder?: Maybe<ReadonlyArray<Maybe<Scalars['Int']>>>;
	mangaOrder?: Maybe<ReadonlyArray<Maybe<Scalars['Int']>>>;
	characterOrder?: Maybe<ReadonlyArray<Maybe<Scalars['Int']>>>;
	staffOrder?: Maybe<ReadonlyArray<Maybe<Scalars['Int']>>>;
	studioOrder?: Maybe<ReadonlyArray<Maybe<Scalars['Int']>>>;
}

export interface MutationSaveReviewArgs {
	id?: Maybe<Scalars['Int']>;
	mediaId?: Maybe<Scalars['Int']>;
	body?: Maybe<Scalars['String']>;
	summary?: Maybe<Scalars['String']>;
	score?: Maybe<Scalars['Int']>;
	private?: Maybe<Scalars['Boolean']>;
}

export interface MutationDeleteReviewArgs {
	id?: Maybe<Scalars['Int']>;
}

export interface MutationRateReviewArgs {
	reviewId?: Maybe<Scalars['Int']>;
	rating?: Maybe<ReviewRating>;
}

export interface MutationSaveRecommendationArgs {
	mediaId?: Maybe<Scalars['Int']>;
	mediaRecommendationId?: Maybe<Scalars['Int']>;
	rating?: Maybe<RecommendationRating>;
}

export interface MutationSaveThreadArgs {
	id?: Maybe<Scalars['Int']>;
	title?: Maybe<Scalars['String']>;
	body?: Maybe<Scalars['String']>;
	categories?: Maybe<ReadonlyArray<Maybe<Scalars['Int']>>>;
	mediaCategories?: Maybe<ReadonlyArray<Maybe<Scalars['Int']>>>;
	sticky?: Maybe<Scalars['Boolean']>;
	locked?: Maybe<Scalars['Boolean']>;
}

export interface MutationDeleteThreadArgs {
	id?: Maybe<Scalars['Int']>;
}

export interface MutationToggleThreadSubscriptionArgs {
	threadId?: Maybe<Scalars['Int']>;
	subscribe?: Maybe<Scalars['Boolean']>;
}

export interface MutationSaveThreadCommentArgs {
	id?: Maybe<Scalars['Int']>;
	threadId?: Maybe<Scalars['Int']>;
	parentCommentId?: Maybe<Scalars['Int']>;
	comment?: Maybe<Scalars['String']>;
}

export interface MutationDeleteThreadCommentArgs {
	id?: Maybe<Scalars['Int']>;
}

export interface MutationUpdateAniChartSettingsArgs {
	titleLanguage?: Maybe<Scalars['String']>;
	outgoingLinkProvider?: Maybe<Scalars['String']>;
	theme?: Maybe<Scalars['String']>;
	sort?: Maybe<Scalars['String']>;
}

export interface MutationUpdateAniChartHighlightsArgs {
	highlights?: Maybe<ReadonlyArray<Maybe<AniChartHighlightInput>>>;
}

/** Notification option */
export interface NotificationOption {
	readonly __typename?: 'NotificationOption';
	/** The type of notification */
	readonly type?: Maybe<NotificationType>;
	/** Whether this type of notification is enabled */
	readonly enabled?: Maybe<Scalars['Boolean']>;
}

/** Notification option input */
export interface NotificationOptionInput {
	/** The type of notification */
	readonly type?: Maybe<NotificationType>;
	/** Whether this type of notification is enabled */
	readonly enabled?: Maybe<Scalars['Boolean']>;
}

/** Notification type enum */
export const enum NotificationType {
	/** A user has sent you message */
	ActivityMessage = 'ACTIVITY_MESSAGE',
	/** A user has replied to your activity */
	ActivityReply = 'ACTIVITY_REPLY',
	/** A user has followed you */
	Following = 'FOLLOWING',
	/** A user has mentioned you in their activity */
	ActivityMention = 'ACTIVITY_MENTION',
	/** A user has mentioned you in a forum comment */
	ThreadCommentMention = 'THREAD_COMMENT_MENTION',
	/** A user has commented in one of your subscribed forum threads */
	ThreadSubscribed = 'THREAD_SUBSCRIBED',
	/** A user has replied to your forum comment */
	ThreadCommentReply = 'THREAD_COMMENT_REPLY',
	/** An anime you are currently watching has aired */
	Airing = 'AIRING',
	/** A user has liked your activity */
	ActivityLike = 'ACTIVITY_LIKE',
	/** A user has liked your activity reply */
	ActivityReplyLike = 'ACTIVITY_REPLY_LIKE',
	/** A user has liked your forum thread */
	ThreadLike = 'THREAD_LIKE',
	/** A user has liked your forum comment */
	ThreadCommentLike = 'THREAD_COMMENT_LIKE',
	/** A user has replied to activity you have also replied to */
	ActivityReplySubscribed = 'ACTIVITY_REPLY_SUBSCRIBED',
	/** A new anime or manga has been added to the site where its related media is on the user's list */
	RelatedMediaAddition = 'RELATED_MEDIA_ADDITION'
}

/** Notification union type */
export type NotificationUnion =
	| AiringNotification
	| FollowingNotification
	| ActivityMessageNotification
	| ActivityMentionNotification
	| ActivityReplyNotification
	| ActivityReplySubscribedNotification
	| ActivityLikeNotification
	| ActivityReplyLikeNotification
	| ThreadCommentMentionNotification
	| ThreadCommentReplyNotification
	| ThreadCommentSubscribedNotification
	| ThreadCommentLikeNotification
	| ThreadLikeNotification
	| RelatedMediaAdditionNotification;

/** Page of data */
export interface Page {
	readonly __typename?: 'Page';
	/** The pagination information */
	readonly pageInfo?: Maybe<PageInfo>;
	readonly users?: Maybe<ReadonlyArray<Maybe<User>>>;
	readonly media?: Maybe<ReadonlyArray<Maybe<Media>>>;
	readonly characters?: Maybe<ReadonlyArray<Maybe<Character>>>;
	readonly staff?: Maybe<ReadonlyArray<Maybe<Staff>>>;
	readonly studios?: Maybe<ReadonlyArray<Maybe<Studio>>>;
	readonly mediaList?: Maybe<ReadonlyArray<Maybe<MediaList>>>;
	readonly airingSchedules?: Maybe<ReadonlyArray<Maybe<AiringSchedule>>>;
	readonly mediaTrends?: Maybe<ReadonlyArray<Maybe<MediaTrend>>>;
	readonly notifications?: Maybe<ReadonlyArray<Maybe<NotificationUnion>>>;
	readonly followers?: Maybe<ReadonlyArray<Maybe<User>>>;
	readonly following?: Maybe<ReadonlyArray<Maybe<User>>>;
	readonly activities?: Maybe<ReadonlyArray<Maybe<ActivityUnion>>>;
	readonly activityReplies?: Maybe<ReadonlyArray<Maybe<ActivityReply>>>;
	readonly threads?: Maybe<ReadonlyArray<Maybe<Thread>>>;
	readonly threadComments?: Maybe<ReadonlyArray<Maybe<ThreadComment>>>;
	readonly reviews?: Maybe<ReadonlyArray<Maybe<Review>>>;
	readonly recommendations?: Maybe<ReadonlyArray<Maybe<Recommendation>>>;
	readonly likes?: Maybe<ReadonlyArray<Maybe<User>>>;
}

/** Page of data */
export interface PageUsersArgs {
	id?: Maybe<Scalars['Int']>;
	name?: Maybe<Scalars['String']>;
	isModerator?: Maybe<Scalars['Boolean']>;
	search?: Maybe<Scalars['String']>;
	sort?: Maybe<ReadonlyArray<Maybe<UserSort>>>;
}

/** Page of data */
export interface PageMediaArgs {
	id?: Maybe<Scalars['Int']>;
	idMal?: Maybe<Scalars['Int']>;
	startDate?: Maybe<Scalars['FuzzyDateInt']>;
	endDate?: Maybe<Scalars['FuzzyDateInt']>;
	season?: Maybe<MediaSeason>;
	seasonYear?: Maybe<Scalars['Int']>;
	type?: Maybe<MediaType>;
	format?: Maybe<MediaFormat>;
	status?: Maybe<MediaStatus>;
	episodes?: Maybe<Scalars['Int']>;
	duration?: Maybe<Scalars['Int']>;
	chapters?: Maybe<Scalars['Int']>;
	volumes?: Maybe<Scalars['Int']>;
	isAdult?: Maybe<Scalars['Boolean']>;
	genre?: Maybe<Scalars['String']>;
	tag?: Maybe<Scalars['String']>;
	minimumTagRank?: Maybe<Scalars['Int']>;
	tagCategory?: Maybe<Scalars['String']>;
	onList?: Maybe<Scalars['Boolean']>;
	licensedBy?: Maybe<Scalars['String']>;
	averageScore?: Maybe<Scalars['Int']>;
	popularity?: Maybe<Scalars['Int']>;
	source?: Maybe<MediaSource>;
	countryOfOrigin?: Maybe<Scalars['CountryCode']>;
	search?: Maybe<Scalars['String']>;
	id_not?: Maybe<Scalars['Int']>;
	id_in?: Maybe<ReadonlyArray<Maybe<Scalars['Int']>>>;
	id_not_in?: Maybe<ReadonlyArray<Maybe<Scalars['Int']>>>;
	idMal_not?: Maybe<Scalars['Int']>;
	idMal_in?: Maybe<ReadonlyArray<Maybe<Scalars['Int']>>>;
	idMal_not_in?: Maybe<ReadonlyArray<Maybe<Scalars['Int']>>>;
	startDate_greater?: Maybe<Scalars['FuzzyDateInt']>;
	startDate_lesser?: Maybe<Scalars['FuzzyDateInt']>;
	startDate_like?: Maybe<Scalars['String']>;
	endDate_greater?: Maybe<Scalars['FuzzyDateInt']>;
	endDate_lesser?: Maybe<Scalars['FuzzyDateInt']>;
	endDate_like?: Maybe<Scalars['String']>;
	format_in?: Maybe<ReadonlyArray<Maybe<MediaFormat>>>;
	format_not?: Maybe<MediaFormat>;
	format_not_in?: Maybe<ReadonlyArray<Maybe<MediaFormat>>>;
	status_in?: Maybe<ReadonlyArray<Maybe<MediaStatus>>>;
	status_not?: Maybe<MediaStatus>;
	status_not_in?: Maybe<ReadonlyArray<Maybe<MediaStatus>>>;
	episodes_greater?: Maybe<Scalars['Int']>;
	episodes_lesser?: Maybe<Scalars['Int']>;
	duration_greater?: Maybe<Scalars['Int']>;
	duration_lesser?: Maybe<Scalars['Int']>;
	chapters_greater?: Maybe<Scalars['Int']>;
	chapters_lesser?: Maybe<Scalars['Int']>;
	volumes_greater?: Maybe<Scalars['Int']>;
	volumes_lesser?: Maybe<Scalars['Int']>;
	genre_in?: Maybe<ReadonlyArray<Maybe<Scalars['String']>>>;
	genre_not_in?: Maybe<ReadonlyArray<Maybe<Scalars['String']>>>;
	tag_in?: Maybe<ReadonlyArray<Maybe<Scalars['String']>>>;
	tag_not_in?: Maybe<ReadonlyArray<Maybe<Scalars['String']>>>;
	tagCategory_in?: Maybe<ReadonlyArray<Maybe<Scalars['String']>>>;
	tagCategory_not_in?: Maybe<ReadonlyArray<Maybe<Scalars['String']>>>;
	licensedBy_in?: Maybe<ReadonlyArray<Maybe<Scalars['String']>>>;
	averageScore_not?: Maybe<Scalars['Int']>;
	averageScore_greater?: Maybe<Scalars['Int']>;
	averageScore_lesser?: Maybe<Scalars['Int']>;
	popularity_not?: Maybe<Scalars['Int']>;
	popularity_greater?: Maybe<Scalars['Int']>;
	popularity_lesser?: Maybe<Scalars['Int']>;
	source_in?: Maybe<ReadonlyArray<Maybe<MediaSource>>>;
	sort?: Maybe<ReadonlyArray<Maybe<MediaSort>>>;
}

/** Page of data */
export interface PageCharactersArgs {
	id?: Maybe<Scalars['Int']>;
	isBirthday?: Maybe<Scalars['Boolean']>;
	search?: Maybe<Scalars['String']>;
	id_not?: Maybe<Scalars['Int']>;
	id_in?: Maybe<ReadonlyArray<Maybe<Scalars['Int']>>>;
	id_not_in?: Maybe<ReadonlyArray<Maybe<Scalars['Int']>>>;
	sort?: Maybe<ReadonlyArray<Maybe<CharacterSort>>>;
}

/** Page of data */
export interface PageStaffArgs {
	id?: Maybe<Scalars['Int']>;
	isBirthday?: Maybe<Scalars['Boolean']>;
	search?: Maybe<Scalars['String']>;
	id_not?: Maybe<Scalars['Int']>;
	id_in?: Maybe<ReadonlyArray<Maybe<Scalars['Int']>>>;
	id_not_in?: Maybe<ReadonlyArray<Maybe<Scalars['Int']>>>;
	sort?: Maybe<ReadonlyArray<Maybe<StaffSort>>>;
}

/** Page of data */
export interface PageStudiosArgs {
	id?: Maybe<Scalars['Int']>;
	search?: Maybe<Scalars['String']>;
	id_not?: Maybe<Scalars['Int']>;
	id_in?: Maybe<ReadonlyArray<Maybe<Scalars['Int']>>>;
	id_not_in?: Maybe<ReadonlyArray<Maybe<Scalars['Int']>>>;
	sort?: Maybe<ReadonlyArray<Maybe<StudioSort>>>;
}

/** Page of data */
export interface PageMediaListArgs {
	id?: Maybe<Scalars['Int']>;
	userId?: Maybe<Scalars['Int']>;
	userName?: Maybe<Scalars['String']>;
	type?: Maybe<MediaType>;
	status?: Maybe<MediaListStatus>;
	mediaId?: Maybe<Scalars['Int']>;
	isFollowing?: Maybe<Scalars['Boolean']>;
	notes?: Maybe<Scalars['String']>;
	startedAt?: Maybe<Scalars['FuzzyDateInt']>;
	completedAt?: Maybe<Scalars['FuzzyDateInt']>;
	compareWithAuthList?: Maybe<Scalars['Boolean']>;
	userId_in?: Maybe<ReadonlyArray<Maybe<Scalars['Int']>>>;
	status_in?: Maybe<ReadonlyArray<Maybe<MediaListStatus>>>;
	status_not_in?: Maybe<ReadonlyArray<Maybe<MediaListStatus>>>;
	status_not?: Maybe<MediaListStatus>;
	mediaId_in?: Maybe<ReadonlyArray<Maybe<Scalars['Int']>>>;
	mediaId_not_in?: Maybe<ReadonlyArray<Maybe<Scalars['Int']>>>;
	notes_like?: Maybe<Scalars['String']>;
	startedAt_greater?: Maybe<Scalars['FuzzyDateInt']>;
	startedAt_lesser?: Maybe<Scalars['FuzzyDateInt']>;
	startedAt_like?: Maybe<Scalars['String']>;
	completedAt_greater?: Maybe<Scalars['FuzzyDateInt']>;
	completedAt_lesser?: Maybe<Scalars['FuzzyDateInt']>;
	completedAt_like?: Maybe<Scalars['String']>;
	sort?: Maybe<ReadonlyArray<Maybe<MediaListSort>>>;
}

/** Page of data */
export interface PageAiringSchedulesArgs {
	id?: Maybe<Scalars['Int']>;
	mediaId?: Maybe<Scalars['Int']>;
	episode?: Maybe<Scalars['Int']>;
	airingAt?: Maybe<Scalars['Int']>;
	notYetAired?: Maybe<Scalars['Boolean']>;
	id_not?: Maybe<Scalars['Int']>;
	id_in?: Maybe<ReadonlyArray<Maybe<Scalars['Int']>>>;
	id_not_in?: Maybe<ReadonlyArray<Maybe<Scalars['Int']>>>;
	mediaId_not?: Maybe<Scalars['Int']>;
	mediaId_in?: Maybe<ReadonlyArray<Maybe<Scalars['Int']>>>;
	mediaId_not_in?: Maybe<ReadonlyArray<Maybe<Scalars['Int']>>>;
	episode_not?: Maybe<Scalars['Int']>;
	episode_in?: Maybe<ReadonlyArray<Maybe<Scalars['Int']>>>;
	episode_not_in?: Maybe<ReadonlyArray<Maybe<Scalars['Int']>>>;
	episode_greater?: Maybe<Scalars['Int']>;
	episode_lesser?: Maybe<Scalars['Int']>;
	airingAt_greater?: Maybe<Scalars['Int']>;
	airingAt_lesser?: Maybe<Scalars['Int']>;
	sort?: Maybe<ReadonlyArray<Maybe<AiringSort>>>;
}

/** Page of data */
export interface PageMediaTrendsArgs {
	mediaId?: Maybe<Scalars['Int']>;
	date?: Maybe<Scalars['Int']>;
	trending?: Maybe<Scalars['Int']>;
	averageScore?: Maybe<Scalars['Int']>;
	popularity?: Maybe<Scalars['Int']>;
	episode?: Maybe<Scalars['Int']>;
	releasing?: Maybe<Scalars['Boolean']>;
	mediaId_not?: Maybe<Scalars['Int']>;
	mediaId_in?: Maybe<ReadonlyArray<Maybe<Scalars['Int']>>>;
	mediaId_not_in?: Maybe<ReadonlyArray<Maybe<Scalars['Int']>>>;
	date_greater?: Maybe<Scalars['Int']>;
	date_lesser?: Maybe<Scalars['Int']>;
	trending_greater?: Maybe<Scalars['Int']>;
	trending_lesser?: Maybe<Scalars['Int']>;
	trending_not?: Maybe<Scalars['Int']>;
	averageScore_greater?: Maybe<Scalars['Int']>;
	averageScore_lesser?: Maybe<Scalars['Int']>;
	averageScore_not?: Maybe<Scalars['Int']>;
	popularity_greater?: Maybe<Scalars['Int']>;
	popularity_lesser?: Maybe<Scalars['Int']>;
	popularity_not?: Maybe<Scalars['Int']>;
	episode_greater?: Maybe<Scalars['Int']>;
	episode_lesser?: Maybe<Scalars['Int']>;
	episode_not?: Maybe<Scalars['Int']>;
	sort?: Maybe<ReadonlyArray<Maybe<MediaTrendSort>>>;
}

/** Page of data */
export interface PageNotificationsArgs {
	type?: Maybe<NotificationType>;
	resetNotificationCount?: Maybe<Scalars['Boolean']>;
	type_in?: Maybe<ReadonlyArray<Maybe<NotificationType>>>;
}

/** Page of data */
export interface PageFollowersArgs {
	userId: Scalars['Int'];
	sort?: Maybe<ReadonlyArray<Maybe<UserSort>>>;
}

/** Page of data */
export interface PageFollowingArgs {
	userId: Scalars['Int'];
	sort?: Maybe<ReadonlyArray<Maybe<UserSort>>>;
}

/** Page of data */
export interface PageActivitiesArgs {
	id?: Maybe<Scalars['Int']>;
	userId?: Maybe<Scalars['Int']>;
	messengerId?: Maybe<Scalars['Int']>;
	mediaId?: Maybe<Scalars['Int']>;
	type?: Maybe<ActivityType>;
	isFollowing?: Maybe<Scalars['Boolean']>;
	hasReplies?: Maybe<Scalars['Boolean']>;
	hasRepliesOrTypeText?: Maybe<Scalars['Boolean']>;
	createdAt?: Maybe<Scalars['Int']>;
	id_not?: Maybe<Scalars['Int']>;
	id_in?: Maybe<ReadonlyArray<Maybe<Scalars['Int']>>>;
	id_not_in?: Maybe<ReadonlyArray<Maybe<Scalars['Int']>>>;
	userId_not?: Maybe<Scalars['Int']>;
	userId_in?: Maybe<ReadonlyArray<Maybe<Scalars['Int']>>>;
	userId_not_in?: Maybe<ReadonlyArray<Maybe<Scalars['Int']>>>;
	messengerId_not?: Maybe<Scalars['Int']>;
	messengerId_in?: Maybe<ReadonlyArray<Maybe<Scalars['Int']>>>;
	messengerId_not_in?: Maybe<ReadonlyArray<Maybe<Scalars['Int']>>>;
	mediaId_not?: Maybe<Scalars['Int']>;
	mediaId_in?: Maybe<ReadonlyArray<Maybe<Scalars['Int']>>>;
	mediaId_not_in?: Maybe<ReadonlyArray<Maybe<Scalars['Int']>>>;
	type_not?: Maybe<ActivityType>;
	type_in?: Maybe<ReadonlyArray<Maybe<ActivityType>>>;
	type_not_in?: Maybe<ReadonlyArray<Maybe<ActivityType>>>;
	createdAt_greater?: Maybe<Scalars['Int']>;
	createdAt_lesser?: Maybe<Scalars['Int']>;
	sort?: Maybe<ReadonlyArray<Maybe<ActivitySort>>>;
}

/** Page of data */
export interface PageActivityRepliesArgs {
	id?: Maybe<Scalars['Int']>;
	activityId?: Maybe<Scalars['Int']>;
}

/** Page of data */
export interface PageThreadsArgs {
	id?: Maybe<Scalars['Int']>;
	userId?: Maybe<Scalars['Int']>;
	replyUserId?: Maybe<Scalars['Int']>;
	subscribed?: Maybe<Scalars['Boolean']>;
	categoryId?: Maybe<Scalars['Int']>;
	mediaCategoryId?: Maybe<Scalars['Int']>;
	search?: Maybe<Scalars['String']>;
	id_in?: Maybe<ReadonlyArray<Maybe<Scalars['Int']>>>;
	sort?: Maybe<ReadonlyArray<Maybe<ThreadSort>>>;
}

/** Page of data */
export interface PageThreadCommentsArgs {
	id?: Maybe<Scalars['Int']>;
	threadId?: Maybe<Scalars['Int']>;
	userId?: Maybe<Scalars['Int']>;
	sort?: Maybe<ReadonlyArray<Maybe<ThreadCommentSort>>>;
}

/** Page of data */
export interface PageReviewsArgs {
	id?: Maybe<Scalars['Int']>;
	mediaId?: Maybe<Scalars['Int']>;
	userId?: Maybe<Scalars['Int']>;
	mediaType?: Maybe<MediaType>;
	sort?: Maybe<ReadonlyArray<Maybe<ReviewSort>>>;
}

/** Page of data */
export interface PageRecommendationsArgs {
	id?: Maybe<Scalars['Int']>;
	mediaId?: Maybe<Scalars['Int']>;
	mediaRecommendationId?: Maybe<Scalars['Int']>;
	userId?: Maybe<Scalars['Int']>;
	rating?: Maybe<Scalars['Int']>;
	onList?: Maybe<Scalars['Boolean']>;
	rating_greater?: Maybe<Scalars['Int']>;
	rating_lesser?: Maybe<Scalars['Int']>;
	sort?: Maybe<ReadonlyArray<Maybe<RecommendationSort>>>;
}

/** Page of data */
export interface PageLikesArgs {
	likeableId?: Maybe<Scalars['Int']>;
	type?: Maybe<LikeableType>;
}

export interface PageInfo {
	readonly __typename?: 'PageInfo';
	/** The total number of items */
	readonly total?: Maybe<Scalars['Int']>;
	/** The count on a page */
	readonly perPage?: Maybe<Scalars['Int']>;
	/** The current page */
	readonly currentPage?: Maybe<Scalars['Int']>;
	/** The last page */
	readonly lastPage?: Maybe<Scalars['Int']>;
	/** If there is another page */
	readonly hasNextPage?: Maybe<Scalars['Boolean']>;
}

/** Provides the parsed markdown as html */
export interface ParsedMarkdown {
	readonly __typename?: 'ParsedMarkdown';
	/** The parsed markdown as html */
	readonly html?: Maybe<Scalars['String']>;
}

export interface Query {
	readonly __typename?: 'Query';
	readonly Page?: Maybe<Page>;
	/** Media query */
	readonly Media?: Maybe<Media>;
	/** Media Trend query */
	readonly MediaTrend?: Maybe<MediaTrend>;
	/** Airing schedule query */
	readonly AiringSchedule?: Maybe<AiringSchedule>;
	/** Character query */
	readonly Character?: Maybe<Character>;
	/** Staff query */
	readonly Staff?: Maybe<Staff>;
	/** Media list query */
	readonly MediaList?: Maybe<MediaList>;
	/** Media list collection query, provides list pre-grouped by status & custom lists. User ID and Media Type arguments required. */
	readonly MediaListCollection?: Maybe<MediaListCollection>;
	/** Collection of all the possible media genres */
	readonly GenreCollection?: Maybe<ReadonlyArray<Maybe<Scalars['String']>>>;
	/** Collection of all the possible media tags */
	readonly MediaTagCollection?: Maybe<ReadonlyArray<Maybe<MediaTag>>>;
	/** User query */
	readonly User?: Maybe<User>;
	/** Get the currently authenticated user */
	readonly Viewer?: Maybe<User>;
	/** Notification query */
	readonly Notification?: Maybe<NotificationUnion>;
	/** Studio query */
	readonly Studio?: Maybe<Studio>;
	/** Review query */
	readonly Review?: Maybe<Review>;
	/** Activity query */
	readonly Activity?: Maybe<ActivityUnion>;
	/** Activity reply query */
	readonly ActivityReply?: Maybe<ActivityReply>;
	/** Follow query */
	readonly Following?: Maybe<User>;
	/** Follow query */
	readonly Follower?: Maybe<User>;
	/** Thread query */
	readonly Thread?: Maybe<Thread>;
	/** Comment query */
	readonly ThreadComment?: Maybe<ReadonlyArray<Maybe<ThreadComment>>>;
	/** Recommendation query */
	readonly Recommendation?: Maybe<Recommendation>;
	/** Like query */
	readonly Like?: Maybe<User>;
	/** Provide AniList markdown to be converted to html (Requires auth) */
	readonly Markdown?: Maybe<ParsedMarkdown>;
	readonly AniChartUser?: Maybe<AniChartUser>;
	/** Site statistics query */
	readonly SiteStatistics?: Maybe<SiteStatistics>;
	/** Get the user who added a tag to a media */
	readonly MediaTagUser?: Maybe<User>;
}

export interface QueryPageArgs {
	page?: Maybe<Scalars['Int']>;
	perPage?: Maybe<Scalars['Int']>;
}

export interface QueryMediaArgs {
	id?: Maybe<Scalars['Int']>;
	idMal?: Maybe<Scalars['Int']>;
	startDate?: Maybe<Scalars['FuzzyDateInt']>;
	endDate?: Maybe<Scalars['FuzzyDateInt']>;
	season?: Maybe<MediaSeason>;
	seasonYear?: Maybe<Scalars['Int']>;
	type?: Maybe<MediaType>;
	format?: Maybe<MediaFormat>;
	status?: Maybe<MediaStatus>;
	episodes?: Maybe<Scalars['Int']>;
	duration?: Maybe<Scalars['Int']>;
	chapters?: Maybe<Scalars['Int']>;
	volumes?: Maybe<Scalars['Int']>;
	isAdult?: Maybe<Scalars['Boolean']>;
	genre?: Maybe<Scalars['String']>;
	tag?: Maybe<Scalars['String']>;
	minimumTagRank?: Maybe<Scalars['Int']>;
	tagCategory?: Maybe<Scalars['String']>;
	onList?: Maybe<Scalars['Boolean']>;
	licensedBy?: Maybe<Scalars['String']>;
	averageScore?: Maybe<Scalars['Int']>;
	popularity?: Maybe<Scalars['Int']>;
	source?: Maybe<MediaSource>;
	countryOfOrigin?: Maybe<Scalars['CountryCode']>;
	search?: Maybe<Scalars['String']>;
	id_not?: Maybe<Scalars['Int']>;
	id_in?: Maybe<ReadonlyArray<Maybe<Scalars['Int']>>>;
	id_not_in?: Maybe<ReadonlyArray<Maybe<Scalars['Int']>>>;
	idMal_not?: Maybe<Scalars['Int']>;
	idMal_in?: Maybe<ReadonlyArray<Maybe<Scalars['Int']>>>;
	idMal_not_in?: Maybe<ReadonlyArray<Maybe<Scalars['Int']>>>;
	startDate_greater?: Maybe<Scalars['FuzzyDateInt']>;
	startDate_lesser?: Maybe<Scalars['FuzzyDateInt']>;
	startDate_like?: Maybe<Scalars['String']>;
	endDate_greater?: Maybe<Scalars['FuzzyDateInt']>;
	endDate_lesser?: Maybe<Scalars['FuzzyDateInt']>;
	endDate_like?: Maybe<Scalars['String']>;
	format_in?: Maybe<ReadonlyArray<Maybe<MediaFormat>>>;
	format_not?: Maybe<MediaFormat>;
	format_not_in?: Maybe<ReadonlyArray<Maybe<MediaFormat>>>;
	status_in?: Maybe<ReadonlyArray<Maybe<MediaStatus>>>;
	status_not?: Maybe<MediaStatus>;
	status_not_in?: Maybe<ReadonlyArray<Maybe<MediaStatus>>>;
	episodes_greater?: Maybe<Scalars['Int']>;
	episodes_lesser?: Maybe<Scalars['Int']>;
	duration_greater?: Maybe<Scalars['Int']>;
	duration_lesser?: Maybe<Scalars['Int']>;
	chapters_greater?: Maybe<Scalars['Int']>;
	chapters_lesser?: Maybe<Scalars['Int']>;
	volumes_greater?: Maybe<Scalars['Int']>;
	volumes_lesser?: Maybe<Scalars['Int']>;
	genre_in?: Maybe<ReadonlyArray<Maybe<Scalars['String']>>>;
	genre_not_in?: Maybe<ReadonlyArray<Maybe<Scalars['String']>>>;
	tag_in?: Maybe<ReadonlyArray<Maybe<Scalars['String']>>>;
	tag_not_in?: Maybe<ReadonlyArray<Maybe<Scalars['String']>>>;
	tagCategory_in?: Maybe<ReadonlyArray<Maybe<Scalars['String']>>>;
	tagCategory_not_in?: Maybe<ReadonlyArray<Maybe<Scalars['String']>>>;
	licensedBy_in?: Maybe<ReadonlyArray<Maybe<Scalars['String']>>>;
	averageScore_not?: Maybe<Scalars['Int']>;
	averageScore_greater?: Maybe<Scalars['Int']>;
	averageScore_lesser?: Maybe<Scalars['Int']>;
	popularity_not?: Maybe<Scalars['Int']>;
	popularity_greater?: Maybe<Scalars['Int']>;
	popularity_lesser?: Maybe<Scalars['Int']>;
	source_in?: Maybe<ReadonlyArray<Maybe<MediaSource>>>;
	sort?: Maybe<ReadonlyArray<Maybe<MediaSort>>>;
}

export interface QueryMediaTrendArgs {
	mediaId?: Maybe<Scalars['Int']>;
	date?: Maybe<Scalars['Int']>;
	trending?: Maybe<Scalars['Int']>;
	averageScore?: Maybe<Scalars['Int']>;
	popularity?: Maybe<Scalars['Int']>;
	episode?: Maybe<Scalars['Int']>;
	releasing?: Maybe<Scalars['Boolean']>;
	mediaId_not?: Maybe<Scalars['Int']>;
	mediaId_in?: Maybe<ReadonlyArray<Maybe<Scalars['Int']>>>;
	mediaId_not_in?: Maybe<ReadonlyArray<Maybe<Scalars['Int']>>>;
	date_greater?: Maybe<Scalars['Int']>;
	date_lesser?: Maybe<Scalars['Int']>;
	trending_greater?: Maybe<Scalars['Int']>;
	trending_lesser?: Maybe<Scalars['Int']>;
	trending_not?: Maybe<Scalars['Int']>;
	averageScore_greater?: Maybe<Scalars['Int']>;
	averageScore_lesser?: Maybe<Scalars['Int']>;
	averageScore_not?: Maybe<Scalars['Int']>;
	popularity_greater?: Maybe<Scalars['Int']>;
	popularity_lesser?: Maybe<Scalars['Int']>;
	popularity_not?: Maybe<Scalars['Int']>;
	episode_greater?: Maybe<Scalars['Int']>;
	episode_lesser?: Maybe<Scalars['Int']>;
	episode_not?: Maybe<Scalars['Int']>;
	sort?: Maybe<ReadonlyArray<Maybe<MediaTrendSort>>>;
}

export interface QueryAiringScheduleArgs {
	id?: Maybe<Scalars['Int']>;
	mediaId?: Maybe<Scalars['Int']>;
	episode?: Maybe<Scalars['Int']>;
	airingAt?: Maybe<Scalars['Int']>;
	notYetAired?: Maybe<Scalars['Boolean']>;
	id_not?: Maybe<Scalars['Int']>;
	id_in?: Maybe<ReadonlyArray<Maybe<Scalars['Int']>>>;
	id_not_in?: Maybe<ReadonlyArray<Maybe<Scalars['Int']>>>;
	mediaId_not?: Maybe<Scalars['Int']>;
	mediaId_in?: Maybe<ReadonlyArray<Maybe<Scalars['Int']>>>;
	mediaId_not_in?: Maybe<ReadonlyArray<Maybe<Scalars['Int']>>>;
	episode_not?: Maybe<Scalars['Int']>;
	episode_in?: Maybe<ReadonlyArray<Maybe<Scalars['Int']>>>;
	episode_not_in?: Maybe<ReadonlyArray<Maybe<Scalars['Int']>>>;
	episode_greater?: Maybe<Scalars['Int']>;
	episode_lesser?: Maybe<Scalars['Int']>;
	airingAt_greater?: Maybe<Scalars['Int']>;
	airingAt_lesser?: Maybe<Scalars['Int']>;
	sort?: Maybe<ReadonlyArray<Maybe<AiringSort>>>;
}

export interface QueryCharacterArgs {
	id?: Maybe<Scalars['Int']>;
	isBirthday?: Maybe<Scalars['Boolean']>;
	search?: Maybe<Scalars['String']>;
	id_not?: Maybe<Scalars['Int']>;
	id_in?: Maybe<ReadonlyArray<Maybe<Scalars['Int']>>>;
	id_not_in?: Maybe<ReadonlyArray<Maybe<Scalars['Int']>>>;
	sort?: Maybe<ReadonlyArray<Maybe<CharacterSort>>>;
}

export interface QueryStaffArgs {
	id?: Maybe<Scalars['Int']>;
	isBirthday?: Maybe<Scalars['Boolean']>;
	search?: Maybe<Scalars['String']>;
	id_not?: Maybe<Scalars['Int']>;
	id_in?: Maybe<ReadonlyArray<Maybe<Scalars['Int']>>>;
	id_not_in?: Maybe<ReadonlyArray<Maybe<Scalars['Int']>>>;
	sort?: Maybe<ReadonlyArray<Maybe<StaffSort>>>;
}

export interface QueryMediaListArgs {
	id?: Maybe<Scalars['Int']>;
	userId?: Maybe<Scalars['Int']>;
	userName?: Maybe<Scalars['String']>;
	type?: Maybe<MediaType>;
	status?: Maybe<MediaListStatus>;
	mediaId?: Maybe<Scalars['Int']>;
	isFollowing?: Maybe<Scalars['Boolean']>;
	notes?: Maybe<Scalars['String']>;
	startedAt?: Maybe<Scalars['FuzzyDateInt']>;
	completedAt?: Maybe<Scalars['FuzzyDateInt']>;
	compareWithAuthList?: Maybe<Scalars['Boolean']>;
	userId_in?: Maybe<ReadonlyArray<Maybe<Scalars['Int']>>>;
	status_in?: Maybe<ReadonlyArray<Maybe<MediaListStatus>>>;
	status_not_in?: Maybe<ReadonlyArray<Maybe<MediaListStatus>>>;
	status_not?: Maybe<MediaListStatus>;
	mediaId_in?: Maybe<ReadonlyArray<Maybe<Scalars['Int']>>>;
	mediaId_not_in?: Maybe<ReadonlyArray<Maybe<Scalars['Int']>>>;
	notes_like?: Maybe<Scalars['String']>;
	startedAt_greater?: Maybe<Scalars['FuzzyDateInt']>;
	startedAt_lesser?: Maybe<Scalars['FuzzyDateInt']>;
	startedAt_like?: Maybe<Scalars['String']>;
	completedAt_greater?: Maybe<Scalars['FuzzyDateInt']>;
	completedAt_lesser?: Maybe<Scalars['FuzzyDateInt']>;
	completedAt_like?: Maybe<Scalars['String']>;
	sort?: Maybe<ReadonlyArray<Maybe<MediaListSort>>>;
}

export interface QueryMediaListCollectionArgs {
	userId?: Maybe<Scalars['Int']>;
	userName?: Maybe<Scalars['String']>;
	type?: Maybe<MediaType>;
	status?: Maybe<MediaListStatus>;
	notes?: Maybe<Scalars['String']>;
	startedAt?: Maybe<Scalars['FuzzyDateInt']>;
	completedAt?: Maybe<Scalars['FuzzyDateInt']>;
	forceSingleCompletedList?: Maybe<Scalars['Boolean']>;
	chunk?: Maybe<Scalars['Int']>;
	perChunk?: Maybe<Scalars['Int']>;
	status_in?: Maybe<ReadonlyArray<Maybe<MediaListStatus>>>;
	status_not_in?: Maybe<ReadonlyArray<Maybe<MediaListStatus>>>;
	status_not?: Maybe<MediaListStatus>;
	notes_like?: Maybe<Scalars['String']>;
	startedAt_greater?: Maybe<Scalars['FuzzyDateInt']>;
	startedAt_lesser?: Maybe<Scalars['FuzzyDateInt']>;
	startedAt_like?: Maybe<Scalars['String']>;
	completedAt_greater?: Maybe<Scalars['FuzzyDateInt']>;
	completedAt_lesser?: Maybe<Scalars['FuzzyDateInt']>;
	completedAt_like?: Maybe<Scalars['String']>;
	sort?: Maybe<ReadonlyArray<Maybe<MediaListSort>>>;
}

export interface QueryMediaTagCollectionArgs {
	status?: Maybe<Scalars['Int']>;
}

export interface QueryUserArgs {
	id?: Maybe<Scalars['Int']>;
	name?: Maybe<Scalars['String']>;
	isModerator?: Maybe<Scalars['Boolean']>;
	search?: Maybe<Scalars['String']>;
	sort?: Maybe<ReadonlyArray<Maybe<UserSort>>>;
}

export interface QueryNotificationArgs {
	type?: Maybe<NotificationType>;
	resetNotificationCount?: Maybe<Scalars['Boolean']>;
	type_in?: Maybe<ReadonlyArray<Maybe<NotificationType>>>;
}

export interface QueryStudioArgs {
	id?: Maybe<Scalars['Int']>;
	search?: Maybe<Scalars['String']>;
	id_not?: Maybe<Scalars['Int']>;
	id_in?: Maybe<ReadonlyArray<Maybe<Scalars['Int']>>>;
	id_not_in?: Maybe<ReadonlyArray<Maybe<Scalars['Int']>>>;
	sort?: Maybe<ReadonlyArray<Maybe<StudioSort>>>;
}

export interface QueryReviewArgs {
	id?: Maybe<Scalars['Int']>;
	mediaId?: Maybe<Scalars['Int']>;
	userId?: Maybe<Scalars['Int']>;
	mediaType?: Maybe<MediaType>;
	sort?: Maybe<ReadonlyArray<Maybe<ReviewSort>>>;
}

export interface QueryActivityArgs {
	id?: Maybe<Scalars['Int']>;
	userId?: Maybe<Scalars['Int']>;
	messengerId?: Maybe<Scalars['Int']>;
	mediaId?: Maybe<Scalars['Int']>;
	type?: Maybe<ActivityType>;
	isFollowing?: Maybe<Scalars['Boolean']>;
	hasReplies?: Maybe<Scalars['Boolean']>;
	hasRepliesOrTypeText?: Maybe<Scalars['Boolean']>;
	createdAt?: Maybe<Scalars['Int']>;
	id_not?: Maybe<Scalars['Int']>;
	id_in?: Maybe<ReadonlyArray<Maybe<Scalars['Int']>>>;
	id_not_in?: Maybe<ReadonlyArray<Maybe<Scalars['Int']>>>;
	userId_not?: Maybe<Scalars['Int']>;
	userId_in?: Maybe<ReadonlyArray<Maybe<Scalars['Int']>>>;
	userId_not_in?: Maybe<ReadonlyArray<Maybe<Scalars['Int']>>>;
	messengerId_not?: Maybe<Scalars['Int']>;
	messengerId_in?: Maybe<ReadonlyArray<Maybe<Scalars['Int']>>>;
	messengerId_not_in?: Maybe<ReadonlyArray<Maybe<Scalars['Int']>>>;
	mediaId_not?: Maybe<Scalars['Int']>;
	mediaId_in?: Maybe<ReadonlyArray<Maybe<Scalars['Int']>>>;
	mediaId_not_in?: Maybe<ReadonlyArray<Maybe<Scalars['Int']>>>;
	type_not?: Maybe<ActivityType>;
	type_in?: Maybe<ReadonlyArray<Maybe<ActivityType>>>;
	type_not_in?: Maybe<ReadonlyArray<Maybe<ActivityType>>>;
	createdAt_greater?: Maybe<Scalars['Int']>;
	createdAt_lesser?: Maybe<Scalars['Int']>;
	sort?: Maybe<ReadonlyArray<Maybe<ActivitySort>>>;
}

export interface QueryActivityReplyArgs {
	id?: Maybe<Scalars['Int']>;
	activityId?: Maybe<Scalars['Int']>;
}

export interface QueryFollowingArgs {
	userId: Scalars['Int'];
	sort?: Maybe<ReadonlyArray<Maybe<UserSort>>>;
}

export interface QueryFollowerArgs {
	userId: Scalars['Int'];
	sort?: Maybe<ReadonlyArray<Maybe<UserSort>>>;
}

export interface QueryThreadArgs {
	id?: Maybe<Scalars['Int']>;
	userId?: Maybe<Scalars['Int']>;
	replyUserId?: Maybe<Scalars['Int']>;
	subscribed?: Maybe<Scalars['Boolean']>;
	categoryId?: Maybe<Scalars['Int']>;
	mediaCategoryId?: Maybe<Scalars['Int']>;
	search?: Maybe<Scalars['String']>;
	id_in?: Maybe<ReadonlyArray<Maybe<Scalars['Int']>>>;
	sort?: Maybe<ReadonlyArray<Maybe<ThreadSort>>>;
}

export interface QueryThreadCommentArgs {
	id?: Maybe<Scalars['Int']>;
	threadId?: Maybe<Scalars['Int']>;
	userId?: Maybe<Scalars['Int']>;
	sort?: Maybe<ReadonlyArray<Maybe<ThreadCommentSort>>>;
}

export interface QueryRecommendationArgs {
	id?: Maybe<Scalars['Int']>;
	mediaId?: Maybe<Scalars['Int']>;
	mediaRecommendationId?: Maybe<Scalars['Int']>;
	userId?: Maybe<Scalars['Int']>;
	rating?: Maybe<Scalars['Int']>;
	onList?: Maybe<Scalars['Boolean']>;
	rating_greater?: Maybe<Scalars['Int']>;
	rating_lesser?: Maybe<Scalars['Int']>;
	sort?: Maybe<ReadonlyArray<Maybe<RecommendationSort>>>;
}

export interface QueryLikeArgs {
	likeableId?: Maybe<Scalars['Int']>;
	type?: Maybe<LikeableType>;
}

export interface QueryMarkdownArgs {
	markdown: Scalars['String'];
}

export interface QueryMediaTagUserArgs {
	tagId?: Maybe<Scalars['Int']>;
	mediaId?: Maybe<Scalars['Int']>;
}

/** Media recommendation */
export interface Recommendation {
	readonly __typename?: 'Recommendation';
	/** The id of the recommendation */
	readonly id: Scalars['Int'];
	/** Users rating of the recommendation */
	readonly rating?: Maybe<Scalars['Int']>;
	/** The rating of the recommendation by currently authenticated user */
	readonly userRating?: Maybe<RecommendationRating>;
	/** The media the recommendation is from */
	readonly media?: Maybe<Media>;
	/** The recommended media */
	readonly mediaRecommendation?: Maybe<Media>;
	/** The user that first created the recommendation */
	readonly user?: Maybe<User>;
}

export interface RecommendationConnection {
	readonly __typename?: 'RecommendationConnection';
	readonly edges?: Maybe<ReadonlyArray<Maybe<RecommendationEdge>>>;
	readonly nodes?: Maybe<ReadonlyArray<Maybe<Recommendation>>>;
	/** The pagination information */
	readonly pageInfo?: Maybe<PageInfo>;
}

/** Recommendation connection edge */
export interface RecommendationEdge {
	readonly __typename?: 'RecommendationEdge';
	readonly node?: Maybe<Recommendation>;
}

/** Recommendation rating enums */
export const enum RecommendationRating {
	NoRating = 'NO_RATING',
	RateUp = 'RATE_UP',
	RateDown = 'RATE_DOWN'
}

/** Recommendation sort enums */
export const enum RecommendationSort {
	Id = 'ID',
	IdDesc = 'ID_DESC',
	Rating = 'RATING',
	RatingDesc = 'RATING_DESC'
}

/** Notification for when new media is added to the site */
export interface RelatedMediaAdditionNotification {
	readonly __typename?: 'RelatedMediaAdditionNotification';
	/** The id of the Notification */
	readonly id: Scalars['Int'];
	/** The type of notification */
	readonly type?: Maybe<NotificationType>;
	/** The id of the new media */
	readonly mediaId: Scalars['Int'];
	/** The notification context text */
	readonly context?: Maybe<Scalars['String']>;
	/** The time the notification was created at */
	readonly createdAt?: Maybe<Scalars['Int']>;
	/** The associated media of the airing schedule */
	readonly media?: Maybe<Media>;
}

export interface Report {
	readonly __typename?: 'Report';
	readonly id: Scalars['Int'];
	readonly reporter?: Maybe<User>;
	readonly reported?: Maybe<User>;
	readonly reason?: Maybe<Scalars['String']>;
	/** When the entry data was created */
	readonly createdAt?: Maybe<Scalars['Int']>;
	readonly cleared?: Maybe<Scalars['Boolean']>;
}

/** A Review that features in an anime or manga */
export interface Review {
	readonly __typename?: 'Review';
	/** The id of the review */
	readonly id: Scalars['Int'];
	/** The id of the review's creator */
	readonly userId: Scalars['Int'];
	/** The id of the review's media */
	readonly mediaId: Scalars['Int'];
	/** For which type of media the review is for */
	readonly mediaType?: Maybe<MediaType>;
	/** A short summary of the review */
	readonly summary?: Maybe<Scalars['String']>;
	/** The main review body text */
	readonly body?: Maybe<Scalars['String']>;
	/** The total user rating of the review */
	readonly rating?: Maybe<Scalars['Int']>;
	/** The amount of user ratings of the review */
	readonly ratingAmount?: Maybe<Scalars['Int']>;
	/** The rating of the review by currently authenticated user */
	readonly userRating?: Maybe<ReviewRating>;
	/** The review score of the media */
	readonly score?: Maybe<Scalars['Int']>;
	/** If the review is not yet publicly published and is only viewable by creator */
	readonly private?: Maybe<Scalars['Boolean']>;
	/** The url for the review page on the AniList website */
	readonly siteUrl?: Maybe<Scalars['String']>;
	/** The time of the thread creation */
	readonly createdAt: Scalars['Int'];
	/** The time of the thread last update */
	readonly updatedAt: Scalars['Int'];
	/** The creator of the review */
	readonly user?: Maybe<User>;
	/** The media the review is of */
	readonly media?: Maybe<Media>;
}

/** A Review that features in an anime or manga */
export interface ReviewBodyArgs {
	asHtml?: Maybe<Scalars['Boolean']>;
}

export interface ReviewConnection {
	readonly __typename?: 'ReviewConnection';
	readonly edges?: Maybe<ReadonlyArray<Maybe<ReviewEdge>>>;
	readonly nodes?: Maybe<ReadonlyArray<Maybe<Review>>>;
	/** The pagination information */
	readonly pageInfo?: Maybe<PageInfo>;
}

/** Review connection edge */
export interface ReviewEdge {
	readonly __typename?: 'ReviewEdge';
	readonly node?: Maybe<Review>;
}

/** Review rating enums */
export const enum ReviewRating {
	NoVote = 'NO_VOTE',
	UpVote = 'UP_VOTE',
	DownVote = 'DOWN_VOTE'
}

/** Review sort enums */
export const enum ReviewSort {
	Id = 'ID',
	IdDesc = 'ID_DESC',
	Score = 'SCORE',
	ScoreDesc = 'SCORE_DESC',
	Rating = 'RATING',
	RatingDesc = 'RATING_DESC',
	CreatedAt = 'CREATED_AT',
	CreatedAtDesc = 'CREATED_AT_DESC',
	UpdatedAt = 'UPDATED_AT',
	UpdatedAtDesc = 'UPDATED_AT_DESC'
}

/** Feed of mod edit activity */
export interface RevisionHistory {
	readonly __typename?: 'RevisionHistory';
	/** The id of the media */
	readonly id: Scalars['Int'];
	/** The action taken on the objects */
	readonly action?: Maybe<RevisionHistoryAction>;
	/** A JSON object of the fields that changed */
	readonly changes?: Maybe<Scalars['Json']>;
	/** The user who made the edit to the object */
	readonly user?: Maybe<User>;
	/** The media the mod feed entry references */
	readonly media?: Maybe<Media>;
	/** The character the mod feed entry references */
	readonly character?: Maybe<Character>;
	/** The staff member the mod feed entry references */
	readonly staff?: Maybe<Staff>;
	/** The studio the mod feed entry references */
	readonly studio?: Maybe<Studio>;
	/** When the mod feed entry was created */
	readonly createdAt?: Maybe<Scalars['Int']>;
}

/** Revision history actions */
export const enum RevisionHistoryAction {
	Create = 'CREATE',
	Edit = 'EDIT'
}

/** A user's list score distribution. */
export interface ScoreDistribution {
	readonly __typename?: 'ScoreDistribution';
	readonly score?: Maybe<Scalars['Int']>;
	/** The amount of list entries with this score */
	readonly amount?: Maybe<Scalars['Int']>;
}

/** Media list scoring type */
export const enum ScoreFormat {
	/** An integer from 0-100 */
	Point_100 = 'POINT_100',
	/** A float from 0-10 with 1 decimal place */
	Point_10Decimal = 'POINT_10_DECIMAL',
	/** An integer from 0-10 */
	Point_10 = 'POINT_10',
	/** An integer from 0-5. Should be represented in Stars */
	Point_5 = 'POINT_5',
	/** An integer from 0-3. Should be represented in Smileys. 0 => No Score, 1 => :(, 2 => :|, 3 => :) */
	Point_3 = 'POINT_3'
}

export interface SiteStatistics {
	readonly __typename?: 'SiteStatistics';
	readonly users?: Maybe<SiteTrendConnection>;
	readonly anime?: Maybe<SiteTrendConnection>;
	readonly manga?: Maybe<SiteTrendConnection>;
	readonly characters?: Maybe<SiteTrendConnection>;
	readonly staff?: Maybe<SiteTrendConnection>;
	readonly studios?: Maybe<SiteTrendConnection>;
	readonly reviews?: Maybe<SiteTrendConnection>;
}

export interface SiteStatisticsUsersArgs {
	sort?: Maybe<ReadonlyArray<Maybe<SiteTrendSort>>>;
	page?: Maybe<Scalars['Int']>;
	perPage?: Maybe<Scalars['Int']>;
}

export interface SiteStatisticsAnimeArgs {
	sort?: Maybe<ReadonlyArray<Maybe<SiteTrendSort>>>;
	page?: Maybe<Scalars['Int']>;
	perPage?: Maybe<Scalars['Int']>;
}

export interface SiteStatisticsMangaArgs {
	sort?: Maybe<ReadonlyArray<Maybe<SiteTrendSort>>>;
	page?: Maybe<Scalars['Int']>;
	perPage?: Maybe<Scalars['Int']>;
}

export interface SiteStatisticsCharactersArgs {
	sort?: Maybe<ReadonlyArray<Maybe<SiteTrendSort>>>;
	page?: Maybe<Scalars['Int']>;
	perPage?: Maybe<Scalars['Int']>;
}

export interface SiteStatisticsStaffArgs {
	sort?: Maybe<ReadonlyArray<Maybe<SiteTrendSort>>>;
	page?: Maybe<Scalars['Int']>;
	perPage?: Maybe<Scalars['Int']>;
}

export interface SiteStatisticsStudiosArgs {
	sort?: Maybe<ReadonlyArray<Maybe<SiteTrendSort>>>;
	page?: Maybe<Scalars['Int']>;
	perPage?: Maybe<Scalars['Int']>;
}

export interface SiteStatisticsReviewsArgs {
	sort?: Maybe<ReadonlyArray<Maybe<SiteTrendSort>>>;
	page?: Maybe<Scalars['Int']>;
	perPage?: Maybe<Scalars['Int']>;
}

/** Daily site statistics */
export interface SiteTrend {
	readonly __typename?: 'SiteTrend';
	/** The day the data was recorded (timestamp) */
	readonly date: Scalars['Int'];
	readonly count: Scalars['Int'];
	/** The change from yesterday */
	readonly change: Scalars['Int'];
}

export interface SiteTrendConnection {
	readonly __typename?: 'SiteTrendConnection';
	readonly edges?: Maybe<ReadonlyArray<Maybe<SiteTrendEdge>>>;
	readonly nodes?: Maybe<ReadonlyArray<Maybe<SiteTrend>>>;
	/** The pagination information */
	readonly pageInfo?: Maybe<PageInfo>;
}

/** Site trend connection edge */
export interface SiteTrendEdge {
	readonly __typename?: 'SiteTrendEdge';
	readonly node?: Maybe<SiteTrend>;
}

/** Site trend sort enums */
export const enum SiteTrendSort {
	Date = 'DATE',
	DateDesc = 'DATE_DESC',
	Count = 'COUNT',
	CountDesc = 'COUNT_DESC',
	Change = 'CHANGE',
	ChangeDesc = 'CHANGE_DESC'
}

/** Voice actors or production staff */
export interface Staff {
	readonly __typename?: 'Staff';
	/** The id of the staff member */
	readonly id: Scalars['Int'];
	/** The names of the staff member */
	readonly name?: Maybe<StaffName>;
	/**
	 * The primary language the staff member dub's in
	 * @deprecated Replaced with languageV2
	 */
	readonly language?: Maybe<StaffLanguage>;
	/** The primary language of the staff member. Current values: Japanese, English, Korean, Italian, Spanish, Portuguese, French, German, Hebrew, Hungarian, Chinese, Arabic, Filipino, Catalan */
	readonly languageV2?: Maybe<Scalars['String']>;
	/** The staff images */
	readonly image?: Maybe<StaffImage>;
	/** A general description of the staff member */
	readonly description?: Maybe<Scalars['String']>;
	/** The person's primary occupations */
	readonly primaryOccupations?: Maybe<ReadonlyArray<Maybe<Scalars['String']>>>;
	/** The staff's gender. Usually Male, Female, or Non-binary but can be any string. */
	readonly gender?: Maybe<Scalars['String']>;
	readonly dateOfBirth?: Maybe<FuzzyDate>;
	readonly dateOfDeath?: Maybe<FuzzyDate>;
	/** The person's age in years */
	readonly age?: Maybe<Scalars['Int']>;
	/** [startYear, endYear] (If the 2nd value is not present staff is still active) */
	readonly yearsActive?: Maybe<ReadonlyArray<Maybe<Scalars['Int']>>>;
	/** The persons birthplace or hometown */
	readonly homeTown?: Maybe<Scalars['String']>;
	/** The persons blood type */
	readonly bloodType?: Maybe<Scalars['String']>;
	/** If the staff member is marked as favourite by the currently authenticated user */
	readonly isFavourite: Scalars['Boolean'];
	/** If the staff member is blocked from being added to favourites */
	readonly isFavouriteBlocked: Scalars['Boolean'];
	/** The url for the staff page on the AniList website */
	readonly siteUrl?: Maybe<Scalars['String']>;
	/** Media where the staff member has a production role */
	readonly staffMedia?: Maybe<MediaConnection>;
	/** Characters voiced by the actor */
	readonly characters?: Maybe<CharacterConnection>;
	/** Media the actor voiced characters in. (Same data as characters with media as node instead of characters) */
	readonly characterMedia?: Maybe<MediaConnection>;
	/** @deprecated No data available */
	readonly updatedAt?: Maybe<Scalars['Int']>;
	/** Staff member that the submission is referencing */
	readonly staff?: Maybe<Staff>;
	/** Submitter for the submission */
	readonly submitter?: Maybe<User>;
	/** Status of the submission */
	readonly submissionStatus?: Maybe<Scalars['Int']>;
	/** Inner details of submission status */
	readonly submissionNotes?: Maybe<Scalars['String']>;
	/** The amount of user's who have favourited the staff member */
	readonly favourites?: Maybe<Scalars['Int']>;
	/** Notes for site moderators */
	readonly modNotes?: Maybe<Scalars['String']>;
}

/** Voice actors or production staff */
export interface StaffDescriptionArgs {
	asHtml?: Maybe<Scalars['Boolean']>;
}

/** Voice actors or production staff */
export interface StaffStaffMediaArgs {
	sort?: Maybe<ReadonlyArray<Maybe<MediaSort>>>;
	type?: Maybe<MediaType>;
	onList?: Maybe<Scalars['Boolean']>;
	page?: Maybe<Scalars['Int']>;
	perPage?: Maybe<Scalars['Int']>;
}

/** Voice actors or production staff */
export interface StaffCharactersArgs {
	sort?: Maybe<ReadonlyArray<Maybe<CharacterSort>>>;
	page?: Maybe<Scalars['Int']>;
	perPage?: Maybe<Scalars['Int']>;
}

/** Voice actors or production staff */
export interface StaffCharacterMediaArgs {
	sort?: Maybe<ReadonlyArray<Maybe<MediaSort>>>;
	onList?: Maybe<Scalars['Boolean']>;
	page?: Maybe<Scalars['Int']>;
	perPage?: Maybe<Scalars['Int']>;
}

export interface StaffConnection {
	readonly __typename?: 'StaffConnection';
	readonly edges?: Maybe<ReadonlyArray<Maybe<StaffEdge>>>;
	readonly nodes?: Maybe<ReadonlyArray<Maybe<Staff>>>;
	/** The pagination information */
	readonly pageInfo?: Maybe<PageInfo>;
}

/** Staff connection edge */
export interface StaffEdge {
	readonly __typename?: 'StaffEdge';
	readonly node?: Maybe<Staff>;
	/** The id of the connection */
	readonly id?: Maybe<Scalars['Int']>;
	/** The role of the staff member in the production of the media */
	readonly role?: Maybe<Scalars['String']>;
	/** The order the staff should be displayed from the users favourites */
	readonly favouriteOrder?: Maybe<Scalars['Int']>;
}

export interface StaffImage {
	readonly __typename?: 'StaffImage';
	/** The person's image of media at its largest size */
	readonly large?: Maybe<Scalars['String']>;
	/** The person's image of media at medium size */
	readonly medium?: Maybe<Scalars['String']>;
}

/** The primary language of the voice actor */
export const enum StaffLanguage {
	/** Japanese */
	Japanese = 'JAPANESE',
	/** English */
	English = 'ENGLISH',
	/** Korean */
	Korean = 'KOREAN',
	/** Italian */
	Italian = 'ITALIAN',
	/** Spanish */
	Spanish = 'SPANISH',
	/** Portuguese */
	Portuguese = 'PORTUGUESE',
	/** French */
	French = 'FRENCH',
	/** German */
	German = 'GERMAN',
	/** Hebrew */
	Hebrew = 'HEBREW',
	/** Hungarian */
	Hungarian = 'HUNGARIAN'
}

/** The names of the staff member */
export interface StaffName {
	readonly __typename?: 'StaffName';
	/** The person's given name */
	readonly first?: Maybe<Scalars['String']>;
	/** The person's middle name */
	readonly middle?: Maybe<Scalars['String']>;
	/** The person's surname */
	readonly last?: Maybe<Scalars['String']>;
	/** The person's first and last name */
	readonly full?: Maybe<Scalars['String']>;
	/** The person's full name in their native language */
	readonly native?: Maybe<Scalars['String']>;
	/** Other names the staff member might be referred to as (pen names) */
	readonly alternative?: Maybe<ReadonlyArray<Maybe<Scalars['String']>>>;
	/** The currently authenticated users preferred name language. Default romaji for non-authenticated */
	readonly userPreferred?: Maybe<Scalars['String']>;
}

/** The names of the staff member */
export interface StaffNameInput {
	/** The person's given name */
	readonly first?: Maybe<Scalars['String']>;
	/** The person's middle name */
	readonly middle?: Maybe<Scalars['String']>;
	/** The person's surname */
	readonly last?: Maybe<Scalars['String']>;
	/** The person's full name in their native language */
	readonly native?: Maybe<Scalars['String']>;
	/** Other names the character might be referred by */
	readonly alternative?: Maybe<ReadonlyArray<Maybe<Scalars['String']>>>;
}

/** Voice actor role for a character */
export interface StaffRoleType {
	readonly __typename?: 'StaffRoleType';
	/** The voice actors of the character */
	readonly voiceActor?: Maybe<Staff>;
	/** Notes regarding the VA's role for the character */
	readonly roleNotes?: Maybe<Scalars['String']>;
	/** Used for grouping roles where multiple dubs exist for the same language. Either dubbing company name or language variant. */
	readonly dubGroup?: Maybe<Scalars['String']>;
}

/** Staff sort enums */
export const enum StaffSort {
	Id = 'ID',
	IdDesc = 'ID_DESC',
	Role = 'ROLE',
	RoleDesc = 'ROLE_DESC',
	Language = 'LANGUAGE',
	LanguageDesc = 'LANGUAGE_DESC',
	SearchMatch = 'SEARCH_MATCH',
	Favourites = 'FAVOURITES',
	FavouritesDesc = 'FAVOURITES_DESC',
	/** Order manually decided by moderators */
	Relevance = 'RELEVANCE'
}

/** User's staff statistics */
export interface StaffStats {
	readonly __typename?: 'StaffStats';
	readonly staff?: Maybe<Staff>;
	readonly amount?: Maybe<Scalars['Int']>;
	readonly meanScore?: Maybe<Scalars['Int']>;
	/** The amount of time in minutes the staff member has been watched by the user */
	readonly timeWatched?: Maybe<Scalars['Int']>;
}

/** A submission for a staff that features in an anime or manga */
export interface StaffSubmission {
	readonly __typename?: 'StaffSubmission';
	/** The id of the submission */
	readonly id: Scalars['Int'];
	/** Staff that the submission is referencing */
	readonly staff?: Maybe<Staff>;
	/** The staff submission changes */
	readonly submission?: Maybe<Staff>;
	/** Submitter for the submission */
	readonly submitter?: Maybe<User>;
	/** Status of the submission */
	readonly status?: Maybe<SubmissionStatus>;
	/** Inner details of submission status */
	readonly notes?: Maybe<Scalars['String']>;
	readonly source?: Maybe<Scalars['String']>;
	readonly createdAt?: Maybe<Scalars['Int']>;
}

/** The distribution of the watching/reading status of media or a user's list */
export interface StatusDistribution {
	readonly __typename?: 'StatusDistribution';
	/** The day the activity took place (Unix timestamp) */
	readonly status?: Maybe<MediaListStatus>;
	/** The amount of entries with this status */
	readonly amount?: Maybe<Scalars['Int']>;
}

/** Animation or production company */
export interface Studio {
	readonly __typename?: 'Studio';
	/** The id of the studio */
	readonly id: Scalars['Int'];
	/** The name of the studio */
	readonly name: Scalars['String'];
	/** If the studio is an animation studio or a different kind of company */
	readonly isAnimationStudio: Scalars['Boolean'];
	/** The media the studio has worked on */
	readonly media?: Maybe<MediaConnection>;
	/** The url for the studio page on the AniList website */
	readonly siteUrl?: Maybe<Scalars['String']>;
	/** If the studio is marked as favourite by the currently authenticated user */
	readonly isFavourite: Scalars['Boolean'];
	/** The amount of user's who have favourited the studio */
	readonly favourites?: Maybe<Scalars['Int']>;
}

/** Animation or production company */
export interface StudioMediaArgs {
	sort?: Maybe<ReadonlyArray<Maybe<MediaSort>>>;
	isMain?: Maybe<Scalars['Boolean']>;
	onList?: Maybe<Scalars['Boolean']>;
	page?: Maybe<Scalars['Int']>;
	perPage?: Maybe<Scalars['Int']>;
}

export interface StudioConnection {
	readonly __typename?: 'StudioConnection';
	readonly edges?: Maybe<ReadonlyArray<Maybe<StudioEdge>>>;
	readonly nodes?: Maybe<ReadonlyArray<Maybe<Studio>>>;
	/** The pagination information */
	readonly pageInfo?: Maybe<PageInfo>;
}

/** Studio connection edge */
export interface StudioEdge {
	readonly __typename?: 'StudioEdge';
	readonly node?: Maybe<Studio>;
	/** The id of the connection */
	readonly id?: Maybe<Scalars['Int']>;
	/** If the studio is the main animation studio of the anime */
	readonly isMain: Scalars['Boolean'];
	/** The order the character should be displayed from the users favourites */
	readonly favouriteOrder?: Maybe<Scalars['Int']>;
}

/** Studio sort enums */
export const enum StudioSort {
	Id = 'ID',
	IdDesc = 'ID_DESC',
	Name = 'NAME',
	NameDesc = 'NAME_DESC',
	SearchMatch = 'SEARCH_MATCH',
	Favourites = 'FAVOURITES',
	FavouritesDesc = 'FAVOURITES_DESC'
}

/** User's studio statistics */
export interface StudioStats {
	readonly __typename?: 'StudioStats';
	readonly studio?: Maybe<Studio>;
	readonly amount?: Maybe<Scalars['Int']>;
	readonly meanScore?: Maybe<Scalars['Int']>;
	/** The amount of time in minutes the studio's works have been watched by the user */
	readonly timeWatched?: Maybe<Scalars['Int']>;
}

/** Submission sort enums */
export const enum SubmissionSort {
	Id = 'ID',
	IdDesc = 'ID_DESC'
}

/** Submission status */
export const enum SubmissionStatus {
	Pending = 'PENDING',
	Rejected = 'REJECTED',
	PartiallyAccepted = 'PARTIALLY_ACCEPTED',
	Accepted = 'ACCEPTED'
}

/** User's tag statistics */
export interface TagStats {
	readonly __typename?: 'TagStats';
	readonly tag?: Maybe<MediaTag>;
	readonly amount?: Maybe<Scalars['Int']>;
	readonly meanScore?: Maybe<Scalars['Int']>;
	/** The amount of time in minutes the tag has been watched by the user */
	readonly timeWatched?: Maybe<Scalars['Int']>;
}

/** User text activity */
export interface TextActivity {
	readonly __typename?: 'TextActivity';
	/** The id of the activity */
	readonly id: Scalars['Int'];
	/** The user id of the activity's creator */
	readonly userId?: Maybe<Scalars['Int']>;
	/** The type of activity */
	readonly type?: Maybe<ActivityType>;
	/** The number of activity replies */
	readonly replyCount: Scalars['Int'];
	/** The status text (Markdown) */
	readonly text?: Maybe<Scalars['String']>;
	/** The url for the activity page on the AniList website */
	readonly siteUrl?: Maybe<Scalars['String']>;
	/** If the activity is locked and can receive replies */
	readonly isLocked?: Maybe<Scalars['Boolean']>;
	/** If the currently authenticated user is subscribed to the activity */
	readonly isSubscribed?: Maybe<Scalars['Boolean']>;
	/** The amount of likes the activity has */
	readonly likeCount: Scalars['Int'];
	/** If the currently authenticated user liked the activity */
	readonly isLiked?: Maybe<Scalars['Boolean']>;
	/** The time the activity was created at */
	readonly createdAt: Scalars['Int'];
	/** The user who created the activity */
	readonly user?: Maybe<User>;
	/** The written replies to the activity */
	readonly replies?: Maybe<ReadonlyArray<Maybe<ActivityReply>>>;
	/** The users who liked the activity */
	readonly likes?: Maybe<ReadonlyArray<Maybe<User>>>;
}

/** User text activity */
export interface TextActivityTextArgs {
	asHtml?: Maybe<Scalars['Boolean']>;
}

/** Forum Thread */
export interface Thread {
	readonly __typename?: 'Thread';
	/** The id of the thread */
	readonly id: Scalars['Int'];
	/** The title of the thread */
	readonly title?: Maybe<Scalars['String']>;
	/** The text body of the thread (Markdown) */
	readonly body?: Maybe<Scalars['String']>;
	/** The id of the thread owner user */
	readonly userId: Scalars['Int'];
	/** The id of the user who most recently commented on the thread */
	readonly replyUserId?: Maybe<Scalars['Int']>;
	/** The id of the most recent comment on the thread */
	readonly replyCommentId?: Maybe<Scalars['Int']>;
	/** The number of comments on the thread */
	readonly replyCount?: Maybe<Scalars['Int']>;
	/** The number of times users have viewed the thread */
	readonly viewCount?: Maybe<Scalars['Int']>;
	/** If the thread is locked and can receive comments */
	readonly isLocked?: Maybe<Scalars['Boolean']>;
	/** If the thread is stickied and should be displayed at the top of the page */
	readonly isSticky?: Maybe<Scalars['Boolean']>;
	/** If the currently authenticated user is subscribed to the thread */
	readonly isSubscribed?: Maybe<Scalars['Boolean']>;
	/** The amount of likes the thread has */
	readonly likeCount: Scalars['Int'];
	/** If the currently authenticated user liked the thread */
	readonly isLiked?: Maybe<Scalars['Boolean']>;
	/** The time of the last reply */
	readonly repliedAt?: Maybe<Scalars['Int']>;
	/** The time of the thread creation */
	readonly createdAt: Scalars['Int'];
	/** The time of the thread last update */
	readonly updatedAt: Scalars['Int'];
	/** The owner of the thread */
	readonly user?: Maybe<User>;
	/** The user to last reply to the thread */
	readonly replyUser?: Maybe<User>;
	/** The users who liked the thread */
	readonly likes?: Maybe<ReadonlyArray<Maybe<User>>>;
	/** The url for the thread page on the AniList website */
	readonly siteUrl?: Maybe<Scalars['String']>;
	/** The categories of the thread */
	readonly categories?: Maybe<ReadonlyArray<Maybe<ThreadCategory>>>;
	/** The media categories of the thread */
	readonly mediaCategories?: Maybe<ReadonlyArray<Maybe<Media>>>;
}

/** Forum Thread */
export interface ThreadBodyArgs {
	asHtml?: Maybe<Scalars['Boolean']>;
}

/** A forum thread category */
export interface ThreadCategory {
	readonly __typename?: 'ThreadCategory';
	/** The id of the category */
	readonly id: Scalars['Int'];
	/** The name of the category */
	readonly name: Scalars['String'];
}

/** Forum Thread Comment */
export interface ThreadComment {
	readonly __typename?: 'ThreadComment';
	/** The id of the comment */
	readonly id: Scalars['Int'];
	/** The user id of the comment's owner */
	readonly userId?: Maybe<Scalars['Int']>;
	/** The id of thread the comment belongs to */
	readonly threadId?: Maybe<Scalars['Int']>;
	/** The text content of the comment (Markdown) */
	readonly comment?: Maybe<Scalars['String']>;
	/** The amount of likes the comment has */
	readonly likeCount: Scalars['Int'];
	/** If the currently authenticated user liked the comment */
	readonly isLiked?: Maybe<Scalars['Boolean']>;
	/** The url for the comment page on the AniList website */
	readonly siteUrl?: Maybe<Scalars['String']>;
	/** The time of the comments creation */
	readonly createdAt: Scalars['Int'];
	/** The time of the comments last update */
	readonly updatedAt: Scalars['Int'];
	/** The thread the comment belongs to */
	readonly thread?: Maybe<Thread>;
	/** The user who created the comment */
	readonly user?: Maybe<User>;
	/** The users who liked the comment */
	readonly likes?: Maybe<ReadonlyArray<Maybe<User>>>;
	/** The comment's child reply comments */
	readonly childComments?: Maybe<Scalars['Json']>;
}

/** Forum Thread Comment */
export interface ThreadCommentCommentArgs {
	asHtml?: Maybe<Scalars['Boolean']>;
}

/** Notification for when a thread comment is liked */
export interface ThreadCommentLikeNotification {
	readonly __typename?: 'ThreadCommentLikeNotification';
	/** The id of the Notification */
	readonly id: Scalars['Int'];
	/** The id of the user who liked to the activity */
	readonly userId: Scalars['Int'];
	/** The type of notification */
	readonly type?: Maybe<NotificationType>;
	/** The id of the activity which was liked */
	readonly commentId: Scalars['Int'];
	/** The notification context text */
	readonly context?: Maybe<Scalars['String']>;
	/** The time the notification was created at */
	readonly createdAt?: Maybe<Scalars['Int']>;
	/** The thread that the relevant comment belongs to */
	readonly thread?: Maybe<Thread>;
	/** The thread comment that was liked */
	readonly comment?: Maybe<ThreadComment>;
	/** The user who liked the activity */
	readonly user?: Maybe<User>;
}

/** Notification for when authenticated user is @ mentioned in a forum thread comment */
export interface ThreadCommentMentionNotification {
	readonly __typename?: 'ThreadCommentMentionNotification';
	/** The id of the Notification */
	readonly id: Scalars['Int'];
	/** The id of the user who mentioned the authenticated user */
	readonly userId: Scalars['Int'];
	/** The type of notification */
	readonly type?: Maybe<NotificationType>;
	/** The id of the comment where mentioned */
	readonly commentId: Scalars['Int'];
	/** The notification context text */
	readonly context?: Maybe<Scalars['String']>;
	/** The time the notification was created at */
	readonly createdAt?: Maybe<Scalars['Int']>;
	/** The thread that the relevant comment belongs to */
	readonly thread?: Maybe<Thread>;
	/** The thread comment that included the @ mention */
	readonly comment?: Maybe<ThreadComment>;
	/** The user who mentioned the authenticated user */
	readonly user?: Maybe<User>;
}

/** Notification for when a user replies to your forum thread comment */
export interface ThreadCommentReplyNotification {
	readonly __typename?: 'ThreadCommentReplyNotification';
	/** The id of the Notification */
	readonly id: Scalars['Int'];
	/** The id of the user who create the comment reply */
	readonly userId: Scalars['Int'];
	/** The type of notification */
	readonly type?: Maybe<NotificationType>;
	/** The id of the reply comment */
	readonly commentId: Scalars['Int'];
	/** The notification context text */
	readonly context?: Maybe<Scalars['String']>;
	/** The time the notification was created at */
	readonly createdAt?: Maybe<Scalars['Int']>;
	/** The thread that the relevant comment belongs to */
	readonly thread?: Maybe<Thread>;
	/** The reply thread comment */
	readonly comment?: Maybe<ThreadComment>;
	/** The user who replied to the activity */
	readonly user?: Maybe<User>;
}

/** Thread comments sort enums */
export const enum ThreadCommentSort {
	Id = 'ID',
	IdDesc = 'ID_DESC'
}

/** Notification for when a user replies to a subscribed forum thread */
export interface ThreadCommentSubscribedNotification {
	readonly __typename?: 'ThreadCommentSubscribedNotification';
	/** The id of the Notification */
	readonly id: Scalars['Int'];
	/** The id of the user who commented on the thread */
	readonly userId: Scalars['Int'];
	/** The type of notification */
	readonly type?: Maybe<NotificationType>;
	/** The id of the new comment in the subscribed thread */
	readonly commentId: Scalars['Int'];
	/** The notification context text */
	readonly context?: Maybe<Scalars['String']>;
	/** The time the notification was created at */
	readonly createdAt?: Maybe<Scalars['Int']>;
	/** The thread that the relevant comment belongs to */
	readonly thread?: Maybe<Thread>;
	/** The reply thread comment */
	readonly comment?: Maybe<ThreadComment>;
	/** The user who replied to the subscribed thread */
	readonly user?: Maybe<User>;
}

/** Notification for when a thread is liked */
export interface ThreadLikeNotification {
	readonly __typename?: 'ThreadLikeNotification';
	/** The id of the Notification */
	readonly id: Scalars['Int'];
	/** The id of the user who liked to the activity */
	readonly userId: Scalars['Int'];
	/** The type of notification */
	readonly type?: Maybe<NotificationType>;
	/** The id of the thread which was liked */
	readonly threadId: Scalars['Int'];
	/** The notification context text */
	readonly context?: Maybe<Scalars['String']>;
	/** The time the notification was created at */
	readonly createdAt?: Maybe<Scalars['Int']>;
	/** The thread that the relevant comment belongs to */
	readonly thread?: Maybe<Thread>;
	/** The liked thread comment */
	readonly comment?: Maybe<ThreadComment>;
	/** The user who liked the activity */
	readonly user?: Maybe<User>;
}

/** Thread sort enums */
export const enum ThreadSort {
	Id = 'ID',
	IdDesc = 'ID_DESC',
	Title = 'TITLE',
	TitleDesc = 'TITLE_DESC',
	CreatedAt = 'CREATED_AT',
	CreatedAtDesc = 'CREATED_AT_DESC',
	UpdatedAt = 'UPDATED_AT',
	UpdatedAtDesc = 'UPDATED_AT_DESC',
	RepliedAt = 'REPLIED_AT',
	RepliedAtDesc = 'REPLIED_AT_DESC',
	ReplyCount = 'REPLY_COUNT',
	ReplyCountDesc = 'REPLY_COUNT_DESC',
	ViewCount = 'VIEW_COUNT',
	ViewCountDesc = 'VIEW_COUNT_DESC',
	IsSticky = 'IS_STICKY',
	SearchMatch = 'SEARCH_MATCH'
}

/** A user */
export interface User {
	readonly __typename?: 'User';
	/** The id of the user */
	readonly id: Scalars['Int'];
	/** The name of the user */
	readonly name: Scalars['String'];
	/** The bio written by user (Markdown) */
	readonly about?: Maybe<Scalars['String']>;
	/** The user's avatar images */
	readonly avatar?: Maybe<UserAvatar>;
	/** The user's banner images */
	readonly bannerImage?: Maybe<Scalars['String']>;
	/** If the authenticated user if following this user */
	readonly isFollowing?: Maybe<Scalars['Boolean']>;
	/** If this user if following the authenticated user */
	readonly isFollower?: Maybe<Scalars['Boolean']>;
	/** If the user is blocked by the authenticated user */
	readonly isBlocked?: Maybe<Scalars['Boolean']>;
	readonly bans?: Maybe<Scalars['Json']>;
	/** The user's general options */
	readonly options?: Maybe<UserOptions>;
	/** The user's media list options */
	readonly mediaListOptions?: Maybe<MediaListOptions>;
	/** The users favourites */
	readonly favourites?: Maybe<Favourites>;
	/** The users anime & manga list statistics */
	readonly statistics?: Maybe<UserStatisticTypes>;
	/** The number of unread notifications the user has */
	readonly unreadNotificationCount?: Maybe<Scalars['Int']>;
	/** The url for the user page on the AniList website */
	readonly siteUrl?: Maybe<Scalars['String']>;
	/** The donation tier of the user */
	readonly donatorTier?: Maybe<Scalars['Int']>;
	/** Custom donation badge text */
	readonly donatorBadge?: Maybe<Scalars['String']>;
	/** The user's moderator roles if they are a site moderator */
	readonly moderatorRoles?: Maybe<ReadonlyArray<Maybe<ModRole>>>;
	/** When the user's account was created. (Does not exist for accounts created before 2020) */
	readonly createdAt?: Maybe<Scalars['Int']>;
	/** When the user's data was last updated */
	readonly updatedAt?: Maybe<Scalars['Int']>;
	/**
	 * The user's statistics
	 * @deprecated Deprecated. Replaced with statistics field.
	 */
	readonly stats?: Maybe<UserStats>;
	/**
	 * If the user is a moderator or data moderator
	 * @deprecated Deprecated. Replaced with moderatorRoles field.
	 */
	readonly moderatorStatus?: Maybe<Scalars['String']>;
	/** The user's previously used names. */
	readonly previousNames?: Maybe<ReadonlyArray<Maybe<UserPreviousName>>>;
}

/** A user */
export interface UserAboutArgs {
	asHtml?: Maybe<Scalars['Boolean']>;
}

/** A user */
export interface UserFavouritesArgs {
	page?: Maybe<Scalars['Int']>;
}

/** A user's activity history stats. */
export interface UserActivityHistory {
	readonly __typename?: 'UserActivityHistory';
	/** The day the activity took place (Unix timestamp) */
	readonly date?: Maybe<Scalars['Int']>;
	/** The amount of activity on the day */
	readonly amount?: Maybe<Scalars['Int']>;
	/** The level of activity represented on a 1-10 scale */
	readonly level?: Maybe<Scalars['Int']>;
}

/** A user's avatars */
export interface UserAvatar {
	readonly __typename?: 'UserAvatar';
	/** The avatar of user at its largest size */
	readonly large?: Maybe<Scalars['String']>;
	/** The avatar of user at medium size */
	readonly medium?: Maybe<Scalars['String']>;
}

export interface UserCountryStatistic {
	readonly __typename?: 'UserCountryStatistic';
	readonly count: Scalars['Int'];
	readonly meanScore: Scalars['Float'];
	readonly minutesWatched: Scalars['Int'];
	readonly chaptersRead: Scalars['Int'];
	readonly mediaIds: ReadonlyArray<Maybe<Scalars['Int']>>;
	readonly country?: Maybe<Scalars['CountryCode']>;
}

export interface UserFormatStatistic {
	readonly __typename?: 'UserFormatStatistic';
	readonly count: Scalars['Int'];
	readonly meanScore: Scalars['Float'];
	readonly minutesWatched: Scalars['Int'];
	readonly chaptersRead: Scalars['Int'];
	readonly mediaIds: ReadonlyArray<Maybe<Scalars['Int']>>;
	readonly format?: Maybe<MediaFormat>;
}

export interface UserGenreStatistic {
	readonly __typename?: 'UserGenreStatistic';
	readonly count: Scalars['Int'];
	readonly meanScore: Scalars['Float'];
	readonly minutesWatched: Scalars['Int'];
	readonly chaptersRead: Scalars['Int'];
	readonly mediaIds: ReadonlyArray<Maybe<Scalars['Int']>>;
	readonly genre?: Maybe<Scalars['String']>;
}

export interface UserLengthStatistic {
	readonly __typename?: 'UserLengthStatistic';
	readonly count: Scalars['Int'];
	readonly meanScore: Scalars['Float'];
	readonly minutesWatched: Scalars['Int'];
	readonly chaptersRead: Scalars['Int'];
	readonly mediaIds: ReadonlyArray<Maybe<Scalars['Int']>>;
	readonly length?: Maybe<Scalars['String']>;
}

/** User data for moderators */
export interface UserModData {
	readonly __typename?: 'UserModData';
	readonly alts?: Maybe<ReadonlyArray<Maybe<User>>>;
	readonly bans?: Maybe<Scalars['Json']>;
	readonly ip?: Maybe<Scalars['Json']>;
	readonly counts?: Maybe<Scalars['Json']>;
	readonly privacy?: Maybe<Scalars['Int']>;
	readonly email?: Maybe<Scalars['String']>;
}

/** A user's general options */
export interface UserOptions {
	readonly __typename?: 'UserOptions';
	/** The language the user wants to see media titles in */
	readonly titleLanguage?: Maybe<UserTitleLanguage>;
	/** Whether the user has enabled viewing of 18+ content */
	readonly displayAdultContent?: Maybe<Scalars['Boolean']>;
	/** Whether the user receives notifications when a show they are watching aires */
	readonly airingNotifications?: Maybe<Scalars['Boolean']>;
	/** Profile highlight color (blue, purple, pink, orange, red, green, gray) */
	readonly profileColor?: Maybe<Scalars['String']>;
	/** Notification options */
	readonly notificationOptions?: Maybe<ReadonlyArray<Maybe<NotificationOption>>>;
	/** The user's timezone offset (Auth user only) */
	readonly timezone?: Maybe<Scalars['String']>;
	/** Minutes between activity for them to be merged together. 0 is Never, Above 2 weeks (20160 mins) is Always. */
	readonly activityMergeTime?: Maybe<Scalars['Int']>;
	/** The language the user wants to see staff and character names in */
	readonly staffNameLanguage?: Maybe<UserStaffNameLanguage>;
}

/** A user's previous name */
export interface UserPreviousName {
	readonly __typename?: 'UserPreviousName';
	/** A previous name of the user. */
	readonly name?: Maybe<Scalars['String']>;
	/** When the user first changed from this name. */
	readonly createdAt?: Maybe<Scalars['Int']>;
	/** When the user most recently changed from this name. */
	readonly updatedAt?: Maybe<Scalars['Int']>;
}

export interface UserReleaseYearStatistic {
	readonly __typename?: 'UserReleaseYearStatistic';
	readonly count: Scalars['Int'];
	readonly meanScore: Scalars['Float'];
	readonly minutesWatched: Scalars['Int'];
	readonly chaptersRead: Scalars['Int'];
	readonly mediaIds: ReadonlyArray<Maybe<Scalars['Int']>>;
	readonly releaseYear?: Maybe<Scalars['Int']>;
}

export interface UserScoreStatistic {
	readonly __typename?: 'UserScoreStatistic';
	readonly count: Scalars['Int'];
	readonly meanScore: Scalars['Float'];
	readonly minutesWatched: Scalars['Int'];
	readonly chaptersRead: Scalars['Int'];
	readonly mediaIds: ReadonlyArray<Maybe<Scalars['Int']>>;
	readonly score?: Maybe<Scalars['Int']>;
}

/** User sort enums */
export const enum UserSort {
	Id = 'ID',
	IdDesc = 'ID_DESC',
	Username = 'USERNAME',
	UsernameDesc = 'USERNAME_DESC',
	WatchedTime = 'WATCHED_TIME',
	WatchedTimeDesc = 'WATCHED_TIME_DESC',
	ChaptersRead = 'CHAPTERS_READ',
	ChaptersReadDesc = 'CHAPTERS_READ_DESC',
	SearchMatch = 'SEARCH_MATCH'
}

/** The language the user wants to see staff and character names in */
export const enum UserStaffNameLanguage {
	/** The romanization of the staff or character's native name, with western name ordering */
	RomajiWestern = 'ROMAJI_WESTERN',
	/** The romanization of the staff or character's native name */
	Romaji = 'ROMAJI',
	/** The staff or character's name in their native language */
	Native = 'NATIVE'
}

export interface UserStaffStatistic {
	readonly __typename?: 'UserStaffStatistic';
	readonly count: Scalars['Int'];
	readonly meanScore: Scalars['Float'];
	readonly minutesWatched: Scalars['Int'];
	readonly chaptersRead: Scalars['Int'];
	readonly mediaIds: ReadonlyArray<Maybe<Scalars['Int']>>;
	readonly staff?: Maybe<Staff>;
}

export interface UserStartYearStatistic {
	readonly __typename?: 'UserStartYearStatistic';
	readonly count: Scalars['Int'];
	readonly meanScore: Scalars['Float'];
	readonly minutesWatched: Scalars['Int'];
	readonly chaptersRead: Scalars['Int'];
	readonly mediaIds: ReadonlyArray<Maybe<Scalars['Int']>>;
	readonly startYear?: Maybe<Scalars['Int']>;
}

export interface UserStatisticTypes {
	readonly __typename?: 'UserStatisticTypes';
	readonly anime?: Maybe<UserStatistics>;
	readonly manga?: Maybe<UserStatistics>;
}

export interface UserStatistics {
	readonly __typename?: 'UserStatistics';
	readonly count: Scalars['Int'];
	readonly meanScore: Scalars['Float'];
	readonly standardDeviation: Scalars['Float'];
	readonly minutesWatched: Scalars['Int'];
	readonly episodesWatched: Scalars['Int'];
	readonly chaptersRead: Scalars['Int'];
	readonly volumesRead: Scalars['Int'];
	readonly formats?: Maybe<ReadonlyArray<Maybe<UserFormatStatistic>>>;
	readonly statuses?: Maybe<ReadonlyArray<Maybe<UserStatusStatistic>>>;
	readonly scores?: Maybe<ReadonlyArray<Maybe<UserScoreStatistic>>>;
	readonly lengths?: Maybe<ReadonlyArray<Maybe<UserLengthStatistic>>>;
	readonly releaseYears?: Maybe<ReadonlyArray<Maybe<UserReleaseYearStatistic>>>;
	readonly startYears?: Maybe<ReadonlyArray<Maybe<UserStartYearStatistic>>>;
	readonly genres?: Maybe<ReadonlyArray<Maybe<UserGenreStatistic>>>;
	readonly tags?: Maybe<ReadonlyArray<Maybe<UserTagStatistic>>>;
	readonly countries?: Maybe<ReadonlyArray<Maybe<UserCountryStatistic>>>;
	readonly voiceActors?: Maybe<ReadonlyArray<Maybe<UserVoiceActorStatistic>>>;
	readonly staff?: Maybe<ReadonlyArray<Maybe<UserStaffStatistic>>>;
	readonly studios?: Maybe<ReadonlyArray<Maybe<UserStudioStatistic>>>;
}

export interface UserStatisticsFormatsArgs {
	limit?: Maybe<Scalars['Int']>;
	sort?: Maybe<ReadonlyArray<Maybe<UserStatisticsSort>>>;
}

export interface UserStatisticsStatusesArgs {
	limit?: Maybe<Scalars['Int']>;
	sort?: Maybe<ReadonlyArray<Maybe<UserStatisticsSort>>>;
}

export interface UserStatisticsScoresArgs {
	limit?: Maybe<Scalars['Int']>;
	sort?: Maybe<ReadonlyArray<Maybe<UserStatisticsSort>>>;
}

export interface UserStatisticsLengthsArgs {
	limit?: Maybe<Scalars['Int']>;
	sort?: Maybe<ReadonlyArray<Maybe<UserStatisticsSort>>>;
}

export interface UserStatisticsReleaseYearsArgs {
	limit?: Maybe<Scalars['Int']>;
	sort?: Maybe<ReadonlyArray<Maybe<UserStatisticsSort>>>;
}

export interface UserStatisticsStartYearsArgs {
	limit?: Maybe<Scalars['Int']>;
	sort?: Maybe<ReadonlyArray<Maybe<UserStatisticsSort>>>;
}

export interface UserStatisticsGenresArgs {
	limit?: Maybe<Scalars['Int']>;
	sort?: Maybe<ReadonlyArray<Maybe<UserStatisticsSort>>>;
}

export interface UserStatisticsTagsArgs {
	limit?: Maybe<Scalars['Int']>;
	sort?: Maybe<ReadonlyArray<Maybe<UserStatisticsSort>>>;
}

export interface UserStatisticsCountriesArgs {
	limit?: Maybe<Scalars['Int']>;
	sort?: Maybe<ReadonlyArray<Maybe<UserStatisticsSort>>>;
}

export interface UserStatisticsVoiceActorsArgs {
	limit?: Maybe<Scalars['Int']>;
	sort?: Maybe<ReadonlyArray<Maybe<UserStatisticsSort>>>;
}

export interface UserStatisticsStaffArgs {
	limit?: Maybe<Scalars['Int']>;
	sort?: Maybe<ReadonlyArray<Maybe<UserStatisticsSort>>>;
}

export interface UserStatisticsStudiosArgs {
	limit?: Maybe<Scalars['Int']>;
	sort?: Maybe<ReadonlyArray<Maybe<UserStatisticsSort>>>;
}

/** User statistics sort enum */
export const enum UserStatisticsSort {
	Id = 'ID',
	IdDesc = 'ID_DESC',
	Count = 'COUNT',
	CountDesc = 'COUNT_DESC',
	Progress = 'PROGRESS',
	ProgressDesc = 'PROGRESS_DESC',
	MeanScore = 'MEAN_SCORE',
	MeanScoreDesc = 'MEAN_SCORE_DESC'
}

/** A user's statistics */
export interface UserStats {
	readonly __typename?: 'UserStats';
	/** The amount of anime the user has watched in minutes */
	readonly watchedTime?: Maybe<Scalars['Int']>;
	/** The amount of manga chapters the user has read */
	readonly chaptersRead?: Maybe<Scalars['Int']>;
	readonly activityHistory?: Maybe<ReadonlyArray<Maybe<UserActivityHistory>>>;
	readonly animeStatusDistribution?: Maybe<ReadonlyArray<Maybe<StatusDistribution>>>;
	readonly mangaStatusDistribution?: Maybe<ReadonlyArray<Maybe<StatusDistribution>>>;
	readonly animeScoreDistribution?: Maybe<ReadonlyArray<Maybe<ScoreDistribution>>>;
	readonly mangaScoreDistribution?: Maybe<ReadonlyArray<Maybe<ScoreDistribution>>>;
	readonly animeListScores?: Maybe<ListScoreStats>;
	readonly mangaListScores?: Maybe<ListScoreStats>;
	readonly favouredGenresOverview?: Maybe<ReadonlyArray<Maybe<GenreStats>>>;
	readonly favouredGenres?: Maybe<ReadonlyArray<Maybe<GenreStats>>>;
	readonly favouredTags?: Maybe<ReadonlyArray<Maybe<TagStats>>>;
	readonly favouredActors?: Maybe<ReadonlyArray<Maybe<StaffStats>>>;
	readonly favouredStaff?: Maybe<ReadonlyArray<Maybe<StaffStats>>>;
	readonly favouredStudios?: Maybe<ReadonlyArray<Maybe<StudioStats>>>;
	readonly favouredYears?: Maybe<ReadonlyArray<Maybe<YearStats>>>;
	readonly favouredFormats?: Maybe<ReadonlyArray<Maybe<FormatStats>>>;
}

export interface UserStatusStatistic {
	readonly __typename?: 'UserStatusStatistic';
	readonly count: Scalars['Int'];
	readonly meanScore: Scalars['Float'];
	readonly minutesWatched: Scalars['Int'];
	readonly chaptersRead: Scalars['Int'];
	readonly mediaIds: ReadonlyArray<Maybe<Scalars['Int']>>;
	readonly status?: Maybe<MediaListStatus>;
}

export interface UserStudioStatistic {
	readonly __typename?: 'UserStudioStatistic';
	readonly count: Scalars['Int'];
	readonly meanScore: Scalars['Float'];
	readonly minutesWatched: Scalars['Int'];
	readonly chaptersRead: Scalars['Int'];
	readonly mediaIds: ReadonlyArray<Maybe<Scalars['Int']>>;
	readonly studio?: Maybe<Studio>;
}

export interface UserTagStatistic {
	readonly __typename?: 'UserTagStatistic';
	readonly count: Scalars['Int'];
	readonly meanScore: Scalars['Float'];
	readonly minutesWatched: Scalars['Int'];
	readonly chaptersRead: Scalars['Int'];
	readonly mediaIds: ReadonlyArray<Maybe<Scalars['Int']>>;
	readonly tag?: Maybe<MediaTag>;
}

/** The language the user wants to see media titles in */
export const enum UserTitleLanguage {
	/** The romanization of the native language title */
	Romaji = 'ROMAJI',
	/** The official english title */
	English = 'ENGLISH',
	/** Official title in it's native language */
	Native = 'NATIVE',
	/** The romanization of the native language title, stylised by media creator */
	RomajiStylised = 'ROMAJI_STYLISED',
	/** The official english title, stylised by media creator */
	EnglishStylised = 'ENGLISH_STYLISED',
	/** Official title in it's native language, stylised by media creator */
	NativeStylised = 'NATIVE_STYLISED'
}

export interface UserVoiceActorStatistic {
	readonly __typename?: 'UserVoiceActorStatistic';
	readonly count: Scalars['Int'];
	readonly meanScore: Scalars['Float'];
	readonly minutesWatched: Scalars['Int'];
	readonly chaptersRead: Scalars['Int'];
	readonly mediaIds: ReadonlyArray<Maybe<Scalars['Int']>>;
	readonly voiceActor?: Maybe<Staff>;
	readonly characterIds: ReadonlyArray<Maybe<Scalars['Int']>>;
}

/** User's year statistics */
export interface YearStats {
	readonly __typename?: 'YearStats';
	readonly year?: Maybe<Scalars['Int']>;
	readonly amount?: Maybe<Scalars['Int']>;
	readonly meanScore?: Maybe<Scalars['Int']>;
}

export type ResolverTypeWrapper<T> = Promise<T> | T;

export interface ResolverWithResolve<TResult, TParent, TContext, TArgs> {
	resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
}

export interface LegacyStitchingResolver<TResult, TParent, TContext, TArgs> {
	fragment: string;
	resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
}

export interface NewStitchingResolver<TResult, TParent, TContext, TArgs> {
	selectionSet: string;
	resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
}
export type StitchingResolver<TResult, TParent, TContext, TArgs> =
	| LegacyStitchingResolver<TResult, TParent, TContext, TArgs>
	| NewStitchingResolver<TResult, TParent, TContext, TArgs>;
export type Resolver<TResult, TParent = NonNullObject, TContext = NonNullObject, TArgs = NonNullObject> =
	| ResolverFn<TResult, TParent, TContext, TArgs>
	| ResolverWithResolve<TResult, TParent, TContext, TArgs>
	| StitchingResolver<TResult, TParent, TContext, TArgs>;

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
	parent: TParent,
	args: TArgs,
	context: TContext,
	info: GraphQLResolveInfo
) => Promise<TResult> | TResult;

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
	parent: TParent,
	args: TArgs,
	context: TContext,
	info: GraphQLResolveInfo
) => AsyncIterator<TResult> | Promise<AsyncIterator<TResult>>;

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
	parent: TParent,
	args: TArgs,
	context: TContext,
	info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

export interface SubscriptionSubscriberObject<TResult, TKey extends string, TParent, TContext, TArgs> {
	subscribe: SubscriptionSubscribeFn<{ [key in TKey]: TResult }, TParent, TContext, TArgs>;
	resolve?: SubscriptionResolveFn<TResult, { [key in TKey]: TResult }, TContext, TArgs>;
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
	subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
	resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
}

export type SubscriptionObject<TResult, TKey extends string, TParent, TContext, TArgs> =
	| SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
	| SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

export type SubscriptionResolver<TResult, TKey extends string, TParent = NonNullObject, TContext = NonNullObject, TArgs = NonNullObject> =
	| ((...args: any[]) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
	| SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = NonNullObject, TContext = NonNullObject> = (
	parent: TParent,
	context: TContext,
	info: GraphQLResolveInfo
) => Maybe<TTypes> | Promise<Maybe<TTypes>>;

export type IsTypeOfResolverFn<T = NonNullObject, TContext = NonNullObject> = (
	obj: T,
	context: TContext,
	info: GraphQLResolveInfo
) => boolean | Promise<boolean>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<TResult = NonNullObject, TParent = NonNullObject, TContext = NonNullObject, TArgs = NonNullObject> = (
	next: NextResolverFn<TResult>,
	parent: TParent,
	args: TArgs,
	context: TContext,
	info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

/** Mapping between all available schema types and the resolvers types */
export interface ResolversTypes {
	ActivityLikeNotification: ResolverTypeWrapper<Omit<ActivityLikeNotification, 'activity'> & { activity?: Maybe<ResolversTypes['ActivityUnion']> }>;
	Int: ResolverTypeWrapper<Scalars['Int']>;
	String: ResolverTypeWrapper<Scalars['String']>;
	ActivityMentionNotification: ResolverTypeWrapper<
		Omit<ActivityMentionNotification, 'activity'> & { activity?: Maybe<ResolversTypes['ActivityUnion']> }
	>;
	ActivityMessageNotification: ResolverTypeWrapper<ActivityMessageNotification>;
	ActivityReply: ResolverTypeWrapper<ActivityReply>;
	Boolean: ResolverTypeWrapper<Scalars['Boolean']>;
	ActivityReplyLikeNotification: ResolverTypeWrapper<
		Omit<ActivityReplyLikeNotification, 'activity'> & { activity?: Maybe<ResolversTypes['ActivityUnion']> }
	>;
	ActivityReplyNotification: ResolverTypeWrapper<
		Omit<ActivityReplyNotification, 'activity'> & { activity?: Maybe<ResolversTypes['ActivityUnion']> }
	>;
	ActivityReplySubscribedNotification: ResolverTypeWrapper<
		Omit<ActivityReplySubscribedNotification, 'activity'> & { activity?: Maybe<ResolversTypes['ActivityUnion']> }
	>;
	ActivitySort: ActivitySort;
	ActivityType: ActivityType;
	ActivityUnion: ResolversTypes['TextActivity'] | ResolversTypes['ListActivity'] | ResolversTypes['MessageActivity'];
	AiringNotification: ResolverTypeWrapper<AiringNotification>;
	AiringProgression: ResolverTypeWrapper<AiringProgression>;
	Float: ResolverTypeWrapper<Scalars['Float']>;
	AiringSchedule: ResolverTypeWrapper<AiringSchedule>;
	AiringScheduleConnection: ResolverTypeWrapper<AiringScheduleConnection>;
	AiringScheduleEdge: ResolverTypeWrapper<AiringScheduleEdge>;
	AiringScheduleInput: AiringScheduleInput;
	AiringSort: AiringSort;
	AniChartHighlightInput: AniChartHighlightInput;
	AniChartUser: ResolverTypeWrapper<AniChartUser>;
	Character: ResolverTypeWrapper<Character>;
	CharacterConnection: ResolverTypeWrapper<CharacterConnection>;
	CharacterEdge: ResolverTypeWrapper<CharacterEdge>;
	CharacterImage: ResolverTypeWrapper<CharacterImage>;
	CharacterName: ResolverTypeWrapper<CharacterName>;
	CharacterNameInput: CharacterNameInput;
	CharacterRole: CharacterRole;
	CharacterSort: CharacterSort;
	CharacterSubmission: ResolverTypeWrapper<CharacterSubmission>;
	CharacterSubmissionConnection: ResolverTypeWrapper<CharacterSubmissionConnection>;
	CharacterSubmissionEdge: ResolverTypeWrapper<CharacterSubmissionEdge>;
	CountryCode: ResolverTypeWrapper<Scalars['CountryCode']>;
	Deleted: ResolverTypeWrapper<Deleted>;
	Favourites: ResolverTypeWrapper<Favourites>;
	FollowingNotification: ResolverTypeWrapper<FollowingNotification>;
	FormatStats: ResolverTypeWrapper<FormatStats>;
	FuzzyDate: ResolverTypeWrapper<FuzzyDate>;
	FuzzyDateInput: FuzzyDateInput;
	FuzzyDateInt: ResolverTypeWrapper<Scalars['FuzzyDateInt']>;
	GenreStats: ResolverTypeWrapper<GenreStats>;
	InternalPage: ResolverTypeWrapper<
		Omit<InternalPage, 'notifications' | 'activities'> & {
			notifications?: Maybe<ReadonlyArray<Maybe<ResolversTypes['NotificationUnion']>>>;
			activities?: Maybe<ReadonlyArray<Maybe<ResolversTypes['ActivityUnion']>>>;
		}
	>;
	Json: ResolverTypeWrapper<Scalars['Json']>;
	LikeableType: LikeableType;
	LikeableUnion:
		| ResolversTypes['ListActivity']
		| ResolversTypes['TextActivity']
		| ResolversTypes['MessageActivity']
		| ResolversTypes['ActivityReply']
		| ResolversTypes['Thread']
		| ResolversTypes['ThreadComment'];
	ListActivity: ResolverTypeWrapper<ListActivity>;
	ListScoreStats: ResolverTypeWrapper<ListScoreStats>;
	Media: ResolverTypeWrapper<Media>;
	MediaCharacter: ResolverTypeWrapper<MediaCharacter>;
	MediaConnection: ResolverTypeWrapper<MediaConnection>;
	MediaCoverImage: ResolverTypeWrapper<MediaCoverImage>;
	MediaEdge: ResolverTypeWrapper<MediaEdge>;
	MediaExternalLink: ResolverTypeWrapper<MediaExternalLink>;
	MediaExternalLinkInput: MediaExternalLinkInput;
	MediaFormat: MediaFormat;
	MediaList: ResolverTypeWrapper<MediaList>;
	MediaListCollection: ResolverTypeWrapper<MediaListCollection>;
	MediaListGroup: ResolverTypeWrapper<MediaListGroup>;
	MediaListOptions: ResolverTypeWrapper<MediaListOptions>;
	MediaListOptionsInput: MediaListOptionsInput;
	MediaListSort: MediaListSort;
	MediaListStatus: MediaListStatus;
	MediaListTypeOptions: ResolverTypeWrapper<MediaListTypeOptions>;
	MediaRank: ResolverTypeWrapper<MediaRank>;
	MediaRankType: MediaRankType;
	MediaRelation: MediaRelation;
	MediaSeason: MediaSeason;
	MediaSort: MediaSort;
	MediaSource: MediaSource;
	MediaStats: ResolverTypeWrapper<MediaStats>;
	MediaStatus: MediaStatus;
	MediaStreamingEpisode: ResolverTypeWrapper<MediaStreamingEpisode>;
	MediaSubmission: ResolverTypeWrapper<MediaSubmission>;
	MediaSubmissionComparison: ResolverTypeWrapper<MediaSubmissionComparison>;
	MediaSubmissionEdge: ResolverTypeWrapper<MediaSubmissionEdge>;
	MediaTag: ResolverTypeWrapper<MediaTag>;
	MediaTitle: ResolverTypeWrapper<MediaTitle>;
	MediaTitleInput: MediaTitleInput;
	MediaTrailer: ResolverTypeWrapper<MediaTrailer>;
	MediaTrend: ResolverTypeWrapper<MediaTrend>;
	MediaTrendConnection: ResolverTypeWrapper<MediaTrendConnection>;
	MediaTrendEdge: ResolverTypeWrapper<MediaTrendEdge>;
	MediaTrendSort: MediaTrendSort;
	MediaType: MediaType;
	MessageActivity: ResolverTypeWrapper<MessageActivity>;
	ModAction: ResolverTypeWrapper<ModAction>;
	ModActionType: ModActionType;
	ModRole: ModRole;
	Mutation: ResolverTypeWrapper<NonNullObject>;
	NotificationOption: ResolverTypeWrapper<NotificationOption>;
	NotificationOptionInput: NotificationOptionInput;
	NotificationType: NotificationType;
	NotificationUnion:
		| ResolversTypes['AiringNotification']
		| ResolversTypes['FollowingNotification']
		| ResolversTypes['ActivityMessageNotification']
		| ResolversTypes['ActivityMentionNotification']
		| ResolversTypes['ActivityReplyNotification']
		| ResolversTypes['ActivityReplySubscribedNotification']
		| ResolversTypes['ActivityLikeNotification']
		| ResolversTypes['ActivityReplyLikeNotification']
		| ResolversTypes['ThreadCommentMentionNotification']
		| ResolversTypes['ThreadCommentReplyNotification']
		| ResolversTypes['ThreadCommentSubscribedNotification']
		| ResolversTypes['ThreadCommentLikeNotification']
		| ResolversTypes['ThreadLikeNotification']
		| ResolversTypes['RelatedMediaAdditionNotification'];
	Page: ResolverTypeWrapper<
		Omit<Page, 'notifications' | 'activities'> & {
			notifications?: Maybe<ReadonlyArray<Maybe<ResolversTypes['NotificationUnion']>>>;
			activities?: Maybe<ReadonlyArray<Maybe<ResolversTypes['ActivityUnion']>>>;
		}
	>;
	PageInfo: ResolverTypeWrapper<PageInfo>;
	ParsedMarkdown: ResolverTypeWrapper<ParsedMarkdown>;
	Query: ResolverTypeWrapper<NonNullObject>;
	Recommendation: ResolverTypeWrapper<Recommendation>;
	RecommendationConnection: ResolverTypeWrapper<RecommendationConnection>;
	RecommendationEdge: ResolverTypeWrapper<RecommendationEdge>;
	RecommendationRating: RecommendationRating;
	RecommendationSort: RecommendationSort;
	RelatedMediaAdditionNotification: ResolverTypeWrapper<RelatedMediaAdditionNotification>;
	Report: ResolverTypeWrapper<Report>;
	Review: ResolverTypeWrapper<Review>;
	ReviewConnection: ResolverTypeWrapper<ReviewConnection>;
	ReviewEdge: ResolverTypeWrapper<ReviewEdge>;
	ReviewRating: ReviewRating;
	ReviewSort: ReviewSort;
	RevisionHistory: ResolverTypeWrapper<RevisionHistory>;
	RevisionHistoryAction: RevisionHistoryAction;
	ScoreDistribution: ResolverTypeWrapper<ScoreDistribution>;
	ScoreFormat: ScoreFormat;
	SiteStatistics: ResolverTypeWrapper<SiteStatistics>;
	SiteTrend: ResolverTypeWrapper<SiteTrend>;
	SiteTrendConnection: ResolverTypeWrapper<SiteTrendConnection>;
	SiteTrendEdge: ResolverTypeWrapper<SiteTrendEdge>;
	SiteTrendSort: SiteTrendSort;
	Staff: ResolverTypeWrapper<Staff>;
	StaffConnection: ResolverTypeWrapper<StaffConnection>;
	StaffEdge: ResolverTypeWrapper<StaffEdge>;
	StaffImage: ResolverTypeWrapper<StaffImage>;
	StaffLanguage: StaffLanguage;
	StaffName: ResolverTypeWrapper<StaffName>;
	StaffNameInput: StaffNameInput;
	StaffRoleType: ResolverTypeWrapper<StaffRoleType>;
	StaffSort: StaffSort;
	StaffStats: ResolverTypeWrapper<StaffStats>;
	StaffSubmission: ResolverTypeWrapper<StaffSubmission>;
	StatusDistribution: ResolverTypeWrapper<StatusDistribution>;
	Studio: ResolverTypeWrapper<Studio>;
	StudioConnection: ResolverTypeWrapper<StudioConnection>;
	StudioEdge: ResolverTypeWrapper<StudioEdge>;
	StudioSort: StudioSort;
	StudioStats: ResolverTypeWrapper<StudioStats>;
	SubmissionSort: SubmissionSort;
	SubmissionStatus: SubmissionStatus;
	TagStats: ResolverTypeWrapper<TagStats>;
	TextActivity: ResolverTypeWrapper<TextActivity>;
	Thread: ResolverTypeWrapper<Thread>;
	ThreadCategory: ResolverTypeWrapper<ThreadCategory>;
	ThreadComment: ResolverTypeWrapper<ThreadComment>;
	ThreadCommentLikeNotification: ResolverTypeWrapper<ThreadCommentLikeNotification>;
	ThreadCommentMentionNotification: ResolverTypeWrapper<ThreadCommentMentionNotification>;
	ThreadCommentReplyNotification: ResolverTypeWrapper<ThreadCommentReplyNotification>;
	ThreadCommentSort: ThreadCommentSort;
	ThreadCommentSubscribedNotification: ResolverTypeWrapper<ThreadCommentSubscribedNotification>;
	ThreadLikeNotification: ResolverTypeWrapper<ThreadLikeNotification>;
	ThreadSort: ThreadSort;
	User: ResolverTypeWrapper<User>;
	UserActivityHistory: ResolverTypeWrapper<UserActivityHistory>;
	UserAvatar: ResolverTypeWrapper<UserAvatar>;
	UserCountryStatistic: ResolverTypeWrapper<UserCountryStatistic>;
	UserFormatStatistic: ResolverTypeWrapper<UserFormatStatistic>;
	UserGenreStatistic: ResolverTypeWrapper<UserGenreStatistic>;
	UserLengthStatistic: ResolverTypeWrapper<UserLengthStatistic>;
	UserModData: ResolverTypeWrapper<UserModData>;
	UserOptions: ResolverTypeWrapper<UserOptions>;
	UserPreviousName: ResolverTypeWrapper<UserPreviousName>;
	UserReleaseYearStatistic: ResolverTypeWrapper<UserReleaseYearStatistic>;
	UserScoreStatistic: ResolverTypeWrapper<UserScoreStatistic>;
	UserSort: UserSort;
	UserStaffNameLanguage: UserStaffNameLanguage;
	UserStaffStatistic: ResolverTypeWrapper<UserStaffStatistic>;
	UserStartYearStatistic: ResolverTypeWrapper<UserStartYearStatistic>;
	UserStatisticTypes: ResolverTypeWrapper<UserStatisticTypes>;
	UserStatistics: ResolverTypeWrapper<UserStatistics>;
	UserStatisticsSort: UserStatisticsSort;
	UserStats: ResolverTypeWrapper<UserStats>;
	UserStatusStatistic: ResolverTypeWrapper<UserStatusStatistic>;
	UserStudioStatistic: ResolverTypeWrapper<UserStudioStatistic>;
	UserTagStatistic: ResolverTypeWrapper<UserTagStatistic>;
	UserTitleLanguage: UserTitleLanguage;
	UserVoiceActorStatistic: ResolverTypeWrapper<UserVoiceActorStatistic>;
	YearStats: ResolverTypeWrapper<YearStats>;
}

/** Mapping between all available schema types and the resolvers parents */
export interface ResolversParentTypes {
	ActivityLikeNotification: Omit<ActivityLikeNotification, 'activity'> & { activity?: Maybe<ResolversParentTypes['ActivityUnion']> };
	Int: Scalars['Int'];
	String: Scalars['String'];
	ActivityMentionNotification: Omit<ActivityMentionNotification, 'activity'> & { activity?: Maybe<ResolversParentTypes['ActivityUnion']> };
	ActivityMessageNotification: ActivityMessageNotification;
	ActivityReply: ActivityReply;
	Boolean: Scalars['Boolean'];
	ActivityReplyLikeNotification: Omit<ActivityReplyLikeNotification, 'activity'> & { activity?: Maybe<ResolversParentTypes['ActivityUnion']> };
	ActivityReplyNotification: Omit<ActivityReplyNotification, 'activity'> & { activity?: Maybe<ResolversParentTypes['ActivityUnion']> };
	ActivityReplySubscribedNotification: Omit<ActivityReplySubscribedNotification, 'activity'> & {
		activity?: Maybe<ResolversParentTypes['ActivityUnion']>;
	};
	ActivityUnion: ResolversParentTypes['TextActivity'] | ResolversParentTypes['ListActivity'] | ResolversParentTypes['MessageActivity'];
	AiringNotification: AiringNotification;
	AiringProgression: AiringProgression;
	Float: Scalars['Float'];
	AiringSchedule: AiringSchedule;
	AiringScheduleConnection: AiringScheduleConnection;
	AiringScheduleEdge: AiringScheduleEdge;
	AiringScheduleInput: AiringScheduleInput;
	AniChartHighlightInput: AniChartHighlightInput;
	AniChartUser: AniChartUser;
	Character: Character;
	CharacterConnection: CharacterConnection;
	CharacterEdge: CharacterEdge;
	CharacterImage: CharacterImage;
	CharacterName: CharacterName;
	CharacterNameInput: CharacterNameInput;
	CharacterSubmission: CharacterSubmission;
	CharacterSubmissionConnection: CharacterSubmissionConnection;
	CharacterSubmissionEdge: CharacterSubmissionEdge;
	CountryCode: Scalars['CountryCode'];
	Deleted: Deleted;
	Favourites: Favourites;
	FollowingNotification: FollowingNotification;
	FormatStats: FormatStats;
	FuzzyDate: FuzzyDate;
	FuzzyDateInput: FuzzyDateInput;
	FuzzyDateInt: Scalars['FuzzyDateInt'];
	GenreStats: GenreStats;
	InternalPage: Omit<InternalPage, 'notifications' | 'activities'> & {
		notifications?: Maybe<ReadonlyArray<Maybe<ResolversParentTypes['NotificationUnion']>>>;
		activities?: Maybe<ReadonlyArray<Maybe<ResolversParentTypes['ActivityUnion']>>>;
	};
	Json: Scalars['Json'];
	LikeableUnion:
		| ResolversParentTypes['ListActivity']
		| ResolversParentTypes['TextActivity']
		| ResolversParentTypes['MessageActivity']
		| ResolversParentTypes['ActivityReply']
		| ResolversParentTypes['Thread']
		| ResolversParentTypes['ThreadComment'];
	ListActivity: ListActivity;
	ListScoreStats: ListScoreStats;
	Media: Media;
	MediaCharacter: MediaCharacter;
	MediaConnection: MediaConnection;
	MediaCoverImage: MediaCoverImage;
	MediaEdge: MediaEdge;
	MediaExternalLink: MediaExternalLink;
	MediaExternalLinkInput: MediaExternalLinkInput;
	MediaList: MediaList;
	MediaListCollection: MediaListCollection;
	MediaListGroup: MediaListGroup;
	MediaListOptions: MediaListOptions;
	MediaListOptionsInput: MediaListOptionsInput;
	MediaListTypeOptions: MediaListTypeOptions;
	MediaRank: MediaRank;
	MediaStats: MediaStats;
	MediaStreamingEpisode: MediaStreamingEpisode;
	MediaSubmission: MediaSubmission;
	MediaSubmissionComparison: MediaSubmissionComparison;
	MediaSubmissionEdge: MediaSubmissionEdge;
	MediaTag: MediaTag;
	MediaTitle: MediaTitle;
	MediaTitleInput: MediaTitleInput;
	MediaTrailer: MediaTrailer;
	MediaTrend: MediaTrend;
	MediaTrendConnection: MediaTrendConnection;
	MediaTrendEdge: MediaTrendEdge;
	MessageActivity: MessageActivity;
	ModAction: ModAction;
	Mutation: NonNullObject;
	NotificationOption: NotificationOption;
	NotificationOptionInput: NotificationOptionInput;
	NotificationUnion:
		| ResolversParentTypes['AiringNotification']
		| ResolversParentTypes['FollowingNotification']
		| ResolversParentTypes['ActivityMessageNotification']
		| ResolversParentTypes['ActivityMentionNotification']
		| ResolversParentTypes['ActivityReplyNotification']
		| ResolversParentTypes['ActivityReplySubscribedNotification']
		| ResolversParentTypes['ActivityLikeNotification']
		| ResolversParentTypes['ActivityReplyLikeNotification']
		| ResolversParentTypes['ThreadCommentMentionNotification']
		| ResolversParentTypes['ThreadCommentReplyNotification']
		| ResolversParentTypes['ThreadCommentSubscribedNotification']
		| ResolversParentTypes['ThreadCommentLikeNotification']
		| ResolversParentTypes['ThreadLikeNotification']
		| ResolversParentTypes['RelatedMediaAdditionNotification'];
	Page: Omit<Page, 'notifications' | 'activities'> & {
		notifications?: Maybe<ReadonlyArray<Maybe<ResolversParentTypes['NotificationUnion']>>>;
		activities?: Maybe<ReadonlyArray<Maybe<ResolversParentTypes['ActivityUnion']>>>;
	};
	PageInfo: PageInfo;
	ParsedMarkdown: ParsedMarkdown;
	Query: NonNullObject;
	Recommendation: Recommendation;
	RecommendationConnection: RecommendationConnection;
	RecommendationEdge: RecommendationEdge;
	RelatedMediaAdditionNotification: RelatedMediaAdditionNotification;
	Report: Report;
	Review: Review;
	ReviewConnection: ReviewConnection;
	ReviewEdge: ReviewEdge;
	RevisionHistory: RevisionHistory;
	ScoreDistribution: ScoreDistribution;
	SiteStatistics: SiteStatistics;
	SiteTrend: SiteTrend;
	SiteTrendConnection: SiteTrendConnection;
	SiteTrendEdge: SiteTrendEdge;
	Staff: Staff;
	StaffConnection: StaffConnection;
	StaffEdge: StaffEdge;
	StaffImage: StaffImage;
	StaffName: StaffName;
	StaffNameInput: StaffNameInput;
	StaffRoleType: StaffRoleType;
	StaffStats: StaffStats;
	StaffSubmission: StaffSubmission;
	StatusDistribution: StatusDistribution;
	Studio: Studio;
	StudioConnection: StudioConnection;
	StudioEdge: StudioEdge;
	StudioStats: StudioStats;
	TagStats: TagStats;
	TextActivity: TextActivity;
	Thread: Thread;
	ThreadCategory: ThreadCategory;
	ThreadComment: ThreadComment;
	ThreadCommentLikeNotification: ThreadCommentLikeNotification;
	ThreadCommentMentionNotification: ThreadCommentMentionNotification;
	ThreadCommentReplyNotification: ThreadCommentReplyNotification;
	ThreadCommentSubscribedNotification: ThreadCommentSubscribedNotification;
	ThreadLikeNotification: ThreadLikeNotification;
	User: User;
	UserActivityHistory: UserActivityHistory;
	UserAvatar: UserAvatar;
	UserCountryStatistic: UserCountryStatistic;
	UserFormatStatistic: UserFormatStatistic;
	UserGenreStatistic: UserGenreStatistic;
	UserLengthStatistic: UserLengthStatistic;
	UserModData: UserModData;
	UserOptions: UserOptions;
	UserPreviousName: UserPreviousName;
	UserReleaseYearStatistic: UserReleaseYearStatistic;
	UserScoreStatistic: UserScoreStatistic;
	UserStaffStatistic: UserStaffStatistic;
	UserStartYearStatistic: UserStartYearStatistic;
	UserStatisticTypes: UserStatisticTypes;
	UserStatistics: UserStatistics;
	UserStats: UserStats;
	UserStatusStatistic: UserStatusStatistic;
	UserStudioStatistic: UserStudioStatistic;
	UserTagStatistic: UserTagStatistic;
	UserVoiceActorStatistic: UserVoiceActorStatistic;
	YearStats: YearStats;
}

export interface ActivityLikeNotificationResolvers<
	ContextType = any,
	ParentType extends ResolversParentTypes['ActivityLikeNotification'] = ResolversParentTypes['ActivityLikeNotification']
> {
	id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
	userId?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
	type?: Resolver<Maybe<ResolversTypes['NotificationType']>, ParentType, ContextType>;
	activityId?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
	context?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
	createdAt?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
	activity?: Resolver<Maybe<ResolversTypes['ActivityUnion']>, ParentType, ContextType>;
	user?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
	__isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}

export interface ActivityMentionNotificationResolvers<
	ContextType = any,
	ParentType extends ResolversParentTypes['ActivityMentionNotification'] = ResolversParentTypes['ActivityMentionNotification']
> {
	id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
	userId?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
	type?: Resolver<Maybe<ResolversTypes['NotificationType']>, ParentType, ContextType>;
	activityId?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
	context?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
	createdAt?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
	activity?: Resolver<Maybe<ResolversTypes['ActivityUnion']>, ParentType, ContextType>;
	user?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
	__isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}

export interface ActivityMessageNotificationResolvers<
	ContextType = any,
	ParentType extends ResolversParentTypes['ActivityMessageNotification'] = ResolversParentTypes['ActivityMessageNotification']
> {
	id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
	userId?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
	type?: Resolver<Maybe<ResolversTypes['NotificationType']>, ParentType, ContextType>;
	activityId?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
	context?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
	createdAt?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
	message?: Resolver<Maybe<ResolversTypes['MessageActivity']>, ParentType, ContextType>;
	user?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
	__isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}

export interface ActivityReplyResolvers<
	ContextType = any,
	ParentType extends ResolversParentTypes['ActivityReply'] = ResolversParentTypes['ActivityReply']
> {
	id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
	userId?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
	activityId?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
	text?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType, RequireFields<ActivityReplyTextArgs, never>>;
	likeCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
	isLiked?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
	createdAt?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
	user?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
	likes?: Resolver<Maybe<ReadonlyArray<Maybe<ResolversTypes['User']>>>, ParentType, ContextType>;
	__isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}

export interface ActivityReplyLikeNotificationResolvers<
	ContextType = any,
	ParentType extends ResolversParentTypes['ActivityReplyLikeNotification'] = ResolversParentTypes['ActivityReplyLikeNotification']
> {
	id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
	userId?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
	type?: Resolver<Maybe<ResolversTypes['NotificationType']>, ParentType, ContextType>;
	activityId?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
	context?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
	createdAt?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
	activity?: Resolver<Maybe<ResolversTypes['ActivityUnion']>, ParentType, ContextType>;
	user?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
	__isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}

export interface ActivityReplyNotificationResolvers<
	ContextType = any,
	ParentType extends ResolversParentTypes['ActivityReplyNotification'] = ResolversParentTypes['ActivityReplyNotification']
> {
	id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
	userId?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
	type?: Resolver<Maybe<ResolversTypes['NotificationType']>, ParentType, ContextType>;
	activityId?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
	context?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
	createdAt?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
	activity?: Resolver<Maybe<ResolversTypes['ActivityUnion']>, ParentType, ContextType>;
	user?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
	__isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}

export interface ActivityReplySubscribedNotificationResolvers<
	ContextType = any,
	ParentType extends ResolversParentTypes['ActivityReplySubscribedNotification'] = ResolversParentTypes['ActivityReplySubscribedNotification']
> {
	id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
	userId?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
	type?: Resolver<Maybe<ResolversTypes['NotificationType']>, ParentType, ContextType>;
	activityId?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
	context?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
	createdAt?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
	activity?: Resolver<Maybe<ResolversTypes['ActivityUnion']>, ParentType, ContextType>;
	user?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
	__isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}

export interface ActivityUnionResolvers<
	ContextType = any,
	ParentType extends ResolversParentTypes['ActivityUnion'] = ResolversParentTypes['ActivityUnion']
> {
	__resolveType: TypeResolveFn<'TextActivity' | 'ListActivity' | 'MessageActivity', ParentType, ContextType>;
}

export interface AiringNotificationResolvers<
	ContextType = any,
	ParentType extends ResolversParentTypes['AiringNotification'] = ResolversParentTypes['AiringNotification']
> {
	id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
	type?: Resolver<Maybe<ResolversTypes['NotificationType']>, ParentType, ContextType>;
	animeId?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
	episode?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
	contexts?: Resolver<Maybe<ReadonlyArray<Maybe<ResolversTypes['String']>>>, ParentType, ContextType>;
	createdAt?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
	media?: Resolver<Maybe<ResolversTypes['Media']>, ParentType, ContextType>;
	__isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}

export interface AiringProgressionResolvers<
	ContextType = any,
	ParentType extends ResolversParentTypes['AiringProgression'] = ResolversParentTypes['AiringProgression']
> {
	episode?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
	score?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
	watching?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
	__isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}

export interface AiringScheduleResolvers<
	ContextType = any,
	ParentType extends ResolversParentTypes['AiringSchedule'] = ResolversParentTypes['AiringSchedule']
> {
	id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
	airingAt?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
	timeUntilAiring?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
	episode?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
	mediaId?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
	media?: Resolver<Maybe<ResolversTypes['Media']>, ParentType, ContextType>;
	__isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}

export interface AiringScheduleConnectionResolvers<
	ContextType = any,
	ParentType extends ResolversParentTypes['AiringScheduleConnection'] = ResolversParentTypes['AiringScheduleConnection']
> {
	edges?: Resolver<Maybe<ReadonlyArray<Maybe<ResolversTypes['AiringScheduleEdge']>>>, ParentType, ContextType>;
	nodes?: Resolver<Maybe<ReadonlyArray<Maybe<ResolversTypes['AiringSchedule']>>>, ParentType, ContextType>;
	pageInfo?: Resolver<Maybe<ResolversTypes['PageInfo']>, ParentType, ContextType>;
	__isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}

export interface AiringScheduleEdgeResolvers<
	ContextType = any,
	ParentType extends ResolversParentTypes['AiringScheduleEdge'] = ResolversParentTypes['AiringScheduleEdge']
> {
	node?: Resolver<Maybe<ResolversTypes['AiringSchedule']>, ParentType, ContextType>;
	id?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
	__isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}

export interface AniChartUserResolvers<
	ContextType = any,
	ParentType extends ResolversParentTypes['AniChartUser'] = ResolversParentTypes['AniChartUser']
> {
	user?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
	settings?: Resolver<Maybe<ResolversTypes['Json']>, ParentType, ContextType>;
	highlights?: Resolver<Maybe<ResolversTypes['Json']>, ParentType, ContextType>;
	__isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}

export interface CharacterResolvers<ContextType = any, ParentType extends ResolversParentTypes['Character'] = ResolversParentTypes['Character']> {
	id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
	name?: Resolver<Maybe<ResolversTypes['CharacterName']>, ParentType, ContextType>;
	image?: Resolver<Maybe<ResolversTypes['CharacterImage']>, ParentType, ContextType>;
	description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType, RequireFields<CharacterDescriptionArgs, never>>;
	gender?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
	dateOfBirth?: Resolver<Maybe<ResolversTypes['FuzzyDate']>, ParentType, ContextType>;
	age?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
	bloodType?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
	isFavourite?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
	isFavouriteBlocked?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
	siteUrl?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
	media?: Resolver<Maybe<ResolversTypes['MediaConnection']>, ParentType, ContextType, RequireFields<CharacterMediaArgs, never>>;
	updatedAt?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
	favourites?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
	modNotes?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
	__isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}

export interface CharacterConnectionResolvers<
	ContextType = any,
	ParentType extends ResolversParentTypes['CharacterConnection'] = ResolversParentTypes['CharacterConnection']
> {
	edges?: Resolver<Maybe<ReadonlyArray<Maybe<ResolversTypes['CharacterEdge']>>>, ParentType, ContextType>;
	nodes?: Resolver<Maybe<ReadonlyArray<Maybe<ResolversTypes['Character']>>>, ParentType, ContextType>;
	pageInfo?: Resolver<Maybe<ResolversTypes['PageInfo']>, ParentType, ContextType>;
	__isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}

export interface CharacterEdgeResolvers<
	ContextType = any,
	ParentType extends ResolversParentTypes['CharacterEdge'] = ResolversParentTypes['CharacterEdge']
> {
	node?: Resolver<Maybe<ResolversTypes['Character']>, ParentType, ContextType>;
	id?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
	role?: Resolver<Maybe<ResolversTypes['CharacterRole']>, ParentType, ContextType>;
	name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
	voiceActors?: Resolver<
		Maybe<ReadonlyArray<Maybe<ResolversTypes['Staff']>>>,
		ParentType,
		ContextType,
		RequireFields<CharacterEdgeVoiceActorsArgs, never>
	>;
	voiceActorRoles?: Resolver<
		Maybe<ReadonlyArray<Maybe<ResolversTypes['StaffRoleType']>>>,
		ParentType,
		ContextType,
		RequireFields<CharacterEdgeVoiceActorRolesArgs, never>
	>;
	media?: Resolver<Maybe<ReadonlyArray<Maybe<ResolversTypes['Media']>>>, ParentType, ContextType>;
	favouriteOrder?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
	__isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}

export interface CharacterImageResolvers<
	ContextType = any,
	ParentType extends ResolversParentTypes['CharacterImage'] = ResolversParentTypes['CharacterImage']
> {
	large?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
	medium?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
	__isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}

export interface CharacterNameResolvers<
	ContextType = any,
	ParentType extends ResolversParentTypes['CharacterName'] = ResolversParentTypes['CharacterName']
> {
	first?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
	middle?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
	last?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
	full?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
	native?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
	alternative?: Resolver<Maybe<ReadonlyArray<Maybe<ResolversTypes['String']>>>, ParentType, ContextType>;
	alternativeSpoiler?: Resolver<Maybe<ReadonlyArray<Maybe<ResolversTypes['String']>>>, ParentType, ContextType>;
	userPreferred?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
	__isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}

export interface CharacterSubmissionResolvers<
	ContextType = any,
	ParentType extends ResolversParentTypes['CharacterSubmission'] = ResolversParentTypes['CharacterSubmission']
> {
	id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
	character?: Resolver<Maybe<ResolversTypes['Character']>, ParentType, ContextType>;
	submission?: Resolver<Maybe<ResolversTypes['Character']>, ParentType, ContextType>;
	submitter?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
	status?: Resolver<Maybe<ResolversTypes['SubmissionStatus']>, ParentType, ContextType>;
	notes?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
	source?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
	createdAt?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
	__isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}

export interface CharacterSubmissionConnectionResolvers<
	ContextType = any,
	ParentType extends ResolversParentTypes['CharacterSubmissionConnection'] = ResolversParentTypes['CharacterSubmissionConnection']
> {
	edges?: Resolver<Maybe<ReadonlyArray<Maybe<ResolversTypes['CharacterSubmissionEdge']>>>, ParentType, ContextType>;
	nodes?: Resolver<Maybe<ReadonlyArray<Maybe<ResolversTypes['CharacterSubmission']>>>, ParentType, ContextType>;
	pageInfo?: Resolver<Maybe<ResolversTypes['PageInfo']>, ParentType, ContextType>;
	__isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}

export interface CharacterSubmissionEdgeResolvers<
	ContextType = any,
	ParentType extends ResolversParentTypes['CharacterSubmissionEdge'] = ResolversParentTypes['CharacterSubmissionEdge']
> {
	node?: Resolver<Maybe<ResolversTypes['CharacterSubmission']>, ParentType, ContextType>;
	role?: Resolver<Maybe<ResolversTypes['CharacterRole']>, ParentType, ContextType>;
	voiceActors?: Resolver<Maybe<ReadonlyArray<Maybe<ResolversTypes['Staff']>>>, ParentType, ContextType>;
	submittedVoiceActors?: Resolver<Maybe<ReadonlyArray<Maybe<ResolversTypes['StaffSubmission']>>>, ParentType, ContextType>;
	__isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}

export interface CountryCodeScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['CountryCode'], any> {
	name: 'CountryCode';
}

export interface DeletedResolvers<ContextType = any, ParentType extends ResolversParentTypes['Deleted'] = ResolversParentTypes['Deleted']> {
	deleted?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
	__isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}

export interface FavouritesResolvers<ContextType = any, ParentType extends ResolversParentTypes['Favourites'] = ResolversParentTypes['Favourites']> {
	anime?: Resolver<Maybe<ResolversTypes['MediaConnection']>, ParentType, ContextType, RequireFields<FavouritesAnimeArgs, never>>;
	manga?: Resolver<Maybe<ResolversTypes['MediaConnection']>, ParentType, ContextType, RequireFields<FavouritesMangaArgs, never>>;
	characters?: Resolver<Maybe<ResolversTypes['CharacterConnection']>, ParentType, ContextType, RequireFields<FavouritesCharactersArgs, never>>;
	staff?: Resolver<Maybe<ResolversTypes['StaffConnection']>, ParentType, ContextType, RequireFields<FavouritesStaffArgs, never>>;
	studios?: Resolver<Maybe<ResolversTypes['StudioConnection']>, ParentType, ContextType, RequireFields<FavouritesStudiosArgs, never>>;
	__isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}

export interface FollowingNotificationResolvers<
	ContextType = any,
	ParentType extends ResolversParentTypes['FollowingNotification'] = ResolversParentTypes['FollowingNotification']
> {
	id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
	userId?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
	type?: Resolver<Maybe<ResolversTypes['NotificationType']>, ParentType, ContextType>;
	context?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
	createdAt?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
	user?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
	__isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}

export interface FormatStatsResolvers<
	ContextType = any,
	ParentType extends ResolversParentTypes['FormatStats'] = ResolversParentTypes['FormatStats']
> {
	format?: Resolver<Maybe<ResolversTypes['MediaFormat']>, ParentType, ContextType>;
	amount?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
	__isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}

export interface FuzzyDateResolvers<ContextType = any, ParentType extends ResolversParentTypes['FuzzyDate'] = ResolversParentTypes['FuzzyDate']> {
	year?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
	month?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
	day?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
	__isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}

export interface FuzzyDateIntScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['FuzzyDateInt'], any> {
	name: 'FuzzyDateInt';
}

export interface GenreStatsResolvers<ContextType = any, ParentType extends ResolversParentTypes['GenreStats'] = ResolversParentTypes['GenreStats']> {
	genre?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
	amount?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
	meanScore?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
	timeWatched?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
	__isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}

export interface InternalPageResolvers<
	ContextType = any,
	ParentType extends ResolversParentTypes['InternalPage'] = ResolversParentTypes['InternalPage']
> {
	mediaSubmissions?: Resolver<
		Maybe<ReadonlyArray<Maybe<ResolversTypes['MediaSubmission']>>>,
		ParentType,
		ContextType,
		RequireFields<InternalPageMediaSubmissionsArgs, never>
	>;
	characterSubmissions?: Resolver<
		Maybe<ReadonlyArray<Maybe<ResolversTypes['CharacterSubmission']>>>,
		ParentType,
		ContextType,
		RequireFields<InternalPageCharacterSubmissionsArgs, never>
	>;
	staffSubmissions?: Resolver<
		Maybe<ReadonlyArray<Maybe<ResolversTypes['StaffSubmission']>>>,
		ParentType,
		ContextType,
		RequireFields<InternalPageStaffSubmissionsArgs, never>
	>;
	revisionHistory?: Resolver<
		Maybe<ReadonlyArray<Maybe<ResolversTypes['RevisionHistory']>>>,
		ParentType,
		ContextType,
		RequireFields<InternalPageRevisionHistoryArgs, never>
	>;
	reports?: Resolver<Maybe<ReadonlyArray<Maybe<ResolversTypes['Report']>>>, ParentType, ContextType, RequireFields<InternalPageReportsArgs, never>>;
	modActions?: Resolver<
		Maybe<ReadonlyArray<Maybe<ResolversTypes['ModAction']>>>,
		ParentType,
		ContextType,
		RequireFields<InternalPageModActionsArgs, never>
	>;
	pageInfo?: Resolver<Maybe<ResolversTypes['PageInfo']>, ParentType, ContextType>;
	users?: Resolver<Maybe<ReadonlyArray<Maybe<ResolversTypes['User']>>>, ParentType, ContextType, RequireFields<InternalPageUsersArgs, never>>;
	media?: Resolver<Maybe<ReadonlyArray<Maybe<ResolversTypes['Media']>>>, ParentType, ContextType, RequireFields<InternalPageMediaArgs, never>>;
	characters?: Resolver<
		Maybe<ReadonlyArray<Maybe<ResolversTypes['Character']>>>,
		ParentType,
		ContextType,
		RequireFields<InternalPageCharactersArgs, never>
	>;
	staff?: Resolver<Maybe<ReadonlyArray<Maybe<ResolversTypes['Staff']>>>, ParentType, ContextType, RequireFields<InternalPageStaffArgs, never>>;
	studios?: Resolver<Maybe<ReadonlyArray<Maybe<ResolversTypes['Studio']>>>, ParentType, ContextType, RequireFields<InternalPageStudiosArgs, never>>;
	mediaList?: Resolver<
		Maybe<ReadonlyArray<Maybe<ResolversTypes['MediaList']>>>,
		ParentType,
		ContextType,
		RequireFields<InternalPageMediaListArgs, never>
	>;
	airingSchedules?: Resolver<
		Maybe<ReadonlyArray<Maybe<ResolversTypes['AiringSchedule']>>>,
		ParentType,
		ContextType,
		RequireFields<InternalPageAiringSchedulesArgs, never>
	>;
	mediaTrends?: Resolver<
		Maybe<ReadonlyArray<Maybe<ResolversTypes['MediaTrend']>>>,
		ParentType,
		ContextType,
		RequireFields<InternalPageMediaTrendsArgs, never>
	>;
	notifications?: Resolver<
		Maybe<ReadonlyArray<Maybe<ResolversTypes['NotificationUnion']>>>,
		ParentType,
		ContextType,
		RequireFields<InternalPageNotificationsArgs, never>
	>;
	followers?: Resolver<
		Maybe<ReadonlyArray<Maybe<ResolversTypes['User']>>>,
		ParentType,
		ContextType,
		RequireFields<InternalPageFollowersArgs, 'userId'>
	>;
	following?: Resolver<
		Maybe<ReadonlyArray<Maybe<ResolversTypes['User']>>>,
		ParentType,
		ContextType,
		RequireFields<InternalPageFollowingArgs, 'userId'>
	>;
	activities?: Resolver<
		Maybe<ReadonlyArray<Maybe<ResolversTypes['ActivityUnion']>>>,
		ParentType,
		ContextType,
		RequireFields<InternalPageActivitiesArgs, never>
	>;
	activityReplies?: Resolver<
		Maybe<ReadonlyArray<Maybe<ResolversTypes['ActivityReply']>>>,
		ParentType,
		ContextType,
		RequireFields<InternalPageActivityRepliesArgs, never>
	>;
	threads?: Resolver<Maybe<ReadonlyArray<Maybe<ResolversTypes['Thread']>>>, ParentType, ContextType, RequireFields<InternalPageThreadsArgs, never>>;
	threadComments?: Resolver<
		Maybe<ReadonlyArray<Maybe<ResolversTypes['ThreadComment']>>>,
		ParentType,
		ContextType,
		RequireFields<InternalPageThreadCommentsArgs, never>
	>;
	reviews?: Resolver<Maybe<ReadonlyArray<Maybe<ResolversTypes['Review']>>>, ParentType, ContextType, RequireFields<InternalPageReviewsArgs, never>>;
	recommendations?: Resolver<
		Maybe<ReadonlyArray<Maybe<ResolversTypes['Recommendation']>>>,
		ParentType,
		ContextType,
		RequireFields<InternalPageRecommendationsArgs, never>
	>;
	likes?: Resolver<Maybe<ReadonlyArray<Maybe<ResolversTypes['User']>>>, ParentType, ContextType, RequireFields<InternalPageLikesArgs, never>>;
	__isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}

export interface JsonScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['Json'], any> {
	name: 'Json';
}

export interface LikeableUnionResolvers<
	ContextType = any,
	ParentType extends ResolversParentTypes['LikeableUnion'] = ResolversParentTypes['LikeableUnion']
> {
	__resolveType: TypeResolveFn<
		'ListActivity' | 'TextActivity' | 'MessageActivity' | 'ActivityReply' | 'Thread' | 'ThreadComment',
		ParentType,
		ContextType
	>;
}

export interface ListActivityResolvers<
	ContextType = any,
	ParentType extends ResolversParentTypes['ListActivity'] = ResolversParentTypes['ListActivity']
> {
	id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
	userId?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
	type?: Resolver<Maybe<ResolversTypes['ActivityType']>, ParentType, ContextType>;
	replyCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
	status?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
	progress?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
	isLocked?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
	isSubscribed?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
	likeCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
	isLiked?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
	siteUrl?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
	createdAt?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
	user?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
	media?: Resolver<Maybe<ResolversTypes['Media']>, ParentType, ContextType>;
	replies?: Resolver<Maybe<ReadonlyArray<Maybe<ResolversTypes['ActivityReply']>>>, ParentType, ContextType>;
	likes?: Resolver<Maybe<ReadonlyArray<Maybe<ResolversTypes['User']>>>, ParentType, ContextType>;
	__isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}

export interface ListScoreStatsResolvers<
	ContextType = any,
	ParentType extends ResolversParentTypes['ListScoreStats'] = ResolversParentTypes['ListScoreStats']
> {
	meanScore?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
	standardDeviation?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
	__isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}

export interface MediaResolvers<ContextType = any, ParentType extends ResolversParentTypes['Media'] = ResolversParentTypes['Media']> {
	id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
	idMal?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
	title?: Resolver<Maybe<ResolversTypes['MediaTitle']>, ParentType, ContextType>;
	type?: Resolver<Maybe<ResolversTypes['MediaType']>, ParentType, ContextType>;
	format?: Resolver<Maybe<ResolversTypes['MediaFormat']>, ParentType, ContextType>;
	status?: Resolver<Maybe<ResolversTypes['MediaStatus']>, ParentType, ContextType, RequireFields<MediaStatusArgs, never>>;
	description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType, RequireFields<MediaDescriptionArgs, never>>;
	startDate?: Resolver<Maybe<ResolversTypes['FuzzyDate']>, ParentType, ContextType>;
	endDate?: Resolver<Maybe<ResolversTypes['FuzzyDate']>, ParentType, ContextType>;
	season?: Resolver<Maybe<ResolversTypes['MediaSeason']>, ParentType, ContextType>;
	seasonYear?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
	seasonInt?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
	episodes?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
	duration?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
	chapters?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
	volumes?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
	countryOfOrigin?: Resolver<Maybe<ResolversTypes['CountryCode']>, ParentType, ContextType>;
	isLicensed?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
	source?: Resolver<Maybe<ResolversTypes['MediaSource']>, ParentType, ContextType, RequireFields<MediaSourceArgs, never>>;
	hashtag?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
	trailer?: Resolver<Maybe<ResolversTypes['MediaTrailer']>, ParentType, ContextType>;
	updatedAt?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
	coverImage?: Resolver<Maybe<ResolversTypes['MediaCoverImage']>, ParentType, ContextType>;
	bannerImage?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
	genres?: Resolver<Maybe<ReadonlyArray<Maybe<ResolversTypes['String']>>>, ParentType, ContextType>;
	synonyms?: Resolver<Maybe<ReadonlyArray<Maybe<ResolversTypes['String']>>>, ParentType, ContextType>;
	averageScore?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
	meanScore?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
	popularity?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
	isLocked?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
	trending?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
	favourites?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
	tags?: Resolver<Maybe<ReadonlyArray<Maybe<ResolversTypes['MediaTag']>>>, ParentType, ContextType>;
	relations?: Resolver<Maybe<ResolversTypes['MediaConnection']>, ParentType, ContextType>;
	characters?: Resolver<Maybe<ResolversTypes['CharacterConnection']>, ParentType, ContextType, RequireFields<MediaCharactersArgs, never>>;
	staff?: Resolver<Maybe<ResolversTypes['StaffConnection']>, ParentType, ContextType, RequireFields<MediaStaffArgs, never>>;
	studios?: Resolver<Maybe<ResolversTypes['StudioConnection']>, ParentType, ContextType, RequireFields<MediaStudiosArgs, never>>;
	isFavourite?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
	isAdult?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
	nextAiringEpisode?: Resolver<Maybe<ResolversTypes['AiringSchedule']>, ParentType, ContextType>;
	airingSchedule?: Resolver<
		Maybe<ResolversTypes['AiringScheduleConnection']>,
		ParentType,
		ContextType,
		RequireFields<MediaAiringScheduleArgs, never>
	>;
	trends?: Resolver<Maybe<ResolversTypes['MediaTrendConnection']>, ParentType, ContextType, RequireFields<MediaTrendsArgs, never>>;
	externalLinks?: Resolver<Maybe<ReadonlyArray<Maybe<ResolversTypes['MediaExternalLink']>>>, ParentType, ContextType>;
	streamingEpisodes?: Resolver<Maybe<ReadonlyArray<Maybe<ResolversTypes['MediaStreamingEpisode']>>>, ParentType, ContextType>;
	rankings?: Resolver<Maybe<ReadonlyArray<Maybe<ResolversTypes['MediaRank']>>>, ParentType, ContextType>;
	mediaListEntry?: Resolver<Maybe<ResolversTypes['MediaList']>, ParentType, ContextType>;
	reviews?: Resolver<Maybe<ResolversTypes['ReviewConnection']>, ParentType, ContextType, RequireFields<MediaReviewsArgs, never>>;
	recommendations?: Resolver<
		Maybe<ResolversTypes['RecommendationConnection']>,
		ParentType,
		ContextType,
		RequireFields<MediaRecommendationsArgs, never>
	>;
	stats?: Resolver<Maybe<ResolversTypes['MediaStats']>, ParentType, ContextType>;
	siteUrl?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
	autoCreateForumThread?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
	isRecommendationBlocked?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
	modNotes?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
	__isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}

export interface MediaCharacterResolvers<
	ContextType = any,
	ParentType extends ResolversParentTypes['MediaCharacter'] = ResolversParentTypes['MediaCharacter']
> {
	id?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
	role?: Resolver<Maybe<ResolversTypes['CharacterRole']>, ParentType, ContextType>;
	roleNotes?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
	dubGroup?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
	characterName?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
	character?: Resolver<Maybe<ResolversTypes['Character']>, ParentType, ContextType>;
	voiceActor?: Resolver<Maybe<ResolversTypes['Staff']>, ParentType, ContextType>;
	__isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}

export interface MediaConnectionResolvers<
	ContextType = any,
	ParentType extends ResolversParentTypes['MediaConnection'] = ResolversParentTypes['MediaConnection']
> {
	edges?: Resolver<Maybe<ReadonlyArray<Maybe<ResolversTypes['MediaEdge']>>>, ParentType, ContextType>;
	nodes?: Resolver<Maybe<ReadonlyArray<Maybe<ResolversTypes['Media']>>>, ParentType, ContextType>;
	pageInfo?: Resolver<Maybe<ResolversTypes['PageInfo']>, ParentType, ContextType>;
	__isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}

export interface MediaCoverImageResolvers<
	ContextType = any,
	ParentType extends ResolversParentTypes['MediaCoverImage'] = ResolversParentTypes['MediaCoverImage']
> {
	extraLarge?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
	large?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
	medium?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
	color?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
	__isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}

export interface MediaEdgeResolvers<ContextType = any, ParentType extends ResolversParentTypes['MediaEdge'] = ResolversParentTypes['MediaEdge']> {
	node?: Resolver<Maybe<ResolversTypes['Media']>, ParentType, ContextType>;
	id?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
	relationType?: Resolver<Maybe<ResolversTypes['MediaRelation']>, ParentType, ContextType, RequireFields<MediaEdgeRelationTypeArgs, never>>;
	isMainStudio?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
	characters?: Resolver<Maybe<ReadonlyArray<Maybe<ResolversTypes['Character']>>>, ParentType, ContextType>;
	characterRole?: Resolver<Maybe<ResolversTypes['CharacterRole']>, ParentType, ContextType>;
	characterName?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
	roleNotes?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
	dubGroup?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
	staffRole?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
	voiceActors?: Resolver<
		Maybe<ReadonlyArray<Maybe<ResolversTypes['Staff']>>>,
		ParentType,
		ContextType,
		RequireFields<MediaEdgeVoiceActorsArgs, never>
	>;
	voiceActorRoles?: Resolver<
		Maybe<ReadonlyArray<Maybe<ResolversTypes['StaffRoleType']>>>,
		ParentType,
		ContextType,
		RequireFields<MediaEdgeVoiceActorRolesArgs, never>
	>;
	favouriteOrder?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
	__isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}

export interface MediaExternalLinkResolvers<
	ContextType = any,
	ParentType extends ResolversParentTypes['MediaExternalLink'] = ResolversParentTypes['MediaExternalLink']
> {
	id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
	url?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
	site?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
	__isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}

export interface MediaListResolvers<ContextType = any, ParentType extends ResolversParentTypes['MediaList'] = ResolversParentTypes['MediaList']> {
	id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
	userId?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
	mediaId?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
	status?: Resolver<Maybe<ResolversTypes['MediaListStatus']>, ParentType, ContextType>;
	score?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType, RequireFields<MediaListScoreArgs, never>>;
	progress?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
	progressVolumes?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
	repeat?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
	priority?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
	private?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
	notes?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
	hiddenFromStatusLists?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
	customLists?: Resolver<Maybe<ResolversTypes['Json']>, ParentType, ContextType, RequireFields<MediaListCustomListsArgs, never>>;
	advancedScores?: Resolver<Maybe<ResolversTypes['Json']>, ParentType, ContextType>;
	startedAt?: Resolver<Maybe<ResolversTypes['FuzzyDate']>, ParentType, ContextType>;
	completedAt?: Resolver<Maybe<ResolversTypes['FuzzyDate']>, ParentType, ContextType>;
	updatedAt?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
	createdAt?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
	media?: Resolver<Maybe<ResolversTypes['Media']>, ParentType, ContextType>;
	user?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
	__isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}

export interface MediaListCollectionResolvers<
	ContextType = any,
	ParentType extends ResolversParentTypes['MediaListCollection'] = ResolversParentTypes['MediaListCollection']
> {
	lists?: Resolver<Maybe<ReadonlyArray<Maybe<ResolversTypes['MediaListGroup']>>>, ParentType, ContextType>;
	user?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
	hasNextChunk?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
	statusLists?: Resolver<
		Maybe<ReadonlyArray<Maybe<ReadonlyArray<Maybe<ResolversTypes['MediaList']>>>>>,
		ParentType,
		ContextType,
		RequireFields<MediaListCollectionStatusListsArgs, never>
	>;
	customLists?: Resolver<
		Maybe<ReadonlyArray<Maybe<ReadonlyArray<Maybe<ResolversTypes['MediaList']>>>>>,
		ParentType,
		ContextType,
		RequireFields<MediaListCollectionCustomListsArgs, never>
	>;
	__isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}

export interface MediaListGroupResolvers<
	ContextType = any,
	ParentType extends ResolversParentTypes['MediaListGroup'] = ResolversParentTypes['MediaListGroup']
> {
	entries?: Resolver<Maybe<ReadonlyArray<Maybe<ResolversTypes['MediaList']>>>, ParentType, ContextType>;
	name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
	isCustomList?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
	isSplitCompletedList?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
	status?: Resolver<Maybe<ResolversTypes['MediaListStatus']>, ParentType, ContextType>;
	__isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}

export interface MediaListOptionsResolvers<
	ContextType = any,
	ParentType extends ResolversParentTypes['MediaListOptions'] = ResolversParentTypes['MediaListOptions']
> {
	scoreFormat?: Resolver<Maybe<ResolversTypes['ScoreFormat']>, ParentType, ContextType>;
	rowOrder?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
	useLegacyLists?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
	animeList?: Resolver<Maybe<ResolversTypes['MediaListTypeOptions']>, ParentType, ContextType>;
	mangaList?: Resolver<Maybe<ResolversTypes['MediaListTypeOptions']>, ParentType, ContextType>;
	sharedTheme?: Resolver<Maybe<ResolversTypes['Json']>, ParentType, ContextType>;
	sharedThemeEnabled?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
	__isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}

export interface MediaListTypeOptionsResolvers<
	ContextType = any,
	ParentType extends ResolversParentTypes['MediaListTypeOptions'] = ResolversParentTypes['MediaListTypeOptions']
> {
	sectionOrder?: Resolver<Maybe<ReadonlyArray<Maybe<ResolversTypes['String']>>>, ParentType, ContextType>;
	splitCompletedSectionByFormat?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
	theme?: Resolver<Maybe<ResolversTypes['Json']>, ParentType, ContextType>;
	customLists?: Resolver<Maybe<ReadonlyArray<Maybe<ResolversTypes['String']>>>, ParentType, ContextType>;
	advancedScoring?: Resolver<Maybe<ReadonlyArray<Maybe<ResolversTypes['String']>>>, ParentType, ContextType>;
	advancedScoringEnabled?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
	__isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}

export interface MediaRankResolvers<ContextType = any, ParentType extends ResolversParentTypes['MediaRank'] = ResolversParentTypes['MediaRank']> {
	id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
	rank?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
	type?: Resolver<ResolversTypes['MediaRankType'], ParentType, ContextType>;
	format?: Resolver<ResolversTypes['MediaFormat'], ParentType, ContextType>;
	year?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
	season?: Resolver<Maybe<ResolversTypes['MediaSeason']>, ParentType, ContextType>;
	allTime?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
	context?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
	__isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}

export interface MediaStatsResolvers<ContextType = any, ParentType extends ResolversParentTypes['MediaStats'] = ResolversParentTypes['MediaStats']> {
	scoreDistribution?: Resolver<Maybe<ReadonlyArray<Maybe<ResolversTypes['ScoreDistribution']>>>, ParentType, ContextType>;
	statusDistribution?: Resolver<Maybe<ReadonlyArray<Maybe<ResolversTypes['StatusDistribution']>>>, ParentType, ContextType>;
	airingProgression?: Resolver<Maybe<ReadonlyArray<Maybe<ResolversTypes['AiringProgression']>>>, ParentType, ContextType>;
	__isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}

export interface MediaStreamingEpisodeResolvers<
	ContextType = any,
	ParentType extends ResolversParentTypes['MediaStreamingEpisode'] = ResolversParentTypes['MediaStreamingEpisode']
> {
	title?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
	thumbnail?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
	url?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
	site?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
	__isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}

export interface MediaSubmissionResolvers<
	ContextType = any,
	ParentType extends ResolversParentTypes['MediaSubmission'] = ResolversParentTypes['MediaSubmission']
> {
	id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
	submitter?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
	status?: Resolver<Maybe<ResolversTypes['SubmissionStatus']>, ParentType, ContextType>;
	submitterStats?: Resolver<Maybe<ResolversTypes['Json']>, ParentType, ContextType>;
	notes?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
	source?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
	changes?: Resolver<Maybe<ReadonlyArray<Maybe<ResolversTypes['String']>>>, ParentType, ContextType>;
	media?: Resolver<Maybe<ResolversTypes['Media']>, ParentType, ContextType>;
	submission?: Resolver<Maybe<ResolversTypes['Media']>, ParentType, ContextType>;
	characters?: Resolver<Maybe<ReadonlyArray<Maybe<ResolversTypes['MediaSubmissionComparison']>>>, ParentType, ContextType>;
	staff?: Resolver<Maybe<ReadonlyArray<Maybe<ResolversTypes['MediaSubmissionComparison']>>>, ParentType, ContextType>;
	studios?: Resolver<Maybe<ReadonlyArray<Maybe<ResolversTypes['MediaSubmissionComparison']>>>, ParentType, ContextType>;
	relations?: Resolver<Maybe<ReadonlyArray<Maybe<ResolversTypes['MediaEdge']>>>, ParentType, ContextType>;
	externalLinks?: Resolver<Maybe<ReadonlyArray<Maybe<ResolversTypes['MediaExternalLink']>>>, ParentType, ContextType>;
	createdAt?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
	__isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}

export interface MediaSubmissionComparisonResolvers<
	ContextType = any,
	ParentType extends ResolversParentTypes['MediaSubmissionComparison'] = ResolversParentTypes['MediaSubmissionComparison']
> {
	submission?: Resolver<Maybe<ResolversTypes['MediaSubmissionEdge']>, ParentType, ContextType>;
	character?: Resolver<Maybe<ResolversTypes['MediaCharacter']>, ParentType, ContextType>;
	staff?: Resolver<Maybe<ResolversTypes['StaffEdge']>, ParentType, ContextType>;
	studio?: Resolver<Maybe<ResolversTypes['StudioEdge']>, ParentType, ContextType>;
	__isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}

export interface MediaSubmissionEdgeResolvers<
	ContextType = any,
	ParentType extends ResolversParentTypes['MediaSubmissionEdge'] = ResolversParentTypes['MediaSubmissionEdge']
> {
	id?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
	characterRole?: Resolver<Maybe<ResolversTypes['CharacterRole']>, ParentType, ContextType>;
	staffRole?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
	roleNotes?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
	dubGroup?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
	characterName?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
	isMain?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
	character?: Resolver<Maybe<ResolversTypes['Character']>, ParentType, ContextType>;
	characterSubmission?: Resolver<Maybe<ResolversTypes['Character']>, ParentType, ContextType>;
	voiceActor?: Resolver<Maybe<ResolversTypes['Staff']>, ParentType, ContextType>;
	voiceActorSubmission?: Resolver<Maybe<ResolversTypes['Staff']>, ParentType, ContextType>;
	staff?: Resolver<Maybe<ResolversTypes['Staff']>, ParentType, ContextType>;
	staffSubmission?: Resolver<Maybe<ResolversTypes['Staff']>, ParentType, ContextType>;
	studio?: Resolver<Maybe<ResolversTypes['Studio']>, ParentType, ContextType>;
	media?: Resolver<Maybe<ResolversTypes['Media']>, ParentType, ContextType>;
	__isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}

export interface MediaTagResolvers<ContextType = any, ParentType extends ResolversParentTypes['MediaTag'] = ResolversParentTypes['MediaTag']> {
	id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
	name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
	description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
	category?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
	rank?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
	isGeneralSpoiler?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
	isMediaSpoiler?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
	isAdult?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
	__isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}

export interface MediaTitleResolvers<ContextType = any, ParentType extends ResolversParentTypes['MediaTitle'] = ResolversParentTypes['MediaTitle']> {
	romaji?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType, RequireFields<MediaTitleRomajiArgs, never>>;
	english?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType, RequireFields<MediaTitleEnglishArgs, never>>;
	native?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType, RequireFields<MediaTitleNativeArgs, never>>;
	userPreferred?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
	__isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}

export interface MediaTrailerResolvers<
	ContextType = any,
	ParentType extends ResolversParentTypes['MediaTrailer'] = ResolversParentTypes['MediaTrailer']
> {
	id?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
	site?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
	thumbnail?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
	__isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}

export interface MediaTrendResolvers<ContextType = any, ParentType extends ResolversParentTypes['MediaTrend'] = ResolversParentTypes['MediaTrend']> {
	mediaId?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
	date?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
	trending?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
	averageScore?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
	popularity?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
	inProgress?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
	releasing?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
	episode?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
	media?: Resolver<Maybe<ResolversTypes['Media']>, ParentType, ContextType>;
	__isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}

export interface MediaTrendConnectionResolvers<
	ContextType = any,
	ParentType extends ResolversParentTypes['MediaTrendConnection'] = ResolversParentTypes['MediaTrendConnection']
> {
	edges?: Resolver<Maybe<ReadonlyArray<Maybe<ResolversTypes['MediaTrendEdge']>>>, ParentType, ContextType>;
	nodes?: Resolver<Maybe<ReadonlyArray<Maybe<ResolversTypes['MediaTrend']>>>, ParentType, ContextType>;
	pageInfo?: Resolver<Maybe<ResolversTypes['PageInfo']>, ParentType, ContextType>;
	__isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}

export interface MediaTrendEdgeResolvers<
	ContextType = any,
	ParentType extends ResolversParentTypes['MediaTrendEdge'] = ResolversParentTypes['MediaTrendEdge']
> {
	node?: Resolver<Maybe<ResolversTypes['MediaTrend']>, ParentType, ContextType>;
	__isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}

export interface MessageActivityResolvers<
	ContextType = any,
	ParentType extends ResolversParentTypes['MessageActivity'] = ResolversParentTypes['MessageActivity']
> {
	id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
	recipientId?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
	messengerId?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
	type?: Resolver<Maybe<ResolversTypes['ActivityType']>, ParentType, ContextType>;
	replyCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
	message?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType, RequireFields<MessageActivityMessageArgs, never>>;
	isLocked?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
	isSubscribed?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
	likeCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
	isLiked?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
	isPrivate?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
	siteUrl?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
	createdAt?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
	recipient?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
	messenger?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
	replies?: Resolver<Maybe<ReadonlyArray<Maybe<ResolversTypes['ActivityReply']>>>, ParentType, ContextType>;
	likes?: Resolver<Maybe<ReadonlyArray<Maybe<ResolversTypes['User']>>>, ParentType, ContextType>;
	__isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}

export interface ModActionResolvers<ContextType = any, ParentType extends ResolversParentTypes['ModAction'] = ResolversParentTypes['ModAction']> {
	id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
	user?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
	mod?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
	type?: Resolver<Maybe<ResolversTypes['ModActionType']>, ParentType, ContextType>;
	objectId?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
	objectType?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
	data?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
	createdAt?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
	__isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}

export interface MutationResolvers<ContextType = any, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> {
	UpdateUser?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType, RequireFields<MutationUpdateUserArgs, never>>;
	SaveMediaListEntry?: Resolver<Maybe<ResolversTypes['MediaList']>, ParentType, ContextType, RequireFields<MutationSaveMediaListEntryArgs, never>>;
	UpdateMediaListEntries?: Resolver<
		Maybe<ReadonlyArray<Maybe<ResolversTypes['MediaList']>>>,
		ParentType,
		ContextType,
		RequireFields<MutationUpdateMediaListEntriesArgs, never>
	>;
	DeleteMediaListEntry?: Resolver<
		Maybe<ResolversTypes['Deleted']>,
		ParentType,
		ContextType,
		RequireFields<MutationDeleteMediaListEntryArgs, never>
	>;
	DeleteCustomList?: Resolver<Maybe<ResolversTypes['Deleted']>, ParentType, ContextType, RequireFields<MutationDeleteCustomListArgs, never>>;
	SaveTextActivity?: Resolver<Maybe<ResolversTypes['TextActivity']>, ParentType, ContextType, RequireFields<MutationSaveTextActivityArgs, never>>;
	SaveMessageActivity?: Resolver<
		Maybe<ResolversTypes['MessageActivity']>,
		ParentType,
		ContextType,
		RequireFields<MutationSaveMessageActivityArgs, never>
	>;
	SaveListActivity?: Resolver<Maybe<ResolversTypes['ListActivity']>, ParentType, ContextType, RequireFields<MutationSaveListActivityArgs, never>>;
	DeleteActivity?: Resolver<Maybe<ResolversTypes['Deleted']>, ParentType, ContextType, RequireFields<MutationDeleteActivityArgs, never>>;
	ToggleActivitySubscription?: Resolver<
		Maybe<ResolversTypes['ActivityUnion']>,
		ParentType,
		ContextType,
		RequireFields<MutationToggleActivitySubscriptionArgs, never>
	>;
	SaveActivityReply?: Resolver<
		Maybe<ResolversTypes['ActivityReply']>,
		ParentType,
		ContextType,
		RequireFields<MutationSaveActivityReplyArgs, never>
	>;
	DeleteActivityReply?: Resolver<Maybe<ResolversTypes['Deleted']>, ParentType, ContextType, RequireFields<MutationDeleteActivityReplyArgs, never>>;
	ToggleLike?: Resolver<Maybe<ReadonlyArray<Maybe<ResolversTypes['User']>>>, ParentType, ContextType, RequireFields<MutationToggleLikeArgs, never>>;
	ToggleLikeV2?: Resolver<Maybe<ResolversTypes['LikeableUnion']>, ParentType, ContextType, RequireFields<MutationToggleLikeV2Args, never>>;
	ToggleFollow?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType, RequireFields<MutationToggleFollowArgs, never>>;
	ToggleFavourite?: Resolver<Maybe<ResolversTypes['Favourites']>, ParentType, ContextType, RequireFields<MutationToggleFavouriteArgs, never>>;
	UpdateFavouriteOrder?: Resolver<
		Maybe<ResolversTypes['Favourites']>,
		ParentType,
		ContextType,
		RequireFields<MutationUpdateFavouriteOrderArgs, never>
	>;
	SaveReview?: Resolver<Maybe<ResolversTypes['Review']>, ParentType, ContextType, RequireFields<MutationSaveReviewArgs, never>>;
	DeleteReview?: Resolver<Maybe<ResolversTypes['Deleted']>, ParentType, ContextType, RequireFields<MutationDeleteReviewArgs, never>>;
	RateReview?: Resolver<Maybe<ResolversTypes['Review']>, ParentType, ContextType, RequireFields<MutationRateReviewArgs, never>>;
	SaveRecommendation?: Resolver<
		Maybe<ResolversTypes['Recommendation']>,
		ParentType,
		ContextType,
		RequireFields<MutationSaveRecommendationArgs, never>
	>;
	SaveThread?: Resolver<Maybe<ResolversTypes['Thread']>, ParentType, ContextType, RequireFields<MutationSaveThreadArgs, never>>;
	DeleteThread?: Resolver<Maybe<ResolversTypes['Deleted']>, ParentType, ContextType, RequireFields<MutationDeleteThreadArgs, never>>;
	ToggleThreadSubscription?: Resolver<
		Maybe<ResolversTypes['Thread']>,
		ParentType,
		ContextType,
		RequireFields<MutationToggleThreadSubscriptionArgs, never>
	>;
	SaveThreadComment?: Resolver<
		Maybe<ResolversTypes['ThreadComment']>,
		ParentType,
		ContextType,
		RequireFields<MutationSaveThreadCommentArgs, never>
	>;
	DeleteThreadComment?: Resolver<Maybe<ResolversTypes['Deleted']>, ParentType, ContextType, RequireFields<MutationDeleteThreadCommentArgs, never>>;
	UpdateAniChartSettings?: Resolver<
		Maybe<ResolversTypes['Json']>,
		ParentType,
		ContextType,
		RequireFields<MutationUpdateAniChartSettingsArgs, never>
	>;
	UpdateAniChartHighlights?: Resolver<
		Maybe<ResolversTypes['Json']>,
		ParentType,
		ContextType,
		RequireFields<MutationUpdateAniChartHighlightsArgs, never>
	>;
}

export interface NotificationOptionResolvers<
	ContextType = any,
	ParentType extends ResolversParentTypes['NotificationOption'] = ResolversParentTypes['NotificationOption']
> {
	type?: Resolver<Maybe<ResolversTypes['NotificationType']>, ParentType, ContextType>;
	enabled?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
	__isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}

export interface NotificationUnionResolvers<
	ContextType = any,
	ParentType extends ResolversParentTypes['NotificationUnion'] = ResolversParentTypes['NotificationUnion']
> {
	__resolveType: TypeResolveFn<
		| 'AiringNotification'
		| 'FollowingNotification'
		| 'ActivityMessageNotification'
		| 'ActivityMentionNotification'
		| 'ActivityReplyNotification'
		| 'ActivityReplySubscribedNotification'
		| 'ActivityLikeNotification'
		| 'ActivityReplyLikeNotification'
		| 'ThreadCommentMentionNotification'
		| 'ThreadCommentReplyNotification'
		| 'ThreadCommentSubscribedNotification'
		| 'ThreadCommentLikeNotification'
		| 'ThreadLikeNotification'
		| 'RelatedMediaAdditionNotification',
		ParentType,
		ContextType
	>;
}

export interface PageResolvers<ContextType = any, ParentType extends ResolversParentTypes['Page'] = ResolversParentTypes['Page']> {
	pageInfo?: Resolver<Maybe<ResolversTypes['PageInfo']>, ParentType, ContextType>;
	users?: Resolver<Maybe<ReadonlyArray<Maybe<ResolversTypes['User']>>>, ParentType, ContextType, RequireFields<PageUsersArgs, never>>;
	media?: Resolver<Maybe<ReadonlyArray<Maybe<ResolversTypes['Media']>>>, ParentType, ContextType, RequireFields<PageMediaArgs, never>>;
	characters?: Resolver<
		Maybe<ReadonlyArray<Maybe<ResolversTypes['Character']>>>,
		ParentType,
		ContextType,
		RequireFields<PageCharactersArgs, never>
	>;
	staff?: Resolver<Maybe<ReadonlyArray<Maybe<ResolversTypes['Staff']>>>, ParentType, ContextType, RequireFields<PageStaffArgs, never>>;
	studios?: Resolver<Maybe<ReadonlyArray<Maybe<ResolversTypes['Studio']>>>, ParentType, ContextType, RequireFields<PageStudiosArgs, never>>;
	mediaList?: Resolver<Maybe<ReadonlyArray<Maybe<ResolversTypes['MediaList']>>>, ParentType, ContextType, RequireFields<PageMediaListArgs, never>>;
	airingSchedules?: Resolver<
		Maybe<ReadonlyArray<Maybe<ResolversTypes['AiringSchedule']>>>,
		ParentType,
		ContextType,
		RequireFields<PageAiringSchedulesArgs, never>
	>;
	mediaTrends?: Resolver<
		Maybe<ReadonlyArray<Maybe<ResolversTypes['MediaTrend']>>>,
		ParentType,
		ContextType,
		RequireFields<PageMediaTrendsArgs, never>
	>;
	notifications?: Resolver<
		Maybe<ReadonlyArray<Maybe<ResolversTypes['NotificationUnion']>>>,
		ParentType,
		ContextType,
		RequireFields<PageNotificationsArgs, never>
	>;
	followers?: Resolver<Maybe<ReadonlyArray<Maybe<ResolversTypes['User']>>>, ParentType, ContextType, RequireFields<PageFollowersArgs, 'userId'>>;
	following?: Resolver<Maybe<ReadonlyArray<Maybe<ResolversTypes['User']>>>, ParentType, ContextType, RequireFields<PageFollowingArgs, 'userId'>>;
	activities?: Resolver<
		Maybe<ReadonlyArray<Maybe<ResolversTypes['ActivityUnion']>>>,
		ParentType,
		ContextType,
		RequireFields<PageActivitiesArgs, never>
	>;
	activityReplies?: Resolver<
		Maybe<ReadonlyArray<Maybe<ResolversTypes['ActivityReply']>>>,
		ParentType,
		ContextType,
		RequireFields<PageActivityRepliesArgs, never>
	>;
	threads?: Resolver<Maybe<ReadonlyArray<Maybe<ResolversTypes['Thread']>>>, ParentType, ContextType, RequireFields<PageThreadsArgs, never>>;
	threadComments?: Resolver<
		Maybe<ReadonlyArray<Maybe<ResolversTypes['ThreadComment']>>>,
		ParentType,
		ContextType,
		RequireFields<PageThreadCommentsArgs, never>
	>;
	reviews?: Resolver<Maybe<ReadonlyArray<Maybe<ResolversTypes['Review']>>>, ParentType, ContextType, RequireFields<PageReviewsArgs, never>>;
	recommendations?: Resolver<
		Maybe<ReadonlyArray<Maybe<ResolversTypes['Recommendation']>>>,
		ParentType,
		ContextType,
		RequireFields<PageRecommendationsArgs, never>
	>;
	likes?: Resolver<Maybe<ReadonlyArray<Maybe<ResolversTypes['User']>>>, ParentType, ContextType, RequireFields<PageLikesArgs, never>>;
	__isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}

export interface PageInfoResolvers<ContextType = any, ParentType extends ResolversParentTypes['PageInfo'] = ResolversParentTypes['PageInfo']> {
	total?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
	perPage?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
	currentPage?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
	lastPage?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
	hasNextPage?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
	__isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}

export interface ParsedMarkdownResolvers<
	ContextType = any,
	ParentType extends ResolversParentTypes['ParsedMarkdown'] = ResolversParentTypes['ParsedMarkdown']
> {
	html?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
	__isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}

export interface QueryResolvers<ContextType = any, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> {
	Page?: Resolver<Maybe<ResolversTypes['Page']>, ParentType, ContextType, RequireFields<QueryPageArgs, never>>;
	Media?: Resolver<Maybe<ResolversTypes['Media']>, ParentType, ContextType, RequireFields<QueryMediaArgs, never>>;
	MediaTrend?: Resolver<Maybe<ResolversTypes['MediaTrend']>, ParentType, ContextType, RequireFields<QueryMediaTrendArgs, never>>;
	AiringSchedule?: Resolver<Maybe<ResolversTypes['AiringSchedule']>, ParentType, ContextType, RequireFields<QueryAiringScheduleArgs, never>>;
	Character?: Resolver<Maybe<ResolversTypes['Character']>, ParentType, ContextType, RequireFields<QueryCharacterArgs, never>>;
	Staff?: Resolver<Maybe<ResolversTypes['Staff']>, ParentType, ContextType, RequireFields<QueryStaffArgs, never>>;
	MediaList?: Resolver<Maybe<ResolversTypes['MediaList']>, ParentType, ContextType, RequireFields<QueryMediaListArgs, never>>;
	MediaListCollection?: Resolver<
		Maybe<ResolversTypes['MediaListCollection']>,
		ParentType,
		ContextType,
		RequireFields<QueryMediaListCollectionArgs, never>
	>;
	GenreCollection?: Resolver<Maybe<ReadonlyArray<Maybe<ResolversTypes['String']>>>, ParentType, ContextType>;
	MediaTagCollection?: Resolver<
		Maybe<ReadonlyArray<Maybe<ResolversTypes['MediaTag']>>>,
		ParentType,
		ContextType,
		RequireFields<QueryMediaTagCollectionArgs, never>
	>;
	User?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType, RequireFields<QueryUserArgs, never>>;
	Viewer?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
	Notification?: Resolver<Maybe<ResolversTypes['NotificationUnion']>, ParentType, ContextType, RequireFields<QueryNotificationArgs, never>>;
	Studio?: Resolver<Maybe<ResolversTypes['Studio']>, ParentType, ContextType, RequireFields<QueryStudioArgs, never>>;
	Review?: Resolver<Maybe<ResolversTypes['Review']>, ParentType, ContextType, RequireFields<QueryReviewArgs, never>>;
	Activity?: Resolver<Maybe<ResolversTypes['ActivityUnion']>, ParentType, ContextType, RequireFields<QueryActivityArgs, never>>;
	ActivityReply?: Resolver<Maybe<ResolversTypes['ActivityReply']>, ParentType, ContextType, RequireFields<QueryActivityReplyArgs, never>>;
	Following?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType, RequireFields<QueryFollowingArgs, 'userId'>>;
	Follower?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType, RequireFields<QueryFollowerArgs, 'userId'>>;
	Thread?: Resolver<Maybe<ResolversTypes['Thread']>, ParentType, ContextType, RequireFields<QueryThreadArgs, never>>;
	ThreadComment?: Resolver<
		Maybe<ReadonlyArray<Maybe<ResolversTypes['ThreadComment']>>>,
		ParentType,
		ContextType,
		RequireFields<QueryThreadCommentArgs, never>
	>;
	Recommendation?: Resolver<Maybe<ResolversTypes['Recommendation']>, ParentType, ContextType, RequireFields<QueryRecommendationArgs, never>>;
	Like?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType, RequireFields<QueryLikeArgs, never>>;
	Markdown?: Resolver<Maybe<ResolversTypes['ParsedMarkdown']>, ParentType, ContextType, RequireFields<QueryMarkdownArgs, 'markdown'>>;
	AniChartUser?: Resolver<Maybe<ResolversTypes['AniChartUser']>, ParentType, ContextType>;
	SiteStatistics?: Resolver<Maybe<ResolversTypes['SiteStatistics']>, ParentType, ContextType>;
	MediaTagUser?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType, RequireFields<QueryMediaTagUserArgs, never>>;
}

export interface RecommendationResolvers<
	ContextType = any,
	ParentType extends ResolversParentTypes['Recommendation'] = ResolversParentTypes['Recommendation']
> {
	id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
	rating?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
	userRating?: Resolver<Maybe<ResolversTypes['RecommendationRating']>, ParentType, ContextType>;
	media?: Resolver<Maybe<ResolversTypes['Media']>, ParentType, ContextType>;
	mediaRecommendation?: Resolver<Maybe<ResolversTypes['Media']>, ParentType, ContextType>;
	user?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
	__isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}

export interface RecommendationConnectionResolvers<
	ContextType = any,
	ParentType extends ResolversParentTypes['RecommendationConnection'] = ResolversParentTypes['RecommendationConnection']
> {
	edges?: Resolver<Maybe<ReadonlyArray<Maybe<ResolversTypes['RecommendationEdge']>>>, ParentType, ContextType>;
	nodes?: Resolver<Maybe<ReadonlyArray<Maybe<ResolversTypes['Recommendation']>>>, ParentType, ContextType>;
	pageInfo?: Resolver<Maybe<ResolversTypes['PageInfo']>, ParentType, ContextType>;
	__isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}

export interface RecommendationEdgeResolvers<
	ContextType = any,
	ParentType extends ResolversParentTypes['RecommendationEdge'] = ResolversParentTypes['RecommendationEdge']
> {
	node?: Resolver<Maybe<ResolversTypes['Recommendation']>, ParentType, ContextType>;
	__isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}

export interface RelatedMediaAdditionNotificationResolvers<
	ContextType = any,
	ParentType extends ResolversParentTypes['RelatedMediaAdditionNotification'] = ResolversParentTypes['RelatedMediaAdditionNotification']
> {
	id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
	type?: Resolver<Maybe<ResolversTypes['NotificationType']>, ParentType, ContextType>;
	mediaId?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
	context?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
	createdAt?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
	media?: Resolver<Maybe<ResolversTypes['Media']>, ParentType, ContextType>;
	__isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}

export interface ReportResolvers<ContextType = any, ParentType extends ResolversParentTypes['Report'] = ResolversParentTypes['Report']> {
	id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
	reporter?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
	reported?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
	reason?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
	createdAt?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
	cleared?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
	__isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}

export interface ReviewResolvers<ContextType = any, ParentType extends ResolversParentTypes['Review'] = ResolversParentTypes['Review']> {
	id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
	userId?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
	mediaId?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
	mediaType?: Resolver<Maybe<ResolversTypes['MediaType']>, ParentType, ContextType>;
	summary?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
	body?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType, RequireFields<ReviewBodyArgs, never>>;
	rating?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
	ratingAmount?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
	userRating?: Resolver<Maybe<ResolversTypes['ReviewRating']>, ParentType, ContextType>;
	score?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
	private?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
	siteUrl?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
	createdAt?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
	updatedAt?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
	user?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
	media?: Resolver<Maybe<ResolversTypes['Media']>, ParentType, ContextType>;
	__isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}

export interface ReviewConnectionResolvers<
	ContextType = any,
	ParentType extends ResolversParentTypes['ReviewConnection'] = ResolversParentTypes['ReviewConnection']
> {
	edges?: Resolver<Maybe<ReadonlyArray<Maybe<ResolversTypes['ReviewEdge']>>>, ParentType, ContextType>;
	nodes?: Resolver<Maybe<ReadonlyArray<Maybe<ResolversTypes['Review']>>>, ParentType, ContextType>;
	pageInfo?: Resolver<Maybe<ResolversTypes['PageInfo']>, ParentType, ContextType>;
	__isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}

export interface ReviewEdgeResolvers<ContextType = any, ParentType extends ResolversParentTypes['ReviewEdge'] = ResolversParentTypes['ReviewEdge']> {
	node?: Resolver<Maybe<ResolversTypes['Review']>, ParentType, ContextType>;
	__isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}

export interface RevisionHistoryResolvers<
	ContextType = any,
	ParentType extends ResolversParentTypes['RevisionHistory'] = ResolversParentTypes['RevisionHistory']
> {
	id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
	action?: Resolver<Maybe<ResolversTypes['RevisionHistoryAction']>, ParentType, ContextType>;
	changes?: Resolver<Maybe<ResolversTypes['Json']>, ParentType, ContextType>;
	user?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
	media?: Resolver<Maybe<ResolversTypes['Media']>, ParentType, ContextType>;
	character?: Resolver<Maybe<ResolversTypes['Character']>, ParentType, ContextType>;
	staff?: Resolver<Maybe<ResolversTypes['Staff']>, ParentType, ContextType>;
	studio?: Resolver<Maybe<ResolversTypes['Studio']>, ParentType, ContextType>;
	createdAt?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
	__isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}

export interface ScoreDistributionResolvers<
	ContextType = any,
	ParentType extends ResolversParentTypes['ScoreDistribution'] = ResolversParentTypes['ScoreDistribution']
> {
	score?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
	amount?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
	__isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}

export interface SiteStatisticsResolvers<
	ContextType = any,
	ParentType extends ResolversParentTypes['SiteStatistics'] = ResolversParentTypes['SiteStatistics']
> {
	users?: Resolver<Maybe<ResolversTypes['SiteTrendConnection']>, ParentType, ContextType, RequireFields<SiteStatisticsUsersArgs, never>>;
	anime?: Resolver<Maybe<ResolversTypes['SiteTrendConnection']>, ParentType, ContextType, RequireFields<SiteStatisticsAnimeArgs, never>>;
	manga?: Resolver<Maybe<ResolversTypes['SiteTrendConnection']>, ParentType, ContextType, RequireFields<SiteStatisticsMangaArgs, never>>;
	characters?: Resolver<Maybe<ResolversTypes['SiteTrendConnection']>, ParentType, ContextType, RequireFields<SiteStatisticsCharactersArgs, never>>;
	staff?: Resolver<Maybe<ResolversTypes['SiteTrendConnection']>, ParentType, ContextType, RequireFields<SiteStatisticsStaffArgs, never>>;
	studios?: Resolver<Maybe<ResolversTypes['SiteTrendConnection']>, ParentType, ContextType, RequireFields<SiteStatisticsStudiosArgs, never>>;
	reviews?: Resolver<Maybe<ResolversTypes['SiteTrendConnection']>, ParentType, ContextType, RequireFields<SiteStatisticsReviewsArgs, never>>;
	__isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}

export interface SiteTrendResolvers<ContextType = any, ParentType extends ResolversParentTypes['SiteTrend'] = ResolversParentTypes['SiteTrend']> {
	date?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
	count?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
	change?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
	__isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}

export interface SiteTrendConnectionResolvers<
	ContextType = any,
	ParentType extends ResolversParentTypes['SiteTrendConnection'] = ResolversParentTypes['SiteTrendConnection']
> {
	edges?: Resolver<Maybe<ReadonlyArray<Maybe<ResolversTypes['SiteTrendEdge']>>>, ParentType, ContextType>;
	nodes?: Resolver<Maybe<ReadonlyArray<Maybe<ResolversTypes['SiteTrend']>>>, ParentType, ContextType>;
	pageInfo?: Resolver<Maybe<ResolversTypes['PageInfo']>, ParentType, ContextType>;
	__isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}

export interface SiteTrendEdgeResolvers<
	ContextType = any,
	ParentType extends ResolversParentTypes['SiteTrendEdge'] = ResolversParentTypes['SiteTrendEdge']
> {
	node?: Resolver<Maybe<ResolversTypes['SiteTrend']>, ParentType, ContextType>;
	__isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}

export interface StaffResolvers<ContextType = any, ParentType extends ResolversParentTypes['Staff'] = ResolversParentTypes['Staff']> {
	id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
	name?: Resolver<Maybe<ResolversTypes['StaffName']>, ParentType, ContextType>;
	language?: Resolver<Maybe<ResolversTypes['StaffLanguage']>, ParentType, ContextType>;
	languageV2?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
	image?: Resolver<Maybe<ResolversTypes['StaffImage']>, ParentType, ContextType>;
	description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType, RequireFields<StaffDescriptionArgs, never>>;
	primaryOccupations?: Resolver<Maybe<ReadonlyArray<Maybe<ResolversTypes['String']>>>, ParentType, ContextType>;
	gender?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
	dateOfBirth?: Resolver<Maybe<ResolversTypes['FuzzyDate']>, ParentType, ContextType>;
	dateOfDeath?: Resolver<Maybe<ResolversTypes['FuzzyDate']>, ParentType, ContextType>;
	age?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
	yearsActive?: Resolver<Maybe<ReadonlyArray<Maybe<ResolversTypes['Int']>>>, ParentType, ContextType>;
	homeTown?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
	bloodType?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
	isFavourite?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
	isFavouriteBlocked?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
	siteUrl?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
	staffMedia?: Resolver<Maybe<ResolversTypes['MediaConnection']>, ParentType, ContextType, RequireFields<StaffStaffMediaArgs, never>>;
	characters?: Resolver<Maybe<ResolversTypes['CharacterConnection']>, ParentType, ContextType, RequireFields<StaffCharactersArgs, never>>;
	characterMedia?: Resolver<Maybe<ResolversTypes['MediaConnection']>, ParentType, ContextType, RequireFields<StaffCharacterMediaArgs, never>>;
	updatedAt?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
	staff?: Resolver<Maybe<ResolversTypes['Staff']>, ParentType, ContextType>;
	submitter?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
	submissionStatus?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
	submissionNotes?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
	favourites?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
	modNotes?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
	__isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}

export interface StaffConnectionResolvers<
	ContextType = any,
	ParentType extends ResolversParentTypes['StaffConnection'] = ResolversParentTypes['StaffConnection']
> {
	edges?: Resolver<Maybe<ReadonlyArray<Maybe<ResolversTypes['StaffEdge']>>>, ParentType, ContextType>;
	nodes?: Resolver<Maybe<ReadonlyArray<Maybe<ResolversTypes['Staff']>>>, ParentType, ContextType>;
	pageInfo?: Resolver<Maybe<ResolversTypes['PageInfo']>, ParentType, ContextType>;
	__isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}

export interface StaffEdgeResolvers<ContextType = any, ParentType extends ResolversParentTypes['StaffEdge'] = ResolversParentTypes['StaffEdge']> {
	node?: Resolver<Maybe<ResolversTypes['Staff']>, ParentType, ContextType>;
	id?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
	role?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
	favouriteOrder?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
	__isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}

export interface StaffImageResolvers<ContextType = any, ParentType extends ResolversParentTypes['StaffImage'] = ResolversParentTypes['StaffImage']> {
	large?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
	medium?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
	__isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}

export interface StaffNameResolvers<ContextType = any, ParentType extends ResolversParentTypes['StaffName'] = ResolversParentTypes['StaffName']> {
	first?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
	middle?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
	last?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
	full?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
	native?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
	alternative?: Resolver<Maybe<ReadonlyArray<Maybe<ResolversTypes['String']>>>, ParentType, ContextType>;
	userPreferred?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
	__isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}

export interface StaffRoleTypeResolvers<
	ContextType = any,
	ParentType extends ResolversParentTypes['StaffRoleType'] = ResolversParentTypes['StaffRoleType']
> {
	voiceActor?: Resolver<Maybe<ResolversTypes['Staff']>, ParentType, ContextType>;
	roleNotes?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
	dubGroup?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
	__isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}

export interface StaffStatsResolvers<ContextType = any, ParentType extends ResolversParentTypes['StaffStats'] = ResolversParentTypes['StaffStats']> {
	staff?: Resolver<Maybe<ResolversTypes['Staff']>, ParentType, ContextType>;
	amount?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
	meanScore?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
	timeWatched?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
	__isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}

export interface StaffSubmissionResolvers<
	ContextType = any,
	ParentType extends ResolversParentTypes['StaffSubmission'] = ResolversParentTypes['StaffSubmission']
> {
	id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
	staff?: Resolver<Maybe<ResolversTypes['Staff']>, ParentType, ContextType>;
	submission?: Resolver<Maybe<ResolversTypes['Staff']>, ParentType, ContextType>;
	submitter?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
	status?: Resolver<Maybe<ResolversTypes['SubmissionStatus']>, ParentType, ContextType>;
	notes?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
	source?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
	createdAt?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
	__isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}

export interface StatusDistributionResolvers<
	ContextType = any,
	ParentType extends ResolversParentTypes['StatusDistribution'] = ResolversParentTypes['StatusDistribution']
> {
	status?: Resolver<Maybe<ResolversTypes['MediaListStatus']>, ParentType, ContextType>;
	amount?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
	__isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}

export interface StudioResolvers<ContextType = any, ParentType extends ResolversParentTypes['Studio'] = ResolversParentTypes['Studio']> {
	id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
	name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
	isAnimationStudio?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
	media?: Resolver<Maybe<ResolversTypes['MediaConnection']>, ParentType, ContextType, RequireFields<StudioMediaArgs, never>>;
	siteUrl?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
	isFavourite?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
	favourites?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
	__isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}

export interface StudioConnectionResolvers<
	ContextType = any,
	ParentType extends ResolversParentTypes['StudioConnection'] = ResolversParentTypes['StudioConnection']
> {
	edges?: Resolver<Maybe<ReadonlyArray<Maybe<ResolversTypes['StudioEdge']>>>, ParentType, ContextType>;
	nodes?: Resolver<Maybe<ReadonlyArray<Maybe<ResolversTypes['Studio']>>>, ParentType, ContextType>;
	pageInfo?: Resolver<Maybe<ResolversTypes['PageInfo']>, ParentType, ContextType>;
	__isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}

export interface StudioEdgeResolvers<ContextType = any, ParentType extends ResolversParentTypes['StudioEdge'] = ResolversParentTypes['StudioEdge']> {
	node?: Resolver<Maybe<ResolversTypes['Studio']>, ParentType, ContextType>;
	id?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
	isMain?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
	favouriteOrder?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
	__isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}

export interface StudioStatsResolvers<
	ContextType = any,
	ParentType extends ResolversParentTypes['StudioStats'] = ResolversParentTypes['StudioStats']
> {
	studio?: Resolver<Maybe<ResolversTypes['Studio']>, ParentType, ContextType>;
	amount?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
	meanScore?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
	timeWatched?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
	__isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}

export interface TagStatsResolvers<ContextType = any, ParentType extends ResolversParentTypes['TagStats'] = ResolversParentTypes['TagStats']> {
	tag?: Resolver<Maybe<ResolversTypes['MediaTag']>, ParentType, ContextType>;
	amount?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
	meanScore?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
	timeWatched?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
	__isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}

export interface TextActivityResolvers<
	ContextType = any,
	ParentType extends ResolversParentTypes['TextActivity'] = ResolversParentTypes['TextActivity']
> {
	id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
	userId?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
	type?: Resolver<Maybe<ResolversTypes['ActivityType']>, ParentType, ContextType>;
	replyCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
	text?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType, RequireFields<TextActivityTextArgs, never>>;
	siteUrl?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
	isLocked?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
	isSubscribed?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
	likeCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
	isLiked?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
	createdAt?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
	user?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
	replies?: Resolver<Maybe<ReadonlyArray<Maybe<ResolversTypes['ActivityReply']>>>, ParentType, ContextType>;
	likes?: Resolver<Maybe<ReadonlyArray<Maybe<ResolversTypes['User']>>>, ParentType, ContextType>;
	__isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}

export interface ThreadResolvers<ContextType = any, ParentType extends ResolversParentTypes['Thread'] = ResolversParentTypes['Thread']> {
	id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
	title?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
	body?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType, RequireFields<ThreadBodyArgs, never>>;
	userId?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
	replyUserId?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
	replyCommentId?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
	replyCount?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
	viewCount?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
	isLocked?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
	isSticky?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
	isSubscribed?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
	likeCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
	isLiked?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
	repliedAt?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
	createdAt?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
	updatedAt?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
	user?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
	replyUser?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
	likes?: Resolver<Maybe<ReadonlyArray<Maybe<ResolversTypes['User']>>>, ParentType, ContextType>;
	siteUrl?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
	categories?: Resolver<Maybe<ReadonlyArray<Maybe<ResolversTypes['ThreadCategory']>>>, ParentType, ContextType>;
	mediaCategories?: Resolver<Maybe<ReadonlyArray<Maybe<ResolversTypes['Media']>>>, ParentType, ContextType>;
	__isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}

export interface ThreadCategoryResolvers<
	ContextType = any,
	ParentType extends ResolversParentTypes['ThreadCategory'] = ResolversParentTypes['ThreadCategory']
> {
	id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
	name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
	__isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}

export interface ThreadCommentResolvers<
	ContextType = any,
	ParentType extends ResolversParentTypes['ThreadComment'] = ResolversParentTypes['ThreadComment']
> {
	id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
	userId?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
	threadId?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
	comment?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType, RequireFields<ThreadCommentCommentArgs, never>>;
	likeCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
	isLiked?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
	siteUrl?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
	createdAt?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
	updatedAt?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
	thread?: Resolver<Maybe<ResolversTypes['Thread']>, ParentType, ContextType>;
	user?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
	likes?: Resolver<Maybe<ReadonlyArray<Maybe<ResolversTypes['User']>>>, ParentType, ContextType>;
	childComments?: Resolver<Maybe<ResolversTypes['Json']>, ParentType, ContextType>;
	__isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}

export interface ThreadCommentLikeNotificationResolvers<
	ContextType = any,
	ParentType extends ResolversParentTypes['ThreadCommentLikeNotification'] = ResolversParentTypes['ThreadCommentLikeNotification']
> {
	id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
	userId?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
	type?: Resolver<Maybe<ResolversTypes['NotificationType']>, ParentType, ContextType>;
	commentId?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
	context?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
	createdAt?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
	thread?: Resolver<Maybe<ResolversTypes['Thread']>, ParentType, ContextType>;
	comment?: Resolver<Maybe<ResolversTypes['ThreadComment']>, ParentType, ContextType>;
	user?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
	__isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}

export interface ThreadCommentMentionNotificationResolvers<
	ContextType = any,
	ParentType extends ResolversParentTypes['ThreadCommentMentionNotification'] = ResolversParentTypes['ThreadCommentMentionNotification']
> {
	id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
	userId?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
	type?: Resolver<Maybe<ResolversTypes['NotificationType']>, ParentType, ContextType>;
	commentId?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
	context?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
	createdAt?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
	thread?: Resolver<Maybe<ResolversTypes['Thread']>, ParentType, ContextType>;
	comment?: Resolver<Maybe<ResolversTypes['ThreadComment']>, ParentType, ContextType>;
	user?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
	__isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}

export interface ThreadCommentReplyNotificationResolvers<
	ContextType = any,
	ParentType extends ResolversParentTypes['ThreadCommentReplyNotification'] = ResolversParentTypes['ThreadCommentReplyNotification']
> {
	id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
	userId?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
	type?: Resolver<Maybe<ResolversTypes['NotificationType']>, ParentType, ContextType>;
	commentId?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
	context?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
	createdAt?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
	thread?: Resolver<Maybe<ResolversTypes['Thread']>, ParentType, ContextType>;
	comment?: Resolver<Maybe<ResolversTypes['ThreadComment']>, ParentType, ContextType>;
	user?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
	__isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}

export interface ThreadCommentSubscribedNotificationResolvers<
	ContextType = any,
	ParentType extends ResolversParentTypes['ThreadCommentSubscribedNotification'] = ResolversParentTypes['ThreadCommentSubscribedNotification']
> {
	id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
	userId?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
	type?: Resolver<Maybe<ResolversTypes['NotificationType']>, ParentType, ContextType>;
	commentId?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
	context?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
	createdAt?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
	thread?: Resolver<Maybe<ResolversTypes['Thread']>, ParentType, ContextType>;
	comment?: Resolver<Maybe<ResolversTypes['ThreadComment']>, ParentType, ContextType>;
	user?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
	__isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}

export interface ThreadLikeNotificationResolvers<
	ContextType = any,
	ParentType extends ResolversParentTypes['ThreadLikeNotification'] = ResolversParentTypes['ThreadLikeNotification']
> {
	id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
	userId?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
	type?: Resolver<Maybe<ResolversTypes['NotificationType']>, ParentType, ContextType>;
	threadId?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
	context?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
	createdAt?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
	thread?: Resolver<Maybe<ResolversTypes['Thread']>, ParentType, ContextType>;
	comment?: Resolver<Maybe<ResolversTypes['ThreadComment']>, ParentType, ContextType>;
	user?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
	__isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}

export interface UserResolvers<ContextType = any, ParentType extends ResolversParentTypes['User'] = ResolversParentTypes['User']> {
	id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
	name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
	about?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType, RequireFields<UserAboutArgs, never>>;
	avatar?: Resolver<Maybe<ResolversTypes['UserAvatar']>, ParentType, ContextType>;
	bannerImage?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
	isFollowing?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
	isFollower?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
	isBlocked?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
	bans?: Resolver<Maybe<ResolversTypes['Json']>, ParentType, ContextType>;
	options?: Resolver<Maybe<ResolversTypes['UserOptions']>, ParentType, ContextType>;
	mediaListOptions?: Resolver<Maybe<ResolversTypes['MediaListOptions']>, ParentType, ContextType>;
	favourites?: Resolver<Maybe<ResolversTypes['Favourites']>, ParentType, ContextType, RequireFields<UserFavouritesArgs, never>>;
	statistics?: Resolver<Maybe<ResolversTypes['UserStatisticTypes']>, ParentType, ContextType>;
	unreadNotificationCount?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
	siteUrl?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
	donatorTier?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
	donatorBadge?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
	moderatorRoles?: Resolver<Maybe<ReadonlyArray<Maybe<ResolversTypes['ModRole']>>>, ParentType, ContextType>;
	createdAt?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
	updatedAt?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
	stats?: Resolver<Maybe<ResolversTypes['UserStats']>, ParentType, ContextType>;
	moderatorStatus?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
	previousNames?: Resolver<Maybe<ReadonlyArray<Maybe<ResolversTypes['UserPreviousName']>>>, ParentType, ContextType>;
	__isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}

export interface UserActivityHistoryResolvers<
	ContextType = any,
	ParentType extends ResolversParentTypes['UserActivityHistory'] = ResolversParentTypes['UserActivityHistory']
> {
	date?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
	amount?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
	level?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
	__isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}

export interface UserAvatarResolvers<ContextType = any, ParentType extends ResolversParentTypes['UserAvatar'] = ResolversParentTypes['UserAvatar']> {
	large?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
	medium?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
	__isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}

export interface UserCountryStatisticResolvers<
	ContextType = any,
	ParentType extends ResolversParentTypes['UserCountryStatistic'] = ResolversParentTypes['UserCountryStatistic']
> {
	count?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
	meanScore?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
	minutesWatched?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
	chaptersRead?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
	mediaIds?: Resolver<ReadonlyArray<Maybe<ResolversTypes['Int']>>, ParentType, ContextType>;
	country?: Resolver<Maybe<ResolversTypes['CountryCode']>, ParentType, ContextType>;
	__isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}

export interface UserFormatStatisticResolvers<
	ContextType = any,
	ParentType extends ResolversParentTypes['UserFormatStatistic'] = ResolversParentTypes['UserFormatStatistic']
> {
	count?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
	meanScore?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
	minutesWatched?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
	chaptersRead?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
	mediaIds?: Resolver<ReadonlyArray<Maybe<ResolversTypes['Int']>>, ParentType, ContextType>;
	format?: Resolver<Maybe<ResolversTypes['MediaFormat']>, ParentType, ContextType>;
	__isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}

export interface UserGenreStatisticResolvers<
	ContextType = any,
	ParentType extends ResolversParentTypes['UserGenreStatistic'] = ResolversParentTypes['UserGenreStatistic']
> {
	count?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
	meanScore?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
	minutesWatched?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
	chaptersRead?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
	mediaIds?: Resolver<ReadonlyArray<Maybe<ResolversTypes['Int']>>, ParentType, ContextType>;
	genre?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
	__isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}

export interface UserLengthStatisticResolvers<
	ContextType = any,
	ParentType extends ResolversParentTypes['UserLengthStatistic'] = ResolversParentTypes['UserLengthStatistic']
> {
	count?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
	meanScore?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
	minutesWatched?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
	chaptersRead?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
	mediaIds?: Resolver<ReadonlyArray<Maybe<ResolversTypes['Int']>>, ParentType, ContextType>;
	length?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
	__isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}

export interface UserModDataResolvers<
	ContextType = any,
	ParentType extends ResolversParentTypes['UserModData'] = ResolversParentTypes['UserModData']
> {
	alts?: Resolver<Maybe<ReadonlyArray<Maybe<ResolversTypes['User']>>>, ParentType, ContextType>;
	bans?: Resolver<Maybe<ResolversTypes['Json']>, ParentType, ContextType>;
	ip?: Resolver<Maybe<ResolversTypes['Json']>, ParentType, ContextType>;
	counts?: Resolver<Maybe<ResolversTypes['Json']>, ParentType, ContextType>;
	privacy?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
	email?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
	__isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}

export interface UserOptionsResolvers<
	ContextType = any,
	ParentType extends ResolversParentTypes['UserOptions'] = ResolversParentTypes['UserOptions']
> {
	titleLanguage?: Resolver<Maybe<ResolversTypes['UserTitleLanguage']>, ParentType, ContextType>;
	displayAdultContent?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
	airingNotifications?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
	profileColor?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
	notificationOptions?: Resolver<Maybe<ReadonlyArray<Maybe<ResolversTypes['NotificationOption']>>>, ParentType, ContextType>;
	timezone?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
	activityMergeTime?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
	staffNameLanguage?: Resolver<Maybe<ResolversTypes['UserStaffNameLanguage']>, ParentType, ContextType>;
	__isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}

export interface UserPreviousNameResolvers<
	ContextType = any,
	ParentType extends ResolversParentTypes['UserPreviousName'] = ResolversParentTypes['UserPreviousName']
> {
	name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
	createdAt?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
	updatedAt?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
	__isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}

export interface UserReleaseYearStatisticResolvers<
	ContextType = any,
	ParentType extends ResolversParentTypes['UserReleaseYearStatistic'] = ResolversParentTypes['UserReleaseYearStatistic']
> {
	count?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
	meanScore?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
	minutesWatched?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
	chaptersRead?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
	mediaIds?: Resolver<ReadonlyArray<Maybe<ResolversTypes['Int']>>, ParentType, ContextType>;
	releaseYear?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
	__isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}

export interface UserScoreStatisticResolvers<
	ContextType = any,
	ParentType extends ResolversParentTypes['UserScoreStatistic'] = ResolversParentTypes['UserScoreStatistic']
> {
	count?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
	meanScore?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
	minutesWatched?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
	chaptersRead?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
	mediaIds?: Resolver<ReadonlyArray<Maybe<ResolversTypes['Int']>>, ParentType, ContextType>;
	score?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
	__isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}

export interface UserStaffStatisticResolvers<
	ContextType = any,
	ParentType extends ResolversParentTypes['UserStaffStatistic'] = ResolversParentTypes['UserStaffStatistic']
> {
	count?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
	meanScore?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
	minutesWatched?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
	chaptersRead?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
	mediaIds?: Resolver<ReadonlyArray<Maybe<ResolversTypes['Int']>>, ParentType, ContextType>;
	staff?: Resolver<Maybe<ResolversTypes['Staff']>, ParentType, ContextType>;
	__isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}

export interface UserStartYearStatisticResolvers<
	ContextType = any,
	ParentType extends ResolversParentTypes['UserStartYearStatistic'] = ResolversParentTypes['UserStartYearStatistic']
> {
	count?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
	meanScore?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
	minutesWatched?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
	chaptersRead?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
	mediaIds?: Resolver<ReadonlyArray<Maybe<ResolversTypes['Int']>>, ParentType, ContextType>;
	startYear?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
	__isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}

export interface UserStatisticTypesResolvers<
	ContextType = any,
	ParentType extends ResolversParentTypes['UserStatisticTypes'] = ResolversParentTypes['UserStatisticTypes']
> {
	anime?: Resolver<Maybe<ResolversTypes['UserStatistics']>, ParentType, ContextType>;
	manga?: Resolver<Maybe<ResolversTypes['UserStatistics']>, ParentType, ContextType>;
	__isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}

export interface UserStatisticsResolvers<
	ContextType = any,
	ParentType extends ResolversParentTypes['UserStatistics'] = ResolversParentTypes['UserStatistics']
> {
	count?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
	meanScore?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
	standardDeviation?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
	minutesWatched?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
	episodesWatched?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
	chaptersRead?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
	volumesRead?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
	formats?: Resolver<
		Maybe<ReadonlyArray<Maybe<ResolversTypes['UserFormatStatistic']>>>,
		ParentType,
		ContextType,
		RequireFields<UserStatisticsFormatsArgs, never>
	>;
	statuses?: Resolver<
		Maybe<ReadonlyArray<Maybe<ResolversTypes['UserStatusStatistic']>>>,
		ParentType,
		ContextType,
		RequireFields<UserStatisticsStatusesArgs, never>
	>;
	scores?: Resolver<
		Maybe<ReadonlyArray<Maybe<ResolversTypes['UserScoreStatistic']>>>,
		ParentType,
		ContextType,
		RequireFields<UserStatisticsScoresArgs, never>
	>;
	lengths?: Resolver<
		Maybe<ReadonlyArray<Maybe<ResolversTypes['UserLengthStatistic']>>>,
		ParentType,
		ContextType,
		RequireFields<UserStatisticsLengthsArgs, never>
	>;
	releaseYears?: Resolver<
		Maybe<ReadonlyArray<Maybe<ResolversTypes['UserReleaseYearStatistic']>>>,
		ParentType,
		ContextType,
		RequireFields<UserStatisticsReleaseYearsArgs, never>
	>;
	startYears?: Resolver<
		Maybe<ReadonlyArray<Maybe<ResolversTypes['UserStartYearStatistic']>>>,
		ParentType,
		ContextType,
		RequireFields<UserStatisticsStartYearsArgs, never>
	>;
	genres?: Resolver<
		Maybe<ReadonlyArray<Maybe<ResolversTypes['UserGenreStatistic']>>>,
		ParentType,
		ContextType,
		RequireFields<UserStatisticsGenresArgs, never>
	>;
	tags?: Resolver<
		Maybe<ReadonlyArray<Maybe<ResolversTypes['UserTagStatistic']>>>,
		ParentType,
		ContextType,
		RequireFields<UserStatisticsTagsArgs, never>
	>;
	countries?: Resolver<
		Maybe<ReadonlyArray<Maybe<ResolversTypes['UserCountryStatistic']>>>,
		ParentType,
		ContextType,
		RequireFields<UserStatisticsCountriesArgs, never>
	>;
	voiceActors?: Resolver<
		Maybe<ReadonlyArray<Maybe<ResolversTypes['UserVoiceActorStatistic']>>>,
		ParentType,
		ContextType,
		RequireFields<UserStatisticsVoiceActorsArgs, never>
	>;
	staff?: Resolver<
		Maybe<ReadonlyArray<Maybe<ResolversTypes['UserStaffStatistic']>>>,
		ParentType,
		ContextType,
		RequireFields<UserStatisticsStaffArgs, never>
	>;
	studios?: Resolver<
		Maybe<ReadonlyArray<Maybe<ResolversTypes['UserStudioStatistic']>>>,
		ParentType,
		ContextType,
		RequireFields<UserStatisticsStudiosArgs, never>
	>;
	__isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}

export interface UserStatsResolvers<ContextType = any, ParentType extends ResolversParentTypes['UserStats'] = ResolversParentTypes['UserStats']> {
	watchedTime?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
	chaptersRead?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
	activityHistory?: Resolver<Maybe<ReadonlyArray<Maybe<ResolversTypes['UserActivityHistory']>>>, ParentType, ContextType>;
	animeStatusDistribution?: Resolver<Maybe<ReadonlyArray<Maybe<ResolversTypes['StatusDistribution']>>>, ParentType, ContextType>;
	mangaStatusDistribution?: Resolver<Maybe<ReadonlyArray<Maybe<ResolversTypes['StatusDistribution']>>>, ParentType, ContextType>;
	animeScoreDistribution?: Resolver<Maybe<ReadonlyArray<Maybe<ResolversTypes['ScoreDistribution']>>>, ParentType, ContextType>;
	mangaScoreDistribution?: Resolver<Maybe<ReadonlyArray<Maybe<ResolversTypes['ScoreDistribution']>>>, ParentType, ContextType>;
	animeListScores?: Resolver<Maybe<ResolversTypes['ListScoreStats']>, ParentType, ContextType>;
	mangaListScores?: Resolver<Maybe<ResolversTypes['ListScoreStats']>, ParentType, ContextType>;
	favouredGenresOverview?: Resolver<Maybe<ReadonlyArray<Maybe<ResolversTypes['GenreStats']>>>, ParentType, ContextType>;
	favouredGenres?: Resolver<Maybe<ReadonlyArray<Maybe<ResolversTypes['GenreStats']>>>, ParentType, ContextType>;
	favouredTags?: Resolver<Maybe<ReadonlyArray<Maybe<ResolversTypes['TagStats']>>>, ParentType, ContextType>;
	favouredActors?: Resolver<Maybe<ReadonlyArray<Maybe<ResolversTypes['StaffStats']>>>, ParentType, ContextType>;
	favouredStaff?: Resolver<Maybe<ReadonlyArray<Maybe<ResolversTypes['StaffStats']>>>, ParentType, ContextType>;
	favouredStudios?: Resolver<Maybe<ReadonlyArray<Maybe<ResolversTypes['StudioStats']>>>, ParentType, ContextType>;
	favouredYears?: Resolver<Maybe<ReadonlyArray<Maybe<ResolversTypes['YearStats']>>>, ParentType, ContextType>;
	favouredFormats?: Resolver<Maybe<ReadonlyArray<Maybe<ResolversTypes['FormatStats']>>>, ParentType, ContextType>;
	__isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}

export interface UserStatusStatisticResolvers<
	ContextType = any,
	ParentType extends ResolversParentTypes['UserStatusStatistic'] = ResolversParentTypes['UserStatusStatistic']
> {
	count?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
	meanScore?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
	minutesWatched?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
	chaptersRead?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
	mediaIds?: Resolver<ReadonlyArray<Maybe<ResolversTypes['Int']>>, ParentType, ContextType>;
	status?: Resolver<Maybe<ResolversTypes['MediaListStatus']>, ParentType, ContextType>;
	__isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}

export interface UserStudioStatisticResolvers<
	ContextType = any,
	ParentType extends ResolversParentTypes['UserStudioStatistic'] = ResolversParentTypes['UserStudioStatistic']
> {
	count?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
	meanScore?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
	minutesWatched?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
	chaptersRead?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
	mediaIds?: Resolver<ReadonlyArray<Maybe<ResolversTypes['Int']>>, ParentType, ContextType>;
	studio?: Resolver<Maybe<ResolversTypes['Studio']>, ParentType, ContextType>;
	__isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}

export interface UserTagStatisticResolvers<
	ContextType = any,
	ParentType extends ResolversParentTypes['UserTagStatistic'] = ResolversParentTypes['UserTagStatistic']
> {
	count?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
	meanScore?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
	minutesWatched?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
	chaptersRead?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
	mediaIds?: Resolver<ReadonlyArray<Maybe<ResolversTypes['Int']>>, ParentType, ContextType>;
	tag?: Resolver<Maybe<ResolversTypes['MediaTag']>, ParentType, ContextType>;
	__isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}

export interface UserVoiceActorStatisticResolvers<
	ContextType = any,
	ParentType extends ResolversParentTypes['UserVoiceActorStatistic'] = ResolversParentTypes['UserVoiceActorStatistic']
> {
	count?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
	meanScore?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
	minutesWatched?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
	chaptersRead?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
	mediaIds?: Resolver<ReadonlyArray<Maybe<ResolversTypes['Int']>>, ParentType, ContextType>;
	voiceActor?: Resolver<Maybe<ResolversTypes['Staff']>, ParentType, ContextType>;
	characterIds?: Resolver<ReadonlyArray<Maybe<ResolversTypes['Int']>>, ParentType, ContextType>;
	__isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}

export interface YearStatsResolvers<ContextType = any, ParentType extends ResolversParentTypes['YearStats'] = ResolversParentTypes['YearStats']> {
	year?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
	amount?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
	meanScore?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
	__isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}

export interface Resolvers<ContextType = any> {
	ActivityLikeNotification?: ActivityLikeNotificationResolvers<ContextType>;
	ActivityMentionNotification?: ActivityMentionNotificationResolvers<ContextType>;
	ActivityMessageNotification?: ActivityMessageNotificationResolvers<ContextType>;
	ActivityReply?: ActivityReplyResolvers<ContextType>;
	ActivityReplyLikeNotification?: ActivityReplyLikeNotificationResolvers<ContextType>;
	ActivityReplyNotification?: ActivityReplyNotificationResolvers<ContextType>;
	ActivityReplySubscribedNotification?: ActivityReplySubscribedNotificationResolvers<ContextType>;
	ActivityUnion?: ActivityUnionResolvers<ContextType>;
	AiringNotification?: AiringNotificationResolvers<ContextType>;
	AiringProgression?: AiringProgressionResolvers<ContextType>;
	AiringSchedule?: AiringScheduleResolvers<ContextType>;
	AiringScheduleConnection?: AiringScheduleConnectionResolvers<ContextType>;
	AiringScheduleEdge?: AiringScheduleEdgeResolvers<ContextType>;
	AniChartUser?: AniChartUserResolvers<ContextType>;
	Character?: CharacterResolvers<ContextType>;
	CharacterConnection?: CharacterConnectionResolvers<ContextType>;
	CharacterEdge?: CharacterEdgeResolvers<ContextType>;
	CharacterImage?: CharacterImageResolvers<ContextType>;
	CharacterName?: CharacterNameResolvers<ContextType>;
	CharacterSubmission?: CharacterSubmissionResolvers<ContextType>;
	CharacterSubmissionConnection?: CharacterSubmissionConnectionResolvers<ContextType>;
	CharacterSubmissionEdge?: CharacterSubmissionEdgeResolvers<ContextType>;
	CountryCode?: GraphQLScalarType;
	Deleted?: DeletedResolvers<ContextType>;
	Favourites?: FavouritesResolvers<ContextType>;
	FollowingNotification?: FollowingNotificationResolvers<ContextType>;
	FormatStats?: FormatStatsResolvers<ContextType>;
	FuzzyDate?: FuzzyDateResolvers<ContextType>;
	FuzzyDateInt?: GraphQLScalarType;
	GenreStats?: GenreStatsResolvers<ContextType>;
	InternalPage?: InternalPageResolvers<ContextType>;
	Json?: GraphQLScalarType;
	LikeableUnion?: LikeableUnionResolvers<ContextType>;
	ListActivity?: ListActivityResolvers<ContextType>;
	ListScoreStats?: ListScoreStatsResolvers<ContextType>;
	Media?: MediaResolvers<ContextType>;
	MediaCharacter?: MediaCharacterResolvers<ContextType>;
	MediaConnection?: MediaConnectionResolvers<ContextType>;
	MediaCoverImage?: MediaCoverImageResolvers<ContextType>;
	MediaEdge?: MediaEdgeResolvers<ContextType>;
	MediaExternalLink?: MediaExternalLinkResolvers<ContextType>;
	MediaList?: MediaListResolvers<ContextType>;
	MediaListCollection?: MediaListCollectionResolvers<ContextType>;
	MediaListGroup?: MediaListGroupResolvers<ContextType>;
	MediaListOptions?: MediaListOptionsResolvers<ContextType>;
	MediaListTypeOptions?: MediaListTypeOptionsResolvers<ContextType>;
	MediaRank?: MediaRankResolvers<ContextType>;
	MediaStats?: MediaStatsResolvers<ContextType>;
	MediaStreamingEpisode?: MediaStreamingEpisodeResolvers<ContextType>;
	MediaSubmission?: MediaSubmissionResolvers<ContextType>;
	MediaSubmissionComparison?: MediaSubmissionComparisonResolvers<ContextType>;
	MediaSubmissionEdge?: MediaSubmissionEdgeResolvers<ContextType>;
	MediaTag?: MediaTagResolvers<ContextType>;
	MediaTitle?: MediaTitleResolvers<ContextType>;
	MediaTrailer?: MediaTrailerResolvers<ContextType>;
	MediaTrend?: MediaTrendResolvers<ContextType>;
	MediaTrendConnection?: MediaTrendConnectionResolvers<ContextType>;
	MediaTrendEdge?: MediaTrendEdgeResolvers<ContextType>;
	MessageActivity?: MessageActivityResolvers<ContextType>;
	ModAction?: ModActionResolvers<ContextType>;
	Mutation?: MutationResolvers<ContextType>;
	NotificationOption?: NotificationOptionResolvers<ContextType>;
	NotificationUnion?: NotificationUnionResolvers<ContextType>;
	Page?: PageResolvers<ContextType>;
	PageInfo?: PageInfoResolvers<ContextType>;
	ParsedMarkdown?: ParsedMarkdownResolvers<ContextType>;
	Query?: QueryResolvers<ContextType>;
	Recommendation?: RecommendationResolvers<ContextType>;
	RecommendationConnection?: RecommendationConnectionResolvers<ContextType>;
	RecommendationEdge?: RecommendationEdgeResolvers<ContextType>;
	RelatedMediaAdditionNotification?: RelatedMediaAdditionNotificationResolvers<ContextType>;
	Report?: ReportResolvers<ContextType>;
	Review?: ReviewResolvers<ContextType>;
	ReviewConnection?: ReviewConnectionResolvers<ContextType>;
	ReviewEdge?: ReviewEdgeResolvers<ContextType>;
	RevisionHistory?: RevisionHistoryResolvers<ContextType>;
	ScoreDistribution?: ScoreDistributionResolvers<ContextType>;
	SiteStatistics?: SiteStatisticsResolvers<ContextType>;
	SiteTrend?: SiteTrendResolvers<ContextType>;
	SiteTrendConnection?: SiteTrendConnectionResolvers<ContextType>;
	SiteTrendEdge?: SiteTrendEdgeResolvers<ContextType>;
	Staff?: StaffResolvers<ContextType>;
	StaffConnection?: StaffConnectionResolvers<ContextType>;
	StaffEdge?: StaffEdgeResolvers<ContextType>;
	StaffImage?: StaffImageResolvers<ContextType>;
	StaffName?: StaffNameResolvers<ContextType>;
	StaffRoleType?: StaffRoleTypeResolvers<ContextType>;
	StaffStats?: StaffStatsResolvers<ContextType>;
	StaffSubmission?: StaffSubmissionResolvers<ContextType>;
	StatusDistribution?: StatusDistributionResolvers<ContextType>;
	Studio?: StudioResolvers<ContextType>;
	StudioConnection?: StudioConnectionResolvers<ContextType>;
	StudioEdge?: StudioEdgeResolvers<ContextType>;
	StudioStats?: StudioStatsResolvers<ContextType>;
	TagStats?: TagStatsResolvers<ContextType>;
	TextActivity?: TextActivityResolvers<ContextType>;
	Thread?: ThreadResolvers<ContextType>;
	ThreadCategory?: ThreadCategoryResolvers<ContextType>;
	ThreadComment?: ThreadCommentResolvers<ContextType>;
	ThreadCommentLikeNotification?: ThreadCommentLikeNotificationResolvers<ContextType>;
	ThreadCommentMentionNotification?: ThreadCommentMentionNotificationResolvers<ContextType>;
	ThreadCommentReplyNotification?: ThreadCommentReplyNotificationResolvers<ContextType>;
	ThreadCommentSubscribedNotification?: ThreadCommentSubscribedNotificationResolvers<ContextType>;
	ThreadLikeNotification?: ThreadLikeNotificationResolvers<ContextType>;
	User?: UserResolvers<ContextType>;
	UserActivityHistory?: UserActivityHistoryResolvers<ContextType>;
	UserAvatar?: UserAvatarResolvers<ContextType>;
	UserCountryStatistic?: UserCountryStatisticResolvers<ContextType>;
	UserFormatStatistic?: UserFormatStatisticResolvers<ContextType>;
	UserGenreStatistic?: UserGenreStatisticResolvers<ContextType>;
	UserLengthStatistic?: UserLengthStatisticResolvers<ContextType>;
	UserModData?: UserModDataResolvers<ContextType>;
	UserOptions?: UserOptionsResolvers<ContextType>;
	UserPreviousName?: UserPreviousNameResolvers<ContextType>;
	UserReleaseYearStatistic?: UserReleaseYearStatisticResolvers<ContextType>;
	UserScoreStatistic?: UserScoreStatisticResolvers<ContextType>;
	UserStaffStatistic?: UserStaffStatisticResolvers<ContextType>;
	UserStartYearStatistic?: UserStartYearStatisticResolvers<ContextType>;
	UserStatisticTypes?: UserStatisticTypesResolvers<ContextType>;
	UserStatistics?: UserStatisticsResolvers<ContextType>;
	UserStats?: UserStatsResolvers<ContextType>;
	UserStatusStatistic?: UserStatusStatisticResolvers<ContextType>;
	UserStudioStatistic?: UserStudioStatisticResolvers<ContextType>;
	UserTagStatistic?: UserTagStatisticResolvers<ContextType>;
	UserVoiceActorStatistic?: UserVoiceActorStatisticResolvers<ContextType>;
	YearStats?: YearStatsResolvers<ContextType>;
}

/**
 * @deprecated
 * Use "Resolvers" root object instead. If you wish to get "IResolvers", add "typesPrefix: I" to your config.
 */
export type IResolvers<ContextType = any> = Resolvers<ContextType>;
