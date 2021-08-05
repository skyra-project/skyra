import { GuildEntity, writeSettings } from '#lib/database';
import { canSendMessages } from '#utils/functions';
import { Listener } from '@sapphire/framework';
import { Awaited, isNullish, Nullish, PickByValue } from '@sapphire/utilities';
import { DiscordAPIError, Guild, HTTPError, MessageEmbed, MessageOptions, TextChannel } from 'discord.js';

export class UserListener extends Listener {
	public async run(
		guild: Guild,
		logChannelId: string | Nullish,
		key: PickByValue<GuildEntity, string | Nullish>,
		makeMessage: () => Awaited<MessageEmbed | MessageOptions>
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
		const options: MessageOptions = processed instanceof MessageEmbed ? { embeds: [processed] } : processed;
		try {
			await channel.send(options);
		} catch (error) {
			this.container.logger.fatal(
				error instanceof DiscordAPIError || error instanceof HTTPError
					? `Failed to send '${key}' log for guild ${guild} in channel ${channel.name}. Error: [${error.code} - ${error.method} | ${error.path}] ${error.message}`
					: `Failed to send '${key}' log for guild ${guild} in channel ${channel.name}. Error: ${error.message}`
			);
		}
	}
}
