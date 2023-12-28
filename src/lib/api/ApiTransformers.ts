import {
	isDMChannel,
	isGuildBasedChannelByGuildKey,
	isNewsChannel,
	isTextChannel,
	isThreadChannel,
	isVoiceChannel
} from '@sapphire/discord.js-utilities';
import type {
	Channel,
	ChannelType,
	DMChannel,
	Guild,
	GuildChannel,
	GuildMember,
	NewsChannel,
	PermissionOverwrites,
	Role,
	TextChannel,
	ThreadChannel,
	ThreadChannelType,
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
	color: number;

	guildId: string;

	hoist: boolean;

	id: string;

	managed: boolean;

	mentionable: boolean;

	name: string;

	permissions: string;

	rawPosition: number;
}

// #endregion Role

// #region Channel

export function flattenChannel(channel: NewsChannel): FlattenedNewsChannel;
export function flattenChannel(channel: TextChannel): FlattenedTextChannel;
export function flattenChannel(channel: VoiceChannel): FlattenedVoiceChannel;
export function flattenChannel(channel: DMChannel): FlattenedDMChannel;
export function flattenChannel(channel: ThreadChannel): FlattenedThreadChannel;
export function flattenChannel(channel: Channel): FlattenedChannel;
export function flattenChannel(channel: Channel | ThreadChannel) {
	if (isThreadChannel(channel)) return flattenChannelThread(channel as ThreadChannel);
	if (isNewsChannel(channel)) return flattenChannelNews(channel as NewsChannel);
	if (isTextChannel(channel)) return flattenChannelText(channel as TextChannel);
	if (isVoiceChannel(channel)) return flattenChannelVoice(channel as VoiceChannel);
	if (isGuildBasedChannelByGuildKey(channel)) return flattenChannelGuild(channel as GuildChannel);
	if (isDMChannel(channel)) return flattenChannelDM(channel as DMChannel);
	return flattenChannelFallback(channel);
}

function flattenChannelNews(channel: NewsChannel): FlattenedNewsChannel {
	return {
		id: channel.id,
		type: channel.type,
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
		recipient: channel.recipient?.id ?? null,
		createdTimestamp: channel.createdTimestamp ?? 0
	};
}

function flattenChannelThread(channel: ThreadChannel): FlattenedThreadChannel {
	return {
		id: channel.id,
		type: channel.type,
		archived: channel.archived ?? false,
		archivedTimestamp: channel.archiveTimestamp,
		createdTimestamp: channel.createdTimestamp ?? 0,
		guildId: channel.guildId,
		name: channel.name,
		parentId: channel.parentId,
		permissionOverwrites: [...(channel.parent?.permissionOverwrites.cache.entries() ?? [])],
		rawPosition: channel.parent?.rawPosition ?? null,
		rateLimitPerUser: channel.rateLimitPerUser
	};
}

function flattenChannelFallback(channel: Channel): FlattenedChannel {
	return {
		id: channel.id,
		type: channel.type as FlattenedChannel['type'],
		createdTimestamp: channel.createdTimestamp ?? 0
	};
}

export interface FlattenedChannel {
	id: string;
	type: ChannelType;
	createdTimestamp: number;
}

export interface FlattenedGuildChannel extends FlattenedChannel {
	type: ChannelType;
	guildId: string;
	name: string;
	parentId: string | null;
	permissionOverwrites: [string, PermissionOverwrites][];
	rawPosition: number;
}

export interface FlattenedNewsChannel extends FlattenedGuildChannel {
	type: ChannelType.GuildAnnouncement;
	nsfw: boolean;
	topic: string | null;
}

export interface FlattenedTextChannel extends FlattenedGuildChannel {
	type: ChannelType.GuildText;
	nsfw: boolean;
	rateLimitPerUser: number;
	topic: string | null;
}

export interface FlattenedThreadChannel extends Pick<FlattenedGuildChannel, 'id' | 'createdTimestamp'> {
	type: ThreadChannelType;
	archived: boolean;
	archivedTimestamp: number | null;
	guildId: string;
	name: string;
	parentId: string | null;
	permissionOverwrites: [string, PermissionOverwrites][];
	rateLimitPerUser: number | null;
	rawPosition: number | null;
}

export interface FlattenedNewsThreadChannel extends FlattenedChannel {
	type: ChannelType.AnnouncementThread;
}

export interface FlattenedPublicThreadChannel extends FlattenedChannel {
	type: ChannelType.PublicThread;
}

export interface FlattenedPrivateThreadChannel extends FlattenedChannel {
	type: ChannelType.PrivateThread;
}

export interface FlattenedVoiceChannel extends FlattenedGuildChannel {
	type: ChannelType.GuildVoice;
	bitrate: number;
	userLimit: number;
}

export interface FlattenedDMChannel extends FlattenedChannel {
	type: ChannelType.DM;
	recipient: string | null;
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
	avatar: string | null;

	bot: boolean;

	discriminator: string;

	id: string;

	username: string;
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
	guildId: string;

	id: string;

	joinedTimestamp: number | null;

	premiumSinceTimestamp: number | null;

	roles: FlattenedRole[];

	user: FlattenedUser;
}

// #endregion Member
