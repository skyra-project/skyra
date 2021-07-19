import type { GuildMessage } from '#lib/types';
import type { Message } from 'discord.js';

/**
 * Checks whether or not a message was sent in a guild.
 * @param message The message to check.
 * @returns Whether the message was sent in a guild.
 */
export function isGuildMessage(message: Message): message is GuildMessage {
	return message.guild !== null;
}
