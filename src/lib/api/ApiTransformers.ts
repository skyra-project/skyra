import type { ChannelTypeString } from '#utils/functions';
import type {
	Channel,
	DMChannel,
	Guild,
	GuildChannel,
	GuildMember,
	NewsChannel,
	PermissionOverwrites,
	Role,
	TextChannel,
	User,
	VoiceChannel
} from 'discord.js';

// #region Guild

export function flattenGuild(guild: Guild): FlattenedGuild {
	return {
		afkChannelId: guild.afkChannelId,
		afkTimeout: guild.afkTimeout,
		applicationId: guild.applicationId,
		approximateMemberCount: guild.approximateMemberCount,
		approximatePresenceCount: guild.approximatePresenceCount,
		available: guild.available,
		banner: guild.banner,
		channels: guild.channels.cache.map(flattenChannel) as FlattenedGuildChannel[],
		defaultMessageNotifications: guild.defaultMessageNotifications,
		description: guild.description,
		widgetEnabled: guild.widgetEnabled,
		explicitContentFilter: guild.explicitContentFilter,
		features: guild.features,
		icon: guild.icon,
		id: guild.id,
		joinedTimestamp: guild.joinedTimestamp,
		mfaLevel: guild.mfaLevel,
		name: guild.name,
		ownerId: guild.ownerId,
		partnered: guild.partnered,
		preferredLocale: guild.preferredLocale,
		premiumSubscriptionCount: guild.premiumSubscriptionCount,
		premiumTier: guild.premiumTier,
		roles: guild.roles.cache.map(flattenRole),
		splash: guild.splash,
		systemChannelId: guild.systemChannelId,
		vanityURLCode: guild.vanityURLCode,
		verificationLevel: guild.verificationLevel,
		verified: guild.verified
	};
}

export interface FlattenedGuild
	extends Pick<
		Guild,
		| 'afkChannelId'
		| 'afkTimeout'
		| 'applicationId'
		| 'approximateMemberCount'
		| 'approximatePresenceCount'
		| 'available'
		| 'banner'
		| 'defaultMessageNotifications'
		| 'description'
		| 'widgetEnabled'
		| 'explicitContentFilter'
		| 'features'
		| 'icon'
		| 'id'
		| 'joinedTimestamp'
		| 'mfaLevel'
		| 'name'
		| 'ownerId'
		| 'partnered'
		| 'preferredLocale'
		| 'premiumSubscriptionCount'
		| 'premiumTier'
		| 'splash'
		| 'systemChannelId'
		| 'vanityURLCode'
		| 'verificationLevel'
		| 'verified'
	> {
	channels: FlattenedGuildChannel[];
	roles: FlattenedRole[];
}

// #endregion Guild

// #region Role

export function flattenRole(role: Role): FlattenedRole {
	return {
		id: role.id,
		guildId: role.guild.id,
		name: role.name,
		color: role.color,
		hoist: role.hoist,
		rawPosition: role.rawPosition,
		permissions: role.permissions.bitfield.toString(),
		managed: role.managed,
		mentionable: role.mentionable
	};
}

export interface FlattenedRole {
	id: string;
	guildId: string;
	name: string;
	color: number;
	hoist: boolean;
	rawPosition: number;
	permissions: string;
	managed: boolean;
	mentionable: boolean;
}

// #endregion Role

// #region Channel

export function flattenChannel(channel: NewsChannel): FlattenedNewsChannel;
export function flattenChannel(channel: TextChannel): FlattenedTextChannel;
export function flattenChannel(channel: VoiceChannel): FlattenedVoiceChannel;
export function flattenChannel(channel: GuildChannel): FlattenedGuildChannel;
export function flattenChannel(channel: DMChannel): FlattenedDMChannel;
export function flattenChannel(channel: Channel): FlattenedChannel;
export function flattenChannel(channel: Channel) {
	if (channel.type === 'GUILD_NEWS') return flattenChannelNews(channel as NewsChannel);
	if (channel.type === 'GUILD_TEXT') return flattenChannelText(channel as TextChannel);
	if (channel.type === 'GUILD_VOICE') return flattenChannelVoice(channel as VoiceChannel);
	if (Reflect.has(channel, 'guild')) return flattenChannelGuild(channel as GuildChannel);
	if (channel.type === 'DM') return flattenChannelDM(channel as DMChannel);
	return flattenChannelFallback(channel);
}

