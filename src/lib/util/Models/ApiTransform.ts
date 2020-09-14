import { MusicHandler } from '@lib/structures/music/MusicHandler';
import { Song } from '@lib/structures/music/Song';
import {
	Channel,
	DMChannel,
	ExplicitContentFilterLevel,
	Guild,
	GuildChannel,
	GuildFeatures,
	GuildMember,
	NewsChannel,
	PermissionOverwrites,
	Role,
	TextChannel,
	User,
	VerificationLevel,
	VoiceChannel
} from 'discord.js';

// #region Guild

export function flattenGuild(guild: Guild): FlattenedGuild {
	return {
		id: guild.id,
		available: guild.available,
		channels: guild.channels.cache.map(flattenChannel) as FlattenedGuildChannel[],
		roles: guild.roles.cache.map(flattenRole),
		name: guild.name,
		icon: guild.icon,
		splash: guild.splash,
		region: guild.region,
		features: guild.features,
		applicationID: guild.applicationID,
		afkTimeout: guild.afkTimeout,
		afkChannelID: guild.afkChannelID,
		systemChannelID: guild.systemChannelID,
		embedEnabled: guild.embedEnabled,
		premiumTier: guild.premiumTier,
		premiumSubscriptionCount: guild.premiumSubscriptionCount,
		verificationLevel: guild.verificationLevel,
		explicitContentFilter: guild.explicitContentFilter,
		mfaLevel: guild.mfaLevel,
		joinedTimestamp: guild.joinedTimestamp,
		defaultMessageNotifications: guild.defaultMessageNotifications,
		vanityURLCode: guild.vanityURLCode,
		description: guild.description,
		banner: guild.banner,
		ownerID: guild.ownerID
	};
}

export interface FlattenedGuild {
	id: string;
	available: boolean;
	channels: FlattenedGuildChannel[];
	roles: FlattenedRole[];
	name: string;
	icon: string | null;
	splash: string | null;
	region: string;
	features: GuildFeatures[];
	applicationID: string | null;
	afkTimeout: number;
	afkChannelID: string | null;
	systemChannelID: string | null;
	embedEnabled: boolean;
	premiumTier: number;
	premiumSubscriptionCount: number | null;
	verificationLevel: VerificationLevel;
	explicitContentFilter: ExplicitContentFilterLevel;
	mfaLevel: number;
	joinedTimestamp: number;
	defaultMessageNotifications: number | 'ALL' | 'MENTIONS';
	vanityURLCode: string | null;
	description: string | null;
	banner: string | null;
	ownerID: string;
}

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
	if ('guild' in channel) return flattenChannelGuild(channel as GuildChannel);
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

// #region Music

export function flattenSong(song: Song): FlattenedSong {
	return {
		id: song.id,
		track: song.track,
		requester: song.requester,
		identifier: song.identifier,
		seekable: song.seekable,
		author: song.author,
		duration: song.duration,
		stream: song.stream,
		position: song.position,
		title: song.title,
		url: song.url,
		skips: [...song.skips.values()]
	};
}

export interface FlattenedSong {
	id: string;
	track: string;
	requester: string;
	identifier: string;
	seekable: boolean;
	author: string;
	duration: number;
	stream: boolean;
	position: number;
	title: string;
	url: string;
	skips: string[];
}

export function flattenMusicHandler(handler: MusicHandler): FlattenedMusicHandler {
	const { voiceChannel } = handler;
	return {
		id: handler.guild.id,
		voiceChannel: voiceChannel === null ? null : voiceChannel.id,
		song: handler.song === null ? null : handler.song.toJSON(),
		position: handler.position,
		playing: handler.playing ?? false,
		paused: handler.paused ?? false,
		queue: handler.queue.map((q) => q.toJSON()),
		volume: handler.volume,
		replay: handler.replay
	};
}

export interface FlattenedMusicHandler {
	id: string;
	voiceChannel: string | null;
	song: FlattenedSong | null;
	position: number;
	playing: boolean;
	paused: boolean;
	replay: boolean;
	volume: number;
	queue: readonly FlattenedSong[];
}

// #endregion Music
