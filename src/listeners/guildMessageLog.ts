import { writeSettings, type GuildSettingsOfType } from '#lib/database';
import { EmbedBuilder } from '@discordjs/builders';
import { canSendEmbeds } from '@sapphire/discord.js-utilities';
import { Listener } from '@sapphire/framework';
import { isNullish, type Awaitable, type Nullish } from '@sapphire/utilities';
import { DiscordAPIError, HTTPError, type Guild, type MessageCreateOptions, type TextChannel } from 'discord.js';

export class UserListener extends Listener {
	public async run(
		guild: Guild,
		logChannelId: string | Nullish,
		key: GuildSettingsOfType<string | Nullish>,
		makeMessage: () => Awaitable<EmbedBuilder | EmbedBuilder[] | MessageCreateOptions>
	) {
		if (isNullish(logChannelId)) return;

		const channel = guild.channels.cache.get(logChannelId) as TextChannel;
		if (!channel) {
			await writeSettings(guild, [[key, null]]);
			return;
		}

		// Don't post if it's not possible
		if (!canSendEmbeds(channel)) return;

		const options = this.resolveOptions(await makeMessage());
		try {
			await channel.send(options);
		} catch (error) {
			this.container.logger.fatal(
				error instanceof DiscordAPIError || error instanceof HTTPError
					? `Failed to send '${key}' log for guild ${guild} in channel ${channel.name}. Error: [${error.status} - ${error.method} | ${error.url}] ${error.message}`
					: `Failed to send '${key}' log for guild ${guild} in channel ${channel.name}. Error: ${(error as Error).message}`
			);
		}
	}

	private resolveOptions(options: MessageCreateOptions | EmbedBuilder | EmbedBuilder[]): MessageCreateOptions {
		if (Array.isArray(options)) return { embeds: options };
		if (options instanceof EmbedBuilder) return { embeds: [options] };
		return options;
	}
}
