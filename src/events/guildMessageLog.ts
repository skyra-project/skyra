import { DiscordAPIError, Guild, HTTPError, TextChannel } from 'discord.js';
import { Event } from 'klasa';
import { Events } from '../lib/types/Enums';
import { GuildSettings } from '../lib/types/settings/GuildSettings';
import { MessageLogsEnum } from '../lib/util/constants';

const TYPES: Record<MessageLogsEnum, string> = {
	[MessageLogsEnum.Member]: GuildSettings.Channels.MemberLogs,
	[MessageLogsEnum.Message]: GuildSettings.Channels.MessageLogs,
	[MessageLogsEnum.Image]: GuildSettings.Channels.ImageLogs,
	[MessageLogsEnum.Moderation]: GuildSettings.Channels.ModerationLogs,
	[MessageLogsEnum.NSFWMessage]: GuildSettings.Channels.NSFWMessageLogs
};

export default class extends Event {

	public async run(type: MessageLogsEnum, guild: Guild, makeMessage: () => string) {
		const key = TYPES[type];
		if (!key) {
			this.client.emit(Events.Warn, `[EVENT] GuildMessageLog: Unknown type '${type}'`);
			return;
		}

		const id = guild.settings.get(key) as string;
		if (!id) return;

		const channel = guild.channels.get(id) as TextChannel;
		if (!channel) {
			await guild.settings.reset(key);
			return;
		}

		// Don't post if it's not possible
		if (!channel.postable) return;

		try {
			await channel.send(makeMessage());
		} catch (error) {
			this.client.emit(Events.Wtf, error instanceof DiscordAPIError || error instanceof HTTPError
				? `Failed to send '${MessageLogsEnum[type]}' log for guild ${guild} in channel ${channel.name}. Error: [${error.code} - ${error.method} | ${error.path}] ${error.message}`
				: `Failed to send '${MessageLogsEnum[type]}' log for guild ${guild} in channel ${channel.name}. Error: ${error.message}`);
		}
	}

}
