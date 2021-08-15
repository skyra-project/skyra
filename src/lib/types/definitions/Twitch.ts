import type { NonNullObject } from '@sapphire/utilities';

export const enum TwitchHelixUserType {
	Staff = 'staff',
	Admin = 'admin',
	GlobalMod = 'global_mod',
	Normal = ''
}

export const enum TwitchHelixBroadcasterType {
	Partner = 'partner',
	Affiliate = 'affiliate',
	Normal = ''
}

export interface TwitchHelixBearerToken {
	TOKEN: string | null;
	EXPIRE: number | null;
}

export interface TwitchHelixResponse<T> {
	data: T[];
}

export interface TwitchHelixOauth2Result {
	access_token: string;
	refresh_token: string;
	scope: string;
	expires_in: number;
}

export interface TwitchHelixUsersSearchResult {
	id: string;
	login: string;
	display_name: string;
	type: TwitchHelixUserType;
	broadcaster_type: TwitchHelixBroadcasterType;
	description: string;
	profile_image_url: string;
	offline_image_url: string;
	view_count: number;
	email?: string;
}

export interface TwitchHelixUserFollowsResult {
	/** The ID of the user following a streamer */
	from_id: string;
	/** The name of the user following a streamer */
	from_name: string;
	/** The ID of the channel that the user follows */
	to_id: string;
	/** The name of the channel that the user follows */
	to_name: string;
	/** In the format of YYYY-MM-DD[T]HH:mm:ssZ, so can be parsed to a Date */
	followed_at: string;
}

export interface TwitchHelixGameSearchResult {
	/** ID of the game. */
	id: string;
	/** Name of the game. */
	name: string;

	/** Template URL for the game’s box art. */
	box_art_url: string;
}

export interface TwitchHelixStreamsResult {
	/** Stream ID. */
	id: string;
	/** ID of the user who is streaming. */
	user_id: string;

	/** Login of the user who is streaming. */
	user_login: string;

	/** Display name corresponding to {@link TwitchHelixStreamsResult.user_id}. */
	user_name: string;
	/** ID of the game being played on the stream. */
	game_id: string;
	/** Name of the game being played. */
	game_name: string;

	/** Template URL for the game’s box art. */
	game_box_art_url?: string;
	/** Stream type: "live" or "" (in case of error). */
	type: string;
	/** Stream title. */
	title: string;
	/** Number of viewers watching the stream at the time of the query. */
	viewer_count: number;
	/** UTC timestamp. */
	started_at: Date;
	/** Stream language. A language value is either the {@linkplain https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes ISO 639-1} two-letter code for a {@linkplain https://help.twitch.tv/s/article/languages-on-twitch#streamlang supported stream language} or “other”. */
	language: string;
	/** Thumbnail URL of the stream. All image URLs have variable width and height. You can replace `{width}` and `{height}` with any values to get that size image */
	thumbnail_url: string;
	/** Shows tag IDs that apply to the stream. */
	tag_ids: string[];
	/** Indicates if the broadcaster has specified their channel contains mature content that may be inappropriate for younger audiences. */
	is_mature: boolean;
}

export const enum TwitchEventSubTypes {
	StreamOnline = 'stream.online',
	StreamOffline = 'stream.offline'
}

export interface TwitchEventSubResult {
	id: string;
	status: string;
	type: TwitchEventSubTypes;
	version: string;
	cost: number;
	condition: {
		broadcaster_user_id: string;
	};
	transport: {
		method: string;
		callback: string;
	};
	created_at: string;
}

export interface TwitchEventSubVerificationMessage<T = NonNullObject> {
	challenge: string;
	subscription: TwitchEventSubResult;
	event: TwitchEventSubEvent<T>;
}

export type TwitchEventSubEvent<T = NonNullObject> = T & {
	broadcaster_user_id: string;
	broadcaster_user_login: string;
	broadcaster_user_name: string;
};

export type TwitchEventSubOnlineEvent = TwitchEventSubEvent<{
	id: string;
	type: 'live';
	started_at: string;
}>;

export interface TwitchOnlineEmbedData {
	embedThumbnailUrl?: string;
	gameName?: string;
	language?: string;
	startedAt: Date;
	embedImageUrl?: string;
	title: string;
	userName: string;
	viewerCount?: number;
}
