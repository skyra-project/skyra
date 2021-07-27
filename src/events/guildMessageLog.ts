import { GuildEntity, writeSettings } from '#lib/database';
import { canSendMessages } from '#utils/functions';
import { Event } from '@sapphire/framework';
import { isNullish, Nullish, PickByValue } from '@sapphire/utilities';
import { DiscordAPIError, Guild, HTTPError, MessageEmbed, TextChannel } from 'discord.js';

export class UserEvent extends Event {
	public async run(
		guild: Guild,
		logChannelId: string | Nullish,
		key: PickByValue<GuildEntity, string | Nullish>,
		makeMessage: () => Promise<MessageEmbed> | MessageEmbed
	) {
		if (isNullish(logChannelId)) return;

		const channel = guild.channels.cache.get(logChannelId) as TextChannel;
		if (!channel) {
			await writeSettings(guild, [[key, null]]);
			return;
		}

		// Don't post if it's not possible
		if (!canSendMessages(channel)) return;

		const processed = await makeMessage();
		try {
			await channel.send(processed);
		} catch (error) {
			this.context.client.logger.fatal(
				error instanceof DiscordAPIError || error instanceof HTTPError
					? `Failed to send '${key}' log for guild ${guild} in channel ${channel.name}. Error: [${error.code} - ${error.method} | ${error.path}] ${error.message}`
					: `Failed to send '${key}' log for guild ${guild} in channel ${channel.name}. Error: ${error.message}`
			);
		}
	}
}