function flattenChannelNews(channel: NewsChannel): FlattenedNewsChannel {
	return {
		id: channel.id,
		type: channel.type as FlattenedNewsChannel['type'],
		guildId: channel.guild.id,
		name: channel.name,
		rawPosition: channel.rawPosition,
		parentId: channel.parentId,
		permissionOverwrites: [...channel.permissionOverwrites.cache.entries()],
		topic: channel.topic,
		nsfw: channel.nsfw,
		createdTimestamp: channel.createdTimestamp
	};
}

function flattenChannelText(channel: TextChannel): FlattenedTextChannel {
	return {
		id: channel.id,
		type: channel.type as FlattenedTextChannel['type'],
		guildId: channel.guild.id,
		name: channel.name,
		rawPosition: channel.rawPosition,
		parentId: channel.parentId,
		permissionOverwrites: [...channel.permissionOverwrites.cache.entries()],
		topic: channel.topic,
		nsfw: channel.nsfw,
		rateLimitPerUser: channel.rateLimitPerUser,
		createdTimestamp: channel.createdTimestamp
	};
}

function flattenChannelVoice(channel: VoiceChannel): FlattenedVoiceChannel {
	return {
		id: channel.id,
		type: channel.type as FlattenedVoiceChannel['type'],
		guildId: channel.guild.id,
		name: channel.name,
		rawPosition: channel.rawPosition,
		parentId: channel.parentId,
		permissionOverwrites: [...channel.permissionOverwrites.cache.entries()],
		bitrate: channel.bitrate,
		userLimit: channel.userLimit,
		createdTimestamp: channel.createdTimestamp
	};
}

function flattenChannelGuild(channel: GuildChannel): FlattenedGuildChannel {
	return {
		id: channel.id,
		type: channel.type as FlattenedGuildChannel['type'],
		guildId: channel.guild.id,
		name: channel.name,
		rawPosition: channel.rawPosition,
		parentId: channel.parentId,
		permissionOverwrites: [...channel.permissionOverwrites.cache.entries()],
		createdTimestamp: channel.createdTimestamp
	};
}

function flattenChannelDM(channel: DMChannel): FlattenedDMChannel {
	return {
		id: channel.id,
		type: channel.type as FlattenedDMChannel['type'],
		recipient: channel.recipient.id,
		createdTimestamp: channel.createdTimestamp
	};
}

function flattenChannelFallback(channel: Channel): FlattenedChannel {
	return {
		id: channel.id,
		type: channel.type as FlattenedChannel['type'],
		createdTimestamp: channel.createdTimestamp
	};
}

export interface FlattenedChannel {
	id: string;
	type: ChannelTypeString;
	createdTimestamp: number;
}

export interface FlattenedGuildChannel extends FlattenedChannel {
	type: ChannelTypeString;
	guildId: string;
	name: string;
	rawPosition: number;
	parentId: string | null;
	permissionOverwrites: [string, PermissionOverwrites][];
}

export interface FlattenedNewsChannel extends FlattenedGuildChannel {
	type: 'GUILD_NEWS';
	topic: string | null;
	nsfw: boolean;
}

export interface FlattenedTextChannel extends FlattenedGuildChannel {
	type: 'GUILD_TEXT';
	topic: string | null;
	nsfw: boolean;
	rateLimitPerUser: number;
}

export interface FlattenedVoiceChannel extends FlattenedGuildChannel {
	type: 'GUILD_VOICE';
	bitrate: number;
	userLimit: number;
}

export interface FlattenedDMChannel extends FlattenedChannel {
	type: 'DM';
	recipient: string;
}

// #endregion Channel

// #region User

export function flattenUser(user: User): FlattenedUser {
	return {
		id: user.id,
		bot: user.bot,
		username: user.username,
		discriminator: user.discriminator,
		avatar: user.avatar
	};
}

export interface FlattenedUser {
	id: string;
	bot: boolean;
	username: string;
	discriminator: string;
	avatar: string | null;
}

// #endregion User

// #region Member

export function flattenMember(member: GuildMember): FlattenedMember {
	return {
		id: member.id,
		guildId: member.guild.id,
		user: flattenUser(member.user),
		joinedTimestamp: member.joinedTimestamp,
		premiumSinceTimestamp: member.premiumSinceTimestamp,
		roles: member.roles.cache.map(flattenRole)
	};
}

export interface FlattenedMember {
	id: string;
	guildId: string;
	user: FlattenedUser;
	joinedTimestamp: number | null;
	premiumSinceTimestamp: number | null;
	roles: FlattenedRole[];
}

// #endregion Member
