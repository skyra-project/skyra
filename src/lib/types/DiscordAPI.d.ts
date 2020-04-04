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

export interface APIBanData {
	user: APIUserData;
	reason: string | null;
}

export interface WSGuildCreate {
	preferred_locale: string;
	joined_at: string;
	premium_subscription_count: number;
	channels: WSChannelData[];
	features: any[];
	lazy: boolean;
	default_message_notifications: number;
	rules_channel_id: null;
	premium_tier: number;
	large: boolean;
	afk_channel_id: null;
	members: WSMemberData[];
	voice_states: any[];
	name: string;
	icon: null;
	owner_id: string;
	application_id: null;
	splash: null;
	mfa_level: number;
	afk_timeout: number;
	unavailable: boolean;
	system_channel_id: string;
	presences: WSPresenceData[];
	discovery_splash: null;
	banner: null;
	vanity_url_code: null;
	region: string;
	roles: WSRoleData[];
	description: null;
	member_count: number;
	emojis: any[];
	id: string;
	verification_level: number;
	explicit_content_filter: number;
	system_channel_flags: number;
}

export interface WSChannelData {
	user_limit?: number;
	type: number;
	position: number;
	permission_overwrites: WSPermissionOverwriteData[];
	name: string;
	id: string;
	bitrate?: number;
	topic?: null | string;
	rate_limit_per_user?: number;
	parent_id?: string;
	nsfw?: boolean;
	last_message_id?: string;
}

export interface WSPermissionOverwriteData {
	type: string;
	id: string;
	deny: number;
	allow: number;
}

export interface WSMemberData {
	user: WSUserData;
	roles: string[];
	premium_since?: null;
	nick?: null | string;
	mute: boolean;
	joined_at: string;
	hoisted_role: null | string;
	deaf: boolean;
}

export interface WSUserData {
	username: string;
	id: string;
	discriminator: string;
	bot?: boolean;
	avatar: string;
}

export interface WSPresenceData {
	user: WSPresenceUserData;
	status: string;
	game: WSActivityData | null;
	client_status: WSClientStatusData;
	activities: WSActivityData[];
}

export interface WSActivityData {
	type: number;
	name: string;
	id: string;
	created_at: number;
}

export interface WSClientStatusData {
	web: string;
}

export interface WSPresenceUserData {
	id: string;
}

export interface WSRoleData {
	position: number;
	permissions: number;
	name: string;
	mentionable: boolean;
	managed: boolean;
	id: string;
	hoist: boolean;
	color: number;
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

export interface WSMessageReactionRemoveEmoji {
	message_id: string;
	channel_id: string;
	guild_id: string;
	emoji: { id: string | null; name: string };
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

export interface OauthData {
	access_token: string;
	expires_in: number;
	refresh_token: string;
	scope: string;
	token_type: string;
}

export type APIInviteData = APIGroupInviteData | APIGuildInviteData;

export interface APIGroupInviteData {
	code: string;
	inviter: APIInviterData;
	channel: InviteGroupChannel;
}

export interface InviteGroupChannel {
	id: string;
	name: string;
	type: number;
	icon: null;
}

export interface APIInviterData {
	id: string;
	username: string;
	avatar: string;
	discriminator: string;
}

export interface APIGuildInviteData {
	code: string;
	guild: APIInviteGuildData;
	channel: APIInviteGuildChannelData;
	inviter: APIInviterData;
}

export interface APIInviteGuildChannelData {
	id: string;
	name: string;
	type: number;
}

export interface APIInviteGuildData {
	id: string;
	name: string;
	splash: null;
	banner: null;
	description: null;
	icon: string;
	features: any[];
	verification_level: number;
	vanity_url_code: null;
}
