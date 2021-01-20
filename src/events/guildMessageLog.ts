import { GuildSettings } from '#lib/database';
import { Events } from '#lib/types/Enums';
import { MessageLogsEnum } from '#utils/constants';
import { DiscordAPIError, Guild, HTTPError, MessageEmbed, TextChannel } from 'discord.js';
import { Event } from 'klasa';

const TYPES = {
	[MessageLogsEnum.Member]: GuildSettings.Channels.MemberLogs,
	[MessageLogsEnum.Message]: GuildSettings.Channels.MessageLogs,
	[MessageLogsEnum.Image]: GuildSettings.Channels.ImageLogs,
	[MessageLogsEnum.Moderation]: GuildSettings.Channels.ModerationLogs,
	[MessageLogsEnum.NSFWMessage]: GuildSettings.Channels.NSFWMessageLogs,
	[MessageLogsEnum.Reaction]: GuildSettings.Channels.ReactionLogs
} as const;

export default class extends Event {
	public async run(type: MessageLogsEnum, guild: Guild, makeMessage: () => Promise<MessageEmbed> | MessageEmbed) {
		const key = TYPES[type];
		if (!key) {
			this.context.client.emit(Events.Warn, `[EVENT] GuildMessageLog: Unknown type '${type}'`);
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
			this.context.client.emit(
				Events.Wtf,
				error instanceof DiscordAPIError || error instanceof HTTPError
					? `Failed to send '${type}' log for guild ${guild} in channel ${channel.name}. Error: [${error.code} - ${error.method} | ${error.path}] ${error.message}`
					: `Failed to send '${type}' log for guild ${guild} in channel ${channel.name}. Error: ${error.message}`
			);
		}
	}
}
