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
