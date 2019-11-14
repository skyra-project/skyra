export interface TwitchChannelSearchResults {
	_total: number;
	users: TwitchChannelSearchResult[];
}

export interface TwitchChannelSearchResult {
	_id: string;
	bio: null | string;
	created_at: Date;
	display_name: string;
	logo: null | string;
	name: string;
	type: string;
	updated_at: Date;
}

export interface TwitchChannelResult {
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

export interface TwitchUserFollowersChannelResults {
	created_at: Date;
	notifications: boolean;
	channel: TwitchUserFollowersChannelResultsChannel;
}

export interface TwitchUserFollowersChannelResultsChannel {
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
