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

/**
 * https://discordapp.com/developers/docs/resources/webhook#webhook-object-webhook-structure
 */
export interface APIWebhookData {
	id: string;
	guild_id?: string;
	channel_id: string;
	user?: APIUserData;
	name: string | null;
	avatar: string | null;
	token: string;
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

export interface AuditLogResult {
	webhooks: unknown[];
	users: User[];
	audit_log_entries: AuditLogEntry[];
}

export interface AuditLogEntry {
	target_id: string;
	changes: Change[];
	user_id: string;
	id: string;
	action_type: number;
}

export interface Change {
	new_value: NewValue[];
	key: string;
}

export interface NewValue {
	name: string;
	id: string;
}

export interface User {
	username: string;
	discriminator: string;
	id: string;
	avatar: string;
	bot?: boolean;
}
