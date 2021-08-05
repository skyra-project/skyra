import { LanguageKeys } from '#lib/i18n/languageKeys';
import type { ChannelTypes, GuildTextBasedChannelTypes, TextBasedChannelTypes, VoiceBasedChannelTypes } from '@sapphire/discord.js-utilities';
import { UserError } from '@sapphire/framework';
import { isNullish, Nullish } from '@sapphire/utilities';
import type { GuildChannel, Message, ThreadChannel } from 'discord.js';

// TODO: Port those back to utilities
export type NonThreadGuildBasedChannelTypes = Extract<ChannelTypes, GuildChannel>;
export type GuildBasedChannelTypes = NonThreadGuildBasedChannelTypes | ThreadChannel;

/**
 * Determines whether or not a channel comes from a guild.
 * @param channel The channel to test.
 * @returns Whether or not the channel is guild-based.
 */
export function isGuildBasedChannel(channel: TextBasedChannelTypes): channel is GuildTextBasedChannelTypes {
	return Reflect.has(channel, 'guild');
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
