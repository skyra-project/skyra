/**
 * https://discordapp.com/developers/docs/resources/user#user-object
 */
export interface APIUserData {
	id: string;
	username: string;
	discriminator: string;
	avatar: string | null;
	bot?: boolean;
	mfa_enabled?: boolean;
	locale?: string;
	verified?: boolean;
	email?: string;
}

/**
 * Not Documented, but partial doesn't include roles, users, require_colons, or managed
 */
export interface APIEmojiPartial {
	id: string | null;
	name: string;
	animated: boolean;
}

/**
 * https://discordapp.com/developers/docs/resources/emoji#emoji-object-emoji-structure
 */
export interface APIEmojiData extends APIEmojiPartial {
	roles?: string[];
	user?: APIUserData;
	require_colons?: boolean;
	managed?: boolean;
}

/**
 * https://discordapp.com/developers/docs/resources/channel#reaction-object
 */
export interface APIReactionData {
	count: number;
	me: boolean;
	emoji: APIEmojiData;
}

/**
 * Not Documented, but Partial packets only exclude the user property
 */
export interface APIGuildMemberPartial {
	nick?: string;
	roles: string[];
	joined_at: string;
	deaf: boolean;
	mute: boolean;
}

/**
 * https://discordapp.com/developers/docs/resources/guild#guild-member-object-guild-member-structure
 */
export interface APIGuildMemberData extends APIGuildMemberPartial {
	user: APIUserData;
}

export interface WSGuildMemberAdd extends APIGuildMemberData {
	guild_id: string;
}

export interface WSGuildMemberRemove {
	user: APIUserData;
	guild_id: string;
}

export interface WSGuildMemberUpdate {
	user: APIUserData;
	roles: string[];
	nick: string | null;
	guild_id: string;
}

export interface WSMessageDelete {
	id: string;
	channel_id: string;
	guild_id: string;
}

export interface WSMessageDeleteBulk {
	ids: string[];
	channel_id: string;
	guild_id: string;
}

export interface WSMessageReactionAdd {
	user_id: string;
	message_id: string;
	emoji: APIEmojiData;
	channel_id: string;
	guild_id: string;
}

export interface WSMessageReactionRemove {
	user_id: string;
	message_id: string;
	emoji: APIEmojiData;
	channel_id: string;
	guild_id: string;
}

export interface WSMessageReactionRemoveAll {
	message_id: string;
	channel_id: string;
	guild_id: string;
}
