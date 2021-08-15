export const enum TwitchSubscriptionTypes {
	StreamOnline = 'stream.online',
	StreamOffline = 'stream.offline'
}

export interface OauthResponse {
	access_token: string;
	refresh_token: string;
	scope: string;
	expires_in: number;
}

export interface TwitchHelixBearerToken {
	TOKEN: string | null;
	EXPIRE: number | null;
}

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

export interface TwitchHelixResponse<T> {
	data: T[];
}

export interface TwitchHelixGameSearchResult {
	id: string;
	name: string;
	box_art_url: string;
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

export interface TwitchEventSubResult {
	id: string;
	status: string;
	type: TwitchSubscriptionTypes;
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

export interface TwitchEventSubVerificationMessage {
	challenge: string;
	subscription: TwitchEventSubResult;
	event: TwitchEventSubOnlineOfflineEvent;
}

export interface TwitchEventSubOnlineOfflineEvent {
	/** Only defined when this is an Online notification */
	id?: string;
	broadcaster_user_id: string;
	broadcaster_user_login: string;
	broadcaster_user_name: string;
	/** Only defined when this is an Online notification */
	type?: 'live';
	/** Only defined when this is an Online notification */
	started_at?: `${number}${number}${number}${number}-${number}${number}-${number}${number}T${number}${number}:${number}${number}:${number}${number}.${number}${number}${number}Z`;
}
