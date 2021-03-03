import { GuildSettings } from '#lib/database';
import { MessageLogsEnum } from '#utils/constants';
import { Event } from '@sapphire/framework';
import { DiscordAPIError, Guild, HTTPError, MessageEmbed, TextChannel } from 'discord.js';

const TYPES = {
	[MessageLogsEnum.Member]: GuildSettings.Channels.Logs.Member,
	[MessageLogsEnum.Message]: GuildSettings.Channels.Logs.Message,
	[MessageLogsEnum.Image]: GuildSettings.Channels.Logs.Image,
	[MessageLogsEnum.Moderation]: GuildSettings.Channels.Logs.Moderation,
	[MessageLogsEnum.NSFWMessage]: GuildSettings.Channels.Logs.NSFWMessage,
	[MessageLogsEnum.Reaction]: GuildSettings.Channels.Logs.Reaction
} as const;

export class UserEvent extends Event {
	public async run(type: MessageLogsEnum, guild: Guild, makeMessage: () => Promise<MessageEmbed> | MessageEmbed) {
		const key = TYPES[type];
		if (!key) {
			this.context.client.logger.warn(`[EVENT] GuildMessageLog: Unknown type '${type}'`);
			return;
		}

		const id = await guild.readSettings(key);
		if (!id) return;

		const channel = guild.channels.cache.get(id) as TextChannel;
		if (!channel) {
			await guild.writeSettings([[key, null]]);
			return;
		}

		// Don't post if it's not possible
		if (!channel.postable) return;

		const processed = await makeMessage();
		try {
			await channel.send(processed);
		} catch (error) {
			this.context.client.logger.fatal(
				error instanceof DiscordAPIError || error instanceof HTTPError
					? `Failed to send '${type}' log for guild ${guild} in channel ${channel.name}. Error: [${error.code} - ${error.method} | ${error.path}] ${error.message}`
					: `Failed to send '${type}' log for guild ${guild} in channel ${channel.name}. Error: ${error.message}`
			);
		}
	}
}
