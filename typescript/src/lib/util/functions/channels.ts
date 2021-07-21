import { Permissions, GuildChannel, Message } from 'discord.js';

export type ChannelTypes = Message['channel'];
export type GuildBasedChannelTypes = Extract<ChannelTypes, GuildChannel>;

/**
 * Determines whether or not a channel comes from a guild.
 * @param channel The channel to test.
 * @returns Whether or not the channel is guild-based.
 */
export function isGuildBasedChannel(channel: ChannelTypes): channel is GuildBasedChannelTypes {
	return Reflect.has(channel, 'guild');
}

const canSendMessagesPermissions = new Permissions(['VIEW_CHANNEL', 'SEND_MESSAGES']);

/**
 * Determines whether or not we can send messages in a given channel.
 * @param channel The channel to test the permissions from.
 * @returns Whether or not we can send messages in the specified channel.
 */
export function canSendMessages(channel: ChannelTypes): boolean {
	return isGuildBasedChannel(channel) ? channel.permissionsFor(channel.guild.me!)!.has(canSendMessagesPermissions) : true;
}
