export interface TwitchKrakenChannelSearchResults {
	_total: number;
	users: TwitchKrakenChannelSearchResult[];
}

export interface TwitchKrakenChannelSearchResult {
	_id: string;
	bio: null | string;
	created_at: Date;
	display_name: string;
	logo: null | string;
	name: string;
	type: string;
	updated_at: Date;
}

export interface TwitchKrakenChannelResult {
	_id: string;
	broadcaster_language: string;
	broadcaster_software: string;
	broadcaster_type: string;
	created_at: Date;
	description: string;
	display_name: string;
	followers: number;
	game: string;
	language: string;
	logo: string;
	mature: boolean;
	name: string;
	partner: boolean;
	privacy_options_enabled: boolean;
	private_video: boolean;
	profile_banner_background_color: null;
	profile_banner: string;
	status: string;
	updated_at: Date;
	url: string;
	video_banner: string;
	views: number;
}

export interface TwitchKrakenUserFollowersChannelResults {
	created_at: Date;
	notifications: boolean;
	channel: TwitchKrakenUserFollowersChannelResultsChannel;
}

export interface TwitchKrakenUserFollowersChannelResultsChannel {
	_id: number;
	broadcaster_language: string;
	created_at: Date;
	display_name: string;
	followers: number;
	game: string;
	language: string;
	logo: string;
	mature: boolean;
	name: string;
	partner: boolean;
	profile_banner_background_color: string;
	profile_banner: string;
	status: string;
	updated_at: Date;
	url: string;
	video_banner: string;
	views: number;
}

export interface TwitchHelixBearerToken {
	TOKEN: string;
	EXPIRE: number;
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
