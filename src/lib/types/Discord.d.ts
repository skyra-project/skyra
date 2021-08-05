import type { GuildTextBasedChannelTypes } from '@sapphire/discord.js-utilities';
import type { DMChannel, Guild, GuildMember, Message, TextChannel } from 'discord.js';

export interface GuildMessage extends Message {
	channel: GuildTextBasedChannelTypes;
	readonly guild: Guild;
	readonly member: GuildMember;
}

export interface DMMessage extends Message {
	channel: DMChannel;
	readonly guild: null;
	readonly member: null;
}

export type MessageAcknowledgeable = TextChannel | GuildMessage;
