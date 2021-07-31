import { LanguageKeys } from '#lib/i18n/languageKeys';
import { UserError } from '@sapphire/framework';
import { isNullish, Nullish } from '@sapphire/utilities';
import {
	CategoryChannel,
	DMChannel,
	GuildChannel,
	Message,
	NewsChannel,
	Permissions,
	StageChannel,
	StoreChannel,
	TextChannel,
	ThreadChannel,
	VoiceChannel
} from 'discord.js';

export type ChannelTypes = CategoryChannel | DMChannel | NewsChannel | StageChannel | StoreChannel | TextChannel | ThreadChannel | VoiceChannel;
export type TextBasedChannelTypes = Message['channel'];
export type VoiceBasedChannelTypes = VoiceChannel | StageChannel;
export type NonThreadGuildTextBasedChannelTypes = Extract<TextBasedChannelTypes, GuildChannel>;
export type GuildTextBasedChannelTypes = NonThreadGuildTextBasedChannelTypes | ThreadChannel;

export type ChannelTypeString = ChannelTypes['type'] | 'UNKNOWN';

/**
 * Determines whether or not a channel comes from a guild.
 * @param channel The channel to test.
 * @returns Whether or not the channel is guild-based.
 */
export function isGuildBasedChannel(channel: TextBasedChannelTypes): channel is GuildTextBasedChannelTypes {
	return Reflect.has(channel, 'guild');
}

export function isNsfw(channel: TextBasedChannelTypes): boolean {
	switch (channel.type) {
		case 'DM':
			return false;
		case 'GUILD_TEXT':
		case 'GUILD_NEWS':
			return channel.nsfw;
		case 'GUILD_NEWS_THREAD':
		case 'GUILD_PUBLIC_THREAD':
		case 'GUILD_PRIVATE_THREAD':
			// `ThreadChannel#parent` returns `null` only when the cache is
			// incomplete, which is never the case in Skyra.
			return channel.parent!.nsfw;
	}
}

/**
 * Asserts a text-based channel is not a thread channel.
 * @param channel The channel to assert.
 * @returns The thread channel.
 */
export function assertNonThread<T extends TextBasedChannelTypes>(channel: T): Exclude<T, ThreadChannel> {
	if (channel.isThread()) throw new UserError({ identifier: LanguageKeys.Assertions.ExpectedNonThreadChannel, context: { channel } });
	return channel as Exclude<T, ThreadChannel>;
}

const canReadMessagesPermissions = new Permissions(['VIEW_CHANNEL']);

/**
 * Determines whether or not we can send messages in a given channel.
 * @param channel The channel to test the permissions from.
 * @returns Whether or not we can send messages in the specified channel.
 */
export function canReadMessages(channel: TextBasedChannelTypes): boolean {
	return isGuildBasedChannel(channel) ? channel.permissionsFor(channel.guild.me!)!.has(canReadMessagesPermissions) : true;
}

const canSendMessagesPermissions = new Permissions([canReadMessagesPermissions, 'SEND_MESSAGES']);

/**
 * Determines whether or not we can send messages in a given channel.
 * @param channel The channel to test the permissions from.
 * @returns Whether or not we can send messages in the specified channel.
 */
export function canSendMessages(channel: TextBasedChannelTypes): boolean {
	return isGuildBasedChannel(channel) ? channel.permissionsFor(channel.guild.me!)!.has(canSendMessagesPermissions) : true;
}

const canSendEmbedsPermissions = new Permissions([canSendMessagesPermissions, 'EMBED_LINKS']);

/**
 * Determines whether or not we can send embeds in a given channel.
 * @param channel The channel to test the permissions from.
 * @returns Whether or not we can send embeds in the specified channel.
 */
export function canSendEmbeds(channel: TextBasedChannelTypes): boolean {
	return isGuildBasedChannel(channel) ? channel.permissionsFor(channel.guild.me!)!.has(canSendEmbedsPermissions) : true;
}

const canSendAttachmentsPermissions = new Permissions([canSendMessagesPermissions, 'ATTACH_FILES']);

/**
 * Determines whether or not we can send attachments in a given channel.
 * @param channel The channel to test the permissions from.
 * @returns Whether or not we can send attachments in the specified channel.
 */
export function canSendAttachments(channel: TextBasedChannelTypes): boolean {
	return isGuildBasedChannel(channel) ? channel.permissionsFor(channel.guild.me!)!.has(canSendAttachmentsPermissions) : true;
}

export function getListeners(channel: VoiceBasedChannelTypes | Nullish): string[] {
	if (isNullish(channel)) return [];

	const members: string[] = [];
	for (const [id, member] of channel.members.entries()) {
		if (member.user.bot || member.voice.deaf) continue;
		members.push(id);
	}

	return members;
}

export function getListenerCount(channel: VoiceBasedChannelTypes | Nullish): number {
	if (isNullish(channel)) return 0;

	let count = 0;
	for (const member of channel.members.values()) {
		if (!member.user.bot && !member.voice.deaf) ++count;
	}

	return count;
}

export interface SnipedMessage {
	message: Message;
	timeout: NodeJS.Timeout;
}

const snipedMessages = new WeakMap<GuildTextBasedChannelTypes, SnipedMessage>();
export function getSnipedMessage(channel: GuildTextBasedChannelTypes): Message | null {
	const current = snipedMessages.get(channel);
	return current?.message ?? null;
}

export function setSnipedMessage(channel: GuildTextBasedChannelTypes, value: Message | null) {
	const previous = snipedMessages.get(channel);
	if (typeof previous !== 'undefined') clearTimeout(previous.timeout);

	if (value === null) {
		snipedMessages.delete(channel);
	} else {
		const next: SnipedMessage = {
			message: value,
			timeout: setTimeout(() => snipedMessages.delete(channel), 15000).unref()
		};
		snipedMessages.set(channel, next);
	}
}
