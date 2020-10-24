import {
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
		afkChannelID: guild.afkChannelID,
		afkTimeout: guild.afkTimeout,
		applicationID: guild.applicationID,
		approximateMemberCount: guild.approximateMemberCount,
		approximatePresenceCount: guild.approximatePresenceCount,
		available: guild.available,
		banner: guild.banner,
		channels: guild.channels.cache.map(flattenChannel) as FlattenedGuildChannel[],
		defaultMessageNotifications: guild.defaultMessageNotifications,
		description: guild.description,
		embedEnabled: guild.embedEnabled,
		explicitContentFilter: guild.explicitContentFilter,
		features: guild.features,
		icon: guild.icon,
		id: guild.id,
		joinedTimestamp: guild.joinedTimestamp,
		mfaLevel: guild.mfaLevel,
		name: guild.name,
		ownerID: guild.ownerID,
		partnered: guild.partnered,
		preferredLocale: guild.preferredLocale,
		premiumSubscriptionCount: guild.premiumSubscriptionCount,
		premiumTier: guild.premiumTier,
		region: guild.region,
		roles: guild.roles.cache.map(flattenRole),
		splash: guild.splash,
		systemChannelID: guild.systemChannelID,
		vanityURLCode: guild.vanityURLCode,
		verificationLevel: guild.verificationLevel,
		verified: guild.verified
	};
}

export interface FlattenedGuild
	extends Pick<
		Guild,
		| 'afkChannelID'
		| 'afkTimeout'
		| 'applicationID'
		| 'approximateMemberCount'
		| 'approximatePresenceCount'
		| 'available'
		| 'banner'
		| 'defaultMessageNotifications'
		| 'description'
		| 'embedEnabled'
		| 'explicitContentFilter'
		| 'features'
		| 'icon'
		| 'id'
		| 'joinedTimestamp'
		| 'mfaLevel'
		| 'name'
		| 'ownerID'
		| 'partnered'
		| 'preferredLocale'
		| 'premiumSubscriptionCount'
		| 'premiumTier'
		| 'region'
		| 'splash'
		| 'systemChannelID'
		| 'vanityURLCode'
		| 'verificationLevel'
		| 'verified'
	> {
	channels: FlattenedGuildChannel[];
	roles: FlattenedRole[];
}

export type PublicFlattenedGuild = Pick<FlattenedGuild, 'id' | 'name' | 'icon' | 'vanityURLCode' | 'description'>;

// #endregion Guild

// #region Role

export function flattenRole(role: Role): FlattenedRole {
	return {
		id: role.id,
		guildID: role.guild.id,
		name: role.name,
		color: role.color,
		hoist: role.hoist,
		rawPosition: role.rawPosition,
		permissions: role.permissions.bitfield,
		managed: role.managed,
		mentionable: role.mentionable
	};
}

export interface FlattenedRole {
	id: string;
	guildID: string;
	name: string;
	color: number;
	hoist: boolean;
	rawPosition: number;
	permissions: number;
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
	if (channel.type === 'news') return flattenChannelNews(channel as NewsChannel);
	if (channel.type === 'text') return flattenChannelText(channel as TextChannel);
	if (channel.type === 'voice') return flattenChannelVoice(channel as VoiceChannel);
	if (Reflect.has(channel, 'guild')) return flattenChannelGuild(channel as GuildChannel);
	if (channel.type === 'dm') return flattenChannelDM(channel as DMChannel);
	return flattenChannelFallback(channel);
}

function flattenChannelNews(channel: NewsChannel): FlattenedNewsChannel {
	return {
		id: channel.id,
		type: channel.type as FlattenedNewsChannel['type'],
		guildID: channel.guild.id,
		name: channel.name,
		rawPosition: channel.rawPosition,
		parentID: channel.parentID,
		permissionOverwrites: [...channel.permissionOverwrites.entries()],
		topic: channel.topic,
		nsfw: channel.nsfw,
		createdTimestamp: channel.createdTimestamp
	};
}

function flattenChannelText(channel: TextChannel): FlattenedTextChannel {
	return {
		id: channel.id,
		type: channel.type as FlattenedTextChannel['type'],
		guildID: channel.guild.id,
		name: channel.name,
		rawPosition: channel.rawPosition,
		parentID: channel.parentID,
		permissionOverwrites: [...channel.permissionOverwrites.entries()],
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
		guildID: channel.guild.id,
		name: channel.name,
		rawPosition: channel.rawPosition,
		parentID: channel.parentID,
		permissionOverwrites: [...channel.permissionOverwrites.entries()],
		bitrate: channel.bitrate,
		userLimit: channel.userLimit,
		createdTimestamp: channel.createdTimestamp
	};
}

function flattenChannelGuild(channel: GuildChannel): FlattenedGuildChannel {
	return {
		id: channel.id,
		type: channel.type as FlattenedGuildChannel['type'],
		guildID: channel.guild.id,
		name: channel.name,
		rawPosition: channel.rawPosition,
		parentID: channel.parentID,
		permissionOverwrites: [...channel.permissionOverwrites.entries()],
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
	type: 'dm' | 'text' | 'voice' | 'category' | 'news' | 'store' | 'unknown';
	createdTimestamp: number;
}

export interface FlattenedGuildChannel extends FlattenedChannel {
	type: 'text' | 'voice' | 'category' | 'news' | 'store' | 'unknown';
	guildID: string;
	name: string;
	rawPosition: number;
	parentID: string | null;
	permissionOverwrites: [string, PermissionOverwrites][];
}

export interface FlattenedNewsChannel extends FlattenedGuildChannel {
	type: 'news';
	topic: string | null;
	nsfw: boolean;
}

export interface FlattenedTextChannel extends FlattenedGuildChannel {
	type: 'text';
	topic: string | null;
	nsfw: boolean;
	rateLimitPerUser: number;
}

export interface FlattenedVoiceChannel extends FlattenedGuildChannel {
	type: 'voice';
	bitrate: number;
	userLimit: number;
}

export interface FlattenedDMChannel extends FlattenedChannel {
	type: 'dm';
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
		guildID: member.guild.id,
		user: flattenUser(member.user),
		joinedTimestamp: member.joinedTimestamp,
		premiumSinceTimestamp: member.premiumSinceTimestamp,
		roles: member.roles.cache.map(flattenRole)
	};
}

export interface FlattenedMember {
	id: string;
	guildID: string;
	user: FlattenedUser;
	joinedTimestamp: number | null;
	premiumSinceTimestamp: number | null;
	roles: FlattenedRole[];
}

// #endregion Member
